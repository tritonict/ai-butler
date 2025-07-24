// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Layout from '@/components/layout/Layout'
import { supabase } from '@/lib/supabaseClient'
import { IfRole } from '@/components/IfRole'

export default function AdminPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, role')
      if (!error && data) {
        setProfiles(data)
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [])

  const handleRoleChange = async (id: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    if (!error) {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === id ? { ...profile, role: newRole } : profile
        )
      )
    }
  }

  if (loading) {
    return null
  }

  return (
    <IfRole role="admin">
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-2xl font-semibold mb-4">Beheer gebruikersrollen</h2>
          <table className="w-full border text-left">
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              <tr>
                <th className="p-2 border">Naam</th>
                <th className="p-2 border">Email (huidige gebruiker)</th>
                <th className="p-2 border">Rol</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-t">
                  <td className="p-2 border">{profile.full_name}</td>
                  <td className="p-2 border">
                    {user?.id === profile.id ? user.email : '–'}
                  </td>
                  <td className="p-2 border">
                    <select
                      value={profile.role || 'gebruiker'}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                      className="border p-1 rounded text-black"
                    >
                      <option value="gebruiker">gebruiker</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </IfRole>
  )
}
