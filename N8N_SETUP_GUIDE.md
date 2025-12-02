# 🤖 n8n Setup per blueriot NODΞ

## 📋 Cosa può fare n8n per noi

n8n può automatizzare:
1. ✅ **Sync utenti** - Auto-crea utenti in `tl_users` quando si registrano
2. ✅ **Monitor database** - Controlla RLS policies ogni ora
3. ✅ **GitHub sync** - Monitora push e aggiorna database automaticamente
4. ✅ **Backup automatici** - Export database ogni giorno
5. ✅ **Notifiche** - Telegram/Email quando ci sono errori
6. ✅ **Deploy automatico** - Trigger deploy su Render quando fai push

---

## 🔌 CONNESSIONI DISPONIBILI

### 1. Supabase ✅
- **Native integration** - n8n ha nodo Supabase nativo
- Può eseguire query SQL
- Può usare REST API
- Può ascoltare webhook da Supabase

### 2. GitHub ✅
- **Native integration** - n8n ha nodo GitHub nativo
- Monitora push/PR/issues
- Crea commit/branch/PR automaticamente
- Può leggere e scrivere file

### 3. Render ✅
- Via **HTTP Request** node
- Trigger deploy via API
- Monitor deploy status

---

## 🚀 WORKFLOW 1: Auto-Sync Users to tl_users

**Trigger:** Schedule (ogni 5 minuti o manuale)

**Nodi:**
```
[Schedule Trigger]
    ↓
[Supabase: Query auth.users]
    ↓
[Supabase: Query tl_users]
    ↓
[Code: Find missing users]
    ↓
[IF: Any missing?]
    ↓ Yes
[Supabase: Insert missing users]
    ↓
[Telegram: Send notification]
```

### Configurazione:

#### Node 1: Schedule Trigger
- **Mode:** Every 5 minutes
- **Or:** Manual execution only

#### Node 2: Supabase - Get Auth Users
- **Credential:** Supabase Project
  - **Host:** `https://[your-project].supabase.co`
  - **Service Role Key:** (da Supabase → Settings → API → service_role)
- **Operation:** SQL Query
- **Query:**
```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

#### Node 3: Supabase - Get TL Users
- Same credential as Node 2
- **Query:**
```sql
SELECT id, user_id, email
FROM tl_users;
```

#### Node 4: Code - Find Missing
```javascript
// Get data from both queries
const authUsers = $('Supabase - Get Auth Users').all();
const tlUsers = $('Supabase - Get TL Users').all();

// Extract existing user_ids
const existingUserIds = new Set(
  tlUsers.map(item => item.json.user_id)
);

// Find users not in tl_users
const missingUsers = authUsers.filter(item =>
  !existingUserIds.has(item.json.id)
);

// Return in format ready for insert
return missingUsers.map(item => ({
  json: {
    user_id: item.json.id,
    email: item.json.email
  }
}));
```

#### Node 5: IF - Any Missing?
- **Condition:** `{{ $json.user_id }}`
- **If exists:** continue to insert

#### Node 6: Supabase - Insert Missing Users
- **Operation:** Insert
- **Table:** `tl_users`
- **Columns:**
  - `user_id`: `{{ $json.user_id }}`
  - `email`: `{{ $json.email }}`

#### Node 7: Telegram Notification
- **Chat ID:** Il tuo ID Telegram
- **Message:**
```
✅ Sync completato!

Utenti creati in tl_users: {{ $('Code').all().length }}
```

---

## 🚀 WORKFLOW 2: Monitor RLS Policies

**Trigger:** Schedule (ogni ora)

**Nodi:**
```
[Schedule Trigger]
    ↓
[Supabase: Check RLS Policies]
    ↓
[Code: Validate policies]
    ↓
[IF: Policies OK?]
    ↓ No
[Telegram: Alert - RLS broken!]
```

### Query per controllare RLS:
```sql
SELECT
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE tablename IN ('tours', 'blueriot_tastes', 'tour_days', 'blueriot_routes', 'blueriot_stay')
GROUP BY tablename
ORDER BY tablename;
```

**Expected result:** Ogni tabella deve avere 4 policies.

---

## 🚀 WORKFLOW 3: GitHub → Supabase Deploy

**Trigger:** GitHub push su branch `main`

**Nodi:**
```
[GitHub Trigger: On Push]
    ↓
[IF: Branch = main?]
    ↓ Yes
[GitHub: Get changed files]
    ↓
