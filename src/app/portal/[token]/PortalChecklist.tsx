'use client'

import { useState } from 'react'
import { Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { uploadItemDocument } from './actions'

interface UploadedDoc {
  id: string
  original_filename: string
  file_size: number
  uploaded_at: string
}

interface ChecklistItem {
  id: string
  name: string
  description: string | null
  status: string
  documents: UploadedDoc[]
}

export function PortalChecklist({
  rawToken,
  items,
}: {
  rawToken: string
  items: ChecklistItem[]
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const receivedCount = items.filter(
    (i) => i.status === 'received' || i.status === 'approved'
  ).length

  async function handleFileChange(
    itemId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    setErrors((prev) => ({ ...prev, [itemId]: '' }))
    setUploadingId(itemId)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadItemDocument(rawToken, itemId, formData)
    setUploadingId(null)
    e.target.value = ''

    if (result?.error) {
      setErrors((prev) => ({ ...prev, [itemId]: result.error! }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
          <span>Checklist Progress</span>
          <span>
            {receivedCount} of {items.length} uploaded
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${items.length > 0 ? Math.round((receivedCount / items.length) * 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {items.map((item) => {
          const isReceived =
            item.status === 'received' || item.status === 'approved'
          const isUploading = uploadingId === item.id

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {isReceived ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                </div>

                {item.description && (
                  <p className="text-sm text-slate-600 pl-7">
                    {item.description}
                  </p>
                )}

                {item.documents && item.documents.length > 0 && (
                  <div className="pl-7 pt-1 space-y-1">
                    {item.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1 mr-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{doc.original_filename}</span>
                        <span className="text-emerald-600">
                          ({Math.max(1, Math.round(doc.file_size / 1024))} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {errors[item.id] && (
                  <p className="pl-7 text-xs text-red-600 pt-1">
                    {errors[item.id]}
                  </p>
                )}
              </div>

              <div className="pl-7 sm:pl-0 shrink-0">
                <label
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                    isReceived
                      ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {isReceived ? 'Add Another File' : 'Upload File'}
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => handleFileChange(item.id, e)}
                  />
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}