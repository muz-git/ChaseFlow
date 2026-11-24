import { Suspense } from 'react'
import crypto from 'crypto'
import Link from 'next/link'
import { connection } from 'next/server'
import { ShieldCheck, Calendar, Lock, AlertCircle, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Logo } from '@/components/Logo'
import { PortalChecklist } from './PortalChecklist'

async function PortalContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ token: string }>
}) {
  await connection()
  const { token } = await paramsPromise
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const admin = createAdminClient()

  // 1. Direct lookup on document_requests (no relational joins)
  const { data: request, error } = await admin
    .from('document_requests')
    .select(
      'id, organization_id, client_id, title, description, status, due_date, token_expires_at'
    )
    .eq('access_token_hash', tokenHash)
    .maybeSingle()

  if (error || !request) {
    console.error('Portal lookup error:', error?.message, error?.details)
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Logo size="sm" />
        </div>
        <div className="mx-auto my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Link Not Found
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This document upload link is invalid or no longer active. Please contact your accountant for a fresh link.
          </p>
        </div>
        <p className="text-center text-xs text-slate-400">
          Powered by ChaseFlow Secure Document Collection
        </p>
      </div>
    )
  }

  const isExpired =
    request.token_expires_at &&
    new Date(request.token_expires_at) < new Date()

  if (isExpired || request.status === 'cancelled') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Logo size="sm" />
        </div>
        <div className="mx-auto my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Link Expired
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This upload link has expired. Please reach out to your accountant to request a new upload link.
          </p>
        </div>
        <p className="text-center text-xs text-slate-400">
          Powered by ChaseFlow Secure Document Collection
        </p>
      </div>
    )
  }

  // 2. Fetch firm name, client name, and checklist items independently
  const [{ data: org }, { data: client }, { data: items }] = await Promise.all([
    admin
      .from('organizations')
      .select('name')
      .eq('id', request.organization_id)
      .maybeSingle(),
    admin
      .from('clients')
      .select('name')
      .eq('id', request.client_id)
      .maybeSingle(),
    admin
      .from('request_items')
      .select('id, name, description, status, created_at')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true }),
  ])

  const itemIds = (items ?? []).map((i) => i.id)
  const { data: docs } = itemIds.length
    ? await admin
        .from('documents')
        .select('id, request_item_id, original_filename, file_size, uploaded_at')
        .in('request_item_id', itemIds)
    : { data: [] }

  const sortedItems = (items ?? []).map((item) => ({
    ...item,
    documents: (docs ?? []).filter((d) => d.request_item_id === item.id),
  }))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top security & branding header */}
      <header className="border-b border-slate-200/90 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="hidden text-xs font-semibold text-slate-600 sm:inline">
              {org?.name || 'Accounting Practice'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            256-Bit Encrypted Portal
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {org?.name || 'Accounting Practice'}
            </span>
            {request.due_date && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Due{' '}
                {new Date(request.due_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {request.title}
          </h1>

          <p className="mt-1.5 text-sm text-slate-600">
            Prepared for{' '}
            <strong className="font-semibold text-slate-900">
              {client?.name}
            </strong>{' '}
            · No account or password required
          </p>

          {request.description && (
            <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-700">
              {request.description}
            </div>
          )}