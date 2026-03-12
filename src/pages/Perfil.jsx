import { useUser } from '../hooks/useUser'

const NIVEL_LABEL   = { principiante: '🌱 Principiante', intermedio: '🔥 Intermedio', avanzado: '🚀 Avanzado' }
const OBJETIVO_LABEL = { '5k': '🏁 5K', '10k': '⚡ 10K', '21k': '🏆 Media maratón', 'salud': '❤️ Salud' }

export default function Perfil() {
  const { user, clearUser } = useUser()

  return (
    <div className="page">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--sp-xs)' }}>
        PERFIL
      </h1>
      <p style={{ marginBottom: 'var(--sp-xl)' }}>Tu plan RunDay</p>

      <div className="card" style={{ marginBottom: 'var(--sp-md)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-sm)' }}>👤</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
          {user?.nombre || 'Runner'}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--rd-gray-4)', wordBreak: 'break-all' }}>
          ID: {user?.user_id}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-xl)' }}>
        <InfoCard label="Nivel"       value={NIVEL_LABEL[user?.nivel]    || user?.nivel} />
        <InfoCard label="Objetivo"    value={OBJETIVO_LABEL[user?.objetivo] || user?.objetivo} />
        <InfoCard label="Días/semana" value={`${user?.dias_semana} días`} />
        <InfoCard label="Inicio plan" value={user?.fecha_inicio || '—'} />
      </div>

      <button
        className="btn btn-ghost btn-block"
        onClick={() => {
          if (confirm('¿Reiniciar tu perfil? Se generará un nuevo plan.')) clearUser()
        }}
        style={{ color: 'var(--rd-red)', borderColor: 'var(--rd-red-dark)' }}
      >
        Reiniciar plan
      </button>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--rd-gray-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{value}</div>
    </div>
  )
}
