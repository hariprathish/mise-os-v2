'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', client_name: '', date: '', type: 'Wedding', stage: 'Pitch', venue: '', guest_count: '', budget: '', color: '#C8941F', notes: '', client_phone: '', client_email: '' })

  const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!form.name || !form.client_name || !form.date) { setError('Name, client and date required.'); return; }
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user!.id).single()
      const { data, error: err } = await supabase.from('events').insert({ tenant_id: profile?.tenant_id, ...form, guest_count: parseInt(form.guest_count)||0, budget: parseFloat(form.budget)||0, spent: 0, total_tasks: 0, completed_tasks: 0, active_blockers: 0 }).select().single()
      if (err) throw err
      router.push(`/events/${data.id}`)
    } catch (err: any) { setError(err.message); setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href="/events">← All events</Link>
      <h1>Create an event</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Event name" value={form.name} onChange={set('name')} required />
        <input placeholder="Client name" value={form.client_name} onChange={set('client_name')} required />
        <input type="date" value={form.date} onChange={set('date')} required />
        {error && <p>{error}</p>}
        <button type="submit" disabled={saving}>{Saving ? 'Saving...' : 'Create Event'}</button>
      </form>
    </div>
  )
}
