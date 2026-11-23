import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Users, FileText, Clock, CheckCircle2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function DashboardOverview() {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  // Fetch live counts (RLS automatically scopes these to the user's organization)
  const [{ count: clientCount }, { data: requests }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('document_requests').select('id, status'),
  ])

  const allRequests = requests ?? []
  const activeRequests = allRequests.filter(
    (r) => r.status === 'pending' || r.status === 'in_progress'
  ).length
  const completedRequests = allRequests.filter(
    (r) => r.status === 'completed'
  ).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {org ? `${org.name} Overview` : 'Dashboard Overview'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track client onboarding and outstanding document checklists.
          </p>
        </div>

        <Link
          href="/dashboard/clients"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total Clients</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {clientCount ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total Requests</span>
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {allRequests.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-sm font-medium text-slate-500">Awaiting Docs</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {activeRequests}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-sm font-medium text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {completedRequests}
          </p>
        </div>
      </div>

      {/* Getting Started Callout */}
      {(clientCount ?? 0) === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Add your first client to get started
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
            Once a client is added to your firm roster, you can send them a magic-link document checklist in seconds.
          </p>
          <Link
            href="/dashboard/clients"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to Clients
          </Link>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading dashboard...</div>}>
      <DashboardOverview />
    </Suspense>
  )
}