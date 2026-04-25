import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EventTabs from '@/components/events/EventTabs'
import type { Event } from '@/types'

export const revalidate = 30
interface Props { params: { id: string } }

export default async function EventWorkspacePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  const tenantId = profile?.tenant_id

  const { data: event } = await supabase.from('events').select('*').eq('id', params.id).eq('tenant_id', tenantId).single()
  if (!event) notFound()

  return (
    <div className="stagger">
      <Link href="/events">← All events</Link>
      <h1>{event.name}</h1>
      <EventTabs event={event as Event} tasks={[]} vendors={[]} family={[]} cues={[]} expenses={[]} invoices={[]} />
    </div>
  )
}
