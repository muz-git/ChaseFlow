'use client'

import { useState } from 'react'

type DocStatus = 'approved' | 'review' | 'awaiting'

interface DemoItem {
  id: string
  title: string
  meta: string
  fileName?: string
  status: DocStatus
}

const initialDocs: DemoItem[] = [
  {
    id: 'bank',
    title: '12 Months Business Bank Statements (PDF / CSV)',
    meta: 'Uploaded 2 hours ago · Verified complete (Apr 2025 – Mar 2026)',
    fileName: 'Barclays_Business_2025_26.pdf',
    status: 'approved',
  },
  {
    id: 'p60',
    title: 'P60 End of Year Certificate',
    meta: 'Uploaded 14 mins ago · Click Approve to test workflow',
    fileName: 'Hartwell_P60_2026.pdf',
    status: 'review',
  },
  {
    id: 'dividends',
    title: 'Dividend Vouchers & Interim Minutes',
    meta: 'Next polite reminder scheduled: Tomorrow at 9:00 AM',
    status: 'awaiting',
  },
]

const faqs = [
  {
    q: 'Do my clients need to create an account or remember a password?',
    a: 'No. Every request generates a unique, encrypted magic link. Your client clicks the link in their email on their phone or computer, drops in their PDFs, spreadsheets, or photos, and closes the tab.',
  },
  {
    q: 'How do automated weekday reminders work?',
    a: 'On Practice and Firm plans, FetchDocs sends polite, branded email nudges at 9:00 AM on weekdays only—never on weekends—and automatically stops the moment the final document is uploaded.',
  },
  {
    q: 'Where are client tax records stored and is it GDPR compliant?',
    a: 'All files are encrypted in transit (TLS 1.3) and at rest inside UK/EU data centres with strict row-level isolation per accounting practice and timestamped audit logs.',
  },
  {
    q: 'Can I white-label the client upload portal with my firm logo?',
    a: 'Yes. Practice and Firm plans let you upload your firm logo and set your brand accent colour so clients see your practice identity rather than generic third-party software.',
  },
  {
    q: 'Can I switch plans or cancel anytime?',
    a: 'Yes. Every plan starts with a full 14-day free trial. You can upgrade, downgrade, or cancel with one click inside your Billing portal with zero lock-in contracts.',
  },
]

export function HeroProductDemo() {
  const [view, setView] = useState<'accountant' | 'client'>('accountant')
  const [docs, setDocs] = useState<DemoItem[]>(initialDocs)

  const approvedCount = docs.filter((d) => d.status === 'approved').length
  const uploadedCount = docs.filter((d) => d.status !== 'awaiting').length

  function approveDoc(id: string) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'approved',
              meta: 'Approved just now · Logged in audit trail',
            }
          : d
      )
    )
  }

  function simulateClientUpload(id: string) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'review',
              fileName: 'Dividend_Vouchers_FY26.pdf',
              meta: 'Uploaded just now via Magic Link · Ready for review',
            }
          : d
      )
    )
  }

  function resetDemo() {
    setDocs(initialDocs)
  }

  return (
    <div className="mx-auto mt-14 max-w-4xl">
      {/* View Switcher Pill */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/90 p-1">
          <button
            type="button"
            onClick={() => setView('accountant')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              view === 'accountant'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accountant Dashboard View
          </button>
          <button
            type="button"
            onClick={() => setView('client')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              view === 'client'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Client Magic-Link View
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Interactive preview — try approving or uploading a file</span>
          {(approvedCount > 1 || uploadedCount > 2) && (
            <button
              type="button"
              onClick={resetDemo}
              className="font-semibold text-emerald-700 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Browser Frame */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950 p-2 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-3 rounded-md bg-slate-900 px-2.5 py-0.5 font-mono text-[11px] text-slate-400">
              {view === 'accountant'
                ? 'fetchdocs.co.uk/dashboard/requests/sa-2026'
                : 'fetchdocs.co.uk/portal/hartwell-sa26?token=live_magic'}
            </span>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] font-medium text-emerald-400 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            TLS 1.3 Encrypted
          </span>
        </div>

        {view === 'accountant' ? (
          <div className="rounded-xl bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Auto-Chase Active
                  </span>
                  <span className="text-xs text-slate-400">Due 31 Jan 2027</span>
                </div>
                <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                  2025/26 Self-Assessment Pack — Hartwell Design Ltd
                </h2>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {uploadedCount} of {docs.length} Received
                </span>
                <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(uploadedCount / docs.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                      {doc.fileName && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                          {doc.fileName}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{doc.meta}</p>
                  </div>

                  <div className="shrink-0">
                    {doc.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
                        ✓ Approved
                      </span>
                    )}
                    {doc.status === 'review' && (
                      <button
                        type="button"
                        onClick={() => approveDoc(doc.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                      >
                        Approve File →
                      </button>
                    )}
                    {doc.status === 'awaiting' && (
                      <span className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                        Auto-Nudge 9:00 AM
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-6 sm:p-8">
            <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Whitaker & Co Chartered Accountants
                  </span>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                    Hi Sarah, please upload your 2025/26 records
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  No login required
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                      <p className="text-xs text-slate-500">
                        {doc.status === 'awaiting'
                          ? 'Drag & drop PDF, CSV, JPG, or Excel'
                          : `Uploaded: ${doc.fileName}`}
                      </p>
                    </div>
                    {doc.status === 'awaiting' ? (
                      <button
                        type="button"
                        onClick={() => simulateClientUpload(doc.id)}
                        className="shrink-0 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                      >
                        + Simulate Upload
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        ✓ Received
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mx-auto mt-12 max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
      {faqs.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div key={item.q} className="py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-base font-semibold text-slate-900">{item.q}</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-600">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && <p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
