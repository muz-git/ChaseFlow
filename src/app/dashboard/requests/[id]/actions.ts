'use server'

import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderEmail } from '@/lib/email/resend'

export async function updateItemStatus(
  requestId: string,
  itemId: string,
  newStatus: 'approved' | 'rejected'
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('request_items')
    .update({ status: newStatus })
    .eq('id', itemId)
    .eq('request_id', requestId)

  if (error) {
    return { error: error.message }
  }

  // Re-evaluate parent document_requests completion status
  const { data: allItems } = await supabase
    .from('request_items')
    .select('status')
    .eq('request_id', requestId)

  const allCompleted =
    allItems &&
    allItems.length > 0 &&
    allItems.every((i) => i.status === 'received' || i.status === 'approved')

  await supabase
    .from('document_requests')
    .update({
      status: allCompleted ? 'completed' : 'in_progress',
      completed_at: allCompleted ? new Date().toISOString() : null,
    })
    .eq('id', requestId)

  revalidatePath(`/dashboard/requests/${requestId}`)
  revalidatePath('/dashboard/requests')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function sendManualChase(requestId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  const { data: request, error: reqError } = await supabase
    .from('document_requests')
    .select('id, client_id, title, due_date, status')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    return { error: 'Document request not found' }
  }

  const [{ data: client }, { data: items }] = await Promise.all([
    supabase
      .from('clients')
      .select('name, email')
      .eq('id', request.client_id)
      .single(),
    supabase
      .from('request_items')
      .select('name, status')
      .eq('request_id', request.id),
  ])

  if (!client) {
    return { error: 'Client record not found' }
  }

  const remainingItems = (items ?? [])
    .filter((i) => i.status === 'pending' || i.status === 'rejected')
    .map((i) => i.name)

  if (remainingItems.length === 0) {
    return { error: 'All items have already been uploaded or approved.' }
  }

  // Issue a fresh portal token so the reminder email always has an active link
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const admin = createAdminClient()
  await admin
    .from('document_requests')
    .update({
      access_token_hash: tokenHash,
      token_expires_at: expiresAt,
    })
    .eq('id', request.id)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const portalUrl = `${appUrl}/portal/${rawToken}`

  const emailResult = await sendReminderEmail({
    to: client.email,
    clientName: client.name,
    firmName: org?.name || 'Your Accountant',
    requestTitle: request.title,
    dueDate: request.due_date,
    portalUrl,
    remainingItems,
  })

  await admin.from('reminder_logs').insert({
    request_id: request.id,
    reminder_type: 'manual',
    recipient_email: client.email,
    provider_message_id: emailResult.messageId ?? null,
  })

  revalidatePath(`/dashboard/requests/${requestId}`)

  return {
    success: true,
    portalUrl,
    emailWarning: emailResult.error || null,
  }
}