// components/IfRole.tsx
'use client'

import { useAuth } from '@/components/AuthProvider'

export function IfRole({
  role,
  children,
}: {
  role: string
  children: React.ReactNode
}) {
  const { role: current } = useAuth()
  if (current !== role) return null
  return <>{children}</>
}