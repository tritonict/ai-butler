'use client'

import { useState, useEffect, useRef } from 'react'
import { useDisableActions } from '@/components/layout/Header'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'

type Action = {
  id: string
  name: string
  description?: string
  slug: string
  action_type?: string
  prompt_template: string
  parameters?: Record<string, string>
  is_active: boolean
  system_prompt?: string
  // voeg hier velden toe die je nog gebruikt
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [selected, setSelected] = useState<Action | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const disableActions = useDisableActions()
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('actions').select('*').order('name')
      setActions(data || [])
    }
    fetch()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (selected && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [selected])

  const handleSubmit = async () => {
    if (!input.trim() || !selected || disableActions || loading) return

    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const updatedMessages = [...messages, { role: 'user', content: input.trim() }]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/agent', {
      method: 'POST',
      body: JSON.stringify({
        prompt: input,
        action_id: selected.id,
        user_id: user.id,
        parameters: selected.parameters,
        inputs: {}
      }),
    })
    const data = await res.json()

    setMessages([...updatedMessages, { role: 'assistant', content: data?.output || 'Geen antwoord' }])
    setLoading(false)
  }

  return (
    <Layout>
      <div className="pl-8 pr-4 flex flex-col h-[calc(100vh-4rem)]">
        {!selected ? (
          <div className="grid gap-2">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                disabled={disableActions}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {a.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4">{selected.name}</h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`whitespace-pre-wrap max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-700 text-white text-right'
                        : 'bg-neutral-700 text-green-300 text-left'
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {msg.role === 'user' ? 'Jij' : 'AI'}:
                    </span>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-700 text-green-300 text-left p-3 rounded-lg max-w-[80%]">
                    <span className="block text-sm font-semibold">AI:</span>
                    typing...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="mt-4 mb-2 flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 bg-neutral-800 text-white rounded"
                placeholder="Typ je vraag..."
                disabled={disableActions || loading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={disableActions || loading || !input.trim()}
              >
                Verstuur
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
