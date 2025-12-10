/**
 * Dashboard - BlueRiot Cyberpunk Style
 * VERSION: 2024-12-10-v9
 * Brand Identity: Greek Letters + Orbitron Font
 */
import { auth } from '../utils/auth.js';
import { getCityInfo, searchCities, getPhonePrefix, getGoogleMapsLink, getWhat3WordsLink } from '../utils/cities-db.js';
import './eticket-panel.js';
import './pdf-ocr-panel.js';
import './tour-weather-panel.js';

const VERSION = '2024-12-10-v9';
console.log(`📦 dashboard-frame.js loaded (${VERSION})`);

// Restaurant types
const RESTAURANT_TYPES = [
    'Ristorante Tradizionale',
    'Trattoria',
    'Osteria',
    'Pizzeria',
    'Enoteca',
    'Agriturismo',
    'Fine Dining',
    'Bistrot',
    'Taverna',
    'Street Food',
    'Bar/Caffè',
    'Gelateria',
    'Pasticceria'
];

// Price ranges
const PRICE_RANGES = [
    { value: '€', label: '€ (Budget)' },
    { value: '€€', label: '€€ (Medio)' },
    { value: '€€€', label: '€€€ (Alto)' },
    { value: '€€€€', label: '€€€€ (Lusso)' }
];

