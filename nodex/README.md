# NODΞ - Operational Control Node

**Part of blueriot mαtrιχ ecosystem**

NODΞ is the operational control panel for tour leaders, providing comprehensive tools for tour management, document processing, and operational planning.

## 🎯 Features

### Core Modules

1. **eTicket Reader**
   - PDF ticket parsing
   - QR code scanning
   - Barcode reading
   - Automatic ticket classification
   - Batch processing

2. **PDF OCP Generator**
   - SΤΔΥ OCP (Hotels operational pack)
   - R0UT35 OCP (Transport schedule)
   - NODΞ OCP (Daily operative plan)
   - Bulk export

3. **vCard Ingestion**
   - Import contacts from phone
   - Automatic classification (restaurant/hotel/driver/emergency)
   - Batch import support

4. **Day Engine**
   - Calendar date management
   - Logical day numbering
   - Drag & drop reordering
   - Link days to tastes/routes/stay/tickets

5. **Weather Integration**
   - Open-Meteo API
   - 7-day forecasts
   - Multi-city support
   - Caching layer

6. **Deterministic Bot**
   - "Ask NODΞ" interface
   - Rule-based responses
   - Tour data search
   - No AI/LLM required

## 🚀 Quick Start

### Installation

```bash
cd nodex/backend
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### Run Server

```bash
# Development
npm run dev

# Production
npm start
```

### Run Migrations

```bash
npm run migrate
```

## 📡 API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /version` - Version info

### NODΞ Core
- `GET /api/nodex/dashboard` - Dashboard data
- `GET /api/nodex/tour/:tourId` - Tour operational data
- `POST /api/nodex/ask` - Ask deterministic bot

### Days
- `GET /api/days/tour/:tourId` - Get all days
- `POST /api/days` - Create day
- `PUT /api/days/:id` - Update day
- `POST /api/days/reorder` - Reorder days
- `POST /api/days/:id/assign` - Assign items to day

### Tickets
- `GET /api/tickets/tour/:tourId` - Get tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/day/:dayId` - Tickets by day

### Weather
- `GET /api/weather/:city/:date` - Get weather
- `GET /api/weather/forecast/:city` - 7-day forecast
- `GET /api/weather/tour/:tourId` - Weather for tour

### eTicket Parser
- `POST /api/parser/eticket/pdf` - Parse PDF ticket
- `POST /api/parser/eticket/image` - Parse image (QR/barcode)
- `POST /api/parser/qr` - Parse QR code
- `POST /api/parser/barcode` - Parse barcode
- `POST /api/parser/eticket/batch` - Batch parse

### vCard
- `POST /api/vcard/import` - Import single vCard
- `POST /api/vcard/import/batch` - Batch import
- `POST /api/vcard/parse` - Parse without saving

### PDF OCP
- `GET /api/pdf/ocp/stay/:tourId` - Generate SΤΔΥ OCP
- `GET /api/pdf/ocp/routes/:tourId` - Generate R0UT35 OCP
- `GET /api/pdf/ocp/nodex/:tourId` - Generate NODΞ OCP
- `GET /api/pdf/ocp/all/:tourId` - Generate all (ZIP)

## 🗂️ Project Structure

```
nodex/
├── backend/
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── lib/            # Utilities
│   │   ├── parsers/    # PDF, QR, Barcode extractors
│   │   ├── pdf/        # PDF templates
│   │   └── utils/      # Helpers
│   ├── db/
│   │   ├── migrations/ # SQL migrations
│   │   └── seeds/      # Test data
│   └── logs/
├── frontend/
│   ├── nodex.html      # Admin panel
│   ├── modules/        # Frontend modules
│   └── components/     # UI components
├── shared/             # Shared code
└── docs/               # Documentation
```

## 📚 Documentation

- [NODΞ.md](docs/NODΞ.md) - Core documentation
- [ETICKET.md](docs/ETICKET.md) - eTicket reader guide
- [OCP.md](docs/OCP.md) - PDF OCP generator
- [VCARD.md](docs/VCARD.md) - vCard ingestion
- [BOT.md](docs/BOT.md) - Deterministic bot logic
- [WEATHER.md](docs/WEATHER.md) - Weather integration

## 🔧 Tech Stack

- **Backend**: Node.js 18+, Express
- **Database**: Supabase (PostgreSQL)
- **PDF**: pdf-lib
- **QR/Barcode**: jsQR, @zxing/library
- **vCard**: vcf
- **Weather**: Open-Meteo API

## 📝 License

MIT - BlueRiot Syndicate
