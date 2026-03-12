import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../utils/api'
import { useUser } from '../hooks/useUser'

function formatTiempo(seg) {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function calcularRitmo(distKm, seg) {
  if (!distKm || distKm < 0.01) return '--:--'
  const segPorKm = seg / distKm
  const m = Math.floor(segPorKm / 60)
  const s = Math.round(segPorKm % 60)
  return `${m}:${String(s).padStart(2,'0')}`
}

export default function Activo() {
  const { user }   = useUser()
  const navigate   = useNavigate()
  const location   = useLocation()
  const plan       = location.state?.plan

  const [corriendo, setCorriendo] = useState(false)
  const [pausado,   setPausado]   = useState(false)
  const [tiempo,    setTiempo]    = useState(0)
  const [distancia, setDistancia] = useState(0)
  const [rpe,       setRpe]       = useState(null)
  const [notas,     setNotas]     = useState('')
  const [guardando, setGuardando] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const [resultado, setResultado] = useState(null)

  const intervalRef  = useRef(null)
  const watchRef     = useRef(null)
  const posicionAnterior = useRef(null)
  const distRef      = useRef(0)

  // Cronómetro
  useEffect(() => {
    if (corriendo && !pausado) {
      intervalRef.current = setInterval(() => setTiempo(t => t + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [corriendo, pausado])

  // GPS
  const iniciarGPS = () => {
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (pausado) return
        if (posicionAnterior.current) {
          const d = haversine(posicionAnterior.current, pos.coords)
          distRef.current += d
          setDistancia(+distRef.current.toFixed(3))
        }
        posicionAnterior.current = pos.coords
      },
      null,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }

  const detenerGPS = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
  }

  const iniciar = () => {
    setCorriendo(true)
    setPausado(false)
    iniciarGPS()
  }

  const pausar = () => {
    setPausado(true)
    posicionAnterior.current = null // no acumular distancia en pausa
  }

  const reanudar = () => {
    setPausado(false)
  }

  const terminar = async () => {
    detenerGPS()
    setCorriendo(false)
    setGuardando(true)

    const ritmo = calcularRitmo(distRef.current, tiempo)

    try {
      const res = await api.registrarLog({
        user_id:           user.user_id,
        plan_id:           plan?.plan_id || '',
        fecha:             new Date().toISOString().split('T')[0],
        distancia_km_real: +distRef.current.toFixed(2),
        duracion_seg:      tiempo,
        ritmo_promedio:    ritmo,
        percepcion_esfuerzo: rpe || '',
        notas_runner:      notas,
      })
      setResultado(res)
    } catch (e) {
      setResultado({ ok: false, mensaje: 'No se pudo guardar. Intenta más tarde.' })
    } finally {
      setGuardando(false)
      setTerminado(true)
    }
  }

  // ── Pantalla resultado ────────────────────────────────────
  if (terminado) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--sp-md)' }}>
          {resultado?.completado_pct >= 100 ? '🏆' : resultado?.completado_pct >= 80 ? '💪' : '👊'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--rd-red)', marginBottom: 4 }}>
          {resultado?.completado_pct >= 100 ? '¡LO LOGRASTE!' : 'BUEN TRABAJO'}
        </h1>
        <p style={{ marginBottom: 'var(--sp-xl)' }}>{resultado?.mensaje}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-xl)' }}>
          <StatBox label="Distancia"  value={`${distRef.current.toFixed(2)} km`} />
          <StatBox label="Tiempo"     value={formatTiempo(tiempo)} />
          <StatBox label="Ritmo prom" value={calcularRitmo(distRef.current, tiempo)} />
          {resultado?.completado_pct && (
            <StatBox label="% del plan" value={`${resultado.completado_pct}%`} highlight />
          )}
        </div>

        <button className="btn btn-primary btn-block" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    )
  }

  const ritmoActual = calcularRitmo(distancia, tiempo)
  const objetivo    = plan?.distancia_km_objetivo || 0
  const pctAvance   = objetivo > 0 ? Math.min(100, (distancia / objetivo) * 100) : 0

  // ── Pantalla RPE antes de terminar ───────────────────────
  if (corriendo === false && tiempo > 0) {
    return (
      <div className="page">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 8 }}>
          ¿CÓMO TE SENTISTE?
        </h2>
        <p style={{ marginBottom: 'var(--sp-xl)' }}>Escala del 1 (muy fácil) al 5 (al límite)</p>

        <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-xl)' }}>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => setRpe(n)}
              style={{
                flex: 1, padding: '16px 0',
                borderRadius: 'var(--r-md)',
                border: `2px solid ${rpe === n ? 'var(--rd-red)' : 'var(--rd-gray-2)'}`,
                background: rpe === n ? 'rgba(232,65,42,0.15)' : 'var(--rd-black-2)',
                color: rpe === n ? 'var(--rd-red)' : 'var(--rd-white)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <textarea
          className="input"
          placeholder="Notas del entrenamiento (opcional)"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={3}
          style={{ marginBottom: 'var(--sp-lg)', resize: 'none' }}
        />

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={terminar}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar entrenamiento'}
        </button>
      </div>
    )
  }

  // ── Pantalla principal activo ─────────────────────────────
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{ marginBottom: 'var(--sp-lg)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--rd-gray-4)' }}>
          {plan?.sesion?.nombre_display || 'ENTRENAMIENTO'}
        </h2>
        {objetivo > 0 && (
          <>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${pctAvance}%` }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--rd-gray-4)', marginTop: 4 }}>
              {distancia.toFixed(2)} / {objetivo} km
            </p>
          </>
        )}
      </div>

      {/* Cronómetro grande */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-xl)' }}>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4rem, 20vw, 7rem)',
          letterSpacing: '0.04em',
          color: corriendo && !pausado ? 'var(--rd-white)' : 'var(--rd-gray-3)',
          transition: 'color 0.3s',
        }}>
          {formatTiempo(tiempo)}
        </div>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)', width: '100%' }}>
          <StatBox label="Distancia"  value={`${distancia.toFixed(2)} km`} />
          <StatBox label="Ritmo"      value={`${ritmoActual} /km`} />
        </div>
      </div>

      {/* Controles */}
      <div style={{ paddingBottom: 'var(--sp-lg)' }}>
        {!corriendo ? (
          <button className="btn btn-primary btn-block btn-lg" onClick={iniciar}>
            🏃 Iniciar
          </button>
        ) : pausado ? (
          <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
            <button className="btn btn-primary btn-block" onClick={reanudar} style={{ flex: 2 }}>
              ▶ Continuar
            </button>
            <button className="btn btn-ghost" onClick={() => setCorriendo(false)} style={{ flex: 1 }}>
              Terminar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
            <button className="btn btn-ghost btn-block" onClick={pausar} style={{ flex: 1 }}>
              ⏸ Pausa
            </button>
            <button
              className="btn btn-block"
              onClick={() => setCorriendo(false)}
              style={{ flex: 1, background: 'var(--rd-black-2)', border: '1px solid var(--rd-gray-2)', color: 'var(--rd-white)', borderRadius: 'var(--r-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}
            >
              ⏹ Terminar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value, highlight }) {
  return (
    <div className="card" style={{ padding: '14px 16px', borderColor: highlight ? 'var(--rd-red)' : undefined }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--rd-gray-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: highlight ? 'var(--rd-red)' : 'var(--rd-white)' }}>
        {value}
      </div>
    </div>
  )
}

// Haversine: distancia entre dos coordenadas GPS en km
function haversine(a, b) {
  const R = 6371
  const dLat = toRad(b.latitude  - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const x = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) *
             Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
}

function toRad(deg) { return deg * Math.PI / 180 }
