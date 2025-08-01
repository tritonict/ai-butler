'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'
import { Button, Input } from '@/components/ui';
import { H1 } from '@/components/ui/Headings';
import { useAuth } from '@/components/AuthProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
 
  const { user } = useAuth()

  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [calendarLinked, setCalendarLinked] = useState(false)
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('settings')
  const g = useTranslations('general')

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (error) {
        setMessage('Kon profiel niet ophalen')
      } else {
        setFullName(data.full_name || '')
      }

      const { data: token, error: tokenError } = await supabase
        .from('google_tokens')
        .select('access_token')
        .eq('id', user.id)
        .maybeSingle()

      if (token && token.access_token) {
        setCalendarLinked(true)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleGoogleCalendarConnect = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_REDIRECT_URI;
  const scope = 'https://www.googleapis.com/auth/calendar';
  const state = user?.id; // <-- gebruik je huidige user ID

  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
              `client_id=${clientId}&` +
              `redirect_uri=${redirectUri}&` +
              `response_type=code&` +
              `scope=${scope}&` +
              `access_type=offline&` +
              `prompt=consent&` + 
              `state=${state}`;

  window.location.href = url;
};


  const handleUnlink = async () => {
  	if (!user) return; // of toon een foutmelding
    await supabase.from('google_tokens').delete().eq('id', user.id)
    setCalendarLinked(false)
  }
  
  
  

  const handleSave = async () => {
  if (!user) return; // of toon een foutmelding
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      setMessage('Er ging iets mis bij het opslaan')
    } else {
      setMessage('Profiel bijgewerkt')
    }
  }
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Layout>
      <div className="p-4 max-w-xl mx-auto">
        <H1>{t('settings')}</H1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">{t('fullname')}</label>
          <Input 
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <LanguageSwitcher />
        <Button variant="blue" onClick={handleSave} >
          {g('save')}
        </Button>

        <div className="mt-8">
          <H1>{t("connectors")}</H1>
          {loading ? (
            <span>{t('busyloading')}</span>
          ) : calendarLinked ? (
            <Button variant="red"
              onClick={handleUnlink}
            >
              {t('disconnect')} Google Calendar
            </Button>
          ) : (
            <Button variant="green"
  
              onClick={handleGoogleCalendarConnect}
            >
              {t('connect')} Google Calendar
            </Button>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </Layout>
  )
}
