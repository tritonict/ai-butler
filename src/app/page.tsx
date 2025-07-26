'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {getTranslations} from 'next-intl/server';
import Image from 'next/image'

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [mounted, setMounted] = useState(false);
  
  
 

  useEffect(() => {
    if (user) router.push('/home')
  }, [user, router])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage({ type: 'error', text: 'Inloggen mislukt. Controleer je gegevens.' })
    }
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage({ type: 'error', text: 'Registreren mislukt. Probeer een ander e-mailadres.' })
    } else if (!data.session) {
      setMessage({ type: 'success', text: 'Account aangemaakt. Bevestig je e-mailadres via de mail voordat je kunt inloggen.' })
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }
  
   
   useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 
  

  if (user === undefined) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white p-4">
      


    <div className="flex flex-col items-center justify-center px-4">
      <Image
        src="/logo_black.png"
        alt="Logo"
        width={150}
        height={150}
        className="mb-1 w-32 sm:w-40 md:w-48 "
        priority
      />
    </div>
 
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className="w-full max-w-sm p-3 rounded text-black mb-3"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Wachtwoord"
        className="w-full max-w-sm p-3 rounded text-black mb-3"
      />
      <button onClick={handleLogin} className="w-full max-w-sm bg-blue-600 text-white py-3 rounded mb-2">
        Log in
      </button>
      <button
        onClick={handleGoogleLogin}
        className="w-full max-w-sm flex items-center justify-center gap-2 border border-gray-300 bg-white text-black py-3 rounded shadow hover:shadow-md transition mb-4"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Log in met Google
      </button>
      <button onClick={handleSignup} className="w-full max-w-sm bg-gray-600 text-white py-3 rounded mb-4">
        Sign up
      </button>
      {message && (
        <p className={`mt-4 text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
