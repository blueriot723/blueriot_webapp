# 🚀 Render Deployment Guide - NODΞ Backend API

**Guida completa per deployare NODΞ Backend su Render.com con piano PRO**

---

## 📋 Prerequisiti

✅ Hai già Render PRO attivo
✅ Repository GitHub: `blueriot723/blueriot_webapp`
✅ Progetto Supabase creato (o da creare)

---

## 🎯 Deployment Options

Hai **2 opzioni** per deployare su Render:

### Opzione A: Blueprint (Automatico) ⚡ **CONSIGLIATO**
Usa il file `render.yaml` già configurato

### Opzione B: Manuale (Controllo Totale)
Configuri tutto a mano nel dashboard

---

## 🚀 OPZIONE A: Deploy con Blueprint (VELOCE)

### Step 1: Vai su Render Dashboard

1. Vai su: https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**

### Step 2: Connetti Repository

1. Click **"Connect account"** se non hai ancora connesso GitHub
2. Autorizza Render ad accedere a GitHub
3. Seleziona repository: **`blueriot723/blueriot_webapp`**
4. Click **"Connect"**

### Step 3: Render Legge il Blueprint

Render rileverà automaticamente il file `render.yaml` e mostrerà:

```
✓ Service Name: blueriot-nodex-api
✓ Type: Web Service
✓ Environment: Node
✓ Build Command: cd nodex/backend && npm install
✓ Start Command: cd nodex/backend && npm start
✓ Region: Frankfurt
✓ Plan: PRO (dal tuo account)
```

### Step 4: Configura Environment Variables

Render ti chiederà di settare queste variabili (dal file `render.yaml`):

| Variable | Value | Dove Prenderlo |
|----------|-------|----------------|
| `NODE_ENV` | `production` | Già settato ✅ |
| `PORT` | `10000` | Già settato ✅ |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | `eyJxxx...` | Supabase Dashboard → Settings → API → service_role (⚠️ secret!) |
| `ALLOWED_ORIGINS` | `https://blueriot723.github.io` | URL della tua PWA |

**⚠️ IMPORTANTE:**
- Usa il **service_role key** per il backend (non anon key!)
- Il service_role key ha permessi completi sul database
- NON esporre mai questa chiave al frontend

### Step 5: Deploy!

1. Click **"Apply"** o **"Create Service"**
2. Render inizia il build automaticamente
3. Aspetta 2-5 minuti ⏳

---

## 🛠️ OPZIONE B: Deploy Manuale

### Step 1: Crea Nuovo Web Service

1. Vai su: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**

### Step 2: Connetti Repository

1. Click **"Connect a repository"**
2. Seleziona: `blueriot723/blueriot_webapp`
3. Click **"Connect"**

### Step 3: Configurazione Servizio

Inserisci questi valori:

**Name:**
```
blueriot-nodex-api
```

**Region:**
```
Frankfurt (EU Central)
```
*O scegli quella più vicina ai tuoi utenti*

**Branch:**
```
main
```
*O il branch che vuoi deployare*

**Root Directory:**
```
nodex/backend
```
**⚠️ IMPORTANTE!** Specifica questa cartella perché il backend è in una subdirectory

**Environment:**
```
Node
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Plan:**
```
PRO (512 MB RAM)
```
*Usa il tuo piano PRO*

### Step 4: Advanced Settings

Click **"Advanced"** e configura:

**Health Check Path:**
```
/health
```

**Auto-Deploy:**
```
✅ Yes
```
*Deploy automatico quando fai git push*

### Step 5: Environment Variables

Click **"Add Environment Variable"** e aggiungi:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
ALLOWED_ORIGINS=https://blueriot723.github.io,http://localhost:3000
```

**Copia/incolla questi:**

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `SUPABASE_URL` | Dalla Supabase Dashboard |
| `SUPABASE_SERVICE_KEY` | Dalla Supabase Dashboard (service_role) |
| `ALLOWED_ORIGINS` | `https://blueriot723.github.io` |

