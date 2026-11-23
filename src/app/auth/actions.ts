'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const signupSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base || 'firm'}-${suffix}`
}

export async function signupWithFirm(formData: FormData) {
  const parsed = signupSchema.safeParse({
    firmName: formData.get('firmName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { firmName, email, password } = parsed.data
  const supabase = await createClient()
  const admin = createAdminClient()

  // 1. Create the Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Unable to create account' }
  }

  const userId = authData.user.id

  // 2. Create the accounting firm (organizations) using admin client
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: firmName.trim(),
      slug: generateSlug(firmName),
    })
    .select('id')
    .single()

  if (orgError || !org) {
    // Roll back auth user if firm creation fails so no orphan accounts remain
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Failed to create firm workspace. Please try again.' }
  }

  // 3. Link user as owner in organization_members
  const { error: memberError } = await admin
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner',
    })

  if (memberError) {
    await admin.from('organizations').delete().eq('id', org.id)
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Failed to assign firm ownership. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}