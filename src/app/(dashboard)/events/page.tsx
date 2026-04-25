import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatINR, daysUntil, stageColor } from '@/lib/utils'
import type { Event } from '@/types'

export const revalidate = 30

export default async function EventsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  const tenantId = profile?.tenant_id

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: true })

  const evts: Event[] = events ?? []

  return (
    <div className="stagger">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Events</div>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 }}>All events</h1>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{evts.length} total · all event types</div>
        </div>
        <Link href="/events/new" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '9px 16px', background: 'var(--ink)', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Plus size={13} /> New Event
          </div>
        </Link>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {evts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 40, background: '#fff', border: '1px solid var(--line)', borderRadius: 6, textAlign: 'center' }}>
            <div className="serif" style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>No events yet</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Create your first event to get started</div>
            <Link href="/events/new" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-flex', padding: '9px 18px', background: 'var(--ink)', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 500, gap: 6, cursor: 'pointer' }}>
                <Plus size={13} /> Create event
              </div>
            </Link>
          </div>
        )}
        {evts.map(ev => {
          const days = daysUntil(ev.date)
          const pct  = ev.total_tasks > 0 ? Math.round((ev.completed_tasks / ev.total_tasks) * 100) : 0
          return (
            <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = ev.color}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = 'var(--line)'}
              >
                <div style={{ height: 5, background: ev.color }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className={`mono text-xs px-2 py-0.5 rounded ${stageColor(ev.stage)}`} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 3, letterSpacing: '0.1em' }}>{ev.stage.toUpperCase()}</span>
                    <span className="mono" style={{ fontSize: 10, color: days < 30 ? 'var(--rose)' : 'var(--muted)' }}>D-{days}</span>
                  </div>
                  <h3 className="serif" style={{ fontSize: 20, fontWeight: 500, margin: '0 0 3px', letterSpacing: '-0.01em' }}>{ev.name}</h3>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 16 }}>{ev.type} · {ev.guest_count} guests · {ev.venue}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Budget</div>
                      <div className="serif" style={{ fontSize: 15, fontWeight: 500 }}>{formatINR(ev.budget)}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Spent</div>
                      <div className="serif" style={{ fontSize: 15, fontWeight: 500, color: ev.budget > 0 && ev.spent / ev.budget > 0.85 ? 'var(--rose)' : 'var(--text)' }}>{formatINR(ev.spent)}</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ev.color }} />
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ev.completed_tasks}/{ev.total_tasks} tasks done</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
