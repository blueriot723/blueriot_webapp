# 🔴 blueriot mαtrιχ

**The Complete Tour Management Ecosystem for Tour Leaders**

A full-stack monorepo combining PWA frontend, Node.js backend API, and PostgreSQL database for comprehensive tour operations.

---

## 🌐 Live Demo

- **Frontend PWA:** https://blueriot723.github.io/blueriot_webapp/
- **Backend API:** https://blueriot-nodex-api.onrender.com
- **Database:** Supabase (PostgreSQL)

---

## 🎯 Ecosystem Overview

The **blueriot mαtrιχ** consists of 4 interconnected modules:

### 1. ΤΔSΤΞ5 (Tastes)
**Restaurant & Food Database**
- Browse curated restaurants by city
- Filter by cuisine type, price range
- View photos, menus, contact info
- Multi-language support (IT, EN, DE, FR, ES)

### 2. R0UT35 (Routes)
**Transport Database**
- Train, bus, ferry schedules
- Route planning between cities
- Operator information & booking links
- Real-time availability

### 3. SΤΔΥ (Stay)
**Accommodation Database**
- Hotels, hostels, B&Bs
- Amenities, check-in times
- Location maps
- Booking management

### 4. NODΞ (Node)
**Operational Control Panel** *(Tour Leader Only)*
- 📅 **Day Engine**: Drag & drop tour day management
- 🎫 **eTicket Reader**: Parse PDFs, QR codes, barcodes
- 📄 **PDF OCP Generator**: Create operational control packs
- 📇 **vCard Ingestion**: Import contacts from phone
- ☁️ **Weather Engine**: 7-day forecasts with caching
- 🤖 **Ask NODΞ**: Deterministic Q&A bot

---

## 🏗️ Repository Structure

```
blueriot_webapp/               # Monorepo root
│
├── 🌐 Frontend (GitHub Pages)
│   ├── index.html             # PWA entry point
│   ├── css/                   # Stylesheets
│   ├── js/                    # Client-side JavaScript
│   └── images/                # Assets
│
├── 🔴 Backend (Render)
│   └── nodex/backend/
│       ├── server.js          # Express server entry
│       ├── app.js             # App configuration
│       ├── routes/            # API endpoints
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic
│       │   ├── weather.service.js
│       │   ├── day-engine.service.js
│       │   ├── eticket-reader.service.js
│       │   ├── vcard.service.js
│       │   └── pdf-generator.service.js
│       └── lib/
│           ├── parsers/       # PDF, QR, Barcode extractors
│           ├── templates/     # PDF templates
│           └── utils/         # Helpers
│
├── 🗄️ Database (Supabase)
│   └── database/
│       ├── schemas/           # Complete SQL schemas
│       ├── migrations/        # Incremental migrations
│       │   ├── 001_days.sql
│       │   ├── 002_tickets.sql
│       │   ├── 003_eticket_import.sql
│       │   ├── 004_weather_cache.sql
│       │   ├── 005_vcard.sql
│       │   ├── 006_nodex_settings.sql
│       │   └── 007_day_items.sql
│       └── seed/              # Test data
│
├── 📦 Configuration
│   ├── package.json           # Monorepo scripts
│   ├── render.yaml            # Render deployment
│   └── .gitignore
│
└── 📚 Documentation
    ├── README.md              # This file
    ├── DEPLOYMENT.md          # Full deployment guide
    └── database/README.md     # Database documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- Accounts: GitHub, Render, Supabase

### Installation

```bash
# Clone repository
git clone https://github.com/blueriot723/blueriot_webapp.git
cd blueriot_webapp

# Install all dependencies
npm run setup

# Start backend dev server
npm run backend:dev

# In another terminal, serve frontend
npm run frontend:serve
```

### Environment Variables

Create `nodex/backend/.env`:

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
CORS_ORIGIN=http://localhost:8080
```

---

## 📡 API Endpoints

### Weather
```http
GET /api/weather/:city/:date
GET /api/weather/forecast/:city
GET /api/weather/tour/:tourId
```

### Day Management
```http
GET    /api/days/tour/:tourId
POST   /api/days
PUT    /api/days/:id
DELETE /api/days/:id
POST   /api/days/reorder
POST   /api/days/:id/swap/:targetId
```

### Day Items
```http
GET    /api/day-items/day/:dayId
POST   /api/day-items
PUT    /api/day-items/:id
DELETE /api/day-items/:id
POST   /api/day-items/:id/move
POST   /api/day-items/reorder
POST   /api/day-items/:id/duplicate
```

### eTicket Reader
```http
POST   /api/parser/eticket/pdf
POST   /api/parser/eticket/image
POST   /api/parser/batch
GET    /api/parser/eticket/tour/:tourId
```

### vCard Ingestion
```http
POST   /api/vcard/import
POST   /api/vcard/import/batch
POST   /api/vcard/parse
POST   /api/vcard/:importId/map
GET    /api/vcard/pending
GET    /api/vcard/:importId
```

### PDF OCP Generator
```http
GET    /api/pdf/stay/:stayId
GET    /api/pdf/routes/:routeId
GET    /api/pdf/nodex/day/:dayId
GET    /api/pdf/nodex/tour/:tourId
POST   /api/pdf/batch
GET    /api/pdf/preview/:type/:id
```

Full API documentation: See `nodex/backend/README.md`

---

## 🛠️ NPM Scripts

