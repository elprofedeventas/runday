import express from 'express'
import fetch from 'node-fetch'
import { config } from 'dotenv'

config({ path: '.env.local' })

const app  = express()
const URL  = process.env.APPS_SCRIPT_URL

app.use(express.json())

app.all('/api/proxy', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)

  try {
    let response
    if (req.method === 'GET') {
      const qs = new URLSearchParams(req.query).toString()
      response = await fetch(`${URL}?${qs}`, { redirect: 'follow' })
    } else {
      response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        redirect: 'follow',
      })
    }
    const data = await response.json()
    res.json(data)
} catch (err) {
    console.error('ERROR PROXY:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log('Proxy corriendo en http://localhost:3000'))