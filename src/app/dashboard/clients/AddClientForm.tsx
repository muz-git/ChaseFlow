'use client'

import { useRef, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { addClient } from './actions'

export function AddClientForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    const result = await addClient(formData)
    setPending(false)

    if (result?.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        Add New Client
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Client or Business Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Sarah Jenkins / Oakwood Ltd"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Client Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="sarah@oakwood.co.uk"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 h-[38px]"
        >
          <UserPlus className="w-4 h-4" />
          {pending ? 'Adding...' : 'Add Client'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}