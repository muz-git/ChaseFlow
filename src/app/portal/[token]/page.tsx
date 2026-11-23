import { Suspense } from 'react'
import crypto from 'crypto'
import { connection } from 'next/server'
import { ShieldCheck, Calendar } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { PortalChecklist } from './PortalChecklist'

async function PortalContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ token: string }>
}) {
  await connection()
  const { token } = await paramsPromise
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const admin = createAdminClient()

  // 1. Direct lookup on document_requests (no relational joins)
  const { data: request, error } = await admin
    .from('document_requests')
    .select(
      'id, organization_id, client_id, title, description, status, due_date, token_expires_at'
    )
    .eq('access_token_hash', tokenHash)
    .maybeSingle()

  if (error || !request) {
    console.error('Portal lookup error:', error?.message, error?.details)
    return (
      <div className="max-w-lg mx-auto mt-20 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Link Not Found</h1>
        <p className="text-sm text-slate-600 mt-2">
          This document upload link is invalid or no longer active. Please contact your accountant for a fresh link.
        </p>
      </div>
    )
  }

  const isExpired =
    request.token_expires_at &&
    new Date(request.token_expires_at) < new Date()

  if (isExpired || request.status === 'cancelled') {
    return (
      <div className="max-w-lg mx-auto mt-20 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Link Expired</h1>
        <p className="text-sm text-slate-600 mt-2">
          This upload link has expired. Please reach out to your accountant to request a new upload link.
        </p>
      </div>
    )
  }

  // 2. Fetch firm name, client name, and checklist items independently
  const [{ data: org }, { data: client }, { data: items }] = await Promise.all([
    admin
      .from('organizations')
      .select('name')
      .eq('id', request.organization_id)
      .maybeSingle(),
    admin
      .from('clients')
      .select('name')
      .eq('id', request.client_id)
      .maybeSingle(),
    admin
      .from('request_items')
      .select('id, name, description, status, created_at')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true }),
  ])

  const itemIds = (items ?? []).map((i) => i.id)
  const { data: docs } = itemIds.length
    ? await admin
        .from('documents')
        .select('id, request_item_id, original_filename, file_size, uploaded_at')
        .in('request_item_id', itemIds)
    : { data: [] }

  const sortedItems = (items ?? []).map((item) => ({
    ...item,
    documents: (docs ?? []).filter((d) => d.request_item_id === item.id),
  }))

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>{org?.name || 'Accounting Firm'}</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full normal-case font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Encrypted Client Portal
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mt-3">
            {request.title}
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            Prepared for <strong className="text-slate-900">{client?.name}</strong>
          </p>

          {request.description && (
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3.5 mt-4">
              {request.description}
            </p>
          )}

          {request.due_date && (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 mt-4">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Requested by{' '}
              {new Date(request.due_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
        </div>

        <PortalChecklist rawToken={token} items={sortedItems} />
      </div>
    </div>
  )
}

export default function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">
          Loading secure document checklist...
        </div>
      }
    >
      <PortalContent paramsPromise={params} />
    </Suspense>
  )
}