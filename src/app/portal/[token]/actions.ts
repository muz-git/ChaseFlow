'use server'

import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function uploadItemDocument(
  rawToken: string,
  itemId: string,
  formData: FormData
) {
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return { error: 'Please select a file to upload.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File exceeds the 15 MB size limit.' }
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      error: 'Unsupported file type. Please upload a PDF, image, CSV, Excel, or Word file.',
    }
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const admin = createAdminClient()

  // 1. Validate magic link token
  const { data: docRequest, error: reqError } = await admin
    .from('document_requests')
    .select('id, organization_id, status, token_expires_at')
    .eq('access_token_hash', tokenHash)
    .single()

  if (reqError || !docRequest) {
    return { error: 'Invalid or unrecognized upload link.' }
  }

  if (docRequest.status === 'cancelled') {
    return { error: 'This document request has been cancelled.' }
  }

  if (
    docRequest.token_expires_at &&
    new Date(docRequest.token_expires_at) < new Date()
  ) {
    return { error: 'This upload link has expired. Please contact your accountant for a new link.' }
  }

  // 2. Verify the item belongs to this exact request
  const { data: item, error: itemError } = await admin
    .from('request_items')
    .select('id')
    .eq('id', itemId)
    .eq('request_id', docRequest.id)
    .single()

  if (itemError || !item) {
    return { error: 'Checklist item not found for this request.' }
  }

  // 3. Upload binary file to private Supabase Storage bucket
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${docRequest.organization_id}/${docRequest.id}/${item.id}/${Date.now()}-${safeName}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await admin.storage
    .from('client-documents')
    .upload(storagePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    return { error: `Storage upload failed: ${uploadError.message}` }
  }

  // 4. Insert metadata into documents table
  const { error: docInsertError } = await admin.from('documents').insert({
    organization_id: docRequest.organization_id,
    request_item_id: item.id,
    original_filename: file.name,
    storage_path: storagePath,
    mime_type: file.type || 'application/octet-stream',
    file_size: file.size,
  })

  if (docInsertError) {
    return { error: docInsertError.message }
  }

  // 5. Mark checklist item as 'received'
  await admin
    .from('request_items')
    .update({ status: 'received' })
    .eq('id', item.id)

  // 6. Check whether all items in this request are now received/approved
  const { data: allItems } = await admin
    .from('request_items')
    .select('status')
    .eq('request_id', docRequest.id)

  const allDone =
    allItems &&
    allItems.length > 0 &&
    allItems.every((i) => i.status === 'received' || i.status === 'approved')

  await admin
    .from('document_requests')
    .update({
      status: allDone ? 'completed' : 'in_progress',
      completed_at: allDone ? new Date().toISOString() : null,
    })
    .eq('id', docRequest.id)

  revalidatePath(`/portal/${rawToken}`)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/requests')

  return { success: true }
}