export class DashboardFrame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentView = 'home';
        this.loadedSections = new Set();
        this.tastesData = [];
        this.routesData = [];
        this.stayData = [];
        this.toursData = [];
        this.citySearchResults = [];
        this.render();
    }

    connectedCallback() {
        try {
            this.setupListeners();
            console.log('✅ Dashboard ready');
        } catch(e) {
            console.error('Dashboard error:', e);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* ORBITRON FONT */
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');

                /* BLUERIOT CYBERPUNK THEME */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    background: #0A0A0A;
                    color: #eee;
                    min-height: 100vh;
                }

                .container { display: flex; min-height: 100vh; }

                /* SIDEBAR - PURE BLACK */
                .sidebar {
                    width: 220px;
                    background: #000000;
                    border-right: 1px solid #222;
                    padding: 20px 15px;
                    display: flex;
                    flex-direction: column;
                }

                .logo {
                    text-align: center;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #222;
                }
                .logo img { max-width: 100px; height: auto; opacity: 0.9; }
                .logo-text {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    color: #00F0FF;
                    letter-spacing: 2px;
                }

                .nav { list-style: none; flex: 1; }
                .nav-item {
                    padding: 14px 15px;
                    margin-bottom: 5px;
                    cursor: pointer;
                    color: #666;
                    border-radius: 4px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 1px;
                    transition: all 0.2s ease;
                }
                .nav-item:hover {
                    background: #111;
                    color: #00F0FF;
                    border-left: 2px solid #00F0FF;
                }
                .nav-item.active {
                    background: #0A0A0A;
                    color: #00F0FF;
                    border-left: 2px solid #00F0FF;
                }

                .nav-divider { border-top: 1px solid #222; margin: 15px 0; }

                .logout-btn {
                    padding: 10px;
                    background: transparent;
                    border: 1px solid #333;
                    color: #666;
                    cursor: pointer;
                    border-radius: 4px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 10px;
                    letter-spacing: 1px;
                    transition: all 0.2s ease;
                }
                .logout-btn:hover { border-color: #00F0FF; color: #00F0FF; }

                /* MAIN CONTENT */
                .main { flex: 1; padding: 25px; overflow-y: auto; background: #0A0A0A; }

                .page { display: none; }
                .page.active { display: block; }

                h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #00F0FF;
                    letter-spacing: 2px;
                }

                .content-box {
                    background: #111111;
                    border: 1px solid #222;
                    border-radius: 6px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                /* GRID */
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 15px;
                }

                .card {
                    background: #0F0F0F;
                    border: 1px solid #222;
                    border-radius: 6px;
                    padding: 18px;
                    transition: all 0.2s ease;
                }
                .card:hover {
                    border-color: #00F0FF;
                    box-shadow: 0 0 15px rgba(0,240,255,0.1);
                }
                .card-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 10px;
                    letter-spacing: 1px;
                }
                .card-info { font-size: 13px; color: #888; margin: 6px 0; }
                .card-info a { color: #00F0FF; text-decoration: none; }
                .card-info a:hover { text-decoration: underline; }
                .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
                .card-tag {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    color: #888;
                }
                .card-tag.tl-free { background: #0a2a0a; border-color: #0f0; color: #0f0; }
                .card-tag.commission { background: #2a2a0a; border-color: #ff0; color: #ff0; }
                .card-tag.discount { background: #2a0a2a; border-color: #f0f; color: #f0f; }
                .card-actions {
                    margin-top: 15px;
                    padding-top: 12px;
                    border-top: 1px solid #222;
                    display: flex;
                    gap: 8px;
                }

                /* BUTTONS */
                .btn {
                    padding: 8px 14px;
                    border: 1px solid #333;
                    border-radius: 4px;
                    background: #111;
                    color: #888;
                    font-size: 12px;
                    cursor: pointer;
                    font-family: 'Orbitron', sans-serif;
                    letter-spacing: 0.5px;
                    transition: all 0.2s ease;
                }
                .btn:hover { background: #1a1a1a; color: #fff; border-color: #444; }
                .btn-add {
                    background: #00F0FF;
                    border-color: #00F0FF;
                    color: #000;
                    font-weight: 600;
                }
                .btn-add:hover { background: #00d4e0; }
                .btn-danger { border-color: #ff3333; color: #ff3333; }
                .btn-danger:hover { background: #ff3333; color: #fff; }

                /* TOOLBAR */
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                /* TOOLS SECTION */
                .tools-section { margin-top: 25px; padding-top: 20px; border-top: 1px solid #222; }
                .tools-section h2 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 15px;
                    letter-spacing: 1px;
                }
                .tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

                /* MODAL */
                .modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.9);
                    z-index: 1000;
                    align-items: flex-start;
                    justify-content: center;
                    overflow-y: auto;
                    padding: 40px 20px;
                }
                .modal-overlay.active { display: flex; }
                .modal {
                    background: #0F0F0F;
                    border: 1px solid #222;
                    border-radius: 8px;
                    padding: 25px;
                    max-width: 700px;
                    width: 100%;
                    margin: auto;
                }
                .modal h2 {
                    font-family: 'Orbitron', sans-serif;
                    margin-bottom: 20px;
                    font-size: 18px;
                    color: #00F0FF;
                    letter-spacing: 1px;
                }
                .modal-close {
                    float: right;
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 24px;
                    cursor: pointer;
                }
                .modal-close:hover { color: #ff3333; }

                /* FORM STYLES */
                .form-section {
                    background: #111;
                    border: 1px solid #222;
                    border-radius: 6px;
                    padding: 18px;
                    margin-bottom: 15px;
                }
                .form-section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 11px;
                    color: #00F0FF;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
                .form-row.three { grid-template-columns: 1fr 1fr 1fr; }
                .form-row.four { grid-template-columns: 1fr 1fr 1fr 1fr; }
                .form-group { margin-bottom: 0; }
                .form-group.full { grid-column: span 2; }
                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    color: #666;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #333;
                    border-radius: 4px;
                    background: #0A0A0A;
                    color: #eee;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #00F0FF;
                }
                .form-group input::placeholder { color: #444; }
                .form-group textarea { min-height: 80px; resize: vertical; }
                .form-group select { cursor: pointer; }
                .form-group select option { background: #111; }

                /* AUTO-DETECT INFO */
                .auto-detect-info {
                    display: flex;
                    gap: 10px;
                    margin-top: 8px;
                    padding: 8px 10px;
                    background: #0a1a1a;
                    border: 1px solid #00F0FF33;
                    border-radius: 4px;
                    font-size: 12px;
                }
                .auto-detect-info span { color: #888; }
                .auto-detect-info .value { color: #00F0FF; font-weight: 500; }

                /* CITY AUTOCOMPLETE */
                .city-autocomplete {
                    position: relative;
                }
                .city-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #111;
                    border: 1px solid #333;
                    border-top: none;
                    border-radius: 0 0 4px 4px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 100;
                    display: none;
                }
                .city-suggestions.active { display: block; }
                .city-suggestion {
                    padding: 10px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #222;
                    display: flex;
                    justify-content: space-between;
                }
                .city-suggestion:hover { background: #1a1a1a; }
                .city-suggestion .name { color: #fff; }
                .city-suggestion .region { color: #666; font-size: 12px; }

                /* CHECKBOX GROUP */
                .checkbox-group {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .checkbox-item input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    accent-color: #00F0FF;
                }
                .checkbox-item label { color: #888; font-size: 13px; cursor: pointer; }

                /* MOBILE */
                .hamburger {
                    display: none;
                    position: fixed;
                    top: 15px; left: 15px;
                    z-index: 200;
                    background: #000;
                    border: 1px solid #222;
                    color: #00F0FF;
                    width: 40px; height: 40px;
                    font-size: 18px;
                    cursor: pointer;
                    border-radius: 4px;
                }

                @media (max-width: 768px) {
                    .hamburger { display: flex; align-items: center; justify-content: center; }
                    .sidebar {
                        position: fixed;
                        left: -240px;
                        top: 0;
                        height: 100vh;
                        z-index: 150;
                        transition: left 0.3s;
                    }
                    .sidebar.open { left: 0; }
                    .main { padding: 60px 15px 20px; }
                    .tools-grid { grid-template-columns: 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                    .form-row.three, .form-row.four { grid-template-columns: 1fr; }
                    .form-group.full { grid-column: span 1; }
                }
            </style>

            <button class="hamburger" id="hamburger">☰</button>

            <div class="container">
                <aside class="sidebar" id="sidebar">
                    <div class="logo">
                        <img src="./blueriot-logo.png" alt="BlueRiot" onerror="this.style.display='none'">
                        <div class="logo-text">BLUERIOT</div>
                    </div>
                    <ul class="nav">
                        <li class="nav-item" data-v="tastes">ΤΔSΤΞ5</li>
                        <li class="nav-item" data-v="routes">R0UT35</li>
                        <li class="nav-item" data-v="stay">SΤΔΥ</li>
                        <div class="nav-divider"></div>
                        <li class="nav-item" data-v="node">NODΞ</li>
                        <li class="nav-item" data-v="tools">T00L5</li>
                    </ul>
                    <button class="logout-btn" id="logoutBtn">LOGOUT</button>
                </aside>

                <main class="main">
                    <div id="home" class="page active">
                        <h1>DASHBOARD</h1>
                        <div class="content-box">
                            <p style="color:#666;">Seleziona una sezione dal menu.</p>
                        </div>
                    </div>

                    <div id="tastes" class="page">
                        <h1>ΤΔSΤΞ5</h1>
                        <div class="toolbar">
                            <div></div>
                            <button class="btn btn-add" id="addTaste">+ AGGIUNGI</button>
                        </div>
                        <div class="content-box" id="tastes-c">
                            <p style="color:#666;">Caricamento...</p>
                        </div>
                    </div>

                    <div id="routes" class="page">
                        <h1>R0UT35</h1>
                        <div class="toolbar">
                            <div></div>
                            <button class="btn btn-add" id="addRoute">+ AGGIUNGI</button>
                        </div>
                        <div class="content-box" id="routes-c">
                            <p style="color:#666;">Caricamento...</p>
                        </div>
                    </div>

                    <div id="stay" class="page">
                        <h1>SΤΔΥ</h1>
                        <div class="toolbar">
                            <div></div>
                            <button class="btn btn-add" id="addStay">+ AGGIUNGI</button>
                        </div>
                        <div class="content-box" id="stay-c">
                            <p style="color:#666;">Caricamento...</p>
                        </div>
                    </div>

                    <div id="node" class="page">
                        <div id="node-list">
                            <h1>NODΞ - TOURS</h1>
                            <div class="content-box" id="node-c">
                                <p style="color:#666;">Caricamento...</p>
                            </div>
                        </div>
                        <div id="node-detail" style="display:none;">
                            <tour-weather-panel></tour-weather-panel>
                            <div class="tools-section">
                                <h2>T00L5</h2>
                                <div class="tools-grid">
                                    <div class="content-box">
                                        <h3 style="margin-bottom:10px;color:#888;">eTickets</h3>
                                        <eticket-panel></eticket-panel>
                                    </div>
                                    <div class="content-box">
                                        <h3 style="margin-bottom:10px;color:#888;">PDF OCR</h3>
                                        <pdf-ocr-panel></pdf-ocr-panel>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="tools" class="page">
                        <h1>T00L5</h1>
                        <div class="tools-grid">
                            <div class="content-box">
                                <h3 style="margin-bottom:10px;color:#888;">eTickets Generator</h3>
                                <eticket-panel></eticket-panel>
                            </div>
                            <div class="content-box">
                                <h3 style="margin-bottom:10px;color:#888;">PDF OCR Extractor</h3>
                                <pdf-ocr-panel></pdf-ocr-panel>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <div class="modal-overlay" id="crudModal">
                <div class="modal">
                    <button class="modal-close" id="modalClose">×</button>
                    <h2 id="modalTitle">AGGIUNGI</h2>
                    <form id="crudForm"></form>
                    <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
                        <button type="button" class="btn" id="modalCancel">ANNULLA</button>
                        <button type="submit" class="btn btn-add" id="modalSave">SALVA</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupListeners() {
        this.shadowRoot.getElementById('hamburger').onclick = () => {
            this.shadowRoot.getElementById('sidebar').classList.toggle('open');
        };

        this.shadowRoot.querySelectorAll('.nav-item[data-v]').forEach(item => {
            item.onclick = () => {
                const v = item.dataset.v;
                this.shadowRoot.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
                item.classList.add('active');
                this.shadowRoot.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                this.shadowRoot.getElementById(v).classList.add('active');
                this.load(v);
                this.shadowRoot.getElementById('sidebar').classList.remove('open');
            };
        });

        this.shadowRoot.getElementById('logoutBtn').onclick = async () => {
            await window.supabaseClient.auth.signOut();
            window.location.reload();
        };

        this.shadowRoot.getElementById('addTaste').onclick = () => this.openModal('tastes');
        this.shadowRoot.getElementById('addRoute').onclick = () => this.openModal('routes');
        this.shadowRoot.getElementById('addStay').onclick = () => this.openModal('stay');

        this.shadowRoot.getElementById('modalClose').onclick = () => this.closeModal();
        this.shadowRoot.getElementById('modalCancel').onclick = () => this.closeModal();
        this.shadowRoot.getElementById('modalSave').onclick = () => this.saveModal();

        const tourPanel = this.shadowRoot.querySelector('tour-weather-panel');
        if (tourPanel) {
            tourPanel.addEventListener('back', () => {
                this.shadowRoot.getElementById('node-list').style.display = 'block';
                this.shadowRoot.getElementById('node-detail').style.display = 'none';
            });
        }
    }

    async load(v, force = false) {
        const c = this.shadowRoot.getElementById(v + '-c');
        if (!c) return;
        if (this.loadedSections.has(v) && !force) return;

        try {
            if (v === 'tastes') {
                const { data, error } = await window.supabaseClient.from('blueriot_tastes').select('*').order('name');
                if (error) throw error;
                this.tastesData = data || [];
                this.renderTastes(c);
                this.loadedSections.add(v);
            }
            else if (v === 'routes') {
                const { data, error } = await window.supabaseClient.from('blueriot_routes').select('*').order('start_point');
                if (error) throw error;
                this.routesData = data || [];
                this.renderRoutes(c);
                this.loadedSections.add(v);
            }
            else if (v === 'stay') {
                const { data, error } = await window.supabaseClient.from('blueriot_stay').select('*').order('name');
                if (error) throw error;
                this.stayData = data || [];
                this.renderStay(c);
                this.loadedSections.add(v);
            }
            else if (v === 'node') {
                const { data, error } = await window.supabaseClient.from('tours').select('*').order('start_date', { ascending: false });
                if (error) throw error;
                this.toursData = data || [];
                this.renderTours(c);
                this.loadedSections.add(v);
            }
        } catch (e) {
            console.error('Load error:', e);
            c.innerHTML = `<p style="color:#ff3333;">Errore: ${e.message}</p>`;
        }
    }

    renderTastes(c) {
        if (!this.tastesData.length) { c.innerHTML = '<p style="color:#666;">Nessun ristorante.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.tastesData.map((r, i) => {
            const cityInfo = getCityInfo(r.city);
            const tags = [];
            if (r.tl_free) tags.push('<span class="card-tag tl-free">TL FREE</span>');
            if (r.commission) tags.push(`<span class="card-tag commission">${r.commission}%</span>`);
            if (r.discount) tags.push(`<span class="card-tag discount">-${r.discount}%</span>`);

            return `
                <div class="card">
                    <div class="card-title">${r.name || 'N/A'}</div>
                    <div class="card-info">📍 ${r.city || '-'}${cityInfo ? ` (${cityInfo.region})` : ''}</div>
                    <div class="card-info">🍽️ ${r.restaurant_type || r.cuisine || '-'} ${r.price_range || ''}</div>
                    ${r.phone ? `<div class="card-info">📞 ${r.phone}</div>` : ''}
                    ${r.google_maps ? `<div class="card-info"><a href="${r.google_maps}" target="_blank">📍 Google Maps</a></div>` : ''}
                    ${r.what3words ? `<div class="card-info"><a href="${getWhat3WordsLink(r.what3words)}" target="_blank">///what3words</a></div>` : ''}
                    ${tags.length ? `<div class="card-tags">${tags.join('')}</div>` : ''}
                    <div class="card-actions">
                        <button class="btn" onclick="this.getRootNode().host.editTaste(${i})">MODIFICA</button>
                        <button class="btn btn-danger" onclick="this.getRootNode().host.deleteTaste('${r.id}')">ELIMINA</button>
                    </div>
                </div>
            `;
        }).join('') + '</div>';
    }

    renderRoutes(c) {
        if (!this.routesData.length) { c.innerHTML = '<p style="color:#666;">Nessuna tratta.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.routesData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.start_point || '?'} → ${r.end_point || '?'}</div>
                <div class="card-info">🚗 ${r.transport_type || '-'}</div>
                <div class="card-info">⏱️ ${r.duration || '-'}</div>
                ${r.price ? `<div class="card-info">💰 ${r.price}</div>` : ''}
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editRoute(${i})">MODIFICA</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteRoute('${r.id}')">ELIMINA</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderStay(c) {
        if (!this.stayData.length) { c.innerHTML = '<p style="color:#666;">Nessun hotel.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.stayData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.name || 'N/A'}</div>
                <div class="card-info">📍 ${r.location || '-'}</div>
                <div class="card-info">🏨 ${r.type || 'Hotel'}</div>
                ${r.phone ? `<div class="card-info">📞 ${r.phone}</div>` : ''}
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editStay(${i})">MODIFICA</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteStay('${r.id}')">ELIMINA</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderTours(c) {
        if (!this.toursData.length) { c.innerHTML = '<p style="color:#666;">Nessun tour.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.toursData.map((t, i) => `
            <div class="card" style="cursor:pointer;" onclick="this.getRootNode().host.showTour(${i})">
                <div class="card-title">${t.name || 'Tour'}</div>
                <div class="card-info">📅 ${t.start_date || '-'} → ${t.end_date || '-'}</div>
                <div class="card-info">👥 ${t.passenger_count || 0} pax</div>
                <div class="card-info">🏙️ ${t.cities ? t.cities.join(', ') : 'Nessuna città'}</div>
            </div>
        `).join('') + '</div>';
    }

    showTour(idx) {
        const tour = this.toursData[idx];
        if (!tour) return;
        this.shadowRoot.getElementById('node-list').style.display = 'none';
        this.shadowRoot.getElementById('node-detail').style.display = 'block';
        const panel = this.shadowRoot.querySelector('tour-weather-panel');
        if (panel?.loadTour) panel.loadTour(tour);
    }

    openModal(type, data = null) {
        this.modalType = type;
        this.modalData = data;
        const form = this.shadowRoot.getElementById('crudForm');
        this.shadowRoot.getElementById('modalTitle').textContent = data ? 'MODIFICA' : 'AGGIUNGI';

        if (type === 'tastes') {
            const cityInfo = data?.city ? getCityInfo(data.city) : null;
            form.innerHTML = `
                <!-- BASIC INFO -->
                <div class="form-section">
                    <div class="form-section-title">Informazioni Base</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome Ristorante *</label>
                            <input name="name" value="${data?.name || ''}" required placeholder="Es: Trattoria da Mario">
                        </div>
                        <div class="form-group">
                            <label>Tipo Ristorante</label>
                            <select name="restaurant_type">
                                <option value="">-- Seleziona --</option>
                                ${RESTAURANT_TYPES.map(t => `<option value="${t}" ${data?.restaurant_type === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fascia Prezzo</label>
                            <select name="price_range">
                                <option value="">-- Seleziona --</option>
                                ${PRICE_RANGES.map(p => `<option value="${p.value}" ${data?.price_range === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Cucina</label>
                            <input name="cuisine" value="${data?.cuisine || ''}" placeholder="Es: Romana, Toscana, Pesce...">
                        </div>
                    </div>
                </div>

                <!-- LOCATION -->
                <div class="form-section">
                    <div class="form-section-title">Posizione</div>
                    <div class="form-row">
                        <div class="form-group city-autocomplete">
                            <label>Città *</label>
                            <input name="city" id="cityInput" value="${data?.city || ''}" autocomplete="off" placeholder="Digita per cercare...">
                            <div class="city-suggestions" id="citySuggestions"></div>
                            <div class="auto-detect-info" id="cityInfo" style="display:${cityInfo ? 'flex' : 'none'}">
                                <span>Regione: <span class="value" id="regionValue">${cityInfo?.region || ''}</span></span>
                                <span>Paese: <span class="value" id="countryValue">${cityInfo?.country || ''}</span></span>
                            </div>
                            <input type="hidden" name="region" id="regionInput" value="${cityInfo?.region || ''}">
                            <input type="hidden" name="country" id="countryInput" value="${cityInfo?.country || ''}">
                        </div>
                        <div class="form-group">
                            <label>Indirizzo</label>
                            <input name="address" value="${data?.address || ''}" placeholder="Via/Piazza...">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Google Maps Link</label>
                            <input name="google_maps" value="${data?.google_maps || ''}" placeholder="https://maps.google.com/...">
                        </div>
                        <div class="form-group">
                            <label>What3Words</label>
                            <input name="what3words" value="${data?.what3words || ''}" placeholder="///word.word.word">
                        </div>
                    </div>
                </div>

                <!-- CONTACT -->
                <div class="form-section">
                    <div class="form-section-title">Contatti</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Telefono Principale</label>
                            <input name="phone" id="phoneInput" value="${data?.phone || ''}" placeholder="${cityInfo?.prefix || '+39'} ...">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input name="email" type="email" value="${data?.email || ''}" placeholder="info@ristorante.it">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Contatto Aggiuntivo</label>
                            <input name="contact_name" value="${data?.contact_name || ''}" placeholder="Nome referente">
                        </div>
                        <div class="form-group">
                            <label>Tel. Aggiuntivo</label>
                            <input name="contact_phone" value="${data?.contact_phone || ''}" placeholder="+39 ...">
                        </div>
                    </div>
                </div>

                <!-- BUSINESS TERMS -->
                <div class="form-section">
                    <div class="form-section-title">Condizioni Commerciali</div>
                    <div class="form-row three">
                        <div class="form-group">
                            <label>TL Free</label>
                            <div class="checkbox-group">
                                <div class="checkbox-item">
                                    <input type="checkbox" name="tl_free" id="tlFree" ${data?.tl_free ? 'checked' : ''}>
                                    <label for="tlFree">Tour Leader Gratuito</label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Commissione %</label>
                            <input name="commission" type="number" min="0" max="100" value="${data?.commission || ''}" placeholder="Es: 10">
                        </div>
                        <div class="form-group">
                            <label>Sconto %</label>
                            <input name="discount" type="number" min="0" max="100" value="${data?.discount || ''}" placeholder="Es: 15">
                        </div>
                    </div>
                </div>

                <!-- NOTES -->
                <div class="form-section">
                    <div class="form-section-title">Note</div>
                    <div class="form-group">
                        <textarea name="notes" placeholder="Note aggiuntive, orari, specialità...">${data?.notes || ''}</textarea>
                    </div>
                </div>
            `;
            // Setup city autocomplete
            this.setupCityAutocomplete();
        } else if (type === 'routes') {
            form.innerHTML = `
                <div class="form-section">
                    <div class="form-section-title">Tratta</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Partenza *</label>
                            <input name="start_point" value="${data?.start_point || ''}" required placeholder="Es: Roma Termini">
                        </div>
                        <div class="form-group">
                            <label>Arrivo *</label>
                            <input name="end_point" value="${data?.end_point || ''}" required placeholder="Es: Firenze SMN">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo Trasporto</label>
                            <select name="transport_type">
                                <option value="">-- Seleziona --</option>
                                <option value="Treno AV" ${data?.transport_type === 'Treno AV' ? 'selected' : ''}>Treno Alta Velocità</option>
                                <option value="Treno Regionale" ${data?.transport_type === 'Treno Regionale' ? 'selected' : ''}>Treno Regionale</option>
                                <option value="Bus" ${data?.transport_type === 'Bus' ? 'selected' : ''}>Bus</option>
                                <option value="Pullman GT" ${data?.transport_type === 'Pullman GT' ? 'selected' : ''}>Pullman GT</option>
                                <option value="Traghetto" ${data?.transport_type === 'Traghetto' ? 'selected' : ''}>Traghetto</option>
                                <option value="Aereo" ${data?.transport_type === 'Aereo' ? 'selected' : ''}>Aereo</option>
                                <option value="Transfer Privato" ${data?.transport_type === 'Transfer Privato' ? 'selected' : ''}>Transfer Privato</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Durata</label>
                            <input name="duration" value="${data?.duration || ''}" placeholder="Es: 1h 30min">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Prezzo</label>
                            <input name="price" value="${data?.price || ''}" placeholder="Es: €45">
                        </div>
                        <div class="form-group">
                            <label>Fornitore</label>
                            <input name="supplier" value="${data?.supplier || ''}" placeholder="Es: Trenitalia">
                        </div>
                    </div>
                </div>
                <div class="form-section">
                    <div class="form-section-title">Note</div>
                    <div class="form-group">
                        <textarea name="notes" placeholder="Note aggiuntive...">${data?.notes || ''}</textarea>
                    </div>
                </div>
            `;
        } else if (type === 'stay') {
            form.innerHTML = `
                <div class="form-section">
                    <div class="form-section-title">Struttura</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome Hotel *</label>
                            <input name="name" value="${data?.name || ''}" required placeholder="Es: Grand Hotel Roma">
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select name="type">
                                <option value="Hotel" ${data?.type === 'Hotel' ? 'selected' : ''}>Hotel</option>
                                <option value="B&B" ${data?.type === 'B&B' ? 'selected' : ''}>B&B</option>
                                <option value="Appartamento" ${data?.type === 'Appartamento' ? 'selected' : ''}>Appartamento</option>
                                <option value="Resort" ${data?.type === 'Resort' ? 'selected' : ''}>Resort</option>
                                <option value="Agriturismo" ${data?.type === 'Agriturismo' ? 'selected' : ''}>Agriturismo</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Località</label>
                            <input name="location" value="${data?.location || ''}" placeholder="Es: Roma Centro">
                        </div>
                        <div class="form-group">
                            <label>Indirizzo</label>
                            <input name="address" value="${data?.address || ''}" placeholder="Via...">
                        </div>
                    </div>
                </div>
                <div class="form-section">
                    <div class="form-section-title">Contatti</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Telefono</label>
                            <input name="phone" value="${data?.phone || ''}" placeholder="+39 ...">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input name="email" type="email" value="${data?.email || ''}" placeholder="info@hotel.it">
                        </div>
                    </div>
                </div>
                <div class="form-section">
                    <div class="form-section-title">Note</div>
                    <div class="form-group">
                        <textarea name="notes" placeholder="Note aggiuntive, servizi inclusi...">${data?.notes || ''}</textarea>
                    </div>
                </div>
            `;
        }
        this.shadowRoot.getElementById('crudModal').classList.add('active');
    }

    setupCityAutocomplete() {
        const cityInput = this.shadowRoot.getElementById('cityInput');
        const suggestions = this.shadowRoot.getElementById('citySuggestions');
        const cityInfo = this.shadowRoot.getElementById('cityInfo');
        const regionValue = this.shadowRoot.getElementById('regionValue');
        const countryValue = this.shadowRoot.getElementById('countryValue');
        const regionInput = this.shadowRoot.getElementById('regionInput');
        const countryInput = this.shadowRoot.getElementById('countryInput');
        const phoneInput = this.shadowRoot.getElementById('phoneInput');

        if (!cityInput) return;

        cityInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length < 2) {
                suggestions.classList.remove('active');
                return;
            }

            const results = searchCities(query);
            if (results.length === 0) {
                suggestions.classList.remove('active');
                return;
            }

            suggestions.innerHTML = results.map(city => `
                <div class="city-suggestion" data-city="${city.name}" data-region="${city.region}" data-country="${city.country}" data-prefix="${city.prefix}">
                    <span class="name">${city.name}</span>
                    <span class="region">${city.region}, ${city.country}</span>
                </div>
            `).join('');
            suggestions.classList.add('active');

            // Add click handlers
            suggestions.querySelectorAll('.city-suggestion').forEach(item => {
                item.onclick = () => {
                    cityInput.value = item.dataset.city;
                    regionValue.textContent = item.dataset.region;
                    countryValue.textContent = item.dataset.country;
                    regionInput.value = item.dataset.region;
                    countryInput.value = item.dataset.country;
                    cityInfo.style.display = 'flex';
                    suggestions.classList.remove('active');

                    // Update phone prefix
                    if (phoneInput && !phoneInput.value) {
                        phoneInput.placeholder = `${item.dataset.prefix} ...`;
                    }
                };
            });
        });

        // Close suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!cityInput.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.classList.remove('active');
            }
        });
    }

    closeModal() { this.shadowRoot.getElementById('crudModal').classList.remove('active'); }

    async saveModal() {
        const form = this.shadowRoot.getElementById('crudForm');
        const formData = new FormData(form);
        const obj = {};

        // Handle form data properly
        formData.forEach((value, key) => {
            if (key === 'tl_free') {
                obj[key] = true;
            } else if (key === 'commission' || key === 'discount') {
                obj[key] = value ? parseFloat(value) : null;
            } else {
                obj[key] = value || null;
            }
        });

        // Handle checkbox if unchecked
        if (this.modalType === 'tastes' && !formData.has('tl_free')) {
            obj.tl_free = false;
        }

        const table = this.modalType === 'tastes' ? 'blueriot_tastes' : this.modalType === 'routes' ? 'blueriot_routes' : 'blueriot_stay';

        try {
            if (this.modalData?.id) {
                await window.supabaseClient.from(table).update(obj).eq('id', this.modalData.id);
            } else {
                await window.supabaseClient.from(table).insert([obj]);
            }
            this.closeModal();
            this.loadedSections.delete(this.modalType);
            this.load(this.modalType, true);
        } catch (e) { alert('Errore: ' + e.message); }
    }

    editTaste(i) { this.openModal('tastes', this.tastesData[i]); }
    editRoute(i) { this.openModal('routes', this.routesData[i]); }
    editStay(i) { this.openModal('stay', this.stayData[i]); }

    async deleteTaste(id) { if (confirm('Eliminare?')) { await window.supabaseClient.from('blueriot_tastes').delete().eq('id', id); this.loadedSections.delete('tastes'); this.load('tastes', true); } }
    async deleteRoute(id) { if (confirm('Eliminare?')) { await window.supabaseClient.from('blueriot_routes').delete().eq('id', id); this.loadedSections.delete('routes'); this.load('routes', true); } }
    async deleteStay(id) { if (confirm('Eliminare?')) { await window.supabaseClient.from('blueriot_stay').delete().eq('id', id); this.loadedSections.delete('stay'); this.load('stay', true); } }
}

customElements.define('dashboard-frame', DashboardFrame);
