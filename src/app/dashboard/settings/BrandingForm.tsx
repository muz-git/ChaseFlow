'use client'

import { useState } from 'react'
import { Lock, Upload, Check, ShieldCheck, Trash2 } from 'lucide-react'
import { updateFirmBranding } from './actions'

const PRESET_COLORS = [
  { label: 'Emerald', hex: '#059669' },
  { label: 'Navy', hex: '#1e3a8a' },
  { label: 'Slate', hex: '#0f172a' },
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Burgundy', hex: '#881337' },
]

export function BrandingForm({
  initialName,
  initialLogoUrl,
  initialBrandColor,
  planName,
  canCustomize,
}: {
  initialName: string
  initialLogoUrl: string | null
  initialBrandColor: string
  planName: string
  canCustomize: boolean
}) {
  const [firmName, setFirmName] = useState(initialName)
  const [brandColor, setBrandColor] = useState(initialBrandColor || '#059669')
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setRemoveLogo(false)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleRemoveLogo() {
    setSelectedFile(null)
    setPreviewUrl(null)
    setRemoveLogo(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canCustomize) return

    setSaving(true)
    setMessage(null)

    const formData = new FormData()
    formData.set('firmName', firmName)
    formData.set('brandColor', brandColor)
    formData.set('removeLogo', String(removeLogo))
    if (selectedFile) {
      formData.set('logo', selectedFile)
    }

    const result = await updateFirmBranding(formData)
    setSaving(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setSelectedFile(null)
      if (result.logoUrl !== undefined) {
        setPreviewUrl(result.logoUrl)
      }
      setMessage({ type: 'success', text: 'Portal branding saved and live for all client links.' })
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Left: Settings Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3"
      >
        {!canCustomize && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">
                Available on Practice (£19.99/mo) & Firm (£39.99/mo)
              </p>
              <p className="mt-1 text-xs text-amber-800">
                You are currently on the <strong>{planName}</strong> plan. Upgrade to replace
                the FetchDocs header with your own practice logo and brand colours.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Practice Display Name
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Shown at the top of your client magic-link upload portals and emails.
          </p>
          <input
            type="text"
            value={firmName}
            disabled={!canCustomize}
            onChange={(e) => setFirmName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="e.g. Hartwell & Co Accountants"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Practice Logo
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            PNG, JPG, WebP, or SVG up to 2 MB. Horizontal or square logos work best.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 ${
                !canCustomize ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <Upload className="h-4 w-4 text-slate-500" />
              {previewUrl ? 'Replace Logo' : 'Upload Logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={!canCustomize}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {previewUrl && canCustomize && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Portal Accent Colour
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Used for your firm label, top accent bar, and security badge on client portals.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                disabled={!canCustomize}
                onClick={() => setBrandColor(preset.hex)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  brandColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-white/40"
                  style={{ backgroundColor: preset.hex }}
                />
                {preset.label}
              </button>
            ))}

            <div className="flex items-center gap-2 pl-1">
              <input
                type="color"
                value={brandColor}
                disabled={!canCustomize}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5 disabled:opacity-50"
              />
              <span className="font-mono text-xs uppercase text-slate-500">{brandColor}</span>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-xs font-medium ${
              message.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canCustomize || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Portal Branding'}
          </button>
        </div>
      </form>

      {/* Right: Live Client Portal Preview */}
      <div className="lg:col-span-2">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Live Client Portal Preview
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="h-1.5 w-full" style={{ backgroundColor: brandColor }} />
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={firmName}
                  className="h-8 max-w-[140px] object-contain"
                />
              ) : (
                <span className="text-sm font-bold text-slate-900">
                  {firmName || 'Your Accounting Practice'}
                </span>
              )}
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: brandColor }}
            >
              <ShieldCheck className="h-3 w-3" />
              Encrypted
            </span>
          </div>

          <div className="p-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: brandColor }}
              >
                {firmName || 'Your Accounting Practice'}
              </p>
              <p className="mt-1 text-base font-extrabold text-slate-900">
                2025/26 Self-Assessment Pack
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Prepared for Jane Smith · No login required
              </p>
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs font-medium text-slate-600">
                Client Drag & Drop Upload Box
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Powered by FetchDocs
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}