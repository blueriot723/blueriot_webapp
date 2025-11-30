# blueriot mαtrιχ - Database

This folder contains all database schemas, migrations, and seed data for the blueriot mαtrιχ ecosystem.

## 📁 Structure

```
database/
├── schemas/          # Complete database schemas
│   ├── database_blueriot_ecosystem.sql
│   ├── database_blueriot_ecosystem_clean.sql
│   ├── database_ecosystem_final.sql
│   └── database_mangiamo_schema.sql
├── migrations/       # Incremental migrations (Supabase-ready)
│   ├── 001_days.sql
│   ├── 002_tickets.sql
│   ├── 003_eticket_import.sql
│   ├── 004_weather_cache.sql
│   ├── 005_vcard.sql
│   ├── 006_nodex_settings.sql
│   └── 007_day_items.sql
└── seed/            # Seed data for testing
```

## 🗄️ Database Tables

### Core Ecosystem Tables
- `tl_users` - Tour leaders (authentication)
- `tours` - Tour definitions
- `blueriot_tastes` (ΤΔSΤΞ5) - Restaurants & food
- `blueriot_routes` (R0UT35) - Transport routes
- `blueriot_stay` (SΤΔΥ) - Hotels & accommodations

### NODΞ Operational Tables
- `tour_days` - Tour day management with dual numbering
- `day_items` - Movable day blocks (activities, meals, transport)
- `tickets` - Ticket management
- `eticket_imports` - eTicket parsing audit log
- `weather_cache` - Weather forecast cache (6-hour TTL)
- `vcard_imports` - vCard contact import staging
- `nodex_settings` - User preferences

## 🚀 Deployment to Supabase

### Option 1: Supabase Dashboard (Quick Start)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Run migrations in order:
   ```sql
   -- First, run the base schema
   -- Copy/paste content from: schemas/database_ecosystem_final.sql

   -- Then, run NODΞ migrations in order
   -- Copy/paste from: migrations/001_days.sql
   -- Copy/paste from: migrations/002_tickets.sql
   -- ... continue through 007_day_items.sql
   ```

### Option 2: Supabase CLI (Recommended for Production)

#### Setup Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

#### Initialize Migrations

```bash
# Initialize Supabase locally
supabase init

# Copy migrations to Supabase migrations folder
cp database/migrations/*.sql supabase/migrations/

# Apply migrations
supabase db push
```

#### Create New Migrations

```bash
# Generate a new migration
supabase migration new your_migration_name

# Edit the file in supabase/migrations/
# Then push
supabase db push
```

### Option 3: Direct PostgreSQL Connection

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres"

# Run migrations
\i database/schemas/database_ecosystem_final.sql
\i database/migrations/001_days.sql
\i database/migrations/002_tickets.sql
# ... etc
```

## 🔑 Environment Variables

Make sure these are set in your Supabase project:

```env
SUPABASE_URL=https://[YOUR-REF].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

## 📝 Migration Naming Convention

Migrations use a sequential numbering system:

- `001_days.sql` - Tour days with calendar_date + logical_day_number
- `002_tickets.sql` - Ticket management
- `003_eticket_import.sql` - eTicket parsing audit log
- `004_weather_cache.sql` - Weather forecast cache
- `005_vcard.sql` - vCard import staging
- `006_nodex_settings.sql` - User preferences
- `007_day_items.sql` - Movable day items with color coding

**Important:** Always run migrations in sequential order!

## 🧪 Testing

After applying migrations, test with:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Insert test tour leader
INSERT INTO tl_users (username, email, full_name)
VALUES ('test_leader', 'test@blueriot.com', 'Test Leader');

-- Insert test tour
INSERT INTO tours (tl_id, tour_name, start_date, end_date)
VALUES (
  (SELECT id FROM tl_users WHERE username = 'test_leader'),
  'Test Tour Italia',
  '2024-06-01',
  '2024-06-07'
);
```

## 🔄 Rollback

To rollback a migration in Supabase:

```bash
# Using Supabase CLI
supabase migration repair --status reverted <migration-version>

# Or manually in SQL Editor
DROP TABLE IF EXISTS [table_name];
```

## 📚 Schema Documentation

### tour_days Table
Dual numbering system:
- `calendar_date` - Fixed calendar date (DATE)
- `logical_day_number` - Reorderable position (INTEGER)

This allows drag & drop reordering without changing actual dates.

### day_items Table
Color-coded movable blocks:
- `item_type`: activity, lunch, dinner, transport, suggestion
- `color`: orange, light_blue, blue, green, purple
- `position`: Unique within each day

### vcard_imports Table
Contact import staging:
- `suggested_type`: restaurant, hotel, driver, emergency, guide
- `confidence_score`: 0.0 - 1.0 (higher = more confident)
- `mapping_status`: pending, mapped, rejected

## 🆘 Troubleshooting

**Error: "permission denied for schema public"**
```sql
-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

**Error: "UUID extension not found"**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Tables not showing up**
- Make sure you're running migrations in the correct order
- Check Supabase logs in the dashboard
- Verify your connection string

## 📞 Support

For database issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- blueriot mαtrιχ GitHub Issues
