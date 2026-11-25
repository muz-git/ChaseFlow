'use server'

import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendDocumentRequestEmail } from '@/lib/email/resend'
import { getPlanConfig } from '@/lib/plans'

const createRequestSchema = z.object({
  clientId: z.string().uuid('Please select a valid client'),
  title: z.string().min(2, 'Request title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  items: z
    .array(z.string().min(1))
    .min(1, 'Add at least one document item to the checklist'),
})

export async function createDocumentRequest(input: {
  clientId: string
  title: string
  description?: string
  dueDate?: string
  items: string[]
}) {
  const cleanedItems = input.items.map((i) => i.trim()).filter(Boolean)

  const parsed = createRequestSchema.safeParse({
    ...input,
    items: cleanedItems,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get firm details including current subscription tier
  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name, plan)')
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { error: 'Could not verify firm membership' }
  }

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations

  // Enforce monthly request cap for Starter (10) & Practice (50)
  const planConfig = getPlanConfig(org?.plan)

  if (planConfig.monthlyRequestLimit !== null) {
    const startOfMonth = new Date()
    startOfMonth.setUTCDate(1)
    startOfMonth.setUTCHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('document_requests')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', membership.organization_id)
      .gte('created_at', startOfMonth.toISOString())

    if (countError) {
      return { error: `Could not verify plan usage: ${countError.message}` }
    }

    if ((count ?? 0) >= planConfig.monthlyRequestLimit) {
      const nextTierHint =
        planConfig.id === 'starter'
          ? 'Upgrade to Practice (£19.99/mo for 50 requests) or Firm (£39.99/mo for unlimited).'
          : 'Upgrade to Firm (£39.99/mo) for unlimited monthly document requests.'

      return {
        error: `You have reached your ${planConfig.name} plan limit of ${planConfig.monthlyRequestLimit} document requests this month. ${nextTierHint}`,
      }
    }
  }

  // Verify client belongs to this firm
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('id', parsed.data.clientId)
    .single()

  if (clientError || !client) {
    return { error: clientError ? `Client lookup failed: ${clientError.message}` : 'Client not found' }
  }

  // Generate raw magic token + SHA-256 hash for DB storage
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  const now = new Date().toISOString()

  // 1. Insert document_requests row
  const { data: docRequest, error: reqError } = await supabase
    .from('document_requests')
    .insert({
      organization_id: membership.organization_id,
      client_id: client.id,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      status: 'sent',
      due_date: parsed.data.dueDate || null,
      access_token_hash: tokenHash,
      token_expires_at: expiresAt,
      sent_at: now,
    })
    .select('id')
    .single()

  if (reqError || !docRequest) {
    return { error: reqError?.message || 'Failed to create document request' }
  }

  // 2. Insert checklist items
  const itemRows = parsed.data.items.map((itemName) => ({
    request_id: docRequest.id,
    organization_id: membership.organization_id,
    name: itemName,
    status: 'pending',
  }))

  const { error: itemsError } = await supabase
    .from('request_items')
    .insert(itemRows)

  if (itemsError) {
    return { error: itemsError.message }
  }

  // 3. Send magic-link email via Resend
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const portalUrl = `${appUrl}/portal/${rawToken}`

  const emailResult = await sendDocumentRequestEmail({
    to: client.email,
    clientName: client.name,
    firmName: org?.name || 'Your Accountant',
    requestTitle: parsed.data.title.trim(),
    dueDate: parsed.data.dueDate || null,
    portalUrl,
    items: parsed.data.items,
  })

  // 4. Log initial dispatch in reminder_logs
  await supabase.from('reminder_logs').insert({
    request_id: docRequest.id,
    reminder_type: 'initial',
    recipient_email: client.email,
    provider_message_id: emailResult.messageId ?? null,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/requests')

  return {
    success: true,
    portalUrl,
    emailWarning: emailResult.error || null,
  }
}