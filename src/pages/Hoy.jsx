import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useUser } from '../hooks/useUser'

const TIPO_CONFIG = {
  easy_run:  { emoji: '🟢', label: 'Trote fácil',   color: '#22c55e' },
  intervals: { emoji: '🔴', label: 'Intervalos',    color: '#ef4444' },
  tempo:     { emoji: '🟠', label: 'Tempo run',     color: '#f97316' },
  long_run:  { emoji: '🔵', label: 'Long run',      color: '#3b82f6' },
  rest:      { emoji: '⚪', label: 'Descanso',      color: '#6b7280' },
}

export default function Hoy() {
  const { user }   = useUser()
  const navigate   = useNavigate()
  const [hoy, setHoy]         = useState(null)
  const [racha, setRacha]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.user_id) return
    Promise.all([
      api.obtenerHoy(user.user_id),
      api.obtenerRacha(user.user_id),
    ]).then(([resHoy, resRacha]) => {
      setHoy(resHoy)
      setRacha(resRacha)
    }).finally(() => setLoading(false))
  }, [user?.user_id])

  if (loading) return (
    <div className="page loader">
      <div className="spinner" />
    </div>
  )

  const tipoInfo = hoy?.tipo ? (TIPO_CONFIG[hoy.tipo] || TIPO_CONFIG.rest) : null
  const esDescanso = hoy?.descanso || hoy?.tipo === 'rest'

  return (
    <div className="page">

      {/* Saludo */}
      <div style={{ marginBottom: 'var(--sp-xl)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--rd-gray-4)', marginBottom: 4 }}>
          {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem' }}>
          HOLA, {(user?.nombre || 'RUNNER').toUpperCase().split(' ')[0]} 👋
        </h1>

        {/* Racha */}
        {racha && racha.racha_actual > 0 && (
          <div style={{ marginTop: 'var(--sp-sm)' }}>
            <span className="badge-racha">
              🔥 {racha.racha_actual} {racha.racha_actual === 1 ? 'día' : 'días'} seguidos
              {racha.badge && ` ${racha.badge.emoji}`}
            </span>
          </div>
        )}
      </div>

      {/* Card principal del día */}
      {esDescanso ? (
        <DescansoCard mensaje={hoy?.mensaje} racha={racha} />
      ) : hoy ? (
        <EntrenamientoCard hoy={hoy} tipoInfo={tipoInfo} onIniciar={() => navigate('/activo', { state: { plan: hoy } })} />
      ) : (
        <ErrorCard />
      )}

      {/* Próxima badge */}
      {racha?.siguiente_badge && (
        <div style={{
          marginTop: 'var(--sp-lg)',
          padding: '12px 16px',
          background: 'var(--rd-black-2)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--rd-gray-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--rd-gray-4)' }}>
            Próximo badge
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {racha.siguiente_badge.dias_restantes} días para {racha.siguiente_badge.badge} 🏅
          </span>
        </div>
      )}
    </div>
  )
}

function EntrenamientoCard({ hoy, tipoInfo, onIniciar }) {
  return (
    <div>
      {/* Tipo de sesión */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-md)' }}>
        <span style={{ fontSize: '1.4rem' }}>{tipoInfo?.emoji}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: tipoInfo?.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {tipoInfo?.label}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--rd-gray-4)', marginLeft: 'auto' }}>
          Semana {hoy.semana_num}
        </span>
      </div>

      {/* Nombre de la sesión */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', lineHeight: 1, marginBottom: 'var(--sp-sm)' }}>
        {hoy.sesion?.nombre_display || 'ENTRENAMIENTO'}
      </h2>

      {/* Descripción */}
      {hoy.sesion?.descripcion && (
        <p style={{ marginBottom: 'var(--sp-lg)', fontSize: '0.95rem' }}>
          {hoy.sesion.descripcion}
        </p>
      )}

      {/* Métricas objetivo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-lg)' }}>
        <MetricCard label="Distancia" value={`${hoy.distancia_km_objetivo} km`} />
        <MetricCard label="Duración est." value={hoy.sesion?.duracion_min_ref ? `~${hoy.sesion.duracion_min_ref} min` : '—'} />
      </div>

      {/* Notas del coach */}
      {hoy.notas_coach && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(232,65,42,0.08)',
          borderLeft: '3px solid var(--rd-red)',
          borderRadius: '0 var(--r-sm) var(--r-sm) 0',
          marginBottom: 'var(--sp-lg)',
          fontSize: '0.875rem',
          color: 'var(--rd-white-dim)',
        }}>
          💬 {hoy.notas_coach}
        </div>
      )}

      <button className="btn btn-primary btn-block btn-lg" onClick={onIniciar}>
        🏃 Iniciar entrenamiento
      </button>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--rd-gray-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--rd-white)' }}>
        {value}
      </div>
    </div>
  )
}

function DescansoCard({ mensaje }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-xl)' }}>
      <div style={{ fontSize: '4rem', marginBottom: 'var(--sp-md)' }}>💤</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--sp-sm)' }}>
        DÍA DE DESCANSO
      </h2>
      <p>{mensaje || 'El descanso es parte del plan. Tu cuerpo mejora mientras reposa.'}</p>
    </div>
  )
}

function ErrorCard() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-xl)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-md)' }}>🔌</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 'var(--sp-sm)' }}>
        SIN CONEXIÓN
      </h2>
      <p>No se pudo cargar el entrenamiento de hoy. Revisa tu conexión.</p>
    </div>
  )
}
