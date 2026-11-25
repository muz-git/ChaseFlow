import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderEmail } from '@/lib/email/resend'
import { getPlanConfig } from '@/lib/plans'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const seventyTwoHoursAgo = new Date(
    Date.now() - 72 * 60 * 60 * 1000
  ).toISOString()

  // Find active requests that haven't expired
  const { data: openRequests } = await admin
    .from('document_requests')
    .select('id, organization_id, client_id, title, due_date, token_expires_at')
    .in('status', ['sent', 'in_progress'])

  let chasedCount = 0
  let skippedStarterCount = 0

  for (const req of openRequests ?? []) {
    if (req.token_expires_at && new Date(req.token_expires_at) < new Date()) {
      continue
    }

    // Check organization tier before doing reminder work
    const { data: org } = await admin
      .from('organizations')
      .select('name, plan')
      .eq('id', req.organization_id)
      .single()

    const planConfig = getPlanConfig(org?.plan)
    if (!planConfig.features.automatedReminders) {
      skippedStarterCount++
      continue
    }

    // Skip if reminded within the last 72 hours
    const { data: recentLogs } = await admin
      .from('reminder_logs')
      .select('id')
      .eq('request_id', req.id)
      .gte('sent_at', seventyTwoHoursAgo)
      .limit(1)

    if (recentLogs && recentLogs.length > 0) {
      continue
    }

    const [{ data: client }, { data: items }] = await Promise.all([
      admin
        .from('clients')
        .select('name, email')
        .eq('id', req.client_id)
        .single(),
      admin
        .from('request_items')
        .select('name, status')
        .eq('request_id', req.id),
    ])

    const remainingItems = (items ?? [])
      .filter((i) => i.status === 'pending' || i.status === 'rejected')
      .map((i) => i.name)

    if (!client || remainingItems.length === 0) continue

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString()

    await admin
      .from('document_requests')
      .update({
        access_token_hash: tokenHash,
        token_expires_at: expiresAt,
      })
      .eq('id', req.id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const portalUrl = `${appUrl}/portal/${rawToken}`

    const emailResult = await sendReminderEmail({
      to: client.email,
      clientName: client.name,
      firmName: org?.name || 'Your Accountant',
      requestTitle: req.title,
      dueDate: req.due_date,
      portalUrl,
      remainingItems,
    })

    await admin.from('reminder_logs').insert({
      request_id: req.id,
      reminder_type: 'automated',
      recipient_email: client.email,
      provider_message_id: emailResult.messageId ?? null,
    })

    chasedCount++
  }

  return NextResponse.json({
    ok: true,
    chasedCount,
    skippedStarterCount,
  })
}