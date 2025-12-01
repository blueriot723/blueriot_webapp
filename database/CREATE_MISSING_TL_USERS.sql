-- ═══════════════════════════════════════════════════
-- 🔍 STEP 1: Verifica struttura tl_users
-- ═══════════════════════════════════════════════════
-- Esegui PRIMA questo per vedere quali colonne hai:

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tl_users'
ORDER BY ordinal_position;

-- ═══════════════════════════════════════════════════
-- 🔍 STEP 2: Verifica se il tuo utente esiste
-- ═══════════════════════════════════════════════════
-- Vedi se il tuo utente è già in tl_users:

SELECT
    u.email,
    u.id as auth_user_id,
    tl.id as tl_user_id,
    CASE
        WHEN tl.id IS NULL THEN '❌ UTENTE MANCANTE IN TL_USERS'
        ELSE '✅ UTENTE ESISTE'
    END as status
FROM auth.users u
LEFT JOIN tl_users tl ON tl.user_id = u.id;

-- ═══════════════════════════════════════════════════
-- ✅ STEP 3: Crea l'utente in tl_users (VERSIONE SEMPLICE)
-- ═══════════════════════════════════════════════════
-- Questo crea SOLO con user_id ed email (colonne sicure):

INSERT INTO tl_users (user_id, email)
SELECT
    u.id,
    u.email
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM tl_users WHERE user_id = u.id
);

-- ═══════════════════════════════════════════════════
-- ⚠️ SE RICEVI ANCORA ERRORI sulla colonna email
-- ═══════════════════════════════════════════════════
-- Prova questa versione MINIMALISTA (solo user_id):

-- INSERT INTO tl_users (user_id)
-- SELECT u.id
-- FROM auth.users u
-- WHERE NOT EXISTS (
--     SELECT 1 FROM tl_users WHERE user_id = u.id
-- );

-- ═══════════════════════════════════════════════════
-- 🔍 STEP 4: Verifica che ora funzioni
-- ═══════════════════════════════════════════════════

SELECT
    u.email,
    tl.id as tl_user_id,
    '✅ CREATO!' as status
FROM auth.users u
INNER JOIN tl_users tl ON tl.user_id = u.id;

-- ═══════════════════════════════════════════════════
-- ✅ DONE! Ora prova a creare tour/ristoranti
-- ═══════════════════════════════════════════════════
