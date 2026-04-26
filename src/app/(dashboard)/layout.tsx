import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar  from '@/components/layout/Topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, tenants(name)')
    .eq('id', user.id)
    .single()

  const userName   = profile?.full_name   ?? user.email ?? 'User'
  const userRole   = profile?.role        ?? 'lead_planner'
  const tenantName = (profile?.tenants as { name?: string } | null)?.name ?? 'My Agency'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      <Sidebar userName={userName} userRole={userRole} tenantName={tenantName} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar userRole={userRole} />
        <main
          className="scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
