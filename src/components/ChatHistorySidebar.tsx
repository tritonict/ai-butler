'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Session = {
  session_id: string
  action_id: string
  prompt: string
  started_at: string
}

type ChatHistorySidebarProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (sessionId: string, actionId: string) => void
}

export default function ChatHistorySidebar({
  isOpen,
  onClose,
  onSelect,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('homepage')

  
   useEffect(() => {
    if (!isOpen) return

    const fetchSessions = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError(t('notloggedon'))
        return
      }

      const { data, error } = await supabase
        .from('vw_sessions')
        .select('session_id, action_id, prompt, started_at')
        .order('started_at', { ascending: false })

      if (error) {
        console.error('[SESSIONS ERROR]', error.message)
        setError(t('cannotloadhistory'))
      } else {
        setSessions(data)
        setError(null)
      }
    }

    fetchSessions()
  }, [isOpen])



  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">{t('history')}</h2>
        <button onClick={onClose} aria-label="Close" className="text-xl">&times;</button>
      </div>
      <div className="p-4 overflow-y-auto">
        {error && <p className="text-red-500">{error}</p>}
        {sessions.length === 0 && !error && <p className="text-gray-500">{t('nosessionsfound')}</p>}
        <ul>
          {sessions.map(session => (
            <li key={session.session_id}>
              <button
                className="w-full text-left px-4 py-2 my-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => {
                  onSelect(session.session_id, session.action_id)
                  onClose()
                }}
              >
                {session.prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}