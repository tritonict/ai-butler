// components/layout/Sidebar.tsx
'use client'

import { motion } from 'framer-motion'
import { Home, Settings, LogOut, Users, Activity } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { handleLogout } from '@/lib/auth'
import { IfRole } from '@/components/IfRole'
import { useTranslations } from 'next-intl'
import Link from 'next/link';

export default function Sidebar({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  const t = useTranslations('sidebar')
  const { role } = useAuth()

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 256 : 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-neutral-800 h-full overflow-hidden shadow-lg"
    >
      <div className="flex flex-col p-4 gap-4 w-64">
        <Link href="/" className="flex items-center gap-2 text-neutral-800 dark:text-white">
          <Home size={18} /> {t('dashboard')}
        </Link>
        <a href="/actions" className="flex items-center gap-2 text-neutral-800 dark:text-white">
          <Activity size={18} /> {t('aiagentactions')}
        </a>
        <a href="/settings" className="flex items-center gap-2 text-neutral-800 dark:text-white">
          <Settings size={18} /> {t('settings')}
        </a>
        <IfRole role="admin">
          <a href="/admin" className="flex items-center gap-2 text-neutral-800 dark:text-white">
            <Users size={18} /> {t('rolemanagement')}
          </a>
        </IfRole>
        <IfRole role="admin">
          <a href="/admin/actions" className="flex items-center gap-2 text-neutral-800 dark:text-white">
            <Activity size={18} /> {t('actionsmanagement')}
          </a>
        </IfRole>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut size={18} /> {t('logout')}
        </button>
      </div>
    </motion.div>
  )
}
