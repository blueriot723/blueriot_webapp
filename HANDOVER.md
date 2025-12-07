# BlueRiot Syndicate - Documento di Handover

**Ultimo aggiornamento:** 7 Dicembre 2024
**Repository:** blueriot723/blueriot_webapp

---

## Overview del Progetto

BlueRiot Syndicate e' una web app per Tour Leaders (TL) che gestisce:
- **NODΞ**: Sistema di gestione tour con calendario, passeggeri, PDF OCR, eTicketing
- **ΤΔSΤΞ5**: Database condiviso ristoranti
- **R0UT35**: Database condiviso trasporti (bus, treno, ferry, taxi)
- **SΤΔΥ**: Database condiviso hotel

---

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Frontend | Single HTML file (index.html) con CSS/JS inline |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (Google OAuth + Email/Password) |
| Hosting | GitHub Pages |
| Font | Google Fonts (Orbitron, Share Tech Mono) |

---

## File Principali

```
blueriot_webapp/
├── index.html                    # APP PRINCIPALE (tutto inline)
├── index-old-monolith.html       # Vecchio codice completo (~8500 righe) - RIFERIMENTO
├── COMPLETE_DATABASE_SETUP.sql   # SQL per creare tutte le tabelle Supabase
├── matrix.svg                    # Logo Matrix (280KB, animato)
├── design-reference.png          # Design reference UI
├── nodex/                        # Backend Node.js (NON USATO attualmente)
│   └── backend/
│       ├── routes/               # API routes
│       ├── controllers/          # Business logic
│       ├── services/             # PDF, weather, eTicket services
│       └── lib/                  # Database, templates, parsers
└── src/                          # Componenti modulari (NON USATI - Shadow DOM problematico)
```

---

## Configurazione Supabase

### Credenziali
```javascript
const SUPABASE_URL = 'https://kvomxtzcnczvbcscybcy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WgMzf0xMBQ6a8WMcun3fvg_sUfBQ8qC';
```

**NOTA:** La chiave usa il nuovo formato JWT asimmetrico (`sb_publishable_*`)

### Tabelle Database

| Tabella | Descrizione | Sezione UI |
|---------|-------------|------------|
| `tl_users` | Tour Leaders registrati | Auth |
| `tours` | Tour creati | NODΞ |
| `tour_items` | Elementi giornalieri tour | NODΞ |
| `blueriot_tastes` | Ristoranti | ΤΔSΤΞ5 |
| `blueriot_routes` | Trasporti | R0UT35 |
| `blueriot_stay` | Hotel | SΤΔΥ |
| `tour_passengers` | Passeggeri per eTicket | NODΞ |
| `ticket_templates` | Template biglietti | NODΞ |
| `tour_restaurants` | Ristoranti assegnati a tour | NODΞ |
| `hotels` | Hotel assegnati a tour | NODΞ |
| `tour_pdf_extractions` | Risultati OCR | NODΞ |
| `taste_ratings` | Valutazioni ristoranti | ΤΔSΤΞ5 |

---

## Struttura UI

### Design
- **Tema:** TRON/Cyberpunk neon
- **Colori principali:**
  - Cyan: `#00d4ff` (hover, elementi attivi)
  - Fuchsia: `#ff4fd8` (selezione attiva)
  - Background: `#0a0a0a`
- **Effetti:** Box-shadow neon, glow su hover

### Menu Navigazione
```
mαtrιχ     → Home
ΤΔSΤΞ5    → Tastes (Ristoranti)
R0UT35    → Routes (Trasporti)
SΤΔΥ      → Stay (Hotel)
NODΞ      → Tour Management
```

### Comportamento Nav Items
- **Hover:** Cyan glow + border-left cyan
- **Active:** Fuchsia glow + border-left fuchsia + background rgba

---

## Funzionalita' Implementate

### Login (index.html:1139-1198)
- Google OAuth
- Email/Password
- Cambio lingua (IT/EN/ES/DE/FR)

### ΤΔSΤΞ5 - Tastes (index.html:1243-1257, 1714-1758)
- Lista ristoranti con filtri citta'/cucina
- Aggiunta nuovo ristorante
- Visualizzazione gerarchica: Paese → Regione → Citta'
- Campi: name, city, cuisine, address, phone, notes

### R0UT35 - Routes (index.html:1259-1273, 1726-1767)
- Lista tratte
- Aggiunta nuova tratta
- Campi: from_location, to_location, type, company, duration, price, notes

### SΤΔΥ - Stay (index.html:1277-1290, 1738-1776)
- Lista strutture
- Aggiunta nuova struttura
- Campi: name, city, type, address, price, contact, notes

