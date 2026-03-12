// ============================================================
// RunDay — API client
// Todas las llamadas al backend pasan por /api/proxy
// ============================================================

const BASE = '/api/proxy'
	
async function get(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}?${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function post(body = {}) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Endpoints ────────────────────────────────────────────────

export const api = {

  ping: () =>
    get({ action: 'ping' }),

  generarPlan: (data) =>
    post({ action: 'generarPlan', ...data }),

  obtenerHoy: (user_id) =>
    get({ action: 'obtenerHoy', user_id }),

  registrarLog: (data) =>
    post({ action: 'registrarLog', ...data }),

  obtenerRacha: (user_id) =>
    get({ action: 'obtenerRacha', user_id }),
}
