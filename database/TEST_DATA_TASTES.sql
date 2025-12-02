-- ═══════════════════════════════════════════════════
-- 🍽️ TEST DATA - Aggiungi ristoranti di esempio
-- ═══════════════════════════════════════════════════
-- Esegui questo per testare se TASTES funziona
-- ═══════════════════════════════════════════════════

-- Inserisci 3 ristoranti di test
INSERT INTO blueriot_tastes (
    name,
    type,
    cuisine,
    price_range,
    gratuity,
    commission,
    discount,
    discount_percentage,
    location,
    address,
    opening_hours,
    booking_needed,
    suitable_for_groups,
    max_group_size,
    notes,
    added_by
) VALUES
(
    'Trattoria da Mario',
    'restaurant',
    'Italian',
    '€€',
    true,
    false,
    false,
    NULL,
    'Rome',
    'Via del Corso 123',
    'Lun-Sab 12:00-15:00, 19:00-23:00',
    true,
    true,
    50,
    'Ottimo per gruppi, TL mangia gratis',
    (SELECT id FROM tl_users LIMIT 1)
),
(
    'Pizzeria Napoli',
    'restaurant',
    'Italian',
    '€',
    false,
    true,
    true,
    10,
    'Florence',
    'Piazza del Duomo 45',
    'Tutti i giorni 11:00-23:00',
    false,
    true,
    40,
    'Pizza napoletana autentica, sconto 10%',
    (SELECT id FROM tl_users LIMIT 1)
),
(
    'Ristorante Venezia',
    'restaurant',
    'Seafood',
    '€€€',
    false,
    true,
    false,
    NULL,
    'Venice',
    'Calle Larga San Marco 742',
    'Mar-Dom 12:30-15:00, 19:30-22:30',
    true,
    true,
    30,
    'Pesce freschissimo, commissione 5%',
    (SELECT id FROM tl_users LIMIT 1)
);

-- Verifica inserimento
SELECT
    name,
    location,
    cuisine,
    price_range,
    gratuity,
    commission,
    discount
FROM blueriot_tastes
ORDER BY created_at DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════
-- ✅ Se vedi i 3 ristoranti, la tabella funziona!
-- ═══════════════════════════════════════════════════