### NODΞ - Tour Management (index.html:1292-1390, 1778-2181)
- **Lista Tour:** Card con codice, nome, pax, date, status
- **Creazione Tour:** Modal con tutti i campi
- **Dettaglio Tour:**
  - Info bar (codice, pax, TL, date)
  - Calendario giorni
  - Selezione giorno → mostra elementi
  - Aggiunta elementi (attivita', ristoranti, trasporti, hotel)
- **Tool Buttons:** PDF OCR, eTickets, Rooming, Feedback (placeholder)

---

## Funzionalita' da Implementare

### Priorita' Alta
1. **QR Code Generation** - Per accesso passeggeri al tour
2. **PDF OCR Engine** - Estrazione dati da rooming list PDF
3. **eTicketing System** - Generazione biglietti personalizzati

### Priorita' Media
4. **Collegamento ΤΔSΤΞ5 ↔ NODΞ** - Selezionare ristoranti dal database per tour
5. **Collegamento SΤΔΥ ↔ NODΞ** - Selezionare hotel dal database per tour
6. **Push Notifications** - Notifiche ai passeggeri

### Priorita' Bassa
7. **Weather API Integration** - Meteo per ogni citta' del tour
8. **Menu Ordering** - Preordine pasti
9. **Feedback System** - Raccolta feedback passeggeri

---

## Problemi Noti e Soluzioni

### 1. Pagina Nera
**Causa:** Shadow DOM non eredita CSS variables
**Soluzione:** Usare single-file HTML senza Shadow DOM

### 2. Supabase Auth Non Funziona
**Causa:** Chiave API formato sbagliato
**Soluzione:** Usare formato `sb_publishable_*` (JWT asimmetrico)

### 3. Tabelle Non Trovate
**Causa:** Nomi tabelle errati
**Soluzione:**
- `blueriot_tastes` (NON `tastes`)
- `blueriot_routes` (NON `routes`)
- `blueriot_stay` (NON `stay`)

### 4. Matrix.svg Non Carica
**Causa:** File troppo grande (280KB) o problemi CORS
**Soluzione:** Usare matrix.png o ridurre dimensioni SVG

---

## Come Testare

1. **Locale:**
   ```bash
   cd blueriot_webapp
   python3 -m http.server 8000
   # Apri http://localhost:8000
   ```

2. **GitHub Pages:**
   - Push su main branch
   - Vai a https://blueriot723.github.io/blueriot_webapp

---

## Comandi Git Utili

```bash
# Stato
git status

# Commit
git add -A && git commit -m "descrizione"

# Push
git push -u origin nome-branch

# Pull
git pull origin main
```

---

## Riferimenti Codice

### Funzioni Principali (index.html)

| Funzione | Linea | Descrizione |
|----------|-------|-------------|
| `showScreen()` | 1586 | Mostra login/dashboard |
| `showSection()` | 1592 | Cambia sezione (home/tastes/routes/stay/node) |
| `loadTastes()` | 1714 | Carica ristoranti da Supabase |
| `loadRoutes()` | 1726 | Carica tratte da Supabase |
| `loadStay()` | 1738 | Carica hotel da Supabase |
| `loadTours()` | 1795 | Carica tour utente |
| `openTourDetail()` | 1861 | Apre dettaglio tour |
| `renderTourCalendar()` | 1899 | Renderizza calendario tour |
| `selectDay()` | 1929 | Seleziona giorno nel calendario |
| `renderDayItems()` | 1961 | Mostra elementi del giorno |

### CSS Variables (index.html:12-23)

```css
--neon-cyan: #00d4ff
--neon-fuchsia: #ff4fd8
--bg-dark: #0a0a0a
--bg-sidebar: #0d0d0d
--border-subtle: rgba(80, 90, 100, 0.3)
--text-primary: #FFFFFF
--text-secondary: #8899aa
```

---

## Contatti

- **Repository:** https://github.com/blueriot723/blueriot_webapp
- **Issues:** https://github.com/blueriot723/blueriot_webapp/issues

---

## Changelog Recente

### 7 Dicembre 2024 (Sessione 2)
- Implementato sistema eTicketing completo:
  - Upload template biglietto (immagine)
  - Selezione posizione nome con click
  - Gestione lista passeggeri
  - Generazione biglietti con Canvas API
  - Download biglietti PNG
- Aggiunto CSS per eTicket section

### 7 Dicembre 2024 (Sessione 1)
- Reimplementato tutto in single-file HTML (no modules, no Shadow DOM)
- Aggiunto NODΞ tour management completo
- Corretto nomi tabelle Supabase
- Creato SQL completo per setup database
- Creato documento handover

### Problemi Risolti
- Pagina nera → Single file HTML
- Auth non funziona → Chiave JWT asimmetrica
- TASTES non carica → Nome tabella `blueriot_tastes`

---

## Come Usare eTicketing

1. **Vai su NODΞ** → Seleziona un tour → Clicca **🎫 eTickets**
2. **Carica Template**: Immagine del biglietto vuoto (JPG/PNG)
3. **Posiziona Nome**: Clicca 📍 poi clicca sull'immagine dove vuoi il nome
4. **Aggiungi Passeggeri**: Manualmente o con inserimento multiplo
5. **Genera Biglietti**: Crea automaticamente un biglietto per ogni passeggero
6. **Scarica**: Ogni biglietto puo' essere scaricato come PNG