[IF: database/*.sql changed?]
    ↓ Yes
[GitHub: Read SQL file]
    ↓
[Supabase: Execute SQL]
    ↓
[Telegram: Deploy success]
```

### Configurazione GitHub Trigger:
- **Repository:** `blueriot723/blueriot_webapp`
- **Events:** push
- **Webhook URL:** (n8n te lo dà)

### IF Branch Check:
```javascript
{{ $json.ref === 'refs/heads/main' }}
```

### GitHub Get Files:
- **Operation:** Get all files
- **Filter:** `database/*.sql`

### Supabase Execute:
- **Query:** `{{ $json.content }}` (contenuto file SQL)

---

## 🚀 WORKFLOW 4: Auto-Deploy Render on Push

**Trigger:** GitHub push

**Nodi:**
```
[GitHub Trigger: On Push]
    ↓
[IF: nodex/backend/* changed?]
    ↓ Yes
[HTTP Request: Trigger Render Deploy]
    ↓
[Wait 2 minutes]
    ↓
[HTTP Request: Check deploy status]
    ↓
[Telegram: Notify deploy result]
```

### Render Deploy API:
```
POST https://api.render.com/v1/services/[service-id]/deploys
Headers:
  Authorization: Bearer [render-api-key]
```

Get your Render API key: https://dashboard.render.com/account/settings

---

## 🔐 CREDENZIALI NECESSARIE

### 1. Supabase
- **URL:** `https://[project].supabase.co`
- **Service Role Key:** (Settings → API → service_role secret)

### 2. GitHub
- **Personal Access Token:**
  - Vai su https://github.com/settings/tokens
  - Generate new token (classic)
  - Scopes: `repo`, `workflow`

### 3. Render
- **API Key:**
  - https://dashboard.render.com/account/settings
  - Create API Key

### 4. Telegram Bot (opzionale)
- Parla con @BotFather
- Crea bot con `/newbot`
- Copia il token
- Ottieni il tuo Chat ID con @userinfobot

---

## 📱 SETUP n8n

### Opzione A: n8n Cloud (consigliato)
1. Vai su https://n8n.io/cloud
2. Free plan: 5,000 esecuzioni/mese (sufficiente!)
3. Signup
4. Create workspace

### Opzione B: Self-hosted
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Poi apri http://localhost:5678

---

## 🎯 WORKFLOW PRIORITARI

Per risolvere il problema RLS **adesso**, usa:

### ✅ WORKFLOW 1 (Auto-Sync Users)
- **Priorità:** ALTA
- **Run:** Manuale ORA, poi schedule ogni 5 min
- **Fix:** Crea automaticamente utenti mancanti

### ⏰ WORKFLOW 2 (Monitor RLS)
- **Priorità:** MEDIA
- **Run:** Ogni ora
- **Prevenzione:** Ti avvisa se qualcuno rompe RLS

### 🚀 WORKFLOW 3 (GitHub → Supabase)
- **Priorità:** BASSA (per dopo)
- **Future:** Auto-deploy SQL da GitHub

### 🎨 WORKFLOW 4 (Auto-Deploy Render)
- **Priorità:** BASSA (per dopo)
- **Future:** Deploy automatico backend

---

## 📸 COME USARE CON ODisseo

1. **Setup n8n** (5 minuti)
2. **Crea WORKFLOW 1** (10 minuti)
3. **Test manualmente** → esegui workflow
4. **Fai screenshot** dei risultati
5. **Manda a ODisseo** per verificare
6. **Se funziona** → attiva schedule automatico

---

## 🆘 TROUBLESHOOTING

### Errore: "Could not connect to Supabase"
- ✅ Verifica Service Role Key (non anon key!)
- ✅ Controlla URL progetto
- ✅ Verifica che Supabase sia online

### Errore: "Column 'name' does not exist"
- ✅ Modifica query INSERT per usare solo colonne esistenti
- ✅ Usa solo `user_id` e `email` (sicure)

### Workflow non parte automaticamente
- ✅ Verifica che workflow sia ATTIVO (toggle in alto)
- ✅ Controlla Schedule Trigger settings
- ✅ Guarda Execution History per errori

---

## 💡 PROSSIMI STEP

1. **ORA:** Crea WORKFLOW 1 in n8n
2. **Test:** Esegui manualmente
3. **Verifica:** Controlla che utenti vengano creati
4. **Poi:** Testa webapp (tour e ristoranti)
5. **Se funziona:** Attiva schedule automatico
6. **Dopo:** Aggiungi altri workflow per automazione

---

## 📂 RISORSE

- n8n Docs: https://docs.n8n.io
- Supabase Node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/
- GitHub Node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.github/
- Template workflow: https://n8n.io/workflows

---

## ✅ CHECKLIST SETUP

- [ ] Account n8n creato
- [ ] Credential Supabase aggiunta
- [ ] Credential GitHub aggiunta (opzionale)
- [ ] WORKFLOW 1 creato
- [ ] Test manuale WORKFLOW 1 → OK
- [ ] Utenti creati in tl_users verificati
- [ ] Test webapp → tour creazione OK
- [ ] Test webapp → ristorante creazione OK
- [ ] Schedule attivato

---

**Dopo che n8n funziona, il tuo problema RLS sarà risolto automaticamente!** 🎉
