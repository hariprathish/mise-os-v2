import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ChevronRight } from 'lucide-react'
import StatCard   from '@/components/shared/StatCard'
import SectionHead from '@/components/shared/SectionHead'
import { formatINR, daysUntil, formatShortDate } from '@/lib/utils'
import type { Event, Alert, EventTask } from '@/types'

export const revalidate = 30

export default async function CockpitPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('tenant_id, full_name').eq('id', user.id).single()
  const tenantId = profile?.tenant_id
  const firstName = (profile?.full_name ?? 'there').split(' ')[0]

  // Parallel fetches
  const [eventsRes, alertsRes, tasksRes] = await Promise.all([
    supabase.from('events').select('*').eq('tenant_id', tenantId).neq('stage', 'Complete').order('date', { ascending: true }),
    supabase.from('alerts').select('*').eq('tenant_id', tenantId).eq('resolved', false).order('created_at', { ascending: false }).limit(8),
    supabase.from('event_tasks').select('*').eq('tenant_id', tenantId).in('status', ['pending', 'blocked']).order('created_at', { ascending: true }).limit(8),
  ])

  const events: Event[]     = eventsRes.data  ?? []
  const alerts: Alert[]     = alertsRes.data  ?? []
  const tasks:  EventTask[] = tasksRes.data   ?? []

  const highAlerts   = alerts.filter(a => a.severity === 'high').length
  const todayTasks   = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0] || t.status === 'blocked')
  const totalPipeline = events.reduce((s, e) => s + (e.budget ?? 0), 0)
  const totalSpent   = events.reduce((s, e) => s + (e.spent ?? 0), 0)

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="stagger">
      <div style={{ marginBottom: 28 }}>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 400 }}>Good morning, {firstName}.</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div><h2>Events in flight</h2></div>
        <div><h2>Needs your call</h2></div>
      </div>
    </div>
  )
}
