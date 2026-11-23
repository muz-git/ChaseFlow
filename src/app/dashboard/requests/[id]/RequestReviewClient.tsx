'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Download,
  BellRing,
  Copy,
  Check,
  Clock,
} from 'lucide-react'
import { updateItemStatus, sendManualChase } from './actions'

interface DocWithUrl {
  id: string
  original_filename: string
  file_size: number
  uploaded_at: string
  signedUrl: string | null
}

interface ReviewItem {
  id: string
  name: string
  description: string | null
  status: string
  documents: DocWithUrl[]
}

export function RequestReviewClient({
  requestId,
  items,
}: {
  requestId: string
  items: ReviewItem[]
}) {
  const [busyItemId, setBusyItemId] = useState<string | null>(null)
  const [chasing, setChasing] = useState(false)
  const [chaseBanner, setChaseBanner] = useState<{
    portalUrl?: string
    warning?: string | null
    error?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleStatus(itemId: string, status: 'approved' | 'rejected') {
    setBusyItemId(itemId)
    await updateItemStatus(requestId, itemId, status)
    setBusyItemId(null)
  }

  async function handleChase() {
    setChasing(true)
    setChaseBanner(null)
    const res = await sendManualChase(requestId)
    setChasing(false)

    if (res?.error) {
      setChaseBanner({ error: res.error })
    } else {
      setChaseBanner({
        portalUrl: res.portalUrl,
        warning: res.emailWarning,
      })
    }
  }

  async function copyLink() {
    if (!chaseBanner?.portalUrl) return
    await navigator.clipboard.writeText(chaseBanner.portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasOutstanding = items.some(
    (i) => i.status === 'pending' || i.status === 'rejected'
  )

  return (
    <div className="space-y-6">
      {/* Chase Action Bar */}
      {hasOutstanding && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Outstanding Items Remaining
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Send a reminder email with a fresh magic upload link listing only unuploaded or rejected items.
            </p>
          </div>

          <button
            type="button"
            onClick={handleChase}
            disabled={chasing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shrink-0"
          >
            <BellRing className="w-4 h-4" />
            {chasing ? 'Sending Reminder...' : 'Send Chase Reminder'}
          </button>
        </div>
      )}

      {chaseBanner?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {chaseBanner.error}
        </div>
      )}

      {chaseBanner?.portalUrl && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-900">
            Chase reminder logged and fresh portal link generated!
          </p>
          {chaseBanner.warning && (
            <p className="text-xs text-amber-800 bg-amber-100 px-2.5 py-1.5 rounded">
              Resend sandbox note: {chaseBanner.warning}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={chaseBanner.portalUrl}
              className="w-full rounded border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy New Link'}
            </button>
          </div>
        </div>
      )}

      {/* Checklist Items & Uploaded Files */}
      <div className="space-y-4">
        {items.map((item) => {
          const isBusy = busyItemId === item.id

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.status === 'received'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : item.status === 'rejected'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.status === 'pending' && <Clock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  )}
                </div>

                {item.documents.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isBusy || item.status === 'approved'}
                      onClick={() => handleStatus(item.id, 'approved')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || item.status === 'rejected'}
                      onClick={() => handleStatus(item.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {item.documents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No file uploaded yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-slate-50">
                  {item.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {doc.original_filename}
                        </p>
                        <p className="text-xs text-slate-500">
                          {Math.max(1, Math.round(doc.file_size / 1024))} KB • Uploaded{' '}
                          {new Date(doc.uploaded_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {doc.signedUrl && (
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}