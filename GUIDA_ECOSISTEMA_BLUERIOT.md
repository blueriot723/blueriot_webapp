# 🌍 BlueRiot Ecosystem - Guida Completa

## 📋 Panoramica

**BlueRiot.world** è l'ecosistema completo di servizi per Tour Leaders e membri del Syndicate.

### Domini:
- 🌐 **joinblueriot.com** → Landing page e registrazione
- 🌐 **blueriot.world** → Dashboard principale e tutti i servizi

---

## 🗄️ Database Schema

### Come Applicare lo Schema SQL:

1. **Accedi a Supabase**
   - Progetto: `kvomxtzcnczvbcscybcy`
   - URL: https://supabase.com

2. **Apri SQL Editor**
   - Menu laterale → SQL Editor
   - New query

3. **Esegui lo Schema**
   - Copia TUTTO il contenuto di `database_blueriot_ecosystem.sql`
   - Incolla nell'editor
   - Clicca **RUN**

4. **Verifica**
   ```sql
   -- Controlla che le tabelle esistano
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'blueriot_%';

   -- Dovrebbe restituire:
   -- blueriot_tastes
   -- blueriot_routes
   -- blueriot_stay
   ```

---

## 🏗️ Struttura Ecosistema

L'ecosistema è diviso in **4 sezioni principali**:

### 1. 🍝 **BlueRiot Tastes**
Database completo di luoghi dove mangiare/bere:
- Ristoranti
- Bar
- Bakery
- Gelaterie
- Aperitivi
- Quick bites

**Campi principali:**
- Nome, tipo, cucina
- Price range (€, €€, €€€)
- **Vantaggi TL**: gratuity, commission, discount (multipli)
- Location, indirizzo, Google Maps
- Orari, prenotazione necessaria
- Adatto per gruppi
- Tour rilevanti
- Testato da (nome TL)
- Rating e note

### 2. 🚌 **BlueRiot Routes**
Database trasporti completo:
- Bus
- Ferry
- NCC/Taxi
- Treni (con categorie: AV, IC, EC, R, RV, S, RE)
- Transfer privati

**Campi principali:**
- Tipo trasporto + categoria (se treno)
- Nome operatore
- Area servita
- Partenza → Arrivo
- Frequenza e durata
- Prezzo e info biglietti
- Affidabilità (high/medium/low)
- Contatti, sito, booking URL
- Link mappe
- Note e suggerimenti

### 3. 🏨 **BlueRiot Stay**
Database alloggi (NON quelli ufficiali Intrepid):
- Hotel
- B&B
- Guesthouse
- Boutique hotel
- Hostel
- Apartment

**Campi principali:**
- Nome, tipo, location
- Price range
- Distanza dal centro
- Contatti e booking URL
- Adatto per famiglie/gruppi
- Facilities (WiFi, breakfast, parking, AC)
- Commissioni TL
- Tariffe speciali TL
- Testato da

### 4. 🛡️ **Syndicate Hub**
Centro servizi del Syndicate:
- **Documenti**: Upload/download PDF, forms, template
- **Feedback Count**: Statistiche feedback tour
- **E-Tickets**: Gestione biglietti eventi/membership
- **Forms**: Moduli vari
- **Membership Info**: Informazioni iscrizione

---

## 👥 Sistema Utenti

### Tabella `tl_users` (espansa)

**Campi nuovi:**
- `first_name`, `last_name` → Nome completo
- `username` → Username univoco
- `role` → Ruolo: 'admin', 'tl', 'member'
- `membership_status` → 'active', 'pending', 'expired'
- `membership_start`, `membership_end` → Date membership
- `profile_photo_url` → Foto profilo
- `bio` → Biografia
- `phone`, `country`, `language` → Info aggiuntive

### Ruoli:
- **admin**: Può registrare utenti, verificare contenuti, tutto
- **tl** (Tour Leader): Accesso completo ai database, può aggiungere/modificare
- **member**: Accesso in sola lettura (opzionale)

---

## 🔐 Autenticazione

### Fase 1: Admin Registration (Manuale)
- Solo admin può registrare nuovi utenti
- Form admin: email, password, nome, cognome, username
- Utente riceve email di benvenuto
- Membership = 'pending' fino a pagamento confermato
- Admin cambia status a 'active' manualmente

