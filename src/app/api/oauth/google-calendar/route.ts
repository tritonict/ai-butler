// file: /app/api/oauth/google-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID()
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_REDIRECT_URI
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const scope = [
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar'
  ].join(' ')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    redirect_uri: redirectUri!,
    scope,
    state,
    access_type: 'offline',
    prompt: 'consent'
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
