/**
 * Dashboard - Main application frame with navigation
 */
import { auth } from '../utils/auth.js';
import './eticket-panel.js';
import './pdf-ocr-panel.js';

export class DashboardFrame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentView = 'home';
        this.user = null;
        this.currentTL = null;
        this.render();
    }
    async connectedCallback() {
        this.user = await auth.getCurrentUser();
        this.currentTL = auth.getTL();
        this.setupListeners();
    }
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('../styles/base.css');
                * { box-sizing: border-box; }
                .container { display: flex; min-height: 100vh; }
                .sidebar { width: 260px; background: var(--bg-sidebar); position: fixed; height: 100vh; overflow-y: auto; }
                .logos { padding: 20px; text-align: center; border-bottom: 1px solid rgba(0,240,255,0.1); }
                .logos img { width: 120px; }
                .logos img:first-child { background: white; padding: 8px; border-radius: 6px; margin-bottom: 10px; }
                .syndicate { color: white; font-size: 12px; letter-spacing: 2px; margin: 8px 0; }
                .nav { padding: 20px 0; }
                .nav-section { padding: 8px 16px; color: #556677; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; }
                .nav-section:first-child { margin-top: 0; }
                .nav button { width: calc(100% - 32px); margin: 0 16px 12px; height: 56px; background: rgba(10,14,39,0.8); border: none; color: white; font-size: 17px; font-weight: 700; cursor: pointer; position: relative; clip-path: polygon(0 0,100% 0,95% 15%,95% 85%,100% 100%,0 100%); text-align: left; padding-left: 20px; transition: all 0.2s ease; }
                .nav button:hover { background: rgba(0,240,255,0.1); }
                .nav button::before { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg,#00f0ff 0%,#00f0ff 50%,transparent 100%); box-shadow: 0 0 10px #00f0ff; }
                .nav button.active::before { background: linear-gradient(180deg,#ff00ff 0%,#ff00ff 50%,transparent 100%); box-shadow: 0 0 15px #ff00ff; }
                .nav button.active { background: rgba(255,0,255,0.1); }
                .main { margin-left: 260px; flex: 1; padding: 30px; background: var(--bg-pure-dark); min-height: 100vh; }
                .work { background: rgba(10,14,39,0.4); border-radius: 12px; padding: 30px; min-height: 80vh; position: relative; }
                .work::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,transparent 0%,#00f0ff 25%,#00f0ff 75%,transparent 100%); border-radius: 12px 12px 0 0; }
                .page { display: none; }
                .page.active { display: block; }
                h1 { font-size: 36px; color: #00f0ff; text-shadow: 0 0 12px #00f0ff; margin-bottom: 24px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 20px; }
                .card { background: rgba(10,14,39,0.6); border: 1px solid rgba(0,240,255,0.2); border-radius: 8px; padding: 20px; transition: all 0.3s ease; }
                .card:hover { border-color: rgba(0,240,255,0.4); box-shadow: 0 0 20px rgba(0,240,255,0.1); }
                .card h3 { color: #00f0ff; margin-bottom: 8px; }
                .card p { color: var(--text-secondary); font-size: 14px; margin: 4px 0; }
                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); z-index: 100; transition: transform 0.3s ease; }
                    .sidebar.open { transform: translateX(0); }
                    .main { margin-left: 0; }
                    .hamburger { display: block; position: fixed; top: 20px; left: 20px; z-index: 101; width: 48px; height: 48px; background: var(--bg-sidebar); border: 1px solid #00f0ff; border-radius: 6px; color: #00f0ff; font-size: 24px; cursor: pointer; }
                }
                .hamburger { display: none; }
            </style>
            <button class="hamburger" onclick="this.getRootNode().host.toggleSidebar()">☰</button>
            <div class="container">
                <aside class="sidebar" id="sidebar">
                    <div class="logos">
                        <img src="blueriot-logo.png">
                        <div class="syndicate">SYNDICATE</div>
                        <img src="matrix.svg">
                    </div>
                    <nav class="nav">
                        <div class="nav-section">Database</div>
                        <button data-v="tastes">ΤΔSΤΞ5</button>
                        <button data-v="routes">R0UT35</button>
                        <button data-v="stay">SΤΔΥ</button>
                        <button data-v="node">NODΞ</button>
                        <div class="nav-section">T00L5</div>
                        <button data-v="etickets">🎫 eTICKΞTS</button>
                        <button data-v="pdfocr">📄 PDF 0CR</button>
                    </nav>
                </aside>
                <main class="main">
                    <div class="work">
                        <div id="home" class="page active" style="text-align:center;padding:60px 20px;">
                            <img src="matrix.svg" style="width:250px;opacity:0.8;">
                            <h1 style="margin-top:30px;">SYNDICATE MATRIX</h1>
                            <p style="color:var(--text-secondary);">Seleziona una sezione dal menu</p>
                        </div>
                        <div id="tastes" class="page"><h1>ΤΔSΤΞ5</h1><div id="tastes-c">Caricamento...</div></div>
                        <div id="routes" class="page"><h1>R0UT35</h1><div id="routes-c">Caricamento...</div></div>
                        <div id="stay" class="page"><h1>SΤΔΥ</h1><div id="stay-c">Caricamento...</div></div>
                        <div id="node" class="page"><h1>NODΞ</h1><div id="node-c">Caricamento...</div></div>
                        <div id="etickets" class="page"><eticket-panel></eticket-panel></div>
                        <div id="pdfocr" class="page"><pdf-ocr-panel></pdf-ocr-panel></div>
                    </div>
                </main>
            </div>
        `;
    }
    toggleSidebar() { this.shadowRoot.getElementById('sidebar').classList.toggle('open'); }
    setupListeners() {
        this.shadowRoot.querySelectorAll('.nav button').forEach(b => {
            b.onclick = () => {
                const v = b.dataset.v;
                this.shadowRoot.querySelectorAll('.nav button').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                this.shadowRoot.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                this.shadowRoot.getElementById(v).classList.add('active');
                this.load(v);
                if(window.innerWidth <= 768) this.shadowRoot.getElementById('sidebar').classList.remove('open');
            };
        });
    }
    async load(v) {
        const c = this.shadowRoot.getElementById(v + '-c');
        if(!c) return; // etickets and pdfocr don't have -c containers, they use web components

        try {
            if(v==='tastes') {
                // Try blueriot_tastes first, fall back to shared_restaurants
                let data, error;
                const result1 = await window.supabaseClient.from('blueriot_tastes').select('*').order('rating_avg',{ascending:false}).limit(30);
                if (result1.error) {
                    const result2 = await window.supabaseClient.from('shared_restaurants').select('*').order('rating_avg',{ascending:false}).limit(30);
                    data = result2.data;
                    error = result2.error;
                } else {
                    data = result1.data;
                    error = result1.error;
                }
                if(error) throw error;
                c.innerHTML = !data?.length ? '<p style="color:#8899aa;">Nessun ristorante nel database</p>' :
                    '<div class="grid">' + data.map(r=>`<div class="card"><h3>${r.name||r.restaurant_name||'N/A'}</h3><p>📍 ${r.city||r.location||'N/A'}</p><p>🍽️ ${r.cuisine||r.type||'N/A'}</p>${r.rating_avg ? `<p>⭐ ${parseFloat(r.rating_avg).toFixed(1)}</p>` : ''}</div>`).join('') + '</div>';

            } else if(v==='routes') {
                const {data,error} = await window.supabaseClient.from('blueriot_routes').select('*').order('created_at',{ascending:false}).limit(30);
                if(error) throw error;
                c.innerHTML = !data?.length ? '<p style="color:#8899aa;">Nessuna tratta nel database</p>' :
                    '<div class="grid">' + data.map(r=>`<div class="card"><h3>${r.start_point||'?'} → ${r.end_point||'?'}</h3><p>🚌 ${r.transport_type||'N/A'}</p><p>🏢 ${r.operator_name||'N/A'}</p><p>⏱️ ${r.duration||'N/A'}</p></div>`).join('') + '</div>';

            } else if(v==='stay') {
                const {data,error} = await window.supabaseClient.from('blueriot_stay').select('*').order('created_at',{ascending:false}).limit(30);
                if(error) throw error;
                c.innerHTML = !data?.length ? '<p style="color:#8899aa;">Nessun hotel nel database</p>' :
                    '<div class="grid">' + data.map(h=>`<div class="card"><h3>${h.name||'N/A'}</h3><p>📍 ${h.location||'N/A'}</p><p>🏨 ${h.type||'Hotel'}</p>${h.price_range ? `<p>💰 ${h.price_range}</p>` : ''}</div>`).join('') + '</div>';

            } else if(v==='node') {
                // Get TL profile first
                const { data: user } = await window.supabaseClient.auth.getUser();
                if (!user?.user) {
                    c.innerHTML = '<p style="color:#8899aa;">Utente non autenticato</p>';
                    return;
                }

                const { data: tlProfile } = await window.supabaseClient.from('tl_users').select('id').eq('user_id', user.user.id).single();
                if (!tlProfile) {
                    c.innerHTML = '<p style="color:#8899aa;">Profilo TL non trovato</p>';
                    return;
                }

                const {data,error} = await window.supabaseClient.from('tours').select('*').eq('tl_id',tlProfile.id).order('start_date',{ascending:false}).limit(20);
                if(error) throw error;
                c.innerHTML = !data?.length ? '<p style="color:#8899aa;">Nessun tour. Usa la sezione eTickets per gestire i passeggeri.</p>' :
                    '<div class="grid">' + data.map(t=>`<div class="card"><h3>${t.name||'N/A'}</h3><p>📋 ${t.code||'N/A'}</p><p>📅 ${t.start_date} → ${t.end_date||'N/A'}</p><p>👥 ${t.passenger_count||0} pax</p><p>📊 ${t.status||'upcoming'}</p></div>`).join('') + '</div>';
            }
        } catch(e) {
            console.error('Load error:', e);
            c.innerHTML = '<p style="color:#ff4757;">Errore: ' + e.message + '</p>';
        }
    }
}
customElements.define('dashboard-frame', DashboardFrame);
