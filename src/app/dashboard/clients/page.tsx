import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Trash2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AddClientForm } from './AddClientForm'
import { deleteClient } from './actions'

async function ClientsContent() {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your firm's client directory. Only team members in your organization can view these records.
        </p>
      </div>

      <AddClientForm />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!clients || clients.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No clients added yet. Use the form above to add your first client.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Added</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {client.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {client.email}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(client.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <form
                      action={async () => {
                        'use server'
                        await deleteClient(client.id)
                      }}
                      className="inline"
                    >
                      <button
                        type="submit"
                        title="Delete client"
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading clients...</div>}>
      <ClientsContent />
    </Suspense>
  )
}