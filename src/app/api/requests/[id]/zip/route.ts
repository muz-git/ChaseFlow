import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanConfig } from '@/lib/plans'

function sanitizeSegment(value: string, fallback: string) {
  const cleaned = value
    .replace(/[^a-zA-Z0-9._ -]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  return cleaned || fallback
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify membership & Firm plan tier
  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(id, name, plan)')
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 403 })
  }

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations

  const planConfig = getPlanConfig(org?.plan)
  if (!planConfig.features.zipExport) {
    return NextResponse.json(
      { error: '1-Click ZIP Pack Export is available on the Firm (£39.99/mo) plan.' },
      { status: 403 }
    )
  }

  // RLS ensures request belongs to the user's organization
  const { data: docRequest, error: reqError } = await supabase
    .from('document_requests')
    .select('id, client_id, title')
    .eq('id', id)
    .single()

  if (reqError || !docRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const [{ data: client }, { data: items }] = await Promise.all([
    supabase
      .from('clients')
      .select('name')
      .eq('id', docRequest.client_id)
      .single(),
    supabase
      .from('request_items')
      .select('id, name, created_at')
      .eq('request_id', docRequest.id)
      .order('created_at', { ascending: true }),
  ])

  const itemIds = (items ?? []).map((i) => i.id)
  if (itemIds.length === 0) {
    return NextResponse.json({ error: 'No checklist items found' }, { status: 404 })
  }

  const { data: docs } = await supabase
    .from('documents')
    .select('id, request_item_id, original_filename, storage_path')
    .in('request_item_id', itemIds)

  if (!docs || docs.length === 0) {
    return NextResponse.json(
      { error: 'No documents have been uploaded for this request yet.' },
      { status: 400 }
    )
  }

  const zip = new JSZip()
  const admin = createAdminClient()
  const itemMap = new Map((items ?? []).map((item, idx) => [item.id, { item, idx }]))
  const usedPaths = new Set<string>()

  await Promise.all(
    docs.map(async (doc) => {
      const { data: blob, error: downloadError } = await admin.storage
        .from('client-documents')
        .download(doc.storage_path)

      if (downloadError || !blob) {
        console.error('ZIP file download error:', doc.storage_path, downloadError?.message)
        return
      }

      const entry = itemMap.get(doc.request_item_id)
      const folderPrefix = entry
        ? `${String(entry.idx + 1).padStart(2, '0')}_${sanitizeSegment(entry.item.name, 'Item')}`
        : 'Documents'

      let filename = sanitizeSegment(doc.original_filename, `file_${doc.id}`)
      let fullPath = `${folderPrefix}/${filename}`

      // Avoid overwriting files with identical names inside the same folder
      let counter = 2
      while (usedPaths.has(fullPath)) {
        const dotIndex = filename.lastIndexOf('.')
        const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename
        const ext = dotIndex > 0 ? filename.slice(dotIndex) : ''
        fullPath = `${folderPrefix}/${base}_${counter}${ext}`
        counter++
      }
      usedPaths.add(fullPath)

      const arrayBuffer = await blob.arrayBuffer()
      zip.file(fullPath, arrayBuffer)
    })
  )

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  const clientSlug = sanitizeSegment(client?.name || 'Client', 'Client')
  const titleSlug = sanitizeSegment(docRequest.title, 'Document_Pack')
  const archiveName = `${clientSlug}_${titleSlug}.zip`

  return new Response(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${archiveName}"`,
      'Cache-Control': 'no-store',
    },
  })
}