'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanConfig } from '@/lib/plans'

export async function updateFirmBranding(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(id, plan, logo_url)')
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { error: 'Could not verify firm membership' }
  }

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations

  const planConfig = getPlanConfig(org?.plan)

  if (!planConfig.features.customBranding) {
    return {
      error:
        'Custom logo and portal branding requires the Practice (£19.99/mo) or Firm (£39.99/mo) plan.',
    }
  }

  const firmName = String(formData.get('firmName') || '').trim()
  const brandColor = String(formData.get('brandColor') || '#059669').trim()
  const removeLogo = formData.get('removeLogo') === 'true'
  const logoFile = formData.get('logo') as File | null

  if (!firmName) {
    return { error: 'Practice name cannot be empty' }
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(brandColor)) {
    return { error: 'Please select a valid hex colour (e.g. #059669)' }
  }

  let nextLogoUrl: string | null = removeLogo ? null : (org?.logo_url ?? null)

  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) {
      return { error: 'Logo file must be smaller than 2 MB' }
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(logoFile.type)) {
      return { error: 'Please upload a PNG, JPG, WebP, or SVG image' }
    }

    const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'png'
    const filePath = `${membership.organization_id}/logo-${Date.now()}.${ext}`
    const arrayBuffer = await logoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const admin = createAdminClient()
    const { error: uploadError } = await admin.storage
      .from('firm-logos')
      .upload(filePath, buffer, {
        contentType: logoFile.type,
        upsert: true,
      })

    if (uploadError) {
      return { error: `Logo upload failed: ${uploadError.message}` }
    }

    const { data: publicUrlData } = admin.storage
      .from('firm-logos')
      .getPublicUrl(filePath)

    nextLogoUrl = publicUrlData.publicUrl
  }

  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from('organizations')
    .update({
      name: firmName,
      brand_color: brandColor,
      logo_url: nextLogoUrl,
    })
    .eq('id', membership.organization_id)

  if (updateError) {
    return { error: `Failed to save branding: ${updateError.message}` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')

  return { success: true, logoUrl: nextLogoUrl }
}