# BlueRiot Syndicate - Documento di Handover

**Ultimo aggiornamento:** 7 Dicembre 2024
**Repository:** blueriot723/blueriot_webapp
**Domini:** joinblueriot.com | blueriot.world | (pending) matrixblueriot.world

---

## Overview del Progetto

BlueRiot Syndicate e' una web app per Tour Leaders (TL) che gestisce:
- **NODΞ**: Sistema di gestione tour con calendario, passeggeri, meteo, eTicketing
- **ΤΔSΤΞ5**: Database condiviso ristoranti
- **R0UT35**: Database condiviso trasporti (bus, treno, ferry, taxi)
- **SΤΔΥ**: Database condiviso hotel
- **T00L5**: Strumenti (eTicketing, PDF OCR)

---

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Frontend | ES6 Modules + Web Components |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (Google OAuth + Email/Password) |
| Weather API | Open-Meteo (gratuito, no API key) |
| PDF Processing | PDF.js (client-side) |
| Hosting | GitHub Pages |
| Font | Google Fonts (Orbitron, Share Tech Mono) |

---

## Architettura File

```
blueriot_webapp/
├── index.html                    # Entry point principale
├── matrix.svg                    # Logo Matrix animato
├── blueriot-logo.png             # Logo BlueRiot
│
├── src/
│   ├── components/               # Web Components
│   │   ├── dashboard-frame.js    # Frame principale con navigazione
│   │   ├── eticket-panel.js      # Sistema eTicketing completo
│   │   ├── pdf-ocr-panel.js      # OCR per PDF (hotel/passeggeri)
│   │   ├── tour-weather-panel.js # Dettaglio tour con meteo
│   │   └── node-panel.js         # Database citta' (non usato)
│   │
│   ├── utils/
│   │   ├── auth.js               # Gestione autenticazione
│   │   └── weather.js            # Servizio meteo Open-Meteo
│   │
│   └── styles/
│       ├── base.css              # Variabili CSS e reset
│       ├── layout.css            # Layout e grid
│       └── components.css        # Stili componenti
│
├── database/
│   ├── migrations/               # Migration SQL
│   │   ├── 001_*.sql → 006_*.sql
│   │   └── 004_weather_cache.sql # Cache meteo
│   └── *.sql                     # Script setup completi
│
├── nodex/                        # Backend Node.js (opzionale)
│   └── backend/
│       ├── routes/
│       ├── controllers/
│       └── services/
│
└── docs/
    ├── HANDOVER.md               # Questo file
    ├── README.md                 # Documentazione generale
    └── DEPLOYMENT.md             # Guida deployment
```

---

## Configurazione Supabase

### Credenziali
```javascript
const SUPABASE_URL = 'https://kvomxtzcnczvbcscybcy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WgMzf0xMBQ6a8WMcun3fvg_sUfBQ8qC';
```

### Tabelle Database

| Tabella | Descrizione | Sezione UI |
|---------|-------------|------------|
| `tl_users` | Tour Leaders registrati | Auth |
| `tours` | Tour creati (tl_id, name, code, dates) | NODΞ |
| `tour_days` | Giorni del tour (day_number, city, date) | NODΞ |
| `day_items` | Elementi giornalieri | NODΞ |
| `tour_passengers` | Passeggeri per tour | NODΞ/eTickets |
| `ticket_templates` | Template biglietti | eTickets |
| `weather_cache` | Cache previsioni meteo | NODΞ |
| `blueriot_tastes` | Ristoranti | ΤΔSΤΞ5 |
| `blueriot_routes` | Trasporti | R0UT35 |
| `blueriot_stay` | Hotel | SΤΔΥ |

### Colonne Importanti

**tours:**
- `tl_id` (UUID) - FK a tl_users.id
- `name`, `code`, `start_date`, `end_date`
- `passenger_count`, `status`, `cities` (JSONB array)

**tour_days:**
- `tour_id`, `day_number`, `calendar_date`, `city`, `title`

**blueriot_routes:**
- `start_point`, `end_point` (NON from_location/to_location)
- `transport_type`, `operator_name`, `duration`

**blueriot_stay:**
- `location` (NON city)
- `price_range` (NON price)

---

## Funzionalita' Implementate

### 1. Autenticazione
- Google OAuth
- Email/Password
- Profilo TL (tl_users)

### 2. ΤΔSΤΞ5 (Ristoranti)
- Lista con rating
- Filtri per citta'/cucina
- Aggiunta nuovo ristorante

### 3. R0UT35 (Trasporti)
- Lista tratte
- Info: partenza, arrivo, operatore, durata

### 4. SΤΔΥ (Hotel)
- Lista strutture
- Info: location, tipo, fascia prezzo

