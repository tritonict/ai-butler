'use client'

import { useEffect, useState } from 'react'

type Session = {
  id: string
  title: string
}

type ChatHistorySidebarProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (sessionId: string) => void
}

export default function ChatHistorySidebar({
  isOpen,
  onClose,
  onSelect,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
   useEffect(() => {
    if (!isOpen) return
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history')
        if (!res.ok) throw new Error('Server error')
        const data = await res.json()
        setSessions(data)
        setError(null)
      } catch (err) {
        setError('Kan geschiedenis niet ophalen')
        setSessions([])
      }
    }
    fetchHistory()
  }, [isOpen])


  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">History</h2>
        <button onClick={onClose} aria-label="Close" className="text-xl">&times;</button>
      </div>
      <div className="p-4 overflow-y-auto">
        {error && <p className="text-red-500">{error}</p>}
        {sessions.length === 0 && !error && <p className="text-gray-500">Geen sessies gevonden</p>}
        <ul>
          {sessions.map(session => (
            <li key={session.session_id}>
              <button
                className="w-full text-left px-4 py-2 my-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => {
                  onSelect(session.session_id)
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