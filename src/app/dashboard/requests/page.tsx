import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanConfig } from '@/lib/plans'
import { CreateRequestForm } from './CreateRequestForm'

async function RequestsContent() {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const startOfMonth = new Date()
  startOfMonth.setUTCDate(1)
  startOfMonth.setUTCHours(0, 0, 0, 0)

  const [{ data: clients }, { data: requests }, { data: membership }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, email')
      .order('name', { ascending: true }),
    supabase
      .from('document_requests')
      .select('id, title, status, due_date, created_at, clients(name, email), request_items(id, status)')
      .order('created_at', { ascending: false }),
    supabase
      .from('organization_members')
      .select('organization_id, organizations(plan, trial_ends_at)')
      .eq('user_id', user.id)
      .single(),
  ])

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  const planConfig = getPlanConfig(org?.plan)

  const monthlyUsed = (requests ?? []).filter(
    (r) => new Date(r.created_at) >= startOfMonth
  ).length

  const limit = planConfig.monthlyRequestLimit
  const usagePercent = limit ? Math.min(100, Math.round((monthlyUsed / limit) * 100)) : 0
  const isAtLimit = limit !== null && monthlyUsed >= limit

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Requests</h1>
          <p className="text-sm text-slate-600 mt-1">
            Send magic-link document checklists and track upload progress across your clients.
          </p>
        </div>

        {/* Plan Usage Pill */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:min-w-[260px]">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-700">{planConfig.name} Plan ({planConfig.priceLabel})</span>
            <span className={isAtLimit ? 'text-rose-600' : 'text-slate-600'}>
              {limit === null
                ? `${monthlyUsed} sent this month (Unlimited)`
                : `${monthlyUsed} / ${limit} this month`}
            </span>
          </div>
          {limit !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  isAtLimit
                    ? 'bg-rose-500'
                    : usagePercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <CreateRequestForm clients={clients ?? []} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Sent Requests
          </h2>
        </div>

        {!requests || requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No document requests sent yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Request</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {requests.map((req) => {
                const client = Array.isArray(req.clients)
                  ? req.clients[0]
                  : req.clients
                const items = req.request_items ?? []
                const completedCount = items.filter(
                  (i) => i.status === 'received' || i.status === 'approved'
                ).length

                return (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {client?.name || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/requests/${req.id}`}
                        className="font-medium text-slate-900 underline decoration-slate-300 hover:decoration-slate-900"
                      >
                        {req.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {completedCount} / {items.length} items
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {req.due_date
                        ? new Date(req.due_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200 capitalize">
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/requests/${req.id}`}
                        className="text-xs font-semibold text-slate-900 hover:underline"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading requests...</div>}>
      <RequestsContent />
    </Suspense>
  )
}