// lib/auth.ts
'use client'

import { supabase } from './supabaseClient'

export const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/' // force refresh naar home/login
}