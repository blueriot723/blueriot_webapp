# BlueRiot eTicket System - User Guide

## Overview

The eTicket system allows Tour Leaders to create personalized tickets for all passengers in a tour. Each ticket is automatically generated with the passenger's name overlaid on a custom template.

## Features

✅ Upload custom ticket templates (PDF or images)
✅ Add optional logo that appears on all tickets
✅ Visual name position selector
✅ Single or bulk passenger input
✅ Automatic ticket generation with Canvas API
✅ Download tickets as PNG files
✅ Email distribution (placeholder for future)
✅ Apple Wallet pass support (future enhancement)

## Setup Instructions

### 1. Database Setup

Run the SQL commands in `eticket_database_setup.sql` in your Supabase SQL Editor.

This will create:
- `tour_passengers` table - stores passenger information and generated tickets
- `ticket_templates` table - stores ticket templates and logo for each tour

### 2. Access the System

1. Log into BlueRiot TL Dashboard
2. Open any tour
3. Click on the **🎫 Biglietti** tab

## How to Use

### Step 1: Upload Ticket Template

1. Click **📤 Carica Template Biglietto**
2. Select a blank ticket image (PNG/JPG) or PDF
3. The template will be displayed as a preview

### Step 2: Choose Name Position

1. Click **📍 Scegli Posizione Nome**
2. Click on the template image where you want passenger names to appear
3. A red marker will show the selected position
4. The position is saved automatically

### Step 3: Add Logo (Optional)

1. Click **📤 Carica Logo**
2. Select your logo image (PNG/JPG/SVG recommended)
3. Logo will appear in the top-left corner of all tickets

### Step 4: Add Passengers

**Option A: Single Passenger**
1. Click **+ Aggiungi Passeggero**
2. Enter:
   - Full Name (required)
   - Email (optional)
   - Phone (optional)
3. Click **💾** to save

**Option B: Bulk Import**
1. Click **📋 Inserimento Multiplo**
2. Enter passengers one per line in this format:
   ```
   Mario Rossi
   Giulia Bianchi, giulia@email.com
   Luca Verdi, luca@email.com, +39 333 1234567
   ```
3. Click **💾 Salva Tutti**

### Step 5: Generate Tickets

1. Click **⚡ Genera Biglietti Personalizzati**
2. Confirm the generation
3. Wait while tickets are created (a few seconds)
4. Generated tickets appear in the "Biglietti Generati" section

### Step 6: Download or Send Tickets

For each generated ticket you can:
- **⬇️ Scarica PNG** - Download the ticket as PNG image
- **📧 Invia Email** - Send ticket via email (if passenger has email)

## Technical Details

### Storage

- Templates and logos are stored as base64 data URLs in the database
- For production with many passengers, consider migrating to Supabase Storage
- Current implementation supports up to ~100 passengers per tour

### Ticket Generation

- Uses HTML5 Canvas API for client-side image generation
- Name overlay uses Arial Bold 24px font (customizable)
- Logo is drawn at fixed position (30, 30) with 80x80 size
- Output format: PNG

### Future Enhancements

1. **Apple Wallet Integration**
   - Requires backend PKPass generation with Apple Developer certificate
   - Current placeholder suggests using pass4wallet app

2. **Email Distribution**
   - Requires email service integration (SendGrid, AWS SES, etc.)
   - Current placeholder shows manual download instructions

3. **Advanced Customization**
   - Font family selection
   - Font size adjustment
   - Font color picker
   - Logo position selector
   - QR code generation for ticket validation

4. **Performance Optimization**
   - Move to Supabase Storage for file uploads
   - Background job queue for large batches
   - Progress bar for ticket generation

## Troubleshooting

### "Carica prima un template biglietto!"
You need to upload a ticket template before generating tickets.

### "Scegli prima la posizione del nome sul biglietto!"
You need to click on the template to set where names will appear.

### "Aggiungi almeno un passeggero prima di generare i biglietti"
Add at least one passenger to the list first.

### Template not showing after upload
Check browser console for errors. Large files (>5MB) may cause issues - resize images first.

### Tickets generating slowly
Each ticket takes ~100-500ms to generate. For 50+ passengers, expect 5-25 seconds total.

## Database Schema

### tour_passengers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tour_id | uuid | Foreign key to tours table |
| full_name | text | Passenger full name |
| email | text | Optional email address |
| phone | text | Optional phone number |
| ticket_generated | boolean | Whether ticket has been created |
| ticket_url | text | Base64 data URL of generated ticket |
| wallet_pass_url | text | URL to Apple Wallet pass (future) |
| created_at | timestamptz | Record creation timestamp |

### ticket_templates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tour_id | uuid | Foreign key to tours (unique) |
| template_name | text | Template filename |
| template_file_url | text | Base64 data URL of template |
| logo_url | text | Base64 data URL of logo |
| name_position_x | integer | X coordinate for name |
| name_position_y | integer | Y coordinate for name |
| font_size | integer | Font size for name (default 24) |
| font_color | text | Font color hex code (default #000000) |
| created_at | timestamptz | Record creation timestamp |

## Support

For issues or questions, contact the BlueRiot development team.

---

**Version:** 1.0
**Last Updated:** December 2025
**Developed by:** Claude (Anthropic) for BlueRiot Syndicate
