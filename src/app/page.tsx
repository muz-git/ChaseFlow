import Link from 'next/link'
import { Logo } from '@/components/Logo'

const features = [
  {
    title: 'Zero-Password Magic Portals',
    description:
      'Clients click a secure, encrypted link straight from their inbox - no forgotten passwords, portal registrations, or phone support.',
  },
  {
    title: 'Automated Weekday Chasing',
    description:
      'Set a due date once. FetchDocs politely follows up at 9:00 AM on weekdays until every requested bank statement, P60, or receipt is uploaded.',
  },
  {
    title: 'Instant Review & Audit Trail',
    description:
      'Preview uploaded PDFs and spreadsheets inside your dashboard, approve or reject files with one click, and keep a timestamped compliance log.',
  },
]

const tiers = [
  {
    name: 'Starter',
    price: '£9.99',
    period: '/month',
    description: 'Ideal for sole bookkeepers and independent practitioners starting out.',
    highlights: [
      'Up to 10 active document requests/mo',
      '10 GB encrypted UK/EU client storage',
      'No-login magic link client portals',
      'UK Self-Assessment & VAT templates',
      'Manual 1-click email nudges',
    ],
    cta: 'Start 14-Day Free Trial',
    featured: false,
  },
  {
    name: 'Practice',
    price: '£19.99',
    period: '/month',
    description: 'Built for growing small firms tired of year-end chasing bottlenecks.',
    highlights: [
      'Up to 50 active document requests/mo',
      '50 GB encrypted UK/EU client storage',
      'Automated weekday reminder schedules',
      'Custom firm logo & portal branding',
      'Full document review & audit trail',
    ],
    cta: 'Start 14-Day Free Trial',
    featured: true,
  },
  {
    name: 'Firm',
    price: '£39.99',
    period: '/month',
    description: 'Complete document collection workflow for multi-staff practices.',
    highlights: [
      'Unlimited active document requests',
      '250 GB encrypted UK/EU client storage',
      'Up to 5 staff team logins',
      '1-click ZIP pack export per client',
      'Priority email delivery & support',
    ],
    cta: 'Start 14-Day Free Trial',
    featured: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" aria-label="FetchDocs Home">
            <Logo size="md" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-slate-900">
              How It Works
            </a>
            <a href="#features" className="transition hover:text-slate-900">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-slate-900">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Built for UK Accountants & Bookkeepers
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Stop chasing clients for{' '}
              <span className="text-emerald-600">missing tax records.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Send branded document checklists in 30 seconds. Clients upload bank statements,
              receipts, and P60s through a password-free magic link while FetchDocs handles the
              follow-up emails automatically.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="w-full rounded-xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
              >
                Start Free 14-Day Trial
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
              >
                Accountant Sign In →
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              No credit card required · UK & EU encrypted storage · Setup in under 2 minutes
            </p>
          </div>

          {/* Interactive Product Preview Mockup */}
          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-200 bg-slate-900 p-2 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-medium text-slate-400">
                fetchdocs.co.uk/dashboard/requests/sa-2026
              </span>
            </div>

            <div className="rounded-xl bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Active Checklist · Auto-Chase Enabled
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    2025/26 Self-Assessment Pack - Hartwell Design Ltd
                  </h2>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  2 of 3 Documents Received
                </span>
              </div>

              <div className="mt-5 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      12 Months Business Bank Statements (PDF/CSV)
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded by client · Barclays_2025_26.pdf
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Approved
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      P60 End of Year Certificate
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded 14 mins ago · Ready for review
                    </p>
                  </div>
                  <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    Review File
                  </span>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Dividend Vouchers & Summary
                    </p>
                    <p className="text-xs text-slate-500">
                      Next polite reminder scheduled: Tomorrow 9:00 AM
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Awaiting Client
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-slate-200/80 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Three steps from request to filing-ready
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Replace messy email chains and unencrypted attachments with a single structured workflow.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create a Checklist',
                body: 'Select a client, list the exact documents required, and set your deadline.',
              },
              {
                step: '02',
                title: 'Client Uploads via Magic Link',
                body: 'Your client receives a one-click upload portal that works cleanly on phone or desktop with zero login friction.',
              },
              {
                step: '03',
                title: 'Review, Approve & Export',
                body: 'Inspect files immediately, request replacements if a page is missing, and close the pack.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <span className="inline-block rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-emerald-400">
                  Step {item.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-slate-200/80 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Designed to eliminate January & quarter-end chaos
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-7"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Simple, transparent practice pricing
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Save hours of admin every week for less than one billable hour per month.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col justify-between rounded-2xl p-8 ${
                  tier.featured
                    ? 'border-2 border-emerald-600 bg-slate-900 text-white shadow-xl'
                    : 'border border-slate-200 bg-white text-slate-900 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    {tier.featured && (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      tier.featured ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {tier.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    <span
                      className={`text-sm ${
                        tier.featured ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3 text-sm">
                    {tier.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="font-bold text-emerald-500">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                    tier.featured
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size="sm" />
          <p className="text-xs text-slate-500">
            © 2026 FetchDocs. Secure Client Document Collection for Accounting Practices.
          </p>
          <div className="flex gap-6 text-xs font-medium text-slate-600">
            <Link href="/login" className="hover:text-slate-900">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-slate-900">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}