import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react'
import { formatINR, formatShortDate } from '@/lib/utils'
import type { Invoice, Expense, Event } from '@/types'

export const revalidate = 30

const invoiceStatusPill = (s: string) => {
  const map: Record<string, { bg: string; fg: string }> = {
    paid:     { bg: '#D6F0E4', fg: '#1F8A5F' },
    sent:     { bg: '#EEF8FF', fg: '#0EA5E9' },
    draft:    { bg: 'var(--cream)', fg: 'var(--muted)' },
    overdue:  { bg: '#FCE5DC', fg: 'var(--rose)' },
  }
  return map[s] ?? { bg: 'var(--cream)', fg: 'var(--muted)' }
}

export default async function FinancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  const tenantId = profile?.tenant_id

  const [invoicesRes, expensesRes, eventsRes] = await Promise.all([
    supabase.from('invoices').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(20),
    supabase.from('expenses').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }).limit(20),
    supabase.from('events').select('id, name, budget, spent, color').eq('tenant_id', tenantId).neq('stage', 'Complete'),
  ])

  const invoices: Invoice[] = invoicesRes.data ?? []
  const expenses: Expense[] = expensesRes.data ?? []
  const events: (Pick<Event, 'id' | 'name' | 'budget' | 'spent' | 'color'>)[] = eventsRes.data ?? []

  // KPIs
  const totalInvoiced  = invoices.reduce((s, i) => s + i.amount, 0)
  const totalReceived  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalOutstanding = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const totalExpenses  = expenses.reduce((s, e) => s + e.amount, 0)
  const overdueCnt     = invoices.filter(i => i.status === 'overdue').length
  const grossProfit    = totalReceived - expenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0)

  // Expense by category
  const expByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)
  const expCategories = Object.entries(expByCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="stagger">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Business</div>
        <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 }}>Finance & P&L</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Revenue, expenses, and invoices across all events</div>
      </div>

      {/* KPI rail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', marginBottom: 28 }}>
        {[
          { label: 'Total Invoiced', value: formatINR(totalInvoiced), sub: `${invoices.length} invoices`, tone: 'default' },
          { label: 'Received', value: formatINR(totalReceived), sub: 'cash in hand', tone: 'up' },
          { label: 'Outstanding', value: formatINR(totalOutstanding), sub: `${overdueCnt} overdue`, tone: overdueCnt > 0 ? 'alert' : 'default' },
          { label: 'Total Expenses', value: formatINR(totalExpenses), sub: 'all categories', tone: 'default' },
          { label: 'Gross Profit', value: formatINR(grossProfit), sub: 'received − paid exp.', tone: grossProfit >= 0 ? 'up' : 'down' },
          { label: 'Active Events', value: String(events.length), sub: 'in flight', tone: 'default' },
        ].map(m => {
          const color = m.tone === 'up' ? '#1F8A5F' : m.tone === 'down' || m.tone === 'alert' ? 'var(--rose)' : 'var(--text)'
          return (
            <div key={m.label} style={{ background: '#fff', padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 400, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{m.value}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>{m.sub}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Invoices */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em' }}>01</span>
              <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Invoices</h2>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>recent 20</div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {invoices.length === 0 && (
              <div style={{ padding: '20px 16px', fontSize: 12, color: 'var(--muted)' }}>No invoices yet. Create your first invoice from an event.</div>
            )}
            {invoices.map((inv, i) => {
              const sp = invoiceStatusPill(inv.status)
              return (
                <div key={inv.id} style={{ padding: '12px 16px', borderBottom: i < invoices.length - 1 ? '1px solid var(--line)' : 'none', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.invoice_number}</div>
                      {inv.status === 'overdue' && (
                        <span className="mono" style={{ fontSize: 8, padding: '1px 5px', background: '#FCE5DC', color: 'var(--rose)', borderRadius: 2 }}>OVERDUE</span>
                      )}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {inv.client_name} · {inv.event_name ?? 'No event'} · Due {formatShortDate(inv.due_date)}
                    </div>
                  </div>
                  <div className="serif" style={{ fontSize: 15, fontWeight: 500 }}>{formatINR(inv.amount)}</div>
                  <span className="mono" style={{ fontSize: 9, padding: '3px 7px', background: sp.bg, color: sp.fg, borderRadius: 3 }}>{inv.status.toUpperCase()}</span>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{formatShortDate(inv.created_at)}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Expense categories */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em' }}>02</span>
                <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Expense Breakdown</h2>
              </div>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {expCategories.length === 0 && (
                <div style={{ padding: '16px', fontSize: 12, color: 'var(--muted)' }}>No expenses recorded.</div>
              )}
              {expCategories.map(([cat, total], i) => {
                const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
                return (
                  <div key={cat} style={{ padding: '11px 16px', borderBottom: i < expCategories.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 500 }}>{cat}</span>
                      <span className="serif" style={{ fontSize: 13, fontWeight: 500 }}>{formatINR(total)}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.3s' }} />
                    </div>
                    <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(1)}% of total</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Event budgets */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em' }}>03</span>
              <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Event Budgets</h2>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {events.length === 0 && (
                <div style={{ padding: '16px', fontSize: 12, color: 'var(--muted)' }}>No active events.</div>
              )}
              {events.map((ev, i) => {
                const pct = ev.budget > 0 ? Math.round((ev.spent / ev.budget) * 100) : 0
                return (
                  <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '12px 16px', borderBottom: i < events.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{ev.name}</span>
                        <span className="mono" style={{ fontSize: 10, color: pct > 85 ? 'var(--rose)' : 'var(--muted)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 85 ? 'var(--rose)' : ev.color }} />
                      </div>
                      <div className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
                        {formatINR(ev.spent)} spent of {formatINR(ev.budget)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
          <span className="mono" style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em' }}>04</span>
          <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Recent Expenses</h2>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {expenses.length === 0 && (
            <div style={{ padding: '16px', fontSize: 12, color: 'var(--muted)' }}>No expenses recorded yet.</div>
          )}
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '8px 16px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
            {['Description', 'Category', 'Vendor', 'Date', 'Amount'].map(h => (
              <div key={h} className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {expenses.map((exp, i) => (
            <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '11px 16px', borderBottom: i < expenses.length - 1 ? '1px solid var(--line)' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{exp.description}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
                  <span style={{ padding: '1px 5px', background: exp.status === 'paid' ? '#D6F0E4' : '#FDF5DC', color: exp.status === 'paid' ? '#1F8A5F' : 'var(--gold)', borderRadius: 2 }}>{exp.status}</span>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{exp.category}</div>
              <div style={{ fontSize: 12 }}>{exp.vendor_name ?? '—'}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{formatShortDate(exp.date)}</div>
              <div className="serif" style={{ fontSize: 14, fontWeight: 500 }}>{formatINR(exp.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
