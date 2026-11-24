'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signupWithFirm } from '@/app/auth/actions'
import { Logo } from '@/components/Logo'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    const result = await signupWithFirm(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Back to home
        </Link>
      </div>

      <div className="mx-auto my-auto w-full max-w-md py-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" aria-label="fetchdocs Home">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Create your practice workspace
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="firmName" className="block text-sm font-semibold text-slate-700">
                Accounting Firm Name
              </label>
              <input
                id="firmName"
                name="firmName"
                type="text"
                autoComplete="organization"
                required
                placeholder="e.g. Northgate Accountancy Ltd"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@firm.co.uk"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Creating workspace...' : 'Start Free 14-Day Trial'}
            </button>
          </form>

          <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-slate-900 transition hover:text-emerald-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        UK & EU encrypted storage · Setup in under 2 minutes
      </p>
    </main>
  )
}