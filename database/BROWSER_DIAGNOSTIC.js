// ═══════════════════════════════════════════════════
// DIAGNOSTIC SCRIPT - Esegui nella console del browser
// ═══════════════════════════════════════════════════
// ISTRUZIONI:
// 1. Apri il sito: https://blueriot723.github.io
// 2. Apri la console JavaScript (Safari: Sviluppo → Mostra Console JavaScript)
// 3. Copia TUTTO questo script
// 4. Incolla nella console e premi Invio
// 5. Copia l'output completo e mandalo a Claude
// ═══════════════════════════════════════════════════

(async function diagnosticSupabase() {
    console.log('🔍 INIZIO DIAGNOSTICA SUPABASE...\n');

    const SUPABASE_URL = 'https://kvomxtzcnczvbcscybcy.supabase.co';
    const ANON_KEY = 'sb_publishable_WgMzf0xMBQ6a8WMcun3fvg_sUfBQ8qC';

    console.log('📍 URL Supabase:', SUPABASE_URL);
    console.log('🔑 Anon Key (primi 30 caratteri):', ANON_KEY.substring(0, 30) + '...\n');

    // Test 1: Verifica connessione base
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Connessione PostgREST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        console.log('✅ Status:', response.status, response.statusText);

        if (response.status === 200) {
            const text = await response.text();
            console.log('✅ PostgREST risponde correttamente');
        } else {
            const error = await response.text();
            console.log('❌ ERRORE PostgREST:', error);
        }
    } catch (error) {
        console.log('❌ ERRORE connessione:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Query diretta a tl_users');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/tl_users?select=user_id&limit=1`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        console.log('Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ tl_users accessibile! Record trovati:', data.length);
        } else {
            const error = await response.text();
            console.log('❌ ERRORE tl_users:', error);
        }
    } catch (error) {
        console.log('❌ ERRORE query:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: Query a blueriot_tastes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/blueriot_tastes?select=id&limit=1`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        console.log('Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ blueriot_tastes accessibile! Record trovati:', data.length);
        } else {
            const error = await response.text();
            console.log('❌ ERRORE blueriot_tastes:', error);
        }
    } catch (error) {
        console.log('❌ ERRORE query:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 4: Verifica Supabase Client (se presente)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (typeof supabaseClient !== 'undefined') {
        console.log('✅ supabaseClient trovato');

        try {
            const { data, error } = await supabaseClient
                .from('tl_users')
                .select('user_id')
                .limit(1);

            if (error) {
                console.log('❌ ERRORE supabaseClient.from(tl_users):', error.message);
                console.log('   Code:', error.code);
                console.log('   Details:', error.details);
                console.log('   Hint:', error.hint);
            } else {
                console.log('✅ Query con supabaseClient OK! Record:', data.length);
            }
        } catch (error) {
            console.log('❌ ERRORE catch:', error.message);
        }
    } else {
        console.log('⚠️  supabaseClient non trovato (esegui dopo il caricamento della pagina)');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DIAGNOSTICA COMPLETATA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 COPIA TUTTO L\'OUTPUT SOPRA E MANDALO A CLAUDE\n');
})();
