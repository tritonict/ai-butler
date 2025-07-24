// file: /app/api/oauth/google-calendar/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    console.error('Missing code or state')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=missing_code_or_state`)
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_REDIRECT_URI!,
        grant_type: 'authorization_code'
      }).toString()
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Failed token exchange:', tokenData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=token_exchange_failed`)
    }

    
    const { error } = await supabase.from('google_tokens').upsert({
      id: state,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      created_at: new Date(Date.now()).toISOString(),
      scope: tokenData.scope,
      token_type: tokenData.token_type
    })

    if (error) {
      console.error('Failed to store tokens:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=token_store_failed`)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings?success=google_calendar_connected`)
  } catch (err) {
    console.error('Unexpected error in callback:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=unexpected`)
  }
}
