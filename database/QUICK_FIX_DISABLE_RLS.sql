-- ═══════════════════════════════════════════════════
-- 🚨 QUICK FIX - Disabilita temporaneamente RLS
-- ═══════════════════════════════════════════════════
-- PROBLEMA: Permission denied su blueriot_tastes
-- CAUSA: L'utente potrebbe non avere una riga in tl_users
--        oppure auth.uid() non corrisponde
--
-- SOLUZIONE TEMPORANEA: Disabilita RLS per testare
-- IMPORTANTE: Riabilitare dopo aver verificato tl_users!
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- STEP 1: Verifica se l'utente esiste in tl_users
-- ═══════════════════════════════════════════════════
-- Esegui questa query per vedere gli utenti:

SELECT
    u.id as auth_id,
    u.email,
    tl.id as tl_id,
    tl.user_id,
    tl.name
FROM auth.users u
LEFT JOIN tl_users tl ON tl.user_id = u.id;

-- Se vedi che il tuo utente NON ha una riga in tl_users,
-- vai allo STEP 2

-- ═══════════════════════════════════════════════════
-- STEP 2: Crea l'utente in tl_users (SE NON ESISTE)
-- ═══════════════════════════════════════════════════
-- SOSTITUISCI 'tua-email@example.com' con la tua email reale!

INSERT INTO tl_users (user_id, email, name, role, created_at)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    'tl',
    NOW()
FROM auth.users
WHERE email = 'tua-email@example.com'  -- ⚠️ CAMBIA QUI!
AND NOT EXISTS (
    SELECT 1 FROM tl_users WHERE user_id = auth.users.id
);

-- ═══════════════════════════════════════════════════
-- STEP 3: QUICK FIX - Disabilita RLS temporaneamente
-- ═══════════════════════════════════════════════════
-- Questo permette a TUTTI di leggere/scrivere
-- (solo per testing, riabilitare dopo!)

ALTER TABLE blueriot_tastes DISABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_stay DISABLE ROW LEVEL SECURITY;
ALTER TABLE tours DISABLE ROW LEVEL SECURITY;
ALTER TABLE tour_days DISABLE ROW LEVEL SECURITY;

-- ⚠️⚠️⚠️ IMPORTANTE ⚠️⚠️⚠️
-- Dopo aver verificato che tutto funziona,
-- RIABILITA RLS con lo STEP 4!

-- ═══════════════════════════════════════════════════
-- STEP 4: Riabilita RLS (dopo aver testato)
-- ═══════════════════════════════════════════════════
-- Decommenta e esegui questo quando hai finito i test:

-- ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blueriot_routes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blueriot_stay ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tour_days ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- ✅ FATTO!
-- ═══════════════════════════════════════════════════
-- Ora prova a:
-- 1. Creare un tour
-- 2. Aggiungere un ristorante
--
-- Se funziona, il problema era l'utente mancante in tl_users
-- o le politiche RLS mal configurate.
-- ═══════════════════════════════════════════════════
