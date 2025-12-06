-- =====================================================
-- NODΞ DATABASE SCHEMA
-- Complete schema for blueriot mαtrιχ operational control
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Execute migrations in order
\i migrations/001_days.sql
\i migrations/002_tickets.sql
\i migrations/003_eticket_import.sql
\i migrations/004_weather_cache.sql
\i migrations/005_vcard.sql
\i migrations/006_nodex_settings.sql

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tables created:
--   - tour_days: Tour day management with calendar + logical numbering
--   - tickets: Ticket/pass management
--   - eticket_imports: eTicket parsing audit log
--   - weather_cache: Weather forecast cache
--   - vcard_imports: vCard import staging
--   - nodex_settings: User preferences
-- =====================================================
