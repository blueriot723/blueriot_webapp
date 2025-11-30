# ⚡ Quick Start - Deploy NODΞ su Render

**Guida lampo per il deploy rapido**

---

## 🎯 3 Step Deploy (5 minuti)

### 1️⃣ Render Dashboard
```
https://dashboard.render.com → New + → Blueprint
```

### 2️⃣ Connetti Repo
```
Seleziona: blueriot723/blueriot_webapp
Click: Connect
```

### 3️⃣ Setta Environment Variables

Quando Render te le chiede, inserisci:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...lunghissima_chiave
```

✅ **Deploy!** → Aspetta 2-3 minuti

---

## 🔑 Dove Prendere le Chiavi Supabase

```
1. https://app.supabase.com
2. Tuo progetto → Settings → API
3. Copia:
   - Project URL → SUPABASE_URL
   - service_role key → SUPABASE_SERVICE_KEY
     (⚠️ Click "Reveal" per vederla)
```

---

## ✅ Test Veloce

Una volta deployato, testa:

```bash
curl https://blueriot-nodex-api.onrender.com/health
```

**Risposta attesa:**
```json
{
  "status": "ok",
  "module": "NODΞ",
  "version": "1.0.0"
}
```

✅ Se vedi questo → **FUNZIONA!**

---

## 📝 Environment Variables Complete

Copia/incolla queste nel Render Dashboard:

| Variable | Value | Note |
|----------|-------|------|
| `NODE_ENV` | `production` | ✅ Già settato |
| `PORT` | `10000` | ✅ Già settato |
| `SUPABASE_URL` | `https://xxx.supabase.co` | 🔑 Da Supabase |
| `SUPABASE_SERVICE_KEY` | `eyJxxx...` | 🔑 Da Supabase (service_role) |
| `ALLOWED_ORIGINS` | `https://blueriot723.github.io` | ✅ Già settato |

---

## 🆘 Problemi?

**Build fallito:**
```
Controlla Logs in Render Dashboard
Probabilmente SUPABASE_SERVICE_KEY mancante
```

**Health check fallito:**
```
Verifica SUPABASE_URL sia corretto
Deve iniziare con https://
```

**CORS error:**
```
Verifica ALLOWED_ORIGINS contenga il tuo GitHub Pages URL
```

---

## 📚 Guida Completa

Per la guida dettagliata: **RENDER_DEPLOY.md**

---

*Odisseo Codex - Quick Start*
