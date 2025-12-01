# 🔴 PROMPT PER ODisseo - Risoluzione RLS blueriot NODΞ

## 📋 CONTESTO PROGETTO

Sto lavorando al progetto **blueriot mαtrιχ NODΞ**, una webapp per Tour Leaders che gestisce:
- **ΤΔSΤΞ5** (database ristoranti condiviso)
- **R0UT35** (database trasporti)
- **SΤΔΥ** (database hotel)
- **NODΞ** (sistema gestione tour con Day Engine)

**Stack tecnologico:**
- Frontend: GitHub Pages (https://blueriot723.github.io)
- Database: Supabase PostgreSQL
- Backend API: Render.com (https://blueriot-matrikh-nodks.onrender.com)
- Automazione: n8n

**Repository GitHub:** https://github.com/blueriot723/blueriot_webapp
**Branch di lavoro:** `claude/italian-language-help-01U4XhranfTD5NZUmPxAoZkQ`

---

## 🚨 PROBLEMA ATTUALE

**Errore:** `permission denied for table blueriot_tastes`

Quando provo a:
1. Creare un nuovo tour → non funziona
2. Aggiungere un ristorante in TASTES → errore permessi

**Causa principale:**
Gli utenti esistono in `auth.users` (Supabase Auth) ma NON in `tl_users` (tabella applicazione).
Le politiche Row Level Security (RLS) controllano se l'utente esiste in `tl_users` prima di dare accesso.

---

## 🎯 OBIETTIVO

1. **Verificare** la struttura della tabella `tl_users` su Supabase
2. **Creare** le righe mancanti in `tl_users` per tutti gli utenti in `auth.users`
3. **Sistemare** le politiche RLS per `blueriot_tastes`, `tours`, `tour_days`
4. **NON disabilitare RLS** - deve rimanere attivo per sicurezza
5. **Testare** che tour e ristoranti si creano correttamente

---

## 📸 STEP 1: ANALIZZA SCREENSHOT SUPABASE

Ti invierò screenshot di:
1. **Table Editor → tl_users** - struttura colonne
2. **SQL Editor** - risultati query
3. **Authentication → Users** - lista utenti registrati

**Cosa devi identificare:**
- Quali colonne esistono in `tl_users`? (es: `id`, `user_id`, `email`, `name`?)
- Quanti utenti ci sono in `auth.users`?
- Quanti utenti hanno una riga corrispondente in `tl_users`?

---

## 🔧 STEP 2: QUERY SQL DA ESEGUIRE

### Query 1: Verifica struttura tl_users
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tl_users'
ORDER BY ordinal_position;
```

**Cosa cercare:** Le colonne disponibili (probabilmente: `id`, `user_id`, `email`, ma forse NON `name`)

---

### Query 2: Trova utenti mancanti
```sql
SELECT
    u.email,
    u.id as auth_user_id,
    tl.id as tl_user_id,
    CASE
        WHEN tl.id IS NULL THEN '❌ MANCANTE'
        ELSE '✅ ESISTE'
    END as status
FROM auth.users u
LEFT JOIN tl_users tl ON tl.user_id = u.id;
```

**Risultato atteso:** Vedrai quali utenti hanno `❌ MANCANTE` in `tl_users`

---

### Query 3: Crea utenti mancanti (VERSIONE SICURA)

**Opzione A** - Se esiste la colonna `email`:
```sql
INSERT INTO tl_users (user_id, email)
SELECT
    u.id,
    u.email
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM tl_users WHERE user_id = u.id
);
```

**Opzione B** - Se NON esiste la colonna `email`, usa solo user_id:
```sql
INSERT INTO tl_users (user_id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM tl_users WHERE user_id = u.id
);
```

**Esegui quella che funziona** in base alla struttura trovata in Query 1.

---

### Query 4: Sistema politiche RLS per blueriot_tastes

```sql
ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;

-- Rimuovi politiche vecchie
DROP POLICY IF EXISTS "TLs can view all tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can insert tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can update tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can delete tastes" ON blueriot_tastes;

-- Crea politiche corrette (database condiviso tra tutti i TL)
CREATE POLICY "TLs can view all tastes"
    ON blueriot_tastes FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can insert tastes"
    ON blueriot_tastes FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can update tastes"
    ON blueriot_tastes FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can delete tastes"
    ON blueriot_tastes FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM tl_users));
```

---

### Query 5: Sistema politiche RLS per tours

```sql
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can insert their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can update their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can delete their own tours" ON tours;

-- Ogni TL vede solo i propri tour
CREATE POLICY "TLs can view their own tours"
    ON tours FOR SELECT
    USING (tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid()));

CREATE POLICY "TLs can insert their own tours"
    ON tours FOR INSERT
    WITH CHECK (tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid()));

CREATE POLICY "TLs can update their own tours"
    ON tours FOR UPDATE
    USING (tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid()));

CREATE POLICY "TLs can delete their own tours"
    ON tours FOR DELETE
    USING (tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid()));
```

---

### Query 6: Sistema politiche RLS per tour_days

```sql
ALTER TABLE tour_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can insert their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can update their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can delete their tour days" ON tour_days;

