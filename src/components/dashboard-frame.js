/**
 * Dashboard - BlueRiot Cyberpunk Style (Original)
 * VERSION: 2024-12-09-v7
 */
import { auth } from '../utils/auth.js';
import './eticket-panel.js';
import './pdf-ocr-panel.js';
import './tour-weather-panel.js';

const VERSION = '2024-12-09-v7';
console.log(`📦 dashboard-frame.js loaded (${VERSION})`);

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
                /* ===== BLUERIOT CYBERPUNK THEME - Original ===== */
                :root {
                    --primary-blue: #00F0FF;
                    --secondary-blue: #0A7AFF;
                    --dark-bg: #0A0E27;
                    --card-bg: #13182E;
                    --text-primary: #FFFFFF;
                    --text-secondary: #8B9DC3;
                    --border-color: #1E2749;
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                :host {
                    display: block;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #000;
                    color: var(--text-primary);
                    min-height: 100vh;
                }

                .container {
                    display: flex;
                    min-height: 100vh;
                }

                /* SIDEBAR */
                .sidebar {
                    width: 240px;
                    background: var(--card-bg);
                    border-right: 1px solid var(--border-color);
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                }

                .logo {
                    text-align: center;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--border-color);
                }
                .logo img {
                    max-width: 120px;
                    height: auto;
                    margin-bottom: 8px;
                    filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.3));
                }
                .logo-text {
                    font-size: 11px;
                    color: var(--primary-blue);
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                /* NAV */
                .nav {
                    list-style: none;
                    flex: 1;
                }
                .nav-item {
                    padding: 14px 16px;
                    margin-bottom: 4px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                    color: var(--text-secondary);
                }
                .nav-item:hover {
                    background: var(--dark-bg);
                    color: var(--text-primary);
                }
                .nav-item.active {
                    background: rgba(0, 240, 255, 0.1);
                    color: var(--primary-blue);
                    border-left: 3px solid var(--primary-blue);
                }
                .nav-item span {
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 1px;
                }

                .nav-divider {
                    border-top: 1px solid var(--border-color);
                    margin: 16px 0;
                }

                .logout-btn {
                    padding: 12px 16px;
                    background: transparent;
                    border: 1px solid rgba(255, 71, 87, 0.5);
                    border-radius: 8px;
                    color: #FF4757;
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                    margin-top: auto;
                    transition: all 0.2s;
                }
                .logout-btn:hover {
                    background: rgba(255, 71, 87, 0.1);
                    border-color: #FF4757;
                }

                /* MAIN */
                .main {
                    flex: 1;
                    padding: 32px;
                    background: var(--dark-bg);
                    overflow-y: auto;
                }

                .page { display: none; }
                .page.active { display: block; }

                h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: var(--text-primary);
                }

                .content-box {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                }

                /* GRID */
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }

                .card {
                    background: var(--dark-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.3s;
                }
                .card:hover {
                    border-color: var(--primary-blue);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 240, 255, 0.15);
                }
                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 12px;
                }
                .card-info {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin: 6px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .card-actions {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 10px;
                }

                /* BUTTONS */
                .btn {
                    padding: 10px 18px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn:hover {
                    background: var(--dark-bg);
                    border-color: var(--primary-blue);
                }
                .btn-add {
                    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
                    border: none;
                    color: #000;
                    font-weight: 600;
                }
                .btn-add:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(0, 240, 255, 0.4);
                }
                .btn-danger {
                    border-color: rgba(255, 71, 87, 0.5);
                    color: #FF4757;
                }
                .btn-danger:hover {
                    background: rgba(255, 71, 87, 0.1);
                    border-color: #FF4757;
                }

                /* TOOLBAR */
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .toolbar select, .toolbar input {
                    padding: 10px 14px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 14px;
                }
                .toolbar select:focus, .toolbar input:focus {
                    outline: none;
                    border-color: var(--primary-blue);
                }

                /* T00L5 SECTION */
                .tools-section {
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid var(--border-color);
                }
                .tools-section h2 {
                    color: var(--primary-blue);
                    font-size: 18px;
                    margin-bottom: 20px;
                    letter-spacing: 2px;
                }
                .tools-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                /* MODAL */
                .modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(10, 14, 39, 0.95);
                    backdrop-filter: blur(10px);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }
                .modal-overlay.active { display: flex; }
                .modal {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal h2 {
                    margin-bottom: 24px;
                    color: var(--text-primary);
                    font-size: 22px;
                }
                .modal-close {
                    float: right;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 28px;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .modal-close:hover {
                    color: #FF4757;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 500;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--dark-bg);
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 15px;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-blue);
                    box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.1);
                }
                .form-group textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                /* MOBILE */
                .hamburger {
                    display: none;
                    position: fixed;
                    top: 16px;
                    left: 16px;
                    z-index: 200;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--primary-blue);
                    width: 44px;
                    height: 44px;
                    font-size: 20px;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .hamburger { display: flex; align-items: center; justify-content: center; }
                    .sidebar {
                        position: fixed;
                        left: -260px;
                        top: 0;
                        height: 100vh;
                        z-index: 150;
                        transition: left 0.3s;
                        box-shadow: 4px 0 24px rgba(0,0,0,0.5);
                    }
                    .sidebar.open { left: 0; }
                    .main { padding: 70px 16px 24px; }
                    .tools-grid { grid-template-columns: 1fr; }
                    .grid { grid-template-columns: 1fr; }
                }
            </style>

            <button class="hamburger" id="hamburger">☰</button>

            <div class="container">
                <aside class="sidebar" id="sidebar">
                    <div class="logo">
                        <img src="./blueriot-logo.png" alt="BlueRiot" onerror="this.style.display='none'">
                        <img src="./matrix.svg" alt="Matrix" style="max-width:100px;margin-top:8px;" onerror="this.style.display='none'">
                        <div class="logo-text">Syndicate</div>
                    </div>
                    <ul class="nav">
                        <li class="nav-item" data-v="tastes"><span>TASTES</span></li>
                        <li class="nav-item" data-v="routes"><span>ROUTES</span></li>
                        <li class="nav-item" data-v="stay"><span>STAY</span></li>
                        <div class="nav-divider"></div>
                        <li class="nav-item" data-v="node"><span>NODE</span></li>
                    </ul>
                    <button class="logout-btn" id="logoutBtn">LOGOUT</button>
                </aside>

                <main class="main">
                    <div id="home" class="page active">
                        <h1>Dashboard</h1>
                        <div class="content-box">
                            <p style="color:var(--text-secondary);">Seleziona una sezione dal menu per iniziare.</p>
                        </div>
                    </div>

                    <div id="tastes" class="page">
                        <h1>Tastes</h1>
                        <div class="toolbar">
                            <div id="tastes-filters"></div>
                            <button class="btn btn-add" id="addTaste">+ Aggiungi</button>
                        </div>
                        <div class="content-box" id="tastes-c">
                            <p style="color:var(--text-secondary);">Caricamento...</p>
                        </div>
                    </div>

                    <div id="routes" class="page">
                        <h1>Routes</h1>
                        <div class="toolbar">
                            <div id="routes-filters"></div>
                            <button class="btn btn-add" id="addRoute">+ Aggiungi</button>
                        </div>
                        <div class="content-box" id="routes-c">
                            <p style="color:var(--text-secondary);">Caricamento...</p>
                        </div>
                    </div>

                    <div id="stay" class="page">
                        <h1>Stay</h1>
                        <div class="toolbar">
                            <div id="stay-filters"></div>
                            <button class="btn btn-add" id="addStay">+ Aggiungi</button>
                        </div>
                        <div class="content-box" id="stay-c">
                            <p style="color:var(--text-secondary);">Caricamento...</p>
                        </div>
                    </div>

                    <div id="node" class="page">
                        <div id="node-list">
                            <h1>Node - Tours</h1>
                            <div class="content-box" id="node-c">
                                <p style="color:var(--text-secondary);">Caricamento tour...</p>
                            </div>
                        </div>
                        <div id="node-detail" style="display:none;">
                            <tour-weather-panel></tour-weather-panel>
                            <div class="tools-section">
                                <h2>TOOLS</h2>
                                <div class="tools-grid">
                                    <div class="content-box">
                                        <h3 style="color:var(--primary-blue);margin-bottom:12px;font-size:15px;">eTickets</h3>
                                        <eticket-panel></eticket-panel>
                                    </div>
                                    <div class="content-box">
                                        <h3 style="color:var(--primary-blue);margin-bottom:12px;font-size:15px;">PDF OCR</h3>
                                        <pdf-ocr-panel></pdf-ocr-panel>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- Modal CRUD -->
            <div class="modal-overlay" id="crudModal">
                <div class="modal">
                    <button class="modal-close" id="modalClose">×</button>
                    <h2 id="modalTitle">Aggiungi</h2>
                    <form id="crudForm"></form>
                    <div style="margin-top:24px;display:flex;gap:12px;justify-content:flex-end;">
                        <button type="button" class="btn" id="modalCancel">Annulla</button>
                        <button type="submit" class="btn btn-add" id="modalSave">Salva</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupListeners() {
        // Hamburger
        this.shadowRoot.getElementById('hamburger').onclick = () => {
            this.shadowRoot.getElementById('sidebar').classList.toggle('open');
        };

        // Nav items
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

        // Logout
        this.shadowRoot.getElementById('logoutBtn').onclick = async () => {
            await window.supabaseClient.auth.signOut();
            window.location.reload();
        };

        // Add buttons
        this.shadowRoot.getElementById('addTaste').onclick = () => this.openModal('tastes');
        this.shadowRoot.getElementById('addRoute').onclick = () => this.openModal('routes');
        this.shadowRoot.getElementById('addStay').onclick = () => this.openModal('stay');

        // Modal
        this.shadowRoot.getElementById('modalClose').onclick = () => this.closeModal();
        this.shadowRoot.getElementById('modalCancel').onclick = () => this.closeModal();
        this.shadowRoot.getElementById('modalSave').onclick = () => this.saveModal();

        // Tour weather panel back
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
                const { data, error } = await window.supabaseClient
                    .from('blueriot_tastes')
                    .select('*')
                    .order('name');
                if (error) throw error;
                this.tastesData = data || [];
                this.renderTastes(c);
                this.loadedSections.add(v);
            }
            else if (v === 'routes') {
                const { data, error } = await window.supabaseClient
                    .from('blueriot_routes')
                    .select('*')
                    .order('start_point');
                if (error) throw error;
                this.routesData = data || [];
                this.renderRoutes(c);
                this.loadedSections.add(v);
            }
            else if (v === 'stay') {
                const { data, error } = await window.supabaseClient
                    .from('blueriot_stay')
                    .select('*')
                    .order('name');
                if (error) throw error;
                this.stayData = data || [];
                this.renderStay(c);
                this.loadedSections.add(v);
            }
            else if (v === 'node') {
                const { data, error } = await window.supabaseClient
                    .from('tours')
                    .select('*')
                    .order('start_date', { ascending: false });
                if (error) throw error;
                this.toursData = data || [];
                this.renderTours(c);
                this.loadedSections.add(v);
            }
        } catch (e) {
            console.error('Load error:', e);
            c.innerHTML = `<p style="color:#FF4757;">Errore: ${e.message}</p>`;
        }
    }

    renderTastes(c) {
        if (this.tastesData.length === 0) {
            c.innerHTML = '<p style="color:var(--text-secondary);">Nessun ristorante. Clicca + Aggiungi per crearne uno.</p>';
            return;
        }
        c.innerHTML = '<div class="grid">' + this.tastesData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.name || 'N/A'}</div>
                <div class="card-info">📍 ${r.city || r.location || '-'}</div>
                <div class="card-info">🍽️ ${r.cuisine || r.type || '-'}</div>
                <div class="card-info">📞 ${r.phone || '-'}</div>
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editTaste(${i})">Modifica</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteTaste('${r.id}')">Elimina</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderRoutes(c) {
        if (this.routesData.length === 0) {
            c.innerHTML = '<p style="color:var(--text-secondary);">Nessuna tratta. Clicca + Aggiungi per crearne una.</p>';
            return;
        }
        c.innerHTML = '<div class="grid">' + this.routesData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.start_point || '?'} → ${r.end_point || '?'}</div>
                <div class="card-info">🚗 ${r.transport_type || '-'}</div>
                <div class="card-info">⏱️ ${r.duration || '-'}</div>
                <div class="card-info">💰 ${r.price || '-'}</div>
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editRoute(${i})">Modifica</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteRoute('${r.id}')">Elimina</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderStay(c) {
        if (this.stayData.length === 0) {
            c.innerHTML = '<p style="color:var(--text-secondary);">Nessun hotel. Clicca + Aggiungi per crearne uno.</p>';
            return;
        }
        c.innerHTML = '<div class="grid">' + this.stayData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.name || 'N/A'}</div>
                <div class="card-info">📍 ${r.location || r.city || '-'}</div>
                <div class="card-info">🏨 ${r.type || 'Hotel'}</div>
                <div class="card-info">📞 ${r.phone || '-'}</div>
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editStay(${i})">Modifica</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteStay('${r.id}')">Elimina</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderTours(c) {
        if (this.toursData.length === 0) {
            c.innerHTML = '<p style="color:var(--text-secondary);">Nessun tour disponibile.</p>';
            return;
        }
        c.innerHTML = '<div class="grid">' + this.toursData.map((t, i) => `
            <div class="card" style="cursor:pointer;" onclick="this.getRootNode().host.showTour(${i})">
                <div class="card-title">${t.name || 'Tour'}</div>
                <div class="card-info">📅 ${t.start_date || '-'} → ${t.end_date || '-'}</div>
                <div class="card-info">👥 ${t.passenger_count || 0} passeggeri</div>
                <div class="card-info">🏙️ ${t.cities ? t.cities.join(', ') : '-'}</div>
            </div>
        `).join('') + '</div>';
    }

    showTour(idx) {
        const tour = this.toursData[idx];
        if (!tour) return;
        this.shadowRoot.getElementById('node-list').style.display = 'none';
        this.shadowRoot.getElementById('node-detail').style.display = 'block';
        const panel = this.shadowRoot.querySelector('tour-weather-panel');
        if (panel && panel.loadTour) {
            panel.loadTour(tour);
        }
    }

    // MODAL
    openModal(type, data = null) {
        this.modalType = type;
        this.modalData = data;
        const title = this.shadowRoot.getElementById('modalTitle');
        const form = this.shadowRoot.getElementById('crudForm');

        title.textContent = data ? 'Modifica' : 'Aggiungi';

        if (type === 'tastes') {
            form.innerHTML = `
                <div class="form-group"><label>Nome</label><input name="name" value="${data?.name || ''}"></div>
                <div class="form-group"><label>Città</label><input name="city" value="${data?.city || ''}"></div>
                <div class="form-group"><label>Tipo cucina</label><input name="cuisine" value="${data?.cuisine || ''}"></div>
                <div class="form-group"><label>Telefono</label><input name="phone" value="${data?.phone || ''}"></div>
                <div class="form-group"><label>Note</label><textarea name="notes">${data?.notes || ''}</textarea></div>
            `;
        } else if (type === 'routes') {
            form.innerHTML = `
                <div class="form-group"><label>Partenza</label><input name="start_point" value="${data?.start_point || ''}"></div>
                <div class="form-group"><label>Arrivo</label><input name="end_point" value="${data?.end_point || ''}"></div>
                <div class="form-group"><label>Mezzo</label><input name="transport_type" value="${data?.transport_type || ''}"></div>
                <div class="form-group"><label>Durata</label><input name="duration" value="${data?.duration || ''}"></div>
                <div class="form-group"><label>Prezzo</label><input name="price" value="${data?.price || ''}"></div>
            `;
        } else if (type === 'stay') {
            form.innerHTML = `
                <div class="form-group"><label>Nome</label><input name="name" value="${data?.name || ''}"></div>
                <div class="form-group"><label>Località</label><input name="location" value="${data?.location || ''}"></div>
                <div class="form-group"><label>Tipo</label><input name="type" value="${data?.type || 'Hotel'}"></div>
                <div class="form-group"><label>Telefono</label><input name="phone" value="${data?.phone || ''}"></div>
                <div class="form-group"><label>Note</label><textarea name="notes">${data?.notes || ''}</textarea></div>
            `;
        }

        this.shadowRoot.getElementById('crudModal').classList.add('active');
    }

    closeModal() {
        this.shadowRoot.getElementById('crudModal').classList.remove('active');
    }

    async saveModal() {
        const form = this.shadowRoot.getElementById('crudForm');
        const formData = new FormData(form);
        const obj = Object.fromEntries(formData);

        const table = this.modalType === 'tastes' ? 'blueriot_tastes' :
                      this.modalType === 'routes' ? 'blueriot_routes' : 'blueriot_stay';

        try {
            if (this.modalData?.id) {
                await window.supabaseClient.from(table).update(obj).eq('id', this.modalData.id);
            } else {
                await window.supabaseClient.from(table).insert([obj]);
            }
            this.closeModal();
            this.loadedSections.delete(this.modalType);
            this.load(this.modalType, true);
        } catch (e) {
            alert('Errore: ' + e.message);
        }
    }

    // Edit/Delete methods
    editTaste(i) { this.openModal('tastes', this.tastesData[i]); }
    editRoute(i) { this.openModal('routes', this.routesData[i]); }
    editStay(i) { this.openModal('stay', this.stayData[i]); }

    async deleteTaste(id) {
        if (!confirm('Eliminare?')) return;
        await window.supabaseClient.from('blueriot_tastes').delete().eq('id', id);
        this.loadedSections.delete('tastes');
        this.load('tastes', true);
    }
    async deleteRoute(id) {
        if (!confirm('Eliminare?')) return;
        await window.supabaseClient.from('blueriot_routes').delete().eq('id', id);
        this.loadedSections.delete('routes');
        this.load('routes', true);
    }
    async deleteStay(id) {
        if (!confirm('Eliminare?')) return;
        await window.supabaseClient.from('blueriot_stay').delete().eq('id', id);
        this.loadedSections.delete('stay');
        this.load('stay', true);
    }
}

customElements.define('dashboard-frame', DashboardFrame);
