-- ═══════════════════════════════════════════════════
-- 🔧 AUTO-CREATE TL_USERS - Crea utenti mancanti
-- ═══════════════════════════════════════════════════
-- Questo script crea automaticamente una riga in tl_users
-- per ogni utente in auth.users che non ce l'ha ancora
-- ═══════════════════════════════════════════════════

-- Verifica situazione attuale
SELECT
    u.id as auth_id,
    u.email,
    u.created_at as registered_at,
    tl.id as tl_id,
    CASE
        WHEN tl.id IS NULL THEN '❌ MANCANTE'
        ELSE '✅ OK'
    END as status
FROM auth.users u
LEFT JOIN tl_users tl ON tl.user_id = u.id
ORDER BY u.created_at DESC;

-- ═══════════════════════════════════════════════════
-- Crea automaticamente gli utenti mancanti
-- ═══════════════════════════════════════════════════

INSERT INTO tl_users (user_id, email, name, role, created_at)
SELECT
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        SPLIT_PART(u.email, '@', 1)
    ) as name,
    'tl' as role,
    NOW() as created_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM tl_users WHERE user_id = u.id
);

-- Verifica che tutti gli utenti ora hanno una riga in tl_users
SELECT
    u.id as auth_id,
    u.email,
    tl.id as tl_id,
    tl.name,
    tl.role,
    '✅ TUTTI GLI UTENTI HANNO TL_USERS' as status
FROM auth.users u
INNER JOIN tl_users tl ON tl.user_id = u.id
ORDER BY u.created_at DESC;

-- ═══════════════════════════════════════════════════
-- ✅ FATTO! Tutti gli utenti hanno una riga in tl_users
-- ═══════════════════════════════════════════════════
