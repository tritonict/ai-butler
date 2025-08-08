// components/layout/Sidebar.tsx
'use client'

import { Home, Settings, LogOut, Users, Activity } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { handleLogout } from '@/lib/auth'
import { IfRole } from '@/components/IfRole'
import { useTranslations } from 'next-intl'
import Link from 'next/link';
import { useEffect, useRef } from 'react';




export default function Sidebar({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  const t = useTranslations('sidebar')
  const { role } = useAuth()
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
  touchStartX.current = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e: React.TouchEvent) => {
  touchEndX.current = e.changedTouches[0].screenX;

  if (
    touchStartX.current !== null &&
    touchEndX.current !== null &&
    touchStartX.current - touchEndX.current > 50 // swipe left
  ) {
    toggle(); // sluit sidebar
  }
};
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggle();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggle]);

  return (
    <aside ref={sidebarRef} 
    onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
    className={`bg-gray-200 dark:bg-gray-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition duration-200 ease-in-out z-50`}>
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
        <IfRole role="admin">
          <a href="/admin/dashboard" className="flex items-center gap-2 text-neutral-800 dark:text-white">
            <Activity size={18} /> {t('admindashboard')}
          </a>
        </IfRole>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut size={18} /> {t('logout')}
        </button>
      </div>
    </aside>
  )
}
