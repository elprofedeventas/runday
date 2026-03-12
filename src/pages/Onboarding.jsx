import { useState } from 'react'
import { api } from '../utils/api'
import { storage } from '../utils/storage'
import { useUser } from '../hooks/useUser'

const PASOS = [
  {
    id: 'objetivo',
    pregunta: '¿Cuál es tu meta?',
    subtitulo: 'Tu plan se construye alrededor de esto',
    opciones: [
      { valor: '5k',   emoji: '🏁', label: 'Terminar un 5K' },
      { valor: '10k',  emoji: '⚡', label: 'Mejorar en 10K' },
      { valor: '21k',  emoji: '🏆', label: 'Media maratón' },
      { valor: 'salud',emoji: '❤️', label: 'Correr por salud' },
    ]
  },
  {
    id: 'nivel',
    pregunta: '¿Cuál es tu nivel?',
    subtitulo: 'Sin ego — esto define la intensidad del plan',
    opciones: [
      { valor: 'principiante', emoji: '🌱', label: 'Principiante', desc: 'Nunca corrí más de 20 min seguidos' },
      { valor: 'intermedio',   emoji: '🔥', label: 'Intermedio',   desc: 'Corro regularmente, tengo base' },
      { valor: 'avanzado',     emoji: '🚀', label: 'Avanzado',     desc: 'Tengo marca de referencia' },
    ]
  },
  {
    id: 'dias_semana',
    pregunta: '¿Cuántos días por semana?',
    subtitulo: 'Sé realista — la consistencia gana',
    opciones: [
      { valor: 2, emoji: '2️⃣', label: '2 días', desc: 'Ideal para empezar' },
      { valor: 3, emoji: '3️⃣', label: '3 días', desc: 'El punto dulce' },
      { valor: 4, emoji: '4️⃣', label: '4 días', desc: 'Progresión sólida' },
      { valor: 5, emoji: '5️⃣', label: '5 días', desc: 'Para comprometidos' },
    ]
  },
]

export default function Onboarding() {
  const { setUser } = useUser()
  const [paso, setPaso]       = useState(0)
  const [respuestas, setResp] = useState({})
  const [nombre, setNombre]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const pasosTotal = PASOS.length + 1 // +1 para nombre
  const progreso   = ((paso) / pasosTotal) * 100

  const elegir = (valor) => {
    const nuevas = { ...respuestas, [PASOS[paso].id]: valor }
    setResp(nuevas)
    if (paso < PASOS.length - 1) {
      setPaso(paso + 1)
    } else {
      setPaso(PASOS.length) // paso final: nombre
    }
  }

  const confirmar = async () => {
    if (!nombre.trim()) return
    setLoading(true)
    setError(null)

    const user_id     = storage.getOrCreateUserId()
    const fecha_inicio = new Date().toISOString().split('T')[0]

    try {
      const res = await api.generarPlan({
        user_id,
        nombre: nombre.trim(),
        email: '',
        nivel:       respuestas.nivel,
        objetivo:    respuestas.objetivo,
        dias_semana: respuestas.dias_semana,
        fecha_inicio,
      })

      console.log('RESPUESTA APPS SCRIPT:', res)
      if (res.ok) {
        setUser({ user_id, nombre: nombre.trim(), ...respuestas, fecha_inicio })
      } else {
        setError(res.error || 'Error generando el plan. Intenta de nuevo.')
      }
    } catch (e) {
      console.error('ERROR CATCH:', e)
      setError('No se pudo conectar. Revisa tu conexión.')
    }
  }

  const pasoActual = PASOS[paso]

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ marginBottom: 'var(--sp-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--rd-red)', marginBottom: 4 }}>
          RUNDAY
        </h1>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progreso}%` }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--rd-gray-3)', marginTop: 6 }}>
          Paso {paso + 1} de {pasosTotal}
        </p>
      </div>

      {/* Contenido del paso */}
      <div style={{ flex: 1 }}>

        {paso < PASOS.length ? (
          <div style={{ animation: 'pageIn 0.3s ease' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>{pasoActual.pregunta}</h2>
            <p style={{ marginBottom: 'var(--sp-xl)' }}>{pasoActual.subtitulo}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              {pasoActual.opciones.map(op => (
                <button
                  key={op.valor}
                  onClick={() => elegir(op.valor)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                    padding: '16px 20px',
                    background: 'var(--rd-black-2)',
                    border: '1px solid var(--rd-gray-1)',
                    borderRadius: 'var(--r-lg)',
                    color: 'var(--rd-white)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--rd-red)'
                    e.currentTarget.style.background  = 'var(--rd-black-3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--rd-gray-1)'
                    e.currentTarget.style.background  = 'var(--rd-black-2)'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{op.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{op.label}</div>
                    {op.desc && <div style={{ fontSize: '0.8rem', color: 'var(--rd-gray-4)' }}>{op.desc}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

        ) : (
          // Paso final: nombre
          <div style={{ animation: 'pageIn 0.3s ease' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>¿Cómo te llamas?</h2>
            <p style={{ marginBottom: 'var(--sp-xl)' }}>Tu plan ya está listo. Solo falta tu nombre.</p>

            <input
              className="input"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmar()}
              autoFocus
              style={{ marginBottom: 'var(--sp-md)' }}
            />

            {error && (
              <p style={{ color: 'var(--rd-red)', fontSize: '0.85rem', marginBottom: 'var(--sp-md)' }}>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={confirmar}
              disabled={loading || !nombre.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Generando tu plan...
                </>
              ) : (
                'Empezar a correr →'
              )}
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => setPaso(paso - 1)}
              style={{ marginTop: 'var(--sp-sm)', width: '100%' }}
            >
              ← Atrás
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