### Fase 2: Auto Registration (Futuro)
- Form pubblico su joinblueriot.com
- Integrazione pagamento Stripe
- Auto-attivazione dopo pagamento

### OAuth (Futuro)
- Google
- Facebook
- Apple

---

## 📊 Dashboard Principale

Quando l'utente fa login, vede **4 blocchi/card principali**:

```
┌─────────────────┬─────────────────┐
│  🍝 TASTES      │  🚌 ROUTES      │
│  Ristoranti     │  Trasporti      │
│  Bar & Food     │  Bus, Ferry     │
└─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┐
│  🏨 STAY        │  🛡️ SYNDICATE   │
│  Hotels & B&B   │  Hub & Docs     │
│  Alloggi        │  Forms, eTicket │
└─────────────────┴─────────────────┘
```

### Design:
- **Dark mode** di default
- Minimal, clean
- Colori BlueRiot (blu neon)
- Hover effects
- Responsive mobile

---

## 🔍 Funzionalità per Sezione

### 🍝 BlueRiot Tastes

**Lista:**
- Griglia/lista di tutti i luoghi
- Filtri:
  - Tipo (ristorante, bar, bakery, etc.)
  - Location (città)
  - Price range
  - Vantaggi TL (gratuity, commission, discount)
  - Verified only
  - Top rated
- Ricerca per nome
- Ordinamento (rating, nome, aggiunti di recente)

**Dettaglio:**
- Tutte le info
- Google Maps embedded
- Orari apertura
- Badge: 🎁 Gratuity, 💰 Commission, 🏷️ Discount
- Note del TL che ha testato
- Rating e recensioni
- "Aggiungi al mio tour"

**Form Aggiungi/Modifica:**
- Tutti i campi
- Checkbox multipli per vantaggi TL
- Textarea note
- Upload foto (opzionale)
- Validazione campi obbligatori

### 🚌 BlueRiot Routes

**Lista:**
- Griglia trasporti
- Filtri:
  - Tipo (bus, ferry, ncc, taxi, train)
  - Area servita
  - Affidabilità
  - Verified
- Badge affidabilità: ✅ High, ⚠️ Medium, ❌ Low

**Dettaglio:**
- Info complete
- Mappa percorso
- Orari e frequenza
- Link booking
- Contatti operatore
- Note e suggerimenti

**Form:**
- Dropdown tipo trasporto
- Se = 'train' → mostra categoria (AV, IC, EC, etc.)
- Campi dinamici
- Link utili

### 🏨 BlueRiot Stay

**Lista:**
- Griglia alloggi
- Filtri:
  - Tipo (hotel, bnb, etc.)
  - Location
  - Price range
  - Suitable for families
  - Commission available

**Dettaglio:**
- Info complete
- Google Maps
- Facilities (icone)
- Badge commissioni
- Tariffe speciali TL
- Booking link

**Form:**
- Tutti i campi
- Facilities con checkbox
- Note e raccomandazioni

### 🛡️ Syndicate Hub

**Sezioni:**

1. **Membership Info**
   - Info su come iscriversi
   - Benefici
   - Pricing
   - FAQ

2. **Documents**
   - Lista PDF/documenti
   - Upload (solo admin)
   - Download
   - Categorie: Forms, Guides, Templates, Contracts

3. **Feedback Count**
   - Statistiche feedback per tour
   - Grafici
   - Esporta dati

4. **E-Tickets**
   - Lista biglietti utente
   - QR code
   - Validità
   - Storico

5. **Forms** (futuro)
   - Form builder
   - Submission tracking

---

## 🔗 Connessione con Bot Telegram

### Repository Bot:
`blueriot_syndicate_BOT`

### Integrazione:

1. **Database condiviso**
   - Bot e WebApp usano stesso Supabase
   - Stesse tabelle

2. **Autenticazione**
   - Bot usa `telegram_id` in tl_users
   - Link account via email

3. **Comandi bot**
   - `/tastes [city]` → Cerca ristoranti
   - `/routes [area]` → Cerca trasporti
   - `/stay [city]` → Cerca alloggi
   - `/mystats` → Statistiche personali

4. **Notifiche**
   - Quando nuovo posto aggiunto nella tua città
   - Quando documento nuovo nel Syndicate
   - Feedback ricevuto su tour

---

## 📈 Funzioni SQL Utili

