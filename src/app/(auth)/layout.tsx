export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative"
        style={{ background: 'var(--ink)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--rose))', color: 'var(--ink)', fontSize: 22, fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', fontWeight: 700 }}
          >m</div>
          <div>
            <div className="serif text-white" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Mise <span style={{ color: 'var(--gold)', fontStyle: 'italic', fontWeight: 300 }}>OS</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Event Operating System</div>
          </div>
        </div>

        {/* Quote */}
        <div>
          <div className="serif text-white" style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 24 }}>
            "Every perfect event starts with one system."
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { stat: '2,400+', label: 'Events managed' },
              { stat: '₹48Cr+', label: 'Revenue tracked' },
              { stat: '99.2%', label: 'Day-of reliability' },
            ].map(s => (
              <div key={s.stat} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span className="serif" style={{ fontSize: 22, color: 'var(--gold)', fontWeight: 400 }}>{s.stat}</span>
                <span className="mono" style={{ fontSize: 11, color: '#555', letterSpacing: '0.05em' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mono" style={{ fontSize: 10, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Built for Indian event professionals
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  )
}
