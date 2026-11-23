import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

async function Navbar() {
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
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-bold text-lg text-slate-900">
              ChaseFlow
            </Link>
            {org && (
              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                {org.name}
              </span>
            )}
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/clients"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clients
            </Link>
            <Link
              href="/dashboard/requests"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Requests
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden sm:inline">{user.email}</span>
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
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <header className="bg-white border-b border-slate-200 h-16" />
        }
      >
        <Navbar />
      </Suspense>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}