### 1. Cerca ristoranti
```sql
SELECT * FROM search_tastes(
    'restaurant',  -- tipo
    'Rome',        -- location
    true,          -- solo con gratuity
    true           -- solo verified
);
```

### 2. Cerca trasporti
```sql
SELECT * FROM search_routes(
    'ferry',       -- tipo
    'Naples',      -- area
    'high'         -- affidabilità
);
```

### 3. Cerca alloggi
```sql
SELECT * FROM search_stay(
    'bnb',         -- tipo
    'Florence',    -- location
    true           -- suitable for families
);
```

### 4. Statistiche utente
```sql
SELECT * FROM user_stats WHERE id = 'user-uuid';
-- Ritorna: tours_count, tastes_added, routes_added, stays_added
```

---

## 🎨 Design Guidelines

### Colori:
```css
--primary-blue: #00F0FF;      /* Neon blu */
--secondary-blue: #0A7AFF;
--dark-bg: #0A0E27;           /* Background scuro */
--card-bg: #13182E;           /* Card background */
--text-primary: #FFFFFF;
--text-secondary: #8B9DC3;
--success: #00D9A3;           /* Verde per verified */
--warning: #FFB800;           /* Giallo per pending */
--error: #FF4757;             /* Rosso */
```

### Typography:
- Font: Inter, -apple-system, sans-serif
- Headings: Bold, neon glow effect
- Body: Regular, readable

### Components:
- Cards con border neon sottile
- Hover: glow effect
- Buttons: neon outline su hover
- Inputs: dark background, neon focus

---

## 📱 Responsive

### Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile-first:
- Stack verticale su mobile
- Griglia 2x2 su tablet
- Sidebar navigation su desktop

---

## 🚀 Roadmap Implementazione

### ✅ FASE 1: Database (FATTO)
- Schema SQL completo
- Tabelle create
- Funzioni helper

### 🔄 FASE 2: Autenticazione (IN CORSO)
- [ ] Login con Supabase Auth
- [ ] Registrazione admin-only
- [ ] Password reset
- [ ] Email verification
- [ ] Redirect dopo login

### 📋 FASE 3: Dashboard Home
- [ ] Layout 4 card principali
- [ ] Navigation
- [ ] User profile dropdown
- [ ] Stats overview

### 🍝 FASE 4: BlueRiot Tastes
- [ ] Lista con filtri
- [ ] Form CRUD completo
- [ ] Dettaglio
- [ ] Rating system

### 🚌 FASE 5: BlueRiot Routes
- [ ] Lista con filtri
- [ ] Form CRUD completo
- [ ] Dettaglio
- [ ] Mappa percorsi

### 🏨 FASE 6: BlueRiot Stay
- [ ] Lista con filtri
- [ ] Form CRUD completo
- [ ] Dettaglio
- [ ] Facilities management

### 🛡️ FASE 7: Syndicate Hub
- [ ] Membership info page
- [ ] Documents upload/download
- [ ] Feedback count dashboard
- [ ] E-tickets system

### 🤖 FASE 8: Bot Integration
- [ ] Webhook setup
- [ ] Shared database queries
- [ ] Notifications
- [ ] Commands

---

## 📝 Note Importanti

1. **Tutti i campi contatti sono OPZIONALI**
   - Non forzare compilazione
   - Mostra "N/D" se vuoto

2. **Vantaggi TL multipli**
   - Un posto può avere gratuity + commission + discount
   - Usa checkbox, non radio

3. **Verified badge**
   - Solo admin può verificare
   - Mostra badge ✅ se verified
   - Filtro "verified only"

4. **Rating system**
   - 5 stelle
   - Solo TL che hanno usato possono votare
   - Rating medio + count

5. **Usage tracking**
   - `times_used` → contatore
   - `last_used` → ultima volta
   - Per statistiche

6. **Search**
   - Full-text search (da implementare)
   - Filtri multipli
   - Ordinamento flessibile

---

## 🛠️ Tech Stack

### Frontend:
- HTML5
- CSS3 (custom, no framework)
- Vanilla JavaScript
- Supabase JS Client

### Backend:
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage (per file upload)

### Deploy:
- GitHub Pages
- Custom domain: blueriot.world
- CDN Cloudflare (opzionale)

---

**Pronto per partire! 🚀**

Prossimo step: Implementare autenticazione e dashboard home!