### Step 6: Deploy!

1. Click **"Create Web Service"**
2. Render inizia il build
3. Aspetta 2-5 minuti

---

## 🔑 Come Ottenere le Chiavi Supabase

### Se Hai Già un Progetto Supabase:

1. Vai su: https://app.supabase.com
2. Seleziona il tuo progetto
3. Vai su **Settings** → **API**
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (⚠️ click "Reveal" per vederla)

### Se NON Hai Ancora Supabase:

1. Vai su: https://app.supabase.com
2. Click **"New Project"**
3. Scegli:
   - **Name:** `blueriot-matrix`
   - **Database Password:** (scegli password forte)
   - **Region:** Europe - Frankfurt (o più vicino)
4. Aspetta 2-3 minuti che il progetto si crei
5. Vai su **SQL Editor**
6. Copia/incolla il contenuto di `database/schemas/database_ecosystem_final.sql`
7. Click **"Run"**
8. Poi applica le migrazioni da `database/migrations/` in ordine (001, 002, 003...)
9. Prendi le API keys da **Settings** → **API**

---

## ✅ Verifica Deploy

### Step 1: Controlla Logs

Nel Render Dashboard:
1. Vai sul tuo servizio: `blueriot-nodex-api`
2. Click tab **"Logs"**
3. Dovresti vedere:

```
═══════════════════════════════════════════════════
  🔴 NODΞ - blueriot mαtrιχ Operational Control
═══════════════════════════════════════════════════

  Environment:  production
  Port:         10000
  URL:          http://localhost:10000

  Modules:
    ✓ eTicket Reader
    ✓ PDF OCP Generator
    ✓ vCard Ingestion
    ✓ Weather Engine
    ✓ Day Management
    ✓ Deterministic Bot
```

✅ Se vedi questo, **funziona!**

### Step 2: Testa Health Check

Render ti dà un URL tipo:
```
https://blueriot-nodex-api.onrender.com
```

Testa nel browser o con curl:

```bash
# Health check
curl https://blueriot-nodex-api.onrender.com/health

# Risposta attesa:
{
  "status": "ok",
  "module": "NODΞ",
  "version": "1.0.0",
  "timestamp": "2024-11-30T18:00:00.000Z"
}
```

✅ Se ricevi questa risposta, **tutto OK!**

### Step 3: Testa API Endpoints

```bash
# Version info
curl https://blueriot-nodex-api.onrender.com/version

# Weather (esempio)
curl https://blueriot-nodex-api.onrender.com/api/weather/roma/2024-12-01

# Se Supabase è configurato, dovresti ricevere dati weather
```

---

## 🌐 Collega Frontend PWA al Backend

### Aggiorna index.html

Nel tuo `index.html` (root del repo), trova la configurazione API:

```javascript
// Cerca questa riga:
const API_BASE_URL = 'http://localhost:3000';

// Cambia in:
const API_BASE_URL = 'https://blueriot-nodex-api.onrender.com';
```

Oppure usa una logica condizionale:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://blueriot-nodex-api.onrender.com';
```

### Commit e Push

```bash
git add index.html
git commit -m "Connect frontend to Render backend API"
git push origin main
```

GitHub Pages si auto-aggiorna in ~1 minuto!

---

## 🔧 Troubleshooting

### Errore: "Build failed"

**Causa:** npm install fallito

**Soluzione:**
1. Vai su Render Logs
2. Cerca l'errore esatto
3. Probabilmente manca una dependency
4. Controlla che `nodex/backend/package.json` sia committato

### Errore: "Application failed to respond"

**Causa:** Server non parte o crasha

**Soluzione:**
1. Controlla i Logs
2. Verifica che `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` siano corretti
3. Verifica che `PORT=10000` sia settato
4. Controlla che non ci siano errori di sintassi

### Errore: "CORS policy"

**Causa:** CORS non configurato correttamente

**Soluzione:**
```env
# In Render Environment Variables:
ALLOWED_ORIGINS=https://blueriot723.github.io
```

Se non funziona, controlla `nodex/backend/app.js` righe 28-38

### Errore: "Connection timeout"

**Causa:** Supabase non raggiungibile o chiavi sbagliate

**Soluzione:**
1. Controlla che Supabase sia attivo (non in pausa)
2. Verifica `SUPABASE_URL` (deve iniziare con `https://`)
3. Verifica `SUPABASE_SERVICE_KEY` (deve essere lunghissima, ~200+ caratteri)
4. Testa la connessione manualmente:
   ```bash
   curl -X GET 'https://your-project.supabase.co/rest/v1/' \
     -H "apikey: YOUR_SERVICE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_KEY"
   ```

