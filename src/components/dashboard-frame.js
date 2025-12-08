/**
 * Dashboard - Main application frame with navigation
 */
import { auth } from '../utils/auth.js';
import './eticket-panel.js';
import './pdf-ocr-panel.js';
import './tour-weather-panel.js';

export class DashboardFrame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentView = 'home';
        this.user = null;
        this.currentTL = null;
        this.toursData = [];
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
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :host { --neon-cyan: #00f0ff; --neon-fuchsia: #ff00ff; --text-gray: #6b7280; --bg-black: #000000; }
                .container { display: flex; min-height: 100vh; background: var(--bg-black); font-family: 'Orbitron', sans-serif; }

                /* === SIDEBAR === */
                .sidebar { width: 240px; background: var(--bg-black); padding: 30px 20px; border-right: 1px solid rgba(255,255,255,0.1); position: fixed; height: 100vh; }
                .logo-box { border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 50px; position: relative; }
                .logo-box::after { content: ''; position: absolute; bottom: -15px; left: 20%; right: 20%; height: 2px; background: white; box-shadow: 0 0 10px white, 0 0 20px white, 0 0 30px white; border-radius: 2px; }
                .logo-blue { font-size: 18px; font-weight: 700; color: #6b8fb8; letter-spacing: 2px; }
                .logo-white { font-size: 16px; font-weight: 700; color: white; letter-spacing: 3px; margin-top: 5px; }
                .matrix-logo { width: 100%; max-width: 180px; height: auto; margin-top: 15px; filter: drop-shadow(0 0 8px rgba(0,240,255,0.6)); }

                /* === NAV ITEMS === */
                .nav { list-style: none; padding: 0; }
                .nav-item { margin-bottom: 28px; position: relative; cursor: pointer; padding-bottom: 12px; }
                .nav-item span { font-size: 16px; font-weight: 700; color: var(--text-gray); letter-spacing: 1px; transition: color 0.3s; display: block; }
                .nav-item:hover span { color: white; }
                .nav-item.active span { color: white; }
                .nav-item.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 50px; height: 2px; background: var(--neon-fuchsia); box-shadow: 0 0 10px var(--neon-fuchsia); }
                .nav-item.active::before { content: '←'; position: absolute; right: 0; bottom: 0; color: var(--neon-fuchsia); font-size: 18px; text-shadow: 0 0 10px var(--neon-fuchsia); }
                .nav-section { color: #445566; font-size: 10px; letter-spacing: 2px; margin: 30px 0 15px; text-transform: uppercase; }

                /* === MAIN CONTENT === */
                .main { margin-left: 240px; flex: 1; padding: 30px; background: var(--bg-black); min-height: 100vh; }

                /* === WORK WINDOW with 45° corners === */
                .work {
                    position: relative; background: var(--bg-black); min-height: calc(100vh - 60px); padding: 40px;
                    clip-path: polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px);
                }
                .work::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;
                    border: 2px solid var(--neon-cyan); box-shadow: 0 0 15px var(--neon-cyan), inset 0 0 15px rgba(0,240,255,0.1);
                    clip-path: polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px);
                }

                .page { display: none; }
                .page.active { display: block; }
                h1 { font-size: 42px; font-weight: 900; color: white; letter-spacing: 4px; margin-bottom: 30px; }

                /* === CONTENT BOX === */
                .content-box { background: rgba(10,14,39,0.3); border: 1px solid rgba(0,240,255,0.2); border-radius: 8px; padding: 25px; min-height: 300px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 16px; }
                .card { background: rgba(10,14,39,0.6); border: 1px solid rgba(0,240,255,0.2); border-radius: 8px; padding: 20px; transition: all 0.3s ease; position: relative; }
                .card:hover { border-color: rgba(0,240,255,0.4); box-shadow: 0 0 20px rgba(0,240,255,0.1); }
                .card h3 { color: #00f0ff; margin-bottom: 8px; }
                .card p { color: var(--text-secondary); font-size: 14px; margin: 4px 0; }
                .card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s; }
                .card:hover .card-actions { opacity: 1; }
                .card-actions button { width: 28px; height: 28px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
                .btn-edit { background: rgba(0,240,255,0.2); color: #00f0ff; }
                .btn-edit:hover { background: rgba(0,240,255,0.4); }
                .btn-delete { background: rgba(255,0,100,0.2); color: #ff0064; }
                .btn-delete:hover { background: rgba(255,0,100,0.4); }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: none; justify-content: center; align-items: center; z-index: 1000; }
                .modal-overlay.active { display: flex; }
                .modal { background: #0a0e27; border: 1px solid rgba(0,240,255,0.3); border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
                .modal-header { padding: 20px; border-bottom: 1px solid rgba(0,240,255,0.1); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { color: #00f0ff; margin: 0; font-size: 20px; }
                .modal-close { background: none; border: none; color: #8899aa; font-size: 24px; cursor: pointer; }
                .modal-close:hover { color: #ff0064; }
                .modal-body { padding: 20px; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; color: #8899aa; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; background: rgba(10,14,39,0.8); border: 1px solid rgba(0,240,255,0.2); border-radius: 6px; padding: 12px; color: white; font-size: 14px; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #00f0ff; box-shadow: 0 0 8px rgba(0,240,255,0.3); }
                .form-group textarea { min-height: 80px; resize: vertical; }
                .modal-footer { padding: 20px; border-top: 1px solid rgba(0,240,255,0.1); display: flex; justify-content: flex-end; gap: 12px; }
                .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
                .btn-primary { background: linear-gradient(135deg, #00f0ff, #0080ff); color: white; }
                .btn-primary:hover { box-shadow: 0 0 16px rgba(0,240,255,0.5); }
                .btn-secondary { background: rgba(255,255,255,0.1); color: #8899aa; }
                .btn-secondary:hover { background: rgba(255,255,255,0.2); }
                .btn-danger { background: rgba(255,0,100,0.2); color: #ff0064; }
                .btn-danger:hover { background: rgba(255,0,100,0.4); }
                .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
                .toolbar-filters { display: flex; gap: 12px; flex-wrap: wrap; }
                .toolbar-filters select { background: rgba(10,14,39,0.8); border: 1px solid rgba(0,240,255,0.2); border-radius: 6px; padding: 8px 12px; color: white; font-size: 13px; }
                .btn-add { background: linear-gradient(135deg, #00f0ff, #0080ff); color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; }
                .btn-add:hover { box-shadow: 0 0 16px rgba(0,240,255,0.5); }
                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); z-index: 100; transition: transform 0.3s ease; }
                    .sidebar.open { transform: translateX(0); }
                    .main { margin-left: 0; }
                    .hamburger { display: block; position: fixed; top: 20px; left: 20px; z-index: 101; width: 48px; height: 48px; background: var(--bg-sidebar); border: 1px solid #00f0ff; border-radius: 6px; color: #00f0ff; font-size: 24px; cursor: pointer; }
                }
                .hamburger { display: none; }
            </style>
            <button class="hamburger" id="hamburger">☰</button>
            <div class="container">
                <aside class="sidebar" id="sidebar">
                    <div class="logo-box">
                        <div class="logo-blue">BLUERIOT</div>
                        <div class="logo-white">SYNDICATE</div>
                        <img src="matrix.svg" alt="Matrix" class="matrix-logo">
                    </div>
                    <ul class="nav">
                        <li class="nav-item" data-v="tastes"><span>ΤΔSΤΞ5</span></li>
                        <li class="nav-item" data-v="routes"><span>R0UT35</span></li>
                        <li class="nav-item" data-v="stay"><span>SΤΔΥ</span></li>
                        <li class="nav-item" data-v="node"><span>NODΞ</span></li>
                        <li class="nav-section">T00L5</li>
                        <li class="nav-item" data-v="etickets"><span>eTICKΞTS</span></li>
                        <li class="nav-item" data-v="pdfocr"><span>PDF 0CR</span></li>
                    </ul>
                </aside>
                <main class="main">
                    <div class="work">
                        <div id="home" class="page active" style="text-align:center;padding:80px 20px;">
                            <div style="font-size:72px;margin-bottom:20px;opacity:0.6;">⬡</div>
                            <h1>MATRIX</h1>
                            <p style="color:#6b7280;font-size:14px;">Seleziona una sezione dal menu</p>
                        </div>
                        <div id="tastes" class="page">
                            <h1>TASTES</h1>
                            <div class="content-box" id="tastes-c"><p style="color:#6b7280;">Caricamento...</p></div>
                        </div>
                        <div id="routes" class="page">
                            <h1>ROUTES</h1>
                            <div class="content-box" id="routes-c"><p style="color:#6b7280;">Caricamento...</p></div>
                        </div>
                        <div id="stay" class="page">
                            <h1>STAY</h1>
                            <div class="content-box" id="stay-c"><p style="color:#6b7280;">Caricamento...</p></div>
                        </div>
                        <div id="node" class="page">
                            <div id="node-list">
                                <h1>NODE</h1>
                                <div class="content-box" id="node-c"><p style="color:#6b7280;">Caricamento...</p></div>
                            </div>
                            <div id="node-detail" style="display:none;"><tour-weather-panel></tour-weather-panel></div>
                        </div>
                        <div id="etickets" class="page"><h1>eTICKETS</h1><eticket-panel></eticket-panel></div>
                        <div id="pdfocr" class="page"><h1>PDF OCR</h1><pdf-ocr-panel></pdf-ocr-panel></div>
                    </div>
                </main>
            </div>

            <!-- Modal per CRUD -->
            <div class="modal-overlay" id="crudModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2 id="modalTitle">Aggiungi</h2>
                        <button class="modal-close" id="modalClose">×</button>
                    </div>
                    <div class="modal-body" id="modalBody"></div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="modalCancel">Annulla</button>
                        <button class="btn btn-primary" id="modalSave">Salva</button>
                    </div>
                </div>
            </div>
        `;
    }
    toggleSidebar() { this.shadowRoot.getElementById('sidebar').classList.toggle('open'); }
    setupListeners() {
        // Hamburger
        this.shadowRoot.getElementById('hamburger').onclick = () => this.toggleSidebar();

        // Nav items
        this.shadowRoot.querySelectorAll('.nav-item[data-v]').forEach(item => {
            item.onclick = () => {
                const v = item.dataset.v;
                this.shadowRoot.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
                item.classList.add('active');
                this.shadowRoot.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                this.shadowRoot.getElementById(v).classList.add('active');
                this.load(v);
                if(window.innerWidth <= 768) this.shadowRoot.getElementById('sidebar').classList.remove('open');
            };
        });

        // Listen for back event from tour-weather-panel (with error handling)
        const tourPanel = this.shadowRoot.querySelector('tour-weather-panel');
        if (tourPanel) {
            tourPanel.addEventListener('back', () => {
                this.shadowRoot.getElementById('node-list').style.display = 'block';
                this.shadowRoot.getElementById('node-detail').style.display = 'none';
            });
        } else {
            // Retry after custom element is defined
            customElements.whenDefined('tour-weather-panel').then(() => {
                const panel = this.shadowRoot.querySelector('tour-weather-panel');
                if (panel) {
                    panel.addEventListener('back', () => {
                        this.shadowRoot.getElementById('node-list').style.display = 'block';
                        this.shadowRoot.getElementById('node-detail').style.display = 'none';
                    });
                }
            });
        }
    }
    async load(v) {
        const c = this.shadowRoot.getElementById(v + '-c');
        if(!c) return; // etickets and pdfocr don't have -c containers, they use web components

        try {
            if(v==='tastes') {
                const {data,error} = await window.supabaseClient.from('blueriot_tastes').select('*').order('country,region,city,name');
                if(error) throw error;
                this.tastesData = data || [];

                // Build filters
                const countries = [...new Set(data?.map(r=>r.country).filter(Boolean))].sort();
                const regions = [...new Set(data?.map(r=>r.region).filter(Boolean))].sort();
                const cities = [...new Set(data?.map(r=>r.city).filter(Boolean))].sort();

                c.innerHTML = `
                    <div class="toolbar">
                        <div class="toolbar-filters">
                            <select id="filterCountry"><option value="">🌍 Tutte le nazioni</option>${countries.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
                            <select id="filterRegion"><option value="">📍 Tutte le regioni</option>${regions.map(r=>`<option value="${r}">${r}</option>`).join('')}</select>
                            <select id="filterCity"><option value="">🏙️ Tutte le città</option>${cities.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
                        </div>
                        <button class="btn-add" id="addTaste">+ Aggiungi</button>
                    </div>
                    <div id="tastesGrid" class="grid">${this.renderTastesGrid(data)}</div>
                `;

                // Filter listeners
                ['filterCountry','filterRegion','filterCity'].forEach(id => {
                    this.shadowRoot.getElementById(id).onchange = () => this.filterTastes();
                });

                // Add button
                this.shadowRoot.getElementById('addTaste').onclick = () => this.openTasteModal();

                // Edit/Delete listeners
                this.setupTasteCardListeners();

            } else if(v==='routes') {
                const {data,error} = await window.supabaseClient.from('blueriot_routes').select('*').order('start_point,end_point');
                if(error) throw error;
                this.routesData = data || [];

                const types = [...new Set(data?.map(r=>r.transport_type).filter(Boolean))].sort();
                c.innerHTML = `
                    <div class="toolbar">
                        <div class="toolbar-filters">
                            <select id="filterRouteType"><option value="">🚌 Tutti i tipi</option>${types.map(t=>`<option value="${t}">${t}</option>`).join('')}</select>
                        </div>
                        <button class="btn-add" id="addRoute">+ Aggiungi</button>
                    </div>
                    <div id="routesGrid" class="grid">${this.renderRoutesGrid(data)}</div>
                `;
                this.shadowRoot.getElementById('filterRouteType').onchange = () => this.filterRoutes();
                this.shadowRoot.getElementById('addRoute').onclick = () => this.openRouteModal();
                this.setupRouteCardListeners();

            } else if(v==='stay') {
                const {data,error} = await window.supabaseClient.from('blueriot_stay').select('*').order('country,region,location,name');
                if(error) throw error;
                this.stayData = data || [];

                const countries = [...new Set(data?.map(h=>h.country).filter(Boolean))].sort();
                const regions = [...new Set(data?.map(h=>h.region).filter(Boolean))].sort();
                const cities = [...new Set(data?.map(h=>h.location).filter(Boolean))].sort();

                c.innerHTML = `
                    <div class="toolbar">
                        <div class="toolbar-filters">
                            <select id="filterStayCountry"><option value="">🌍 Tutte le nazioni</option>${countries.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
                            <select id="filterStayRegion"><option value="">📍 Tutte le regioni</option>${regions.map(r=>`<option value="${r}">${r}</option>`).join('')}</select>
                            <select id="filterStayCity"><option value="">🏙️ Tutte le città</option>${cities.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
                        </div>
                        <button class="btn-add" id="addStay">+ Aggiungi</button>
                    </div>
                    <div id="stayGrid" class="grid">${this.renderStayGrid(data)}</div>
                `;
                ['filterStayCountry','filterStayRegion','filterStayCity'].forEach(id => {
                    this.shadowRoot.getElementById(id).onchange = () => this.filterStay();
                });
                this.shadowRoot.getElementById('addStay').onclick = () => this.openStayModal();
                this.setupStayCardListeners();

            } else if(v==='node') {
                // Reset to list view
                this.shadowRoot.getElementById('node-list').style.display = 'block';
                this.shadowRoot.getElementById('node-detail').style.display = 'none';

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
                this.toursData = data || [];

                c.innerHTML = !data?.length ? '<p style="color:#8899aa;">Nessun tour. Usa la sezione eTickets per gestire i passeggeri.</p>' :
                    '<p style="color:#8899aa;margin-bottom:16px;">Clicca su un tour per vedere il meteo</p><div class="grid">' + data.map((t,i)=>`<div class="card tour-card" data-idx="${i}" style="cursor:pointer;"><h3>${t.name||'N/A'}</h3><p>📋 ${t.code||'N/A'}</p><p>📅 ${t.start_date} → ${t.end_date||'N/A'}</p><p>👥 ${t.passenger_count||0} pax</p><p>📊 ${t.status||'upcoming'}</p><p style="color:#00f0ff;font-size:12px;margin-top:8px;">🌤️ Vedi meteo →</p></div>`).join('') + '</div>';

                // Add click handlers to tour cards
                c.querySelectorAll('.tour-card').forEach(card => {
                    card.onclick = () => {
                        const idx = parseInt(card.dataset.idx);
                        const tour = this.toursData[idx];
                        if (tour) this.showTourWeather(tour);
                    };
                });
            }
        } catch(e) {
            console.error('Load error:', e);
            c.innerHTML = '<p style="color:#ff4757;">Errore: ' + e.message + '</p>';
        }
    }

    showTourWeather(tour) {
        this.shadowRoot.getElementById('node-list').style.display = 'none';
        this.shadowRoot.getElementById('node-detail').style.display = 'block';
        const weatherPanel = this.shadowRoot.querySelector('tour-weather-panel');
        weatherPanel.loadTour(tour);
    }

    // === TASTES CRUD ===
    renderTastesGrid(data) {
        if (!data?.length) return '<p style="color:#8899aa;">Nessun ristorante nel database</p>';
        return data.map((r,i) => `
            <div class="card" data-id="${r.id}" data-idx="${i}">
                <div class="card-actions">
                    <button class="btn-edit" title="Modifica">✏️</button>
                    <button class="btn-delete" title="Elimina">🗑️</button>
                </div>
                <h3>${r.name || 'N/A'}</h3>
                <p>🌍 ${r.country || 'N/A'} › ${r.region || 'N/A'} › ${r.city || 'N/A'}</p>
                <p>🍽️ ${r.cuisine || 'N/A'}</p>
                ${r.address ? `<p>📍 ${r.address}</p>` : ''}
                ${r.phone ? `<p>📞 ${r.phone}</p>` : ''}
                ${r.rating_avg ? `<p>⭐ ${parseFloat(r.rating_avg).toFixed(1)}</p>` : ''}
                ${r.notes ? `<p style="font-size:12px;color:#667788;margin-top:8px;">${r.notes}</p>` : ''}
            </div>
        `).join('');
    }

    filterTastes() {
        const country = this.shadowRoot.getElementById('filterCountry').value;
        const region = this.shadowRoot.getElementById('filterRegion').value;
        const city = this.shadowRoot.getElementById('filterCity').value;

        let filtered = this.tastesData;
        if (country) filtered = filtered.filter(r => r.country === country);
        if (region) filtered = filtered.filter(r => r.region === region);
        if (city) filtered = filtered.filter(r => r.city === city);

        this.shadowRoot.getElementById('tastesGrid').innerHTML = this.renderTastesGrid(filtered);
        this.setupTasteCardListeners();
    }

    setupTasteCardListeners() {
        this.shadowRoot.querySelectorAll('#tastesGrid .btn-edit').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const card = btn.closest('.card');
                const idx = parseInt(card.dataset.idx);
                this.openTasteModal(this.tastesData[idx]);
            };
        });
        this.shadowRoot.querySelectorAll('#tastesGrid .btn-delete').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const card = btn.closest('.card');
                const id = card.dataset.id;
                if (confirm('Eliminare questo ristorante?')) {
                    this.deleteTaste(id);
                }
            };
        });
    }

    openTasteModal(taste = null) {
        this.editingTaste = taste;
        const modal = this.shadowRoot.getElementById('crudModal');
        const title = this.shadowRoot.getElementById('modalTitle');
        const body = this.shadowRoot.getElementById('modalBody');

        title.textContent = taste ? 'Modifica Ristorante' : 'Nuovo Ristorante';
        body.innerHTML = `
            <div class="form-group">
                <label>Nome *</label>
                <input type="text" id="tasteName" value="${taste?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Nazione</label>
                <input type="text" id="tasteCountry" value="${taste?.country || ''}" placeholder="Italia">
            </div>
            <div class="form-group">
                <label>Regione</label>
                <input type="text" id="tasteRegion" value="${taste?.region || ''}" placeholder="Toscana">
            </div>
            <div class="form-group">
                <label>Città</label>
                <input type="text" id="tasteCity" value="${taste?.city || ''}" placeholder="Firenze">
            </div>
            <div class="form-group">
                <label>Cucina</label>
                <input type="text" id="tasteCuisine" value="${taste?.cuisine || ''}" placeholder="Italiana, Pesce, Pizza...">
            </div>
            <div class="form-group">
                <label>Indirizzo</label>
                <input type="text" id="tasteAddress" value="${taste?.address || ''}">
            </div>
            <div class="form-group">
                <label>Telefono</label>
                <input type="text" id="tastePhone" value="${taste?.phone || ''}">
            </div>
            <div class="form-group">
                <label>Note</label>
                <textarea id="tasteNotes">${taste?.notes || ''}</textarea>
            </div>
        `;

        modal.classList.add('active');

        // Modal buttons
        this.shadowRoot.getElementById('modalClose').onclick = () => modal.classList.remove('active');
        this.shadowRoot.getElementById('modalCancel').onclick = () => modal.classList.remove('active');
        this.shadowRoot.getElementById('modalSave').onclick = () => this.saveTaste();
    }

    async saveTaste() {
        const name = this.shadowRoot.getElementById('tasteName').value.trim();
        if (!name) return alert('Il nome è obbligatorio');

        const data = {
            name,
            country: this.shadowRoot.getElementById('tasteCountry').value.trim() || null,
            region: this.shadowRoot.getElementById('tasteRegion').value.trim() || null,
            city: this.shadowRoot.getElementById('tasteCity').value.trim() || null,
            cuisine: this.shadowRoot.getElementById('tasteCuisine').value.trim() || null,
            address: this.shadowRoot.getElementById('tasteAddress').value.trim() || null,
            phone: this.shadowRoot.getElementById('tastePhone').value.trim() || null,
            notes: this.shadowRoot.getElementById('tasteNotes').value.trim() || null
        };

        try {
            if (this.editingTaste) {
                await window.supabaseClient.from('blueriot_tastes').update(data).eq('id', this.editingTaste.id);
            } else {
                await window.supabaseClient.from('blueriot_tastes').insert(data);
            }
            this.shadowRoot.getElementById('crudModal').classList.remove('active');
            this.load('tastes');
        } catch (err) {
            alert('Errore: ' + err.message);
        }
    }

    async deleteTaste(id) {
        try {
            await window.supabaseClient.from('blueriot_tastes').delete().eq('id', id);
            this.load('tastes');
        } catch (err) {
            alert('Errore: ' + err.message);
        }
    }

    // === ROUTES CRUD ===
    renderRoutesGrid(data) {
        if (!data?.length) return '<p style="color:#8899aa;">Nessuna tratta nel database</p>';
        return data.map((r,i) => `
            <div class="card" data-id="${r.id}" data-idx="${i}">
                <div class="card-actions">
                    <button class="btn-edit" title="Modifica">✏️</button>
                    <button class="btn-delete" title="Elimina">🗑️</button>
                </div>
                <h3>${r.start_point||'?'} → ${r.end_point||'?'}</h3>
                <p>🚌 ${r.transport_type||'N/A'}</p>
                <p>🏢 ${r.operator_name||'N/A'}</p>
                <p>⏱️ ${r.duration||'N/A'}</p>
                ${r.price ? `<p>💰 ${r.price}</p>` : ''}
                ${r.notes ? `<p style="font-size:12px;color:#667788;margin-top:8px;">${r.notes}</p>` : ''}
            </div>
        `).join('');
    }

    filterRoutes() {
        const type = this.shadowRoot.getElementById('filterRouteType').value;
        let filtered = this.routesData;
        if (type) filtered = filtered.filter(r => r.transport_type === type);
        this.shadowRoot.getElementById('routesGrid').innerHTML = this.renderRoutesGrid(filtered);
        this.setupRouteCardListeners();
    }

    setupRouteCardListeners() {
        this.shadowRoot.querySelectorAll('#routesGrid .btn-edit').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); const idx = parseInt(btn.closest('.card').dataset.idx); this.openRouteModal(this.routesData[idx]); };
        });
        this.shadowRoot.querySelectorAll('#routesGrid .btn-delete').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); if(confirm('Eliminare questa tratta?')) this.deleteRoute(btn.closest('.card').dataset.id); };
        });
    }

    openRouteModal(route = null) {
        this.editingRoute = route;
        const modal = this.shadowRoot.getElementById('crudModal');
        this.shadowRoot.getElementById('modalTitle').textContent = route ? 'Modifica Tratta' : 'Nuova Tratta';
        this.shadowRoot.getElementById('modalBody').innerHTML = `
            <div class="form-group"><label>Partenza *</label><input type="text" id="routeStart" value="${route?.start_point||''}" required></div>
            <div class="form-group"><label>Arrivo *</label><input type="text" id="routeEnd" value="${route?.end_point||''}" required></div>
            <div class="form-group"><label>Tipo Trasporto</label>
                <select id="routeType">
                    <option value="">Seleziona...</option>
                    <option value="Bus" ${route?.transport_type==='Bus'?'selected':''}>🚌 Bus</option>
                    <option value="Train" ${route?.transport_type==='Train'?'selected':''}>🚂 Treno</option>
                    <option value="Ferry" ${route?.transport_type==='Ferry'?'selected':''}>⛴️ Traghetto</option>
                    <option value="Taxi" ${route?.transport_type==='Taxi'?'selected':''}>🚕 Taxi</option>
                    <option value="Flight" ${route?.transport_type==='Flight'?'selected':''}>✈️ Aereo</option>
                </select>
            </div>
            <div class="form-group"><label>Operatore</label><input type="text" id="routeOperator" value="${route?.operator_name||''}"></div>
            <div class="form-group"><label>Durata</label><input type="text" id="routeDuration" value="${route?.duration||''}" placeholder="2h 30m"></div>
            <div class="form-group"><label>Prezzo</label><input type="text" id="routePrice" value="${route?.price||''}"></div>
            <div class="form-group"><label>Note</label><textarea id="routeNotes">${route?.notes||''}</textarea></div>
        `;
        modal.classList.add('active');
        this.shadowRoot.getElementById('modalClose').onclick = () => modal.classList.remove('active');
        this.shadowRoot.getElementById('modalCancel').onclick = () => modal.classList.remove('active');
        this.shadowRoot.getElementById('modalSave').onclick = () => this.saveRoute();
    }

    async saveRoute() {
        const start = this.shadowRoot.getElementById('routeStart').value.trim();
        const end = this.shadowRoot.getElementById('routeEnd').value.trim();
        if (!start || !end) return alert('Partenza e arrivo sono obbligatori');
        const data = {
            start_point: start, end_point: end,
            transport_type: this.shadowRoot.getElementById('routeType').value || null,
            operator_name: this.shadowRoot.getElementById('routeOperator').value.trim() || null,
            duration: this.shadowRoot.getElementById('routeDuration').value.trim() || null,
            price: this.shadowRoot.getElementById('routePrice').value.trim() || null,
            notes: this.shadowRoot.getElementById('routeNotes').value.trim() || null
        };
        try {
            if (this.editingRoute) await window.supabaseClient.from('blueriot_routes').update(data).eq('id', this.editingRoute.id);
            else await window.supabaseClient.from('blueriot_routes').insert(data);
            this.shadowRoot.getElementById('crudModal').classList.remove('active');
            this.load('routes');
        } catch (err) { alert('Errore: ' + err.message); }
    }

    async deleteRoute(id) {
        try { await window.supabaseClient.from('blueriot_routes').delete().eq('id', id); this.load('routes'); }
        catch (err) { alert('Errore: ' + err.message); }
    }

    // === STAY CRUD ===
    renderStayGrid(data) {
        if (!data?.length) return '<p style="color:#8899aa;">Nessun hotel nel database</p>';
        return data.map((h,i) => `
            <div class="card" data-id="${h.id}" data-idx="${i}">
                <div class="card-actions">
                    <button class="btn-edit" title="Modifica">✏️</button>
                    <button class="btn-delete" title="Elimina">🗑️</button>
                </div>
                <h3>${h.name||'N/A'}</h3>
                <p>🌍 ${h.country||'N/A'} › ${h.region||'N/A'} › ${h.location||'N/A'}</p>
                <p>🏨 ${h.type||'Hotel'}</p>
                ${h.address ? `<p>📍 ${h.address}</p>` : ''}
                ${h.phone ? `<p>📞 ${h.phone}</p>` : ''}
                ${h.price_range ? `<p>💰 ${h.price_range}</p>` : ''}
                ${h.notes ? `<p style="font-size:12px;color:#667788;margin-top:8px;">${h.notes}</p>` : ''}
            </div>
        `).join('');
    }

    filterStay() {
        const country = this.shadowRoot.getElementById('filterStayCountry').value;
        const region = this.shadowRoot.getElementById('filterStayRegion').value;
        const city = this.shadowRoot.getElementById('filterStayCity').value;
        let filtered = this.stayData;
        if (country) filtered = filtered.filter(h => h.country === country);
        if (region) filtered = filtered.filter(h => h.region === region);
        if (city) filtered = filtered.filter(h => h.location === city);
        this.shadowRoot.getElementById('stayGrid').innerHTML = this.renderStayGrid(filtered);
        this.setupStayCardListeners();
    }

    setupStayCardListeners() {
        this.shadowRoot.querySelectorAll('#stayGrid .btn-edit').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); const idx = parseInt(btn.closest('.card').dataset.idx); this.openStayModal(this.stayData[idx]); };
        });
        this.shadowRoot.querySelectorAll('#stayGrid .btn-delete').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); if(confirm('Eliminare questo hotel?')) this.deleteStay(btn.closest('.card').dataset.id); };
        });
    }

    openStayModal(stay = null) {
        this.editingStay = stay;
        const modal = this.shadowRoot.getElementById('crudModal');
        this.shadowRoot.getElementById('modalTitle').textContent = stay ? 'Modifica Hotel' : 'Nuovo Hotel';
        this.shadowRoot.getElementById('modalBody').innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="stayName" value="${stay?.name||''}" required></div>
            <div class="form-group"><label>Nazione</label><input type="text" id="stayCountry" value="${stay?.country||''}" placeholder="Italia"></div>
            <div class="form-group"><label>Regione</label><input type="text" id="stayRegion" value="${stay?.region||''}" placeholder="Toscana"></div>
            <div class="form-group"><label>Città</label><input type="text" id="stayCity" value="${stay?.location||''}" placeholder="Firenze"></div>
            <div class="form-group"><label>Tipo</label>
                <select id="stayType">
                    <option value="Hotel" ${stay?.type==='Hotel'?'selected':''}>🏨 Hotel</option>
                    <option value="B&B" ${stay?.type==='B&B'?'selected':''}>🛏️ B&B</option>
                    <option value="Agriturismo" ${stay?.type==='Agriturismo'?'selected':''}>🌾 Agriturismo</option>
                    <option value="Resort" ${stay?.type==='Resort'?'selected':''}>🏖️ Resort</option>
                    <option value="Ostello" ${stay?.type==='Ostello'?'selected':''}>🎒 Ostello</option>
                </select>
            </div>
            <div class="form-group"><label>Indirizzo</label><input type="text" id="stayAddress" value="${stay?.address||''}"></div>
            <div class="form-group"><label>Telefono</label><input type="text" id="stayPhone" value="${stay?.phone||''}"></div>
            <div class="form-group"><label>Fascia Prezzo</label><input type="text" id="stayPrice" value="${stay?.price_range||''}" placeholder="€€€"></div>
            <div class="form-group"><label>Note</label><textarea id="stayNotes">${stay?.notes||''}</textarea></div>
        `;
        modal.classList.add('active');
        this.shadowRoot.getElementById('modalClose').onclick = () => modal.classList.remove('active');
        this.shadowRoot.getElementById('modalCancel').onclick = () => modal.classList.remove('active');
        this.shadowRoot.getElementById('modalSave').onclick = () => this.saveStay();
    }

    async saveStay() {
        const name = this.shadowRoot.getElementById('stayName').value.trim();
        if (!name) return alert('Il nome è obbligatorio');
        const data = {
            name,
            country: this.shadowRoot.getElementById('stayCountry').value.trim() || null,
            region: this.shadowRoot.getElementById('stayRegion').value.trim() || null,
            location: this.shadowRoot.getElementById('stayCity').value.trim() || null,
            type: this.shadowRoot.getElementById('stayType').value || 'Hotel',
            address: this.shadowRoot.getElementById('stayAddress').value.trim() || null,
            phone: this.shadowRoot.getElementById('stayPhone').value.trim() || null,
            price_range: this.shadowRoot.getElementById('stayPrice').value.trim() || null,
            notes: this.shadowRoot.getElementById('stayNotes').value.trim() || null
        };
        try {
            if (this.editingStay) await window.supabaseClient.from('blueriot_stay').update(data).eq('id', this.editingStay.id);
            else await window.supabaseClient.from('blueriot_stay').insert(data);
            this.shadowRoot.getElementById('crudModal').classList.remove('active');
            this.load('stay');
        } catch (err) { alert('Errore: ' + err.message); }
    }

    async deleteStay(id) {
        try { await window.supabaseClient.from('blueriot_stay').delete().eq('id', id); this.load('stay'); }
        catch (err) { alert('Errore: ' + err.message); }
    }
}
customElements.define('dashboard-frame', DashboardFrame);
