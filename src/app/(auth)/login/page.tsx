'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, Phone, ArrowRight, Loader2 } from 'lucide-react'

type LoginMethod = 'magic' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [method, setMethod]     = useState<LoginMethod>('magic')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [step, setStep]         = useState<'input' | 'verify'>('input')
  const [loading, setLoading]   = useState(false)

  async function handleMagicLink() {
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Magic link sent! Check your email.')
    setStep('verify')
  }

  async function handlePhoneOTP() {
    if (!phone) return toast.error('Enter your phone number')
    setLoading(true)
    if (step === 'input') {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      setLoading(false)
      if (error) return toast.error(error.message)
      toast.success('OTP sent to ' + phone)
      setStep('verify')
    } else {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      setLoading(false)
      if (error) return toast.error('Invalid OTP')
      toast.success('Logged in!')
      router.push('/cockpit')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
    borderRadius: 6, fontSize: 14, background: '#fff', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s',
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '13px', background: 'var(--ink)', color: '#fff',
    border: 0, borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Mobile logo */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--rose))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', fontWeight: 700, fontSize: 18 }}>m</div>
        <span className="serif" style={{ fontSize: 24, fontWeight: 500 }}>Mise <span style={{ color: 'var(--gold)', fontStyle: 'italic', fontWeight: 300 }}>OS</span></span>
      </div>

      <div className="mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Welcome back</div>
      <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 6 }}>Sign in</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        Access your event workspace
      </p>

      {/* Method tabs */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 3, marginBottom: 24, gap: 2 }}>
        {[
          { id: 'magic', label: 'Email link', icon: Mail },
          { id: 'otp',   label: 'Phone OTP', icon: Phone },
        ].map(m => {
          const Icon = m.icon
          const active = method === m.id
          return (
            <button
              key={m.id}
              onClick={() => { setMethod(m.id as LoginMethod); setStep('input'); }}
              style={{ flex: 1, padding: '9px', background: active ? 'var(--ink)' : 'transparent', color: active ? '#fff' : 'var(--muted)', border: 0, borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', transition: 'all 0.2s' }}
            >
              <Icon size={13} strokeWidth={1.5} /> {m.label}
            </button>
          )
        })}
      </div>