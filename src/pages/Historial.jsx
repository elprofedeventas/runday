// ── Historial.jsx ────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'

function formatTiempo(seg) {
  if (!seg) return '—'
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${String(s).padStart(2,'0')}`
}

export default function Historial() {
  const { user } = useUser()

  // En la primera versión mostramos un estado vacío elegante
  // Los logs se leerán directamente cuando tengamos endpoint de historial
  return (
    <div className="page">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--sp-xs)' }}>
        HISTORIAL
      </h1>
      <p style={{ marginBottom: 'var(--sp-xl)' }}>Tus entrenamientos completados</p>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 300, gap: 'var(--sp-md)',
        color: 'var(--rd-gray-4)'
      }}>
        <span style={{ fontSize: '3rem' }}>🏃</span>
        <p style={{ textAlign: 'center', color: 'var(--rd-gray-4)' }}>
          Completa tu primer entrenamiento<br />y aparecerá aquí.
        </p>
      </div>
    </div>
  )
}