-- Giorni visibili solo al proprietario del tour
CREATE POLICY "TLs can view their tour days"
    ON tour_days FOR SELECT
    USING (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can insert their tour days"
    ON tour_days FOR INSERT
    WITH CHECK (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can update their tour days"
    ON tour_days FOR UPDATE
    USING (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can delete their tour days"
    ON tour_days FOR DELETE
    USING (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );
```

---

### Query 7: Applica lo stesso per blueriot_routes e blueriot_stay

```sql
-- ROUTES
ALTER TABLE blueriot_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can insert routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can update routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can delete routes" ON blueriot_routes;

CREATE POLICY "TLs can view all routes"
    ON blueriot_routes FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can insert routes"
    ON blueriot_routes FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can update routes"
    ON blueriot_routes FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can delete routes"
    ON blueriot_routes FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

-- STAY
ALTER TABLE blueriot_stay ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can insert stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can update stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can delete stays" ON blueriot_stay;

CREATE POLICY "TLs can view all stays"
    ON blueriot_stay FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can insert stays"
    ON blueriot_stay FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can update stays"
    ON blueriot_stay FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM tl_users));

CREATE POLICY "TLs can delete stays"
    ON blueriot_stay FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM tl_users));
```

---

## 🤖 n8n WORKFLOW (OPZIONALE)

Se vuoi automatizzare questo con n8n:

### Workflow n8n: "Sync Auth Users to TL_Users"

**Nodi:**
1. **Schedule Trigger** (ogni ora o manuale)
2. **Supabase Node** - Query auth.users
3. **Supabase Node** - Query tl_users
4. **Code Node** - Trova utenti mancanti (JS)
5. **Supabase Node** - Insert in tl_users
6. **Telegram/Email Node** - Notifica risultato

**Configurazione Supabase Node:**
- **Host:** `https://[tuo-progetto].supabase.co`
- **Service Key:** (non anon key!)
- **Database:** PostgreSQL

**Code per trovare utenti mancanti:**
```javascript
const authUsers = $input.first().json;
const tlUsers = $input.last().json;

const tlUserIds = new Set(tlUsers.map(u => u.user_id));

const missingUsers = authUsers.filter(u => !tlUserIds.has(u.id));

return missingUsers.map(u => ({
  json: {
    user_id: u.id,
    email: u.email
  }
}));
```

**Ma per ora è meglio farlo manualmente** finché non sistemiamo il database.

---

## ✅ STEP 3: VERIFICA CHE FUNZIONI

Dopo aver eseguito tutte le query:

### Test 1: Verifica utenti creati
```sql
SELECT
    u.email,
    tl.id as tl_user_id,
    '✅ CREATO' as status
FROM auth.users u
INNER JOIN tl_users tl ON tl.user_id = u.id;
```

**Risultato atteso:** Tutti gli utenti hanno un `tl_user_id`

---

### Test 2: Verifica politiche RLS
```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('tours', 'blueriot_tastes', 'tour_days', 'blueriot_routes', 'blueriot_stay')
ORDER BY tablename, policyname;
```

**Risultato atteso:** Dovresti vedere 4 politiche per tabella (SELECT, INSERT, UPDATE, DELETE)

---

## 🧪 STEP 4: TEST SULLA WEBAPP

1. Vai su https://blueriot723.github.io
2. Login con le tue credenziali
3. Prova a **creare un tour**:
   - Codice: TEST-001
   - Nome: Tour di Test
   - Date: qualsiasi
4. Prova ad **aggiungere un ristorante** in TASTES
5. Prova a **generare giorni** per il tour

**Se funziona:** ✅ Problema risolto!
**Se NON funziona:** Apri la Console JavaScript (F12) e dimmi l'errore esatto.

---

## 📂 FILE DI RIFERIMENTO

Sul repository GitHub trovi:
- `database/CREATE_TOURS_TABLE.sql` - Schema tabella tours
- `database/CREATE_MISSING_TL_USERS.sql` - Script utenti mancanti
- `database/FIX_RLS_POLICIES_FINAL.sql` - Fix completo RLS
- `nodex/backend/docs/DAY_ENGINE_API.md` - Documentazione API

---

## 🎯 RIASSUNTO AZIONI

1. ✅ Esegui Query 1 (struttura tl_users)
2. ✅ Esegui Query 2 (trova utenti mancanti)
3. ✅ Esegui Query 3 (crea utenti) - opzione A o B
4. ✅ Esegui Query 4 (fix RLS blueriot_tastes)
5. ✅ Esegui Query 5 (fix RLS tours)
6. ✅ Esegui Query 6 (fix RLS tour_days)
7. ✅ Esegui Query 7 (fix RLS routes/stay)
8. ✅ Test sulla webapp

**IMPORTANTE:**
- RLS deve rimanere ENABLED ⚠️
- Non usare colonne che non esistono (es. `name` se non c'è)
- Tutti i TL possono vedere/modificare TASTES/ROUTES/STAY (database condiviso)
- Ogni TL vede solo i propri tour e giorni

---

## 💬 DOMANDE PER ME

Dopo aver analizzato gli screenshot, dimmi:
1. Quali colonne esistono in `tl_users`?
2. Quanti utenti mancano in `tl_users`?
3. Quale query 3 hai usato (A o B)?
4. Ci sono stati errori nell'esecuzione?
5. I test sulla webapp funzionano ora?

Mandami screenshot dei risultati! 📸
