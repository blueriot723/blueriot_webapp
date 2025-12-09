/**
 * Dashboard - Simple Clean Design
 * VERSION: 2024-12-09-v6
 */
import { auth } from '../utils/auth.js';
import './eticket-panel.js';
import './pdf-ocr-panel.js';
import './tour-weather-panel.js';

const VERSION = '2024-12-09-v6';
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
                * { margin: 0; padding: 0; box-sizing: border-box; }
                :host {
                    display: block;
                    font-family: 'Courier New', Courier, monospace;
                    background: #000;
                    color: #0f0;
                    min-height: 100vh;
                }

                .container {
                    display: flex;
                    min-height: 100vh;
                }

                /* SIDEBAR */
                .sidebar {
                    width: 200px;
                    background: #000;
                    border-right: 1px solid #0f0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                }

                .logo {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #0f0;
                }
                .logo img {
                    max-width: 120px;
                    height: auto;
                    margin-bottom: 10px;
                }

                /* NAV */
                .nav {
                    list-style: none;
                    flex: 1;
                }
                .nav-item {
                    padding: 12px 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                .nav-item:hover {
                    border-color: #0f0;
                    background: rgba(0,255,0,0.1);
                }
                .nav-item.active {
                    border-color: #0f0;
                    background: rgba(0,255,0,0.2);
                    color: #fff;
                }
                .nav-item span {
                    font-size: 14px;
                    letter-spacing: 1px;
                }

                .nav-divider {
                    border-top: 1px dashed #0f0;
                    margin: 15px 0;
                    opacity: 0.5;
                }

                .logout-btn {
                    padding: 10px;
                    background: transparent;
                    border: 1px solid #f00;
                    color: #f00;
                    font-family: inherit;
                    cursor: pointer;
                    margin-top: auto;
                }
                .logout-btn:hover {
                    background: rgba(255,0,0,0.2);
                }

                /* MAIN */
                .main {
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                }

                .page { display: none; }
                .page.active { display: block; }

                h1 {
                    font-size: 24px;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #0f0;
                    color: #0f0;
                }

                .content-box {
                    border: 1px solid #0f0;
                    padding: 20px;
                    margin-bottom: 20px;
                    background: rgba(0,255,0,0.02);
                }

                /* GRID */
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 15px;
                }

                .card {
                    border: 1px solid #0f0;
                    padding: 15px;
                    background: rgba(0,255,0,0.05);
                }
                .card-title {
                    font-size: 16px;
                    color: #fff;
                    margin-bottom: 10px;
                }
                .card-info {
                    font-size: 12px;
                    color: #0f0;
                    margin: 5px 0;
                }
                .card-actions {
                    margin-top: 10px;
                    display: flex;
                    gap: 10px;
                }

                /* BUTTONS */
                .btn {
                    padding: 8px 15px;
                    border: 1px solid #0f0;
                    background: transparent;
                    color: #0f0;
                    font-family: inherit;
                    font-size: 12px;
                    cursor: pointer;
                }
                .btn:hover {
                    background: rgba(0,255,0,0.2);
                }
                .btn-add {
                    border-color: #0ff;
                    color: #0ff;
                }
                .btn-add:hover {
                    background: rgba(0,255,255,0.2);
                }
                .btn-danger {
                    border-color: #f00;
                    color: #f00;
                }
                .btn-danger:hover {
                    background: rgba(255,0,0,0.2);
                }

                /* TOOLBAR */
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .toolbar select, .toolbar input {
                    padding: 8px;
                    border: 1px solid #0f0;
                    background: #000;
                    color: #0f0;
                    font-family: inherit;
                }

                /* T00L5 SECTION */
                .tools-section {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px dashed #0f0;
                }
                .tools-section h2 {
                    color: #0ff;
                    font-size: 16px;
                    margin-bottom: 15px;
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
                    background: rgba(0,0,0,0.9);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }
                .modal-overlay.active { display: flex; }
                .modal {
                    background: #000;
                    border: 2px solid #0f0;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                }
                .modal h2 {
                    margin-bottom: 20px;
                    color: #0f0;
                }
                .modal-close {
                    float: right;
                    background: none;
                    border: none;
                    color: #f00;
                    font-size: 24px;
                    cursor: pointer;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #0f0;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #0f0;
                    background: #000;
                    color: #0f0;
                    font-family: inherit;
                }

                /* MOBILE */
                .hamburger {
                    display: none;
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    z-index: 200;
                    background: #000;
                    border: 1px solid #0f0;
                    color: #0f0;
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .hamburger { display: block; }
                    .sidebar {
                        position: fixed;
                        left: -220px;
                        top: 0;
                        height: 100vh;
                        z-index: 150;
                        transition: left 0.3s;
                    }
                    .sidebar.open { left: 0; }
                    .main { padding: 60px 15px 15px; }
                    .tools-grid { grid-template-columns: 1fr; }
                }
            </style>

            <button class="hamburger" id="hamburger">☰</button>

            <div class="container">
                <aside class="sidebar" id="sidebar">
                    <div class="logo">
                        <img src="./blueriot-logo.png" alt="BlueRiot" onerror="this.style.display='none'">
                        <img src="./matrix.svg" alt="Matrix" style="max-width:100px;" onerror="this.style.display='none'">
                    </div>
                    <ul class="nav">
                        <li class="nav-item" data-v="tastes"><span>ΤΔSΤΞ5</span></li>
                        <li class="nav-item" data-v="routes"><span>R0UT35</span></li>
                        <li class="nav-item" data-v="stay"><span>SΤΔΥ</span></li>
                        <div class="nav-divider"></div>
                        <li class="nav-item" data-v="node"><span>NODΞ</span></li>
                    </ul>
                    <button class="logout-btn" id="logoutBtn">[ LOGOUT ]</button>
                </aside>

                <main class="main">
                    <div id="home" class="page active">
                        <h1>BLUERIOT MATRIX</h1>
                        <div class="content-box">
                            <p>> Seleziona una sezione dal menu</p>
                            <p>> Sistema pronto</p>
                        </div>
                    </div>

                    <div id="tastes" class="page">
                        <h1>ΤΔSΤΞ5</h1>
                        <div class="toolbar">
                            <div id="tastes-filters"></div>
                            <button class="btn btn-add" id="addTaste">+ AGGIUNGI</button>
                        </div>
                        <div class="content-box" id="tastes-c">
                            <p>> Caricamento...</p>
                        </div>
                    </div>

                    <div id="routes" class="page">
                        <h1>R0UT35</h1>
                        <div class="toolbar">
                            <div id="routes-filters"></div>
                            <button class="btn btn-add" id="addRoute">+ AGGIUNGI</button>
                        </div>
                        <div class="content-box" id="routes-c">
                            <p>> Caricamento...</p>
                        </div>
                    </div>

                    <div id="stay" class="page">
                        <h1>SΤΔΥ</h1>
                        <div class="toolbar">
                            <div id="stay-filters"></div>
                            <button class="btn btn-add" id="addStay">+ AGGIUNGI</button>
                        </div>
                        <div class="content-box" id="stay-c">
                            <p>> Caricamento...</p>
                        </div>
                    </div>

                    <div id="node" class="page">
                        <div id="node-list">
                            <h1>NODΞ - Tour</h1>
                            <div class="content-box" id="node-c">
                                <p>> Caricamento tour...</p>
                            </div>
                        </div>
                        <div id="node-detail" style="display:none;">
                            <tour-weather-panel></tour-weather-panel>
                            <div class="tools-section">
                                <h2>T00L5</h2>
                                <div class="tools-grid">
                                    <div class="content-box">
                                        <h3 style="color:#0ff;margin-bottom:10px;">eTICKETS</h3>
                                        <eticket-panel></eticket-panel>
                                    </div>
                                    <div class="content-box">
                                        <h3 style="color:#0ff;margin-bottom:10px;">PDF OCR</h3>
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
                    <div style="margin-top:20px;text-align:right;">
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
                // Close sidebar on mobile
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
            c.innerHTML = `<p style="color:#f00;">> Errore: ${e.message}</p>`;
        }
    }

    renderTastes(c) {
        if (this.tastesData.length === 0) {
            c.innerHTML = '<p>> Nessun ristorante. Clicca + AGGIUNGI</p>';
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
            c.innerHTML = '<p>> Nessuna tratta. Clicca + AGGIUNGI</p>';
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
            c.innerHTML = '<p>> Nessun hotel. Clicca + AGGIUNGI</p>';
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
            c.innerHTML = '<p>> Nessun tour. Crea un tour in Supabase.</p>';
            return;
        }
        c.innerHTML = '<div class="grid">' + this.toursData.map((t, i) => `
            <div class="card" style="cursor:pointer;" onclick="this.getRootNode().host.showTour(${i})">
                <div class="card-title">${t.name || 'Tour'}</div>
                <div class="card-info">📅 ${t.start_date || '-'} → ${t.end_date || '-'}</div>
                <div class="card-info">👥 ${t.passenger_count || 0} pax</div>
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
        this.load('tastes', true);
    }
    async deleteRoute(id) {
        if (!confirm('Eliminare?')) return;
        await window.supabaseClient.from('blueriot_routes').delete().eq('id', id);
        this.load('routes', true);
    }
    async deleteStay(id) {
        if (!confirm('Eliminare?')) return;
        await window.supabaseClient.from('blueriot_stay').delete().eq('id', id);
        this.load('stay', true);
    }
}

customElements.define('dashboard-frame', DashboardFrame);