### 5. NODΞ (Tour Management)
- **Lista Tour**: Card cliccabili con info base
- **Dettaglio Tour**:
  - Header con codice, date, pax
  - Timeline giorni con meteo 7 giorni
  - Previsioni da Open-Meteo (cached in Supabase)
- **Navigazione**: Back button per tornare alla lista

### 6. T00L5
#### eTicketing (eticket-panel.js)
- Selezione tour
- Upload template biglietto (immagine)
- Posizionamento nome con drag & click
- Gestione lista passeggeri
- Generazione Canvas con nome sovrapposto
- Download singolo o ZIP multiplo

#### PDF OCR (pdf-ocr-panel.js)
- Due modalita':
  - **Hotel & Ristoranti**: Estrae nome, indirizzo, telefono
  - **Lista Passeggeri**: Estrae nomi da rooming list
- Preview risultati prima del salvataggio
- Salvataggio nel tour selezionato

### 7. Weather Service (weather.js)
- Integrazione Open-Meteo API
- Cache 6 ore in Supabase
- 50+ citta' italiane pre-mappate
- Geocoding automatico per altre citta'
- WMO codes → condizioni italiano + emoji

---

## UI/UX Design

### Tema: Cyberpunk/TRON
```css
--neon-cyan: #00f0ff
--neon-fuchsia: #ff00ff
--bg-dark: #0a0a0a
--bg-sidebar: #0d0d0d
--text-primary: #FFFFFF
--text-secondary: #8899aa
```

### Navigazione
```
┌─────────────────┐
│  BLUERIOT LOGO  │
│   SYNDICATE     │
│  MATRIX LOGO    │
├─────────────────┤
│ Database        │
│  • ΤΔSΤΞ5       │
│  • R0UT35       │
│  • SΤΔΥ         │
│  • NODΞ         │
├─────────────────┤
│ T00L5           │
│  • eTICKΞTS     │
│  • PDF 0CR      │
└─────────────────┘
```

### Effetti
- Glow neon su hover
- Clip-path per bottoni nav
- Gradient backgrounds
- Shadow blur per enfasi

---

## Mobile Responsiveness

### Breakpoint: 768px
- Sidebar nascosta (hamburger menu)
- Grid single column
- Touch-friendly buttons
- Swipe navigation (TODO)

---

## TODO - Prossimi Step

### Priorita' Alta
1. [ ] Migliorare UI mobile (test su device reali)
2. [ ] QR Code per accesso passeggeri
3. [ ] Push notifications

### Priorita' Media
4. [ ] Collegamento ΤΔSΤΞ5 ↔ NODΞ (seleziona ristorante per giorno)
5. [ ] Collegamento SΤΔΥ ↔ NODΞ (seleziona hotel per tour)
6. [ ] Export PDF itinerario completo

### Priorita' Bassa
7. [ ] Menu pre-ordering
8. [ ] Feedback system passeggeri
9. [ ] Analytics dashboard

---

## Come Testare

### Locale
```bash
cd blueriot_webapp
python3 -m http.server 8000
# Apri http://localhost:8000
```

### GitHub Pages
```
https://blueriot723.github.io/blueriot_webapp
```

---

## Changelog

### 7 Dicembre 2024 - Sessione 3
- Aggiunto Weather Integration per NODΞ:
  - weather.js: servizio client-side Open-Meteo
  - tour-weather-panel.js: vista dettaglio tour con meteo
  - Cache Supabase per previsioni
  - 50+ citta' italiane mappate
- Rinominato "Strumenti" → "T00L5"
- Tour cards cliccabili con preview meteo

### 7 Dicembre 2024 - Sessione 2
- Aggiunto eTicketing completo (eticket-panel.js)
- Aggiunto PDF OCR migliorato (pdf-ocr-panel.js)
- Migrato a architettura Web Components
- Integrato nel dashboard-frame.js

### 7 Dicembre 2024 - Sessione 1
- Allineamento schema database con Supabase
- Fix nomi colonne (start_point, end_point, etc.)
- Creato COMPLETE_DATABASE_SETUP.sql
- Aggiunto RLS policies per day_items

---

## Riferimenti

- **Repository:** https://github.com/blueriot723/blueriot_webapp
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Open-Meteo API:** https://open-meteo.com/
- **PDF.js:** https://mozilla.github.io/pdf.js/

---

## Note per lo Sviluppo

### Web Components
Tutti i componenti usano Shadow DOM per incapsulamento CSS.
Import styles con `@import url('../styles/base.css')` nel template.

### Supabase Client
Accessibile globalmente come `window.supabaseClient`.

### Eventi Custom
- `tour-weather-panel` emette `back` quando si torna alla lista
- Altri componenti comunicano tramite props/methods

### Debug
```javascript
// Console browser
window.supabaseClient.from('tours').select('*').then(console.log)
```
