import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Client: <strong className="text-slate-900">{client?.name}</strong> ({client?.email})
            </p>
          </div>

          <span className="inline-flex items-center self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 capitalize">
            Status: {request.status.replace('_', ' ')}
          </span>
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