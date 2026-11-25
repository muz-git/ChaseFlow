import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { FaqAccordion, HeroProductDemo } from '@/components/LandingInteractive'

const features = [
  {
    title: 'Zero-Password Magic Portals',
    description:
      'Clients click a secure, encrypted link straight from their inbox—no forgotten passwords, portal registrations, or phone support.',
  },
  {
    title: 'Automated Weekday Chasing',
    description:
      'Set a due date once. FetchDocs politely follows up at 9:00 AM on weekdays until every bank statement, P60, or receipt is uploaded.',
  },
  {
    title: 'Instant Review & Audit Trail',
    description:
      'Preview uploaded PDFs and spreadsheets inside your dashboard, approve or reject files with one click, and keep a timestamped compliance log.',
  },
  {
    title: 'White-Label Firm Branding',
    description:
      'Display your accounting practice logo and brand accent colour on every client upload portal so clients trust the link immediately.',
  },
  {
    title: '1-Click ZIP Pack Export',
    description:
      'Once a client checklist is complete, bundle every approved PDF, CSV, and receipt into a neatly named ZIP archive ready for your tax software.',
  },
  {
    title: 'UK Self-Assessment & VAT Presets',
    description:
      'Launch requests in seconds using ready-made checklists for Sole Traders, Limited Company Year-End, Quarterly VAT, and Payroll.',
  },
]

const tiers = [
  {
    name: 'Starter',
    price: '£9.99',
    period: '/month',
    description: 'Ideal for sole bookkeepers and independent practitioners starting out.',
    highlights: [
      'Up to 10 document requests / month',
      '10 GB encrypted UK/EU document storage',
      '1 accountant seat',
      'Manual 1-click reminder emails',
      'Standard FetchDocs client portal',
      'Individual document downloads',
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
      'Up to 50 document requests / month',
      '50 GB encrypted UK/EU document storage',
      '1 accountant seat',
      'Automated weekday client reminder emails',
      'White-label firm logo & custom brand accent',
      'Individual document downloads',
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
      'Unlimited document requests',
      '250 GB encrypted UK/EU document storage',
      'Up to 5 team seats',
      'Automated weekday client reminder emails',
      'White-label firm logo & custom brand accent',
      '1-Click ZIP pack export per client request',
    ],
    cta: 'Start 14-Day Free Trial',
    featured: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
            <a href="#faq" className="transition hover:text-slate-900">
              FAQ
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
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white pt-14 pb-24 sm:pt-20 sm:pb-28">
        {/* Subtle Architectural Grid + Emerald Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_70%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Purpose-Built for UK Accountants & Bookkeepers
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.1]">
              Stop chasing clients for{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                missing tax records.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Send branded document checklists in 30 seconds. Clients upload bank statements,
              receipts, and P60s through a password-free magic link while FetchDocs handles the
              follow-up emails automatically.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/signup"
                className="w-full rounded-xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 sm:w-auto"
              >
                Start Free 14-Day Trial
              </Link>
              <a
                href="#pricing"
                className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
              >
                View Practice Plans →
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span>✓ 14-day free trial</span>
              <span>✓ Zero client passwords</span>
              <span>✓ UK & EU GDPR encrypted storage</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>

          {/* Interactive Dual-View Product Demo */}
          <HeroProductDemo />
        </div>
      </section>

      {/* Old Way vs FetchDocs Comparison */}
      <section className="border-b border-slate-200/80 bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Why Practices Switch
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Replace inbox chaos with a structured collection pipeline
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Old Way */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                ✕ The Old Way
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Scattered emails, blurry photos & manual chasing
              </h3>
              <ul className="mt-5 space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500">✕</span>
                  <span>
                    Clients ignore clunky client portals because they forgot their password from last
                    January.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500">✕</span>
                  <span>
                    Attachments arrive across 14 separate reply-all emails, WhatsApp messages, and
                    unlabelled ZIP files.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-rose-500">✕</span>
                  <span>
                    Senior staff waste billable hours every week manually tracking who still owes a
                    P60 or Q3 bank statement.
                  </span>
                </li>
              </ul>
            </div>

            {/* FetchDocs Way */}
            <div className="rounded-2xl border-2 border-emerald-600/90 bg-slate-900 p-8 text-white shadow-xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                ✓ With FetchDocs
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                One magic link, automatic nudges & filing-ready packs
              </h3>
              <ul className="mt-5 space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-400">✓</span>
                  <span>
                    Clients tap one encrypted link on mobile or desktop and upload straight into each
                    checklist slot.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-400">✓</span>
                  <span>
                    FetchDocs automatically sends polite 9:00 AM weekday reminders until every item
                    is received.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-bold text-emerald-400">✓</span>
                  <span>
                    Approve files as they arrive and export the entire completed client pack in one
                    click.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-slate-200/80 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Simple 3-Step Workflow
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              From request to filing-ready in minutes
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Built so every member of your practice can send a request on day one without training.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create a Client Checklist',
                body: 'Pick a client, choose a Self-Assessment, VAT, or custom checklist, and set your target deadline.',
              },
              {
                step: '02',
                title: 'Client Uploads via Magic Link',
                body: 'Your client receives a one-click upload portal branded with your firm logo—zero login friction on phone or PC.',
              },
              {
                step: '03',
                title: 'Review, Approve & Export',
                body: 'Inspect PDFs and CSVs immediately, request a replacement if a page is missing, and download the complete pack.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-7 transition hover:border-emerald-300 hover:bg-white hover:shadow-md"
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
      <section id="features" className="border-b border-slate-200/80 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Everything You Need
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Designed to eliminate January & quarter-end bottlenecks
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
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

      {/* UK Compliance & Security Strip */}
      <section className="border-b border-slate-200/80 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Security & UK GDPR First
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Built to protect sensitive client tax & financial records
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              TLS 1.3 & AES-256 Encryption
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              UK / EU Data Residency
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              Scoped Magic-Link Tokens
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              Full Upload Audit Logs
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-slate-200/80 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Transparent Pricing
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Simple monthly plans that pay for themselves in one saved hour
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Start with a 14-day free trial on any tier. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col justify-between rounded-2xl p-8 ${
                  tier.featured
                    ? 'relative border-2 border-emerald-500 bg-slate-900 text-white shadow-2xl'
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
                  <p
                    className={`mt-1 text-xs ${
                      tier.featured ? 'text-emerald-300/90' : 'text-slate-500'
                    }`}
                  >
                    Includes 14-day free trial · Cancel anytime
                  </p>

                  <ul className="mt-7 space-y-3 text-sm">
                    {tier.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="font-bold text-emerald-500">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className={`mt-8 block rounded-xl px-5 py-3.5 text-center text-sm font-semibold transition ${
                    tier.featured
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400'
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

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Common questions from UK accounting practices
            </h2>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* Final Conversion CTA Banner */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-slate-900 px-8 py-14 text-center text-white shadow-xl sm:px-14">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to reclaim hours every week from document chasing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            Create your FetchDocs workspace in under two minutes and send your first client
            checklist today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-emerald-500 px-7 py-3.5 text-base font-bold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
            >
              Start Your 14-Day Free Trial
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size="sm" />
          <p className="text-xs text-slate-500">
            © 2026 FetchDocs. Secure Client Document Collection for UK Accounting Practices.
          </p>
          <div className="flex gap-6 text-xs font-medium text-slate-600">
            <a href="#pricing" className="hover:text-slate-900">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
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
