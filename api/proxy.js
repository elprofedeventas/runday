// ============================================================
// RunDay — Proxy Vercel
// El frontend NUNCA llama directo a script.google.com
// Todas las peticiones pasan por aquí
// ============================================================

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL // ← setear en Vercel env vars

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL no configurada en variables de entorno' })
  }

  try {
    let response

    if (req.method === 'GET') {
      // Pasar query params tal cual
      const queryString = new URLSearchParams(req.query).toString()
      const url = queryString ? `${APPS_SCRIPT_URL}?${queryString}` : APPS_SCRIPT_URL
      response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow', // Apps Script redirige, necesario
      })

    } else if (req.method === 'POST') {
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        redirect: 'follow',
      })

    } else {
      return res.status(405).json({ error: 'Método no permitido' })
    }

    const data = await response.json()
    return res.status(200).json(data)

  } catch (err) {
    console.error('[RunDay Proxy Error]', err)
    return res.status(500).json({ error: 'Error en proxy', detalle: err.message })
  }
}
