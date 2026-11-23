'use client'

import { useState } from 'react'
import { Plus, Trash2, Send, Check, Copy } from 'lucide-react'
import { createDocumentRequest } from './actions'

interface ClientOption {
  id: string
  name: string
  email: string
}

const PRESETS: Record<string, { title: string; items: string[] }> = {
  'Self-Assessment Pack': {
    title: '2025/26 Self-Assessment Tax Return',
    items: [
      'P60 End of Year Certificate',
      '12 Months Business Bank Statements (PDF)',
      'Dividend Vouchers & Interest Certificates',
      'Summary of Allowable Business Expenses',
    ],
  },
  'Year-End Accounts': {
    title: 'Annual Accounts & Corporation Tax Pack',
    items: [
      'All Business Bank & Credit Card Statements',
      'Sales Invoices Issued During Period',
      'Purchase Receipts & Supplier Bills',
      'Payroll Summaries (P32 / P11D)',
    ],
  },
}

export function CreateRequestForm({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<string[]>([''])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdPortalUrl, setCreatedPortalUrl] = useState<string | null>(null)
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function applyPreset(presetKey: string) {
    const preset = PRESETS[presetKey]
    if (!preset) return
    setTitle(preset.title)
    setItems([...preset.items])
  }

  function updateItem(index: number, value: string) {
    const updated = [...items]
    updated[index] = value
    setItems(updated)
  }

  function addItemRow() {
    setItems([...items, ''])
  }

  function removeItemRow(index: number) {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreatedPortalUrl(null)
    setEmailWarning(null)
    setPending(true)

    const result = await createDocumentRequest({
      clientId,
      title,
      description,
      dueDate,
      items,
    })

    setPending(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    setCreatedPortalUrl(result.portalUrl || null)
    setEmailWarning(result.emailWarning || null)
    setTitle('')
    setDescription('')
    setDueDate('')
    setItems([''])
  }

  async function copyLink() {
    if (!createdPortalUrl) return
    await navigator.clipboard.writeText(createdPortalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
        You need to add at least one client on the <strong>Clients</strong> tab before sending a document request.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          New Document Request
        </h2>

        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((presetName) => (
            <button
              key={presetName}
              type="button"
              onClick={() => applyPreset(presetName)}
              className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
            >
              + {presetName}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Client
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Request Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 VAT Return Documents"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Instructions for Client (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Please upload PDF statements covering 1 July to 30 September."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Requested Documents Checklist
        </label>

        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              required
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={`Document #${idx + 1} (e.g. Last 3 months bank statements)`}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItemRow(idx)}
                className="text-slate-400 hover:text-red-600 p-2"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItemRow}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 pt-1"
        >
          <Plus className="w-4 h-4" />
          Add another document
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {createdPortalUrl && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-900">
            Document request created!
          </p>
          {emailWarning && (
            <p className="text-xs text-amber-800 bg-amber-100 px-2.5 py-1.5 rounded">
              Resend sandbox note: {emailWarning} (You can still test the client portal directly using the magic link below.)
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={createdPortalUrl}
              className="w-full rounded border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Portal Link'}
            </button>
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {pending ? 'Sending Request...' : 'Send Document Request'}
        </button>
      </div>
    </form>
  )
}