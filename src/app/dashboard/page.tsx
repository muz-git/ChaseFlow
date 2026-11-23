import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

async function DashboardContent() {
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
    .select('role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-slate-900">ChaseFlow</span>
            {org && (
              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                {org.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{org ? `, ${org.name}` : ''}
        </h1>
        <p className="text-slate-600 mt-1">
          Your firm workspace is active and RLS-protected. Next up: Client Management & Document Requests.
        </p>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Loading workspace...</div>}>
      <DashboardContent />
    </Suspense>
  )
}