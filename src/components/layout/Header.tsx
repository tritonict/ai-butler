'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Menu } from 'lucide-react'

let globalRefresh: (() => void) | null = null
export function triggerTokenRefresh() {
  globalRefresh?.()
}

export function useDisableActions() {
  const [disabled, setDisabled] = useState(false)
  useEffect(() => {
    const check = async () => {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return
      const { data } = await supabase.from('profiles').select('saldo').eq('id', user.id).single()
      setDisabled((data?.saldo ?? 0) <= 0)
    }
    check()
  }, [])
  return disabled
}

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { user } = useAuth()
  const [dailyTokens, setDailyTokens] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const [saldo, setSaldo] = useState<number | null>(null)
  const [tokenView, setTokenView] = useState<'daily' | 'total'>('daily')
  const [disableActions, setDisableActions] = useState(false)

  const fetchTokenStats = async () => {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayData } = await supabase
      .from('agent_logs')
      .select('token_usage')
      .eq('user_id', user.id)
      .gte('started_at', today.toISOString())

    const { data: allData } = await supabase
      .from('agent_logs')
      .select('token_usage')
      .eq('user_id', user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('saldo')
      .eq('id', user.id)
      .single()

    const dailySum = todayData?.reduce((sum, row) => sum + (row.token_usage || 0), 0) || 0
    const totalSum = allData?.reduce((sum, row) => sum + (row.token_usage || 0), 0) || 0

    setDailyTokens(dailySum)
    setTotalTokens(totalSum)
    setSaldo(profile?.saldo ?? null)
    setDisableActions((profile?.saldo ?? 0) <= 0)
  }

  useEffect(() => {
    globalRefresh = fetchTokenStats
    fetchTokenStats()
    return () => {
      globalRefresh = null
    }
  }, [user])

  const formattedSaldo = saldo !== null ? saldo.toFixed(4) : '0.00'
  const toggleView = () => setTokenView(tokenView === 'daily' ? 'total' : 'daily')
  const tokenText = tokenView === 'daily' ? `${dailyTokens}` : `${totalTokens}`

  return (
  <>
    <header className="w-full bg-gray-100 dark:bg-neutral-900 shadow-md">
    <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
    	<div className="flex items-center gap-3">
    		<button onClick={toggleSidebar} className="p-2">
        	<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        	</svg>
      	</button>
        
        <div className="flex items-center gap-2">
        	<img src="/logo_black.png" alt="Logo" className="w-8 h-8" />
        	<span className="text-lg font-bold text-neutral-800 dark:text-white">AI Butler</span>
      	</div>
      </div>
      
      <div className="flex items-center gap-4 text-neutral-800 dark:text-white text-sm sm:text-base">
      	<div><span onClick={toggleView} >{tokenText} tokens</span></div>
      	<div><span>€ {formattedSaldo}</span></div>
    	</div>    
             
        
        
       
    </div>  
    </header>
		{disableActions && (
  		<div className="w-full bg-red-600 text-white text-center py-3 text-sm">
    		Je saldo is op. Vul aan om verder te gaan.
  		</div>
		)}
		</>
  )
}

