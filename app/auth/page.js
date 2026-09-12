'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (isLogin) {
      // Connexion
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Vérifier si le profil existe, sinon le créer
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle()
        if (!profile) {
          const defaultUsername = username.trim() || email.split('@')[0]
          await supabase.from('profiles').insert({ id: data.user.id, username: defaultUsername })
        }
        router.push('/')
      }
    } else {
      // Inscription
      if (!username.trim()) {
        setError("Le nom d'utilisateur est requis.")
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        if (signUpError.message.includes('rate limit') || signUpError.message.includes('already registered')) {
          setError("Le compte existe déjà ou la limite d'emails a été atteinte. Clique sur l'onglet 'Connexion' ci-dessus pour te connecter directement !")
        } else {
          setError(signUpError.message)
        }
      } else if (data.user) {
        // Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, username: username.trim() })
        
        if (profileError) {
          // Si le profil existe déjà ou erreur RLS non critique, connecter l'utilisateur quand même
          setSuccess("Compte créé ! Redirection...")
          setTimeout(() => router.push('/'), 1000)
        } else {
          setSuccess("Compte créé avec succès ! Tu es maintenant connecté.")
          setTimeout(() => router.push('/'), 1000)
        }
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-main)',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img
            src="/logo.png"
            alt="Ligue 1 Logo"
            style={{ height: '65px', width: 'auto', margin: '0 auto 0.5rem auto', display: 'block', filter: 'drop-shadow(0 0 12px rgba(0, 255, 135, 0.4))' }}
          />
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Ligue 1 Fantasy DZ</h1>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {isLogin ? 'Connecte-toi pour gérer ton équipe' : 'Crée ton compte pour commencer'}
        </p>

        {/* Tabs Login / Signup */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => { setIsLogin(true); setError(null) }}
            style={{
              flex: 1, padding: '0.7rem', border: 'none', cursor: 'pointer',
              background: isLogin ? 'var(--primary)' : 'transparent',
              color: isLogin ? '#000' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null) }}
            style={{
              flex: 1, padding: '0.7rem', border: 'none', cursor: 'pointer',
              background: !isLogin ? 'var(--primary)' : 'transparent',
              color: !isLogin ? '#000' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          )}
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            minLength={6}
          />

          {error && (
            <div style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem' }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '0.8rem', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: '8px', color: 'var(--primary)', fontSize: '0.9rem' }}>
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? '⏳ Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>
      </div>
    </main>
  )
}
