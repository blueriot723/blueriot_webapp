# 🍝 Guida Database mangiAMO - BlueRiot Syndicate

## 📋 Come Applicare lo Schema SQL su Supabase

### Passo 1: Accedi a Supabase
1. Vai su [https://supabase.com](https://supabase.com)
2. Accedi al tuo progetto: **kvomxtzcnczvbcscybcy**

### Passo 2: Apri SQL Editor
1. Nel menu laterale, clicca su **SQL Editor**
2. Clicca su **New query**

### Passo 3: Copia e Incolla lo Schema
1. Apri il file `database_mangiamo_schema.sql`
2. Copia **TUTTO** il contenuto
3. Incollalo nell'SQL Editor di Supabase
4. Clicca su **RUN** (o CTRL+Enter)

### Passo 4: Verifica
Dopo l'esecuzione, verifica che:
- ✅ La tabella `shared_restaurants` ha le nuove colonne
- ✅ La tabella `shared_transports` è stata creata
- ✅ La tabella `tour_suggestions` è stata creata
- ✅ Le funzioni `get_available_restaurants` e `get_available_transports` esistono

Puoi verificare con:
```sql
-- Verifica colonne shared_restaurants
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'shared_restaurants';

-- Verifica tabella shared_transports
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'shared_transports';
```

---

## 🗺️ Struttura Database

### 1. **shared_restaurants** (Tabella Espansa)

#### Campi Nuovi:
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `discount_type` | TEXT[] | Array: 'sconto', 'gratuita', 'commissione' |
| `group_size` | VARCHAR | 'grande', 'piccolo', 'minimo', 'solo_tl' |
| `purpose` | VARCHAR | 'svago', 'business', etc |
| `closed_days` | TEXT[] | Giorni chiusura: ['lunedi', 'martedi'] |
| `min_people` | INTEGER | Numero minimo persone |
| `max_people` | INTEGER | Numero massimo (NULL = illimitato) |

#### Geografia Gerarchica:
| Campo | Esempio |
|-------|---------|
| `continent` | 'Europa' |
| `country` | 'Italia' |
| `region` | 'Lazio' |
| `province` | 'RM' |
| `city` | 'Roma' |

#### Contatti (tutti opzionali):
- `contact_email`
- `website`
- `phone`
- `contact_person`

#### Metadata:
- `added_by` - Chi l'ha aggiunto
- `verified` - Se verificato dal team
- `notes` - Note libere
- `last_updated` - Ultimo aggiornamento (automatico)

---

### 2. **shared_transports** (Nuova Tabella)

#### Struttura:
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | UUID | ID univoco |
| `transport_type` | VARCHAR | 'taxi', 'ncc', 'bus_privato', 'van' |
| `company_name` | VARCHAR | Nome azienda/driver |
| Geografia | VARCHAR | continent, country, region, province, city |
| `services` | TEXT[] | ['aeroporto', 'stazione', 'tours'] |
| `vehicle_types` | TEXT[] | ['sedan', 'van', 'minibus'] |
| `max_passengers` | INTEGER | Capacità massima |
| `price_range` | VARCHAR | '€', '€€', '€€€' |
| `fixed_rates` | JSONB | Tariffe fisse formato JSON |
| `available_24h` | BOOLEAN | Disponibile 24/7 |
| `closed_days` | TEXT[] | Giorni chiusura |
| `discount_type` | TEXT[] | Vantaggi per TL |
| `tl_benefits` | TEXT | Descrizione benefici |
| Contatti | VARCHAR | email, website, phone, whatsapp, contact_person |
| Metadata | - | notes, added_by, verified, rating_avg, rating_count |

---

### 3. **tour_suggestions** (Suggerimenti Automatici)

Sistema intelligente che collega tour a ristoranti/trasporti:

| Campo | Descrizione |
|-------|-------------|
| `tour_id` | ID del tour |
| `suggestion_type` | 'restaurant' o 'transport' |
| `resource_id` | ID del ristorante o trasporto |
| `day_number` | Giorno del tour (opzionale) |
| `meal_type` | 'colazione', 'pranzo', 'cena' (per ristoranti) |
| `route_type` | 'aeroporto', 'hotel' (per trasporti) |
| `status` | 'suggested', 'accepted', 'rejected', 'used' |

---

## 🔍 Funzioni SQL Intelligenti

### 1. `get_available_restaurants(città, giorno, min_persone)`

Trova ristoranti disponibili:
```sql
-- Esempio: ristoranti a Roma aperti di lunedì per 20+ persone
SELECT * FROM get_available_restaurants('Roma', 'lunedi', 20);
```

**Logica:**
- ✅ Filtra per città
- ✅ Esclude ristoranti chiusi quel giorno
- ✅ Verifica capacità minima
- ✅ Ordina per rating

### 2. `get_available_transports(città, tipo)`

Trova trasporti disponibili:
```sql
-- Esempio: NCC a Roma
SELECT * FROM get_available_transports('Roma', 'ncc');
```

**Logica:**
- ✅ Filtra per città
- ✅ Filtra per tipo (opzionale)
- ✅ Ordina per rating

---

## 🎯 Come Funzionerà nella WebApp

### Scenario 1: TL aggiunge un ristorante

1. **Form nella webapp** con tutti i campi
2. Campi opzionali = possono essere vuoti
3. Selezione geografica:
   - **Opzione A**: Dropdown a cascata (Continente → Paese → Regione → Provincia → Città)
   - **Opzione B**: Campo libero + ricerca
   - **Opzione C**: Mappa interattiva (da implementare)

### Scenario 2: TL crea un tour a Roma dal 10-15 Maggio

**Sistema automatico suggerisce:**
```javascript
// Giorno 1 (10 Maggio = Lunedì)
- Pranzo: Trattoria da Mario (aperta lunedì, TL gratis, commissione)
- Cena: Ristorante X (aperto lunedì, sconto 20%)
- Trasporto: Rome VIP Transfer (disponibile 24h, sconto TL)

// Giorno 2 (11 Maggio = Martedì)
- Pranzo: ...
- Cena: ...
```

### Scenario 3: Badge visivi

Quando mostri i ristoranti:
- 🎁 **Gratuita** (TL mangia gratis)
- 💰 **Commissione** (TL riceve commissione)
- 🏷️ **Sconto** (Sconto per il gruppo)
- 👥 **Grande gruppo** (Adatto a 30+ persone)

---

## 📊 Esempi di Dati

### Esempio Ristorante Completo:
```json
{
  "name": "Trattoria da Mario",
  "city": "Roma",
  "country": "Italia",
  "region": "Lazio",
  "province": "RM",
  "continent": "Europa",
  "discount_type": ["gratuita", "commissione"],
  "group_size": "grande",
  "purpose": "svago",
  "closed_days": ["lunedi"],
  "min_people": 10,
  "max_people": 50,
  "contact_email": "mario@trattoria.it",
  "phone": "+39 06 1234567",
  "website": "www.trattoriamario.it",
  "contact_person": "Mario Rossi",
  "rating_avg": 4.5,
  "tl_free": true,
  "commission": true,
  "notes": "Chiedere di Mario, offrono vino della casa gratis"
}
```

### Esempio Trasporto NCC:
```json
{
  "transport_type": "ncc",
  "company_name": "Rome VIP Transfer",
  "city": "Roma",
  "country": "Italia",
  "continent": "Europa",
  "services": ["aeroporto", "stazione", "tours"],
  "vehicle_types": ["sedan", "van"],
  "max_passengers": 8,
  "price_range": "€€",
  "discount_type": ["sconto", "commissione"],
  "available_24h": true,
  "phone": "+39 333 1234567",
  "whatsapp": "+39 333 1234567",
  "contact_person": "Giuseppe",
  "rating_avg": 4.7,
  "tl_benefits": "10% sconto + commissione 5% su ogni corsa",
  "notes": "Disponibili anche di notte, auto di lusso"
}
```

---

## 🚀 Prossimi Passi

### ✅ Database
1. Applica SQL su Supabase
2. Verifica che tutto funziona
3. (Opzionale) Aggiungi dati di test

### 🎨 WebApp
1. Espandi form ristoranti esistente
2. Crea form trasporti
3. Implementa selezione geografica
4. Sistema suggerimenti nel tour builder
5. Badge visuali (🎁 💰 🏷️)

### 🤖 Bot Telegram
1. Comandi per query ristoranti
2. Comandi per query trasporti
3. Suggerimenti via bot

---

## ⚠️ Note Importanti

1. **Tutti i campi contatti sono OPZIONALI**
   - Non obbligare a compilare tutto
   - Mostra "N/D" se vuoto

2. **discount_type è un ARRAY**
   - Un ristorante può avere GRATUITA + COMMISSIONE insieme
   - Usa checkbox multipli nel form

3. **Geografia flessibile**
   - Non tutti i campi obbligatori
   - Almeno city + country
   - Il resto opzionale

4. **Giorni chiusura**
   - Array: ['lunedi', 'martedi', etc]
   - In italiano (minuscolo)
   - Usa checkbox nel form

5. **Rating**
   - Sistema di rating da implementare
   - Per ora manuale o NULL

---

## 🔧 Troubleshooting

### Errore: "uuid_generate_v4 does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Errore: "function already exists"
- Normale, lo script usa `CREATE OR REPLACE`

### Verificare che le tabelle esistono:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'shared_%';
```

---

**Database pronto! Ora possiamo costruire l'interfaccia! 🚀**