### Il servizio si spegne dopo un po'

**Render PRO non dovrebbe mai spegnersi!**

Se succede:
1. Controlla il Piano nel dashboard (deve dire "PRO" o "Starter")
2. Se dice "Free", upgrade dal dashboard
3. Verifica che non ci siano crash ricorrenti nei logs

---

## 🔄 Auto-Deploy

Con la configurazione attuale, **ogni volta** che fai:

```bash
git push origin main
```

Render fa automaticamente:
1. ✅ Rileva i cambiamenti
2. ✅ Esegue `npm install`
3. ✅ Esegue `npm start`
4. ✅ Health check su `/health`
5. ✅ Switch al nuovo deploy (zero downtime)

**Tempo totale: ~2-3 minuti**

---

## 📊 Monitoraggio

### Metrics & Usage

Nel Render Dashboard puoi vedere:
- **CPU Usage**: Quanto usa il server
- **Memory Usage**: RAM utilizzata
- **Response Time**: Latenza API
- **Bandwidth**: Traffico in/out

### Logs in Real-Time

```bash
# Apri i logs nel browser
# Dashboard → blueriot-nodex-api → Logs

# Oppure usa Render CLI:
brew install render  # Mac
render logs --service blueriot-nodex-api --tail
```

### Alerts

Puoi configurare alerts:
1. Dashboard → Service → Settings → Notifications
2. Aggiungi email o Slack webhook
3. Ricevi notifiche se il servizio crasha

---

## 💰 Costi Render PRO

Con Render PRO:

- **$7/mese per servizio** (paghi solo quello che usi)
- **Oppure $19/mese Team Plan** = servizi illimitati

Per NODΞ Backend:
- **1 servizio** = $7/mese
- RAM: 512MB (sufficiente per NODΞ)
- CPU: Shared (va benissimo)
- Bandwidth: 100GB incluso

**Consiglio:** Se hai 3+ servizi (bot + NODΞ + altro), prendi Team Plan ($19/mese) così risparmi.

---

## 🎯 Checklist Finale

Prima di considerare il deploy completo:

- [ ] Servizio attivo su Render
- [ ] Health check `/health` funziona
- [ ] Supabase connesso correttamente
- [ ] Logs non mostrano errori
- [ ] Frontend PWA collegato al backend
- [ ] CORS configurato correttamente
- [ ] Environment variables tutte settate
- [ ] Auto-deploy attivo
- [ ] Database migrations applicate

---

## 📞 Supporto

**Render Support:**
- Dashboard → Help → Contact Support
- https://render.com/docs

**Supabase Support:**
- https://supabase.com/docs
- Discord: https://discord.supabase.com

**blueriot mαtrιχ:**
- GitHub Issues: https://github.com/blueriot723/blueriot_webapp/issues

---

## 🎉 Fatto!

Una volta completati tutti gli step, avrai:

✅ Backend NODΞ API live su: `https://blueriot-nodex-api.onrender.com`
✅ Auto-deploy attivo (git push → deploy automatico)
✅ Monitoraggio e logs in real-time
✅ Zero downtime deployments
✅ Connessione al database Supabase

**Il tuo NODΞ è operativo! 🔴**

---

*Odisseo Codex - Guida creata il 2024-11-30*
