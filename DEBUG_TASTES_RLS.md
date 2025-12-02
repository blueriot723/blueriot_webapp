# 🔍 DEBUG RLS TASTES - Cosa Controllare su Supabase

## 1️⃣ Vai su SQL Editor e esegui questo:

```sql
-- Controlla se le RLS policies esistono per blueriot_tastes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'blueriot_tastes';
```

**Cosa dovrebbe mostrare:**
- Almeno 2 policy (SELECT e INSERT per TLs)
- Se è vuoto = le policy NON sono state create!

---

## 2️⃣ Controlla il tuo utente:

```sql
-- Vedi chi sei
SELECT auth.uid() as my_user_id;

-- Controlla se sei in tl_users
SELECT * FROM tl_users WHERE user_id = auth.uid();
```

**Cosa dovrebbe mostrare:**
- Prima query: il tuo UUID utente
- Seconda query: una riga con i tuoi dati
- Se la seconda è vuota = NON sei in tl_users!

---

## 3️⃣ Controlla se RLS è abilitato:

```sql
-- Verifica RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'blueriot_tastes';
```

**Cosa dovrebbe mostrare:**
- `rowsecurity = true`
- Se è `false` = RLS è disabilitato!

---

## 4️⃣ Prova a leggere direttamente:

```sql
-- Test lettura (questo DOVREBBE funzionare se sei in tl_users)
SELECT COUNT(*) FROM blueriot_tastes;
```

**Cosa succede:**
- Se vedi un numero = RLS funziona
- Se vedi "permission denied" = problema con le policy

---

## 🎯 Dimmi i risultati di queste 4 query!

Oppure mandami screenshot e ti dico cosa non va.
