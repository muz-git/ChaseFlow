import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { ArrowLeft, Mail, FolderArchive, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanConfig } from '@/lib/plans'
import { RequestReviewClient } from './RequestReviewClient'

async function RequestDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await paramsPromise
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch firm plan for ZIP export tier-gating
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organizations(plan)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  const planConfig = getPlanConfig(org?.plan)

  // RLS ensures the user can only fetch requests belonging to their firm
  const { data: request, error } = await supabase
    .from('document_requests')
    .select('id, client_id, title, description, status, due_date, created_at')
    .eq('id', id)
    .single()

  if (error || !request) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">Document request not found.</p>
        <Link
          href="/dashboard/requests"
          className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
        >
          Back to Requests
        </Link>
      </div>
    )
  }

  const [{ data: client }, { data: items }, { data: logs }] = await Promise.all([
    supabase
      .from('clients')
      .select('name, email')
      .eq('id', request.client_id)
      .single(),
    supabase
      .from('request_items')
      .select('id, name, description, status, created_at')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('reminder_logs')
      .select('id, reminder_type, recipient_email, sent_at')
      .eq('request_id', request.id)
      .order('sent_at', { ascending: false }),
  ])

  const itemIds = (items ?? []).map((i) => i.id)
  const { data: docs } = itemIds.length
    ? await supabase
        .from('documents')
        .select('id, request_item_id, original_filename, storage_path, file_size, uploaded_at')
        .in('request_item_id', itemIds)
    : { data: [] }

  // Generate 1-hour signed URLs from private Storage bucket
  const admin = createAdminClient()
  const docsWithUrls = await Promise.all(
    (docs ?? []).map(async (doc) => {
      const { data } = await admin.storage
        .from('client-documents')
        .createSignedUrl(doc.storage_path, 3600)
      return {
        ...doc,
        signedUrl: data?.signedUrl ?? null,
      }
    })
  )

  const reviewItems = (items ?? []).map((item) => ({
    ...item,
    documents: docsWithUrls.filter((d) => d.request_item_id === item.id),
  }))

  const totalUploadedCount = docsWithUrls.length

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Client: <strong className="text-slate-900">{client?.name}</strong> ({client?.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {planConfig.features.zipExport ? (
              totalUploadedCount > 0 ? (
                <a
                  href={`/api/requests/${request.id}/zip`}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
                >
                  <FolderArchive className="h-4 w-4 text-emerald-400" />
                  Download All as ZIP ({totalUploadedCount})
                </a>
              ) : (
                <span
                  title="Available once at least one file is uploaded"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400"
                >
                  <FolderArchive className="h-3.5 w-3.5" />
                  Download ZIP (0 files)
                </span>
              )
            ) : (
              <span
                title="Upgrade to the Firm (£39.99/mo) plan to download all client files in a single ZIP archive"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500"
              >
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                ZIP Export (Firm Plan)
              </span>
            )}

            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 capitalize">
              Status: {request.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <RequestReviewClient requestId={request.id} items={reviewItems} />

      {/* Reminder Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Chase & Email Log
          </h2>
        </div>

        {!logs || logs.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No reminders logged yet.</div>
        ) : (
          <ul className="divide-y divide-slate-200 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="px-6 py-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="capitalize font-medium">{log.reminder_type}</span> sent to{' '}
                  {log.recipient_email}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(log.sent_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading request details...</div>}>
      <RequestDetailContent paramsPromise={params} />
    </Suspense>
  )
}