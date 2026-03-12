# RunDay 🏃

> Tu entrenador de bolsillo. Te dice qué correr hoy.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite |
| Deploy | Vercel |
| Backend | Google Apps Script Web App |
| Base de datos | Google Sheets |
| CORS | Proxy Vercel (`api/proxy.js`) |
| Fuentes | Bebas Neue + DM Sans |

---

## Setup paso a paso

### 1. Google Sheets
1. Sube `runner_wap_sheet.xlsx` a Google Drive
2. Abre el Sheet → copia el ID de la URL
   ```
   docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

### 2. Google Apps Script
1. En el Sheet: **Extensiones → Apps Script**
2. Pega el contenido de `runday_apps_script.js`
3. Cambia `SHEET_ID` por tu ID
4. **Implementar → Nueva implementación → App web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier usuario**
5. Copia la URL de implementación

### 3. Vercel
1. Sube este repo a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. En **Settings → Environment Variables** agrega:
   ```
   APPS_SCRIPT_URL = [URL del paso 2]
   ```
4. Deploy 🚀

### 4. Desarrollo local
```bash
npm install
cp .env.example .env.local
# edita .env.local con tu APPS_SCRIPT_URL
npm run dev
```

---

## Endpoints del backend

| Action | Método | Descripción |
|--------|--------|-------------|
| `ping` | GET | Health check |
| `generarPlan` | POST | Onboarding → genera plan completo |
| `obtenerHoy` | GET | Entrenamiento del día |
| `registrarLog` | POST | Guarda sesión completada |
| `obtenerRacha` | GET | Racha de días consecutivos |

---

## Estructura del proyecto

```
runday/
├── api/
│   └── proxy.js          ← Proxy Vercel (CORS shield)
├── src/
│   ├── components/
│   │   └── NavBar.jsx
│   ├── hooks/
│   │   └── useUser.js
│   ├── pages/
│   │   ├── Onboarding.jsx  ← 3 pasos iniciales
│   │   ├── Hoy.jsx         ← Pantalla principal
│   │   ├── Activo.jsx      ← Cronómetro + GPS
│   │   ├── Historial.jsx
│   │   └── Perfil.jsx
│   ├── utils/
│   │   ├── api.js          ← Cliente HTTP
│   │   └── storage.js      ← localStorage
│   ├── App.jsx
│   ├── index.css           ← Design system
│   └── main.jsx
├── index.html
├── vite.config.js
├── vercel.json
└── .env.example
```
