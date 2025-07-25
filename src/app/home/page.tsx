'use client'

import { useState, useEffect, useRef } from 'react'
import { useDisableActions } from '@/components/layout/Header'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'
import { Button, Input } from '@/components/ui';
import { Upload, Globe, Settings2, Send, Bot } from 'lucide-react';

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

  type Props = {
  actions: Action[]
  onSelect: (action: Action) => void
}

export default function HomePage() {
  const [actions, setActions] = useState<Action[]>([])
  const [selected, setSelected] = useState<Action | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const disableActions = useDisableActions()
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mounted, setMounted] = useState(false);
  
  
  // dropdown voor buddies  
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  
 
  useEffect(() => {
  const fetch = async () => {
    const { data } = await supabase
      .from('actions')
      .select('*')
      .order('name')
      .eq('action_type', 'free_prompt')

    setActions(data || [])

    const defaultAction = data?.find(action => action.slug === 'vrije_prompt_algemeen')
    setSelected(defaultAction ?? null)
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


useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  
  const handleSelectAction = (action: Action) => {
  setSelected(action);
  setMessages([
    {
      role: 'system'
      // hier system prompt zetten. 
    },
  ]);
};

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
          <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto w-[80vw] mx-auto max-w-3xl space-y-2 pr-2">
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
                        ? 'bg-green-100 text-black text-right'
                        : 'bg-white text-black text-left'
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {msg.role === 'user' ? 'Jij' : selected?.name || 'AI'}:
                    </span>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-black text-left p-3 rounded-lg max-w-[80%]">
                    <span className="block text-sm font-semibold">{selected?.name || 'AI'}:</span>
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
            
            
           {/* chatbox */}
            <div className="sticky bottom-0 w-[80vw] max-w-3xl mx-auto bg-zinc-200 dark:bg-zinc-800 p-4 rounded-2xl shadow-sm mb-10">
            	<div className="flex flex-col gap-3">        
      					{/* Input veld */}
  							<input
    							type="text"
    							placeholder="Typ hier je prompt..."
    							value={input}
        					onChange={(e) => setInput(e.target.value)}
    							className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 dark:placeholder-zinc-400 px-1 py-2 border-none focus:outline-none focus:ring-0"
      				  />
      	
      					<div className="flex justify-between items-center">
          				<div className="flex gap-2">
      							
      							
      							
      							
            				
            				
            				
            				<div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Select Action"
      >
      <Bot className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 w-48 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-10">
          <ul className="max-h-60 overflow-y-auto text-sm">
            {actions.map(action => (
              <li
                key={action.id}
                onClick={() => {
                handleSelectAction(action)  
                  setOpen(false)
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {action.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
            				
            				
            				
            				<button
              				title="Instellingen"
              				className="p-2 rounded-md border border-zinc-400 dark:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition border-none"
            				>
              			<Settings2 className="w-5 h-5" />
            				</button>
        					</div>
									<button className="p-2 rounded-md border border-zinc-400 dark:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition border-none">
            				<Upload className="w-5 h-5" />
          				</button>
      						<button
            				title="Verstuur"
            					className="p-2 rounded-md border border-zinc-400 dark:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition border-none"
          				>
            			<Send className="w-5 h-5" />
          				</button>
            		</div>
  						</div>
</div>
            
    
             
             
             
            </form>
          </div>
      </div>
    </Layout>
  )
}
