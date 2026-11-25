import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { Logo } from '@/components/Logo'

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
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" aria-label="FetchDocs Dashboard">
              <Logo size="sm" />
            </Link>
            {org && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                {org.name}
              </span>
            )}
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/clients"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Clients
            </Link>
            <Link
              href="/dashboard/requests"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Requests
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Branding
            </Link>
            <Link
              href="/dashboard/billing"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Billing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-slate-500 md:inline">
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        <Link
          href="/dashboard"
          className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/clients"
          className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Clients
        </Link>
        <Link
          href="/dashboard/requests"
          className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Requests
        </Link>
        <Link
          href="/dashboard/settings"
          className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Branding
        </Link>
        <Link
          href="/dashboard/billing"
          className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Billing
        </Link>
      </nav>
    </header>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <Suspense
        fallback={
          <header className="h-16 border-b border-slate-200 bg-white" />
        }
      >
        <Navbar />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}