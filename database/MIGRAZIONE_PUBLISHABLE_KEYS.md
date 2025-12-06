# 🔄 Migrazione a Publishable/Secret Keys di Supabase

## 📋 Problema Attuale

Supabase sta migrando dal vecchio sistema **Legacy JWT** al nuovo sistema **Publishable/Secret Keys**.

**Stato attuale:**
- ✅ Il sito usa ancora le **Legacy JWT keys** (anon/service_role)
- ⚠️ Supabase ha mostrato: "Legacy JWT secret has been migrated to new JWT Signing Keys"
- ❌ Le **Publishable keys** NON funzionano con query dirette a PostgREST
- ⚠️ Le Legacy JWT keys saranno deprecate in futuro

---

## 🎯 Soluzione Permanente

### **PASSO 1: Aggiorna Supabase Client** ✅

**FATTO:** Aggiornato a `@supabase/supabase-js@2.45.4` (ultima versione)

Questa versione supporta completamente le Publishable keys.

---

### **PASSO 2: Ottieni le Publishable Keys Corrette**

Vai su **Supabase Dashboard → Settings → API**

Dovresti vedere **DUE sezioni separate**:

#### **A. Project API keys (Legacy JWT)**
```
anon (public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
⚠️ Queste sono le chiavi VECCHIE (attualmente in uso)

#### **B. Publishable keys (Nuovo sistema)**
```
Publishable (anon): sb_publishable_xxxxxxxxxxxxx
Secret: sb_secret_xxxxxxxxxxxxx
```
✅ Queste sono le chiavi NUOVE (da usare in futuro)

---

### **PASSO 3: Verifica Compatibilità**

**Prima di migrare**, testa le publishable keys:

1. **Apri**: https://blueriot723.github.io/blueriot_webapp/diagnostic.html

2. **Modifica temporaneamente la key** nella pagina diagnostica:
   - Ispeziona elemento (se possibile su iPad connesso a Mac)
   - Oppure crea una copia locale del file
   - Cambia `const ANON_KEY = 'sb_publishable_...'` con la tua publishable key

3. **Esegui i test**

4. **Verifica:**
   - ✅ TEST 1 deve essere OK (200)
   - ✅ TEST 2 deve essere OK (tl_users accessibile)
   - ✅ TEST 3 deve essere OK (blueriot_tastes accessibile)

Se **TUTTI i test sono OK**, puoi procedere con il PASSO 4.

Se **qualche test fallisce**, significa che Supabase non ha completato la migrazione - rimani con le Legacy JWT keys per ora.

---

### **PASSO 4: Migrazione nel Codice**

**Quando i test del PASSO 3 sono OK:**

#### **4A. Aggiorna index.html**

Sostituisci in `index.html`:

```javascript
// DA (Legacy JWT):
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// A (Publishable Key):
const SUPABASE_ANON_KEY = 'sb_publishable_WgMzf0xMBQ6a8WMcun3fvg_sUfBQ8qC';
```

#### **4B. Aggiorna Render (API backend)**

Su **Render → Environment Variables**:

```
SUPABASE_SERVICE_KEY = sb_secret_xxxxxxxxxxxxxxxxxxxxxx
```

(Usa la **Secret key** dalla sezione "Publishable keys", NON la service_role JWT)

---

### **PASSO 5: Test Completo**

Dopo la migrazione:

1. ✅ Test login su https://blueriot723.github.io/blueriot_webapp/
2. ✅ Test TASTES (caricamento, aggiunta, modifica, delete)
3. ✅ Test ROUTES, STAY, altri database
4. ✅ Test API Render (se usata)

---

## 🔍 Diagnostica Problemi

### **Se il login fallisce con Publishable Key:**

**Errore: PGRST002 "Could not query schema cache"**

**Causa:** Le publishable keys non sono state generate correttamente su Supabase.

**Soluzione:**
1. Vai su **Supabase Dashboard → Settings → API → JWT Settings**
2. Clicca su **"Generate new JWT secret"** (rigenera)
3. Aspetta 2-3 minuti
4. Le publishable keys dovrebbero aggiornarsi automaticamente
5. Riprova i test dal PASSO 3

---

### **Se continua a non funzionare:**

**Contatta Supabase Support:**

1. Vai su https://supabase.com/dashboard/support
2. Spiega che:
   - Hai migrato alle new signing keys
   - Le publishable keys danno PGRST002
   - Le legacy JWT keys funzionano
   - Chiedi come completare la migrazione

---

## 📊 Vantaggi delle Publishable Keys

Quando la migrazione sarà completata:

✅ **Sicurezza migliorata**: Le secret keys hanno più controlli di sicurezza
✅ **Rotazione semplificata**: Puoi rigenerare le chiavi senza invalidare le vecchie
✅ **Compatibilità futura**: Supabase deprecherà le Legacy JWT keys
✅ **Migliore gestione**: Separazione chiara tra publishable (frontend) e secret (backend)

---

## 🗓️ Timeline Consigliata

**ORA (Dicembre 2024):**
- ✅ Usa Legacy JWT keys (funzionano)
- ✅ Aggiorna Supabase client a v2.45.4 (fatto)
- ⏳ Monitora quando Supabase completa la migrazione

**Quando Supabase annuncia deprecazione Legacy JWT:**
- 🔄 Esegui PASSO 3 per testare publishable keys
- 🔄 Esegui PASSO 4 per migrare il codice
- ✅ Completa PASSO 5 per verificare tutto

**NON c'è urgenza** - le Legacy JWT continueranno a funzionare finché Supabase non le depreca ufficialmente (probabilmente 6-12 mesi).

---

## ✅ Checklist

- [x] Aggiornato Supabase client a v2.45.4
- [ ] Testato publishable keys con diagnostic.html
- [ ] Migrato index.html a publishable key
- [ ] Migrato Render a secret key
- [ ] Testato login completo
- [ ] Testato tutte le funzionalità

---

**Autore:** Claude
**Data:** 3 Dicembre 2024
**Stato:** In attesa di completamento migrazione Supabase