```bash
# Development
npm run backend:dev          # Start backend with hot reload
npm run frontend:serve       # Serve frontend locally

# Production
npm run backend:start        # Start backend (production)
npm run backend:install      # Install backend dependencies

# Deployment
npm run deploy:render        # Deploy to Render
npm run deploy:pages         # Deploy to GitHub Pages

# Database
npm run db:migrate           # Apply migrations to Supabase
npm run db:seed              # Seed database with test data

# Utilities
npm run setup                # Install all dependencies
npm run install:all          # Install workspace dependencies
```

---

## 🗄️ Database Schema

### Core Tables
- **tl_users** - Tour leaders (authentication)
- **tours** - Tour definitions
- **tour_days** - Tour days with dual numbering system
- **day_items** - Movable day blocks (activities, meals, transport)

### Module Tables
- **blueriot_tastes** - Restaurants (ΤΔSΤΞ5)
- **blueriot_routes** - Transport (R0UT35)
- **blueriot_stay** - Hotels (SΤΔΥ)

### NODΞ Tables
- **tickets** - Ticket management
- **eticket_imports** - eTicket parsing audit log
- **weather_cache** - Weather forecast cache (6h TTL)
- **vcard_imports** - vCard contact import staging
- **nodex_settings** - User preferences

Full schema documentation: See `database/README.md`

---

## 🎨 Key Features

### Day Engine
- **Dual Numbering**: Calendar dates (fixed) + logical day numbers (reorderable)
- **Drag & Drop**: Reorder days without changing calendar dates
- **Linked Items**: Connect restaurants, hotels, routes to days
- **Swap Days**: Exchange content between days

### Day Items System
- **Color-Coded Blocks**:
  - 🟠 Activities (orange)
  - 🔵 Lunch (light blue)
  - 🔵 Dinner (blue)
  - 🟢 Transport (green)
  - 🟣 Suggestions (purple)
- **Move Between Days**: Drag items across days independently
- **Time-Based Ordering**: Schedule items with start times

### eTicket Reader
- **Multi-Format Support**:
  - PDF text extraction (pdfjs-dist)
  - QR code reading (jsQR)
  - Barcode scanning (ZXing - 13+ formats)
- **Smart Parsing**:
  - Auto-extract ticket numbers, operators, dates
  - Support for Italian & English
  - Pattern matching for multiple date formats
- **Audit Log**: All imports saved to database

### vCard Ingestion
- **Auto-Classification**:
  - Restaurant (85% confidence)
  - Hotel (90% confidence)
  - Driver (80% confidence)
  - Emergency (95% confidence)
  - Guide (85% confidence)
- **Keyword Matching**: Detects type from organization/notes
- **Direct Mapping**: Map to ΤΔSΤΞ5 or SΤΔΥ modules

### PDF OCP Generator
- **3 Templates**:
  - SΤΔΥ: Hotel operational packs
  - R0UT35: Transport schedules
  - NODΞ: Daily operative plans
- **Professional Design**: Branded, color-coded, multi-page
- **Weather Integration**: Auto-fetch forecast for NODΞ plans
- **Batch Generation**: Create multiple PDFs at once

### Weather Engine
- **Open-Meteo API**: Free, no key required
- **6-Hour Caching**: Reduce API calls
- **40+ European Cities**: Pre-configured coordinates
- **7-Day Forecast**: Temperature, precipitation, wind

---

## 🌍 Multi-Language Support

Frontend supports 5 languages:
- 🇮🇹 Italian (IT)
- 🇬🇧 English (EN)
- 🇩🇪 German (DE)
- 🇫🇷 French (FR)
- 🇪🇸 Spanish (ES)

Backend API responses include language-appropriate content.

---

## 📱 PWA Features

- ✅ **Installable**: Add to home screen (iOS & Android)
- ✅ **Offline-first**: Service worker caching
- ✅ **Responsive**: Mobile, tablet, desktop
- ✅ **Fast**: Optimized bundle size
- ✅ **Secure**: HTTPS only

---

## 🔐 Security

- **Row Level Security (RLS)**: Enabled on all Supabase tables
- **API Keys**: Environment variables only (never committed)
- **CORS**: Configured for specific origins
- **HTTPS**: Required for all connections
- **Service Role Key**: Backend only (never exposed to frontend)

---

## 🚀 Deployment

This monorepo deploys to **3 services**:

1. **GitHub Pages** (Frontend PWA)
   - Auto-deploys on push to `main`
   - Free, fast CDN
   - Custom domain support

2. **Render** (Backend API)
   - Auto-deploys via `render.yaml`
   - Free tier available
   - Auto-scaling

3. **Supabase** (Database)
   - PostgreSQL with real-time
   - Authentication built-in
   - Auto-backups

**Full deployment guide:** See `DEPLOYMENT.md`

---

## 🧪 Testing

```bash
# Test backend locally
cd nodex/backend
npm test

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/weather/roma/2024-06-15

# Test frontend
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## 📦 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Progressive Web App (PWA)
- Service Worker for offline support

### Backend
- Node.js 18+
- Express.js 4.18+
- ES Modules (`type: "module"`)

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Real-time subscriptions

### Libraries
- **PDF**: pdf-lib, pdfjs-dist
- **Images**: sharp, canvas
- **Parsing**: jsQR, @zxing/library, vcf
- **Weather**: Open-Meteo API
- **Utilities**: date-fns, uuid

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/blueriot723/blueriot_webapp/issues)
- **Documentation**: See `/docs` folder
- **Email**: support@blueriot.com

---

## 🎉 Acknowledgments

- Open-Meteo for free weather API
- Supabase for database & auth
- Render for backend hosting
- GitHub for Pages & version control

---

**Built with ❤️ for tour leaders**

*blueriot mαtrιχ v1.0 - 2024*
