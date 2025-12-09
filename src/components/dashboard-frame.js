/**
 * Dashboard - Simple Dark Design
 * VERSION: 2024-12-09-v8
 */
import { auth } from '../utils/auth.js';
import './eticket-panel.js';
import './pdf-ocr-panel.js';
import './tour-weather-panel.js';

const VERSION = '2024-12-09-v8';
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
                /* SIMPLE DARK THEME */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    background: #111;
                    color: #eee;
                    min-height: 100vh;
                }

                .container { display: flex; min-height: 100vh; }

                /* SIDEBAR */
                .sidebar {
                    width: 220px;
                    background: #1a1a1a;
                    border-right: 1px solid #333;
                    padding: 20px 15px;
                    display: flex;
                    flex-direction: column;
                }

                .logo {
                    text-align: center;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #333;
                }
                .logo img { max-width: 100px; height: auto; opacity: 0.9; }

                .nav { list-style: none; flex: 1; }
                .nav-item {
                    padding: 12px 15px;
                    margin-bottom: 5px;
                    cursor: pointer;
                    color: #888;
                    border-radius: 4px;
                }
                .nav-item:hover { background: #222; color: #fff; }
                .nav-item.active { background: #333; color: #fff; }

                .nav-divider { border-top: 1px solid #333; margin: 15px 0; }

                .logout-btn {
                    padding: 10px;
                    background: transparent;
                    border: 1px solid #555;
                    color: #888;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .logout-btn:hover { border-color: #888; color: #fff; }

                /* MAIN */
                .main { flex: 1; padding: 25px; overflow-y: auto; }

                .page { display: none; }
                .page.active { display: block; }

                h1 { font-size: 22px; font-weight: 600; margin-bottom: 20px; color: #fff; }

                .content-box {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                /* GRID */
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 15px;
                }

                .card {
                    background: #222;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 15px;
                }
                .card:hover { border-color: #555; }
                .card-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 10px; }
                .card-info { font-size: 13px; color: #888; margin: 5px 0; }
                .card-actions { margin-top: 12px; padding-top: 12px; border-top: 1px solid #333; display: flex; gap: 8px; }

                /* BUTTONS */
                .btn {
                    padding: 8px 14px;
                    border: 1px solid #444;
                    border-radius: 4px;
                    background: #222;
                    color: #ccc;
                    font-size: 13px;
                    cursor: pointer;
                }
                .btn:hover { background: #333; color: #fff; }
                .btn-add { background: #2563eb; border-color: #2563eb; color: #fff; }
                .btn-add:hover { background: #1d4ed8; }
                .btn-danger { border-color: #dc2626; color: #dc2626; }
                .btn-danger:hover { background: #dc2626; color: #fff; }

                /* TOOLBAR */
                .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 10px; flex-wrap: wrap; }

                /* TOOLS */
                .tools-section { margin-top: 25px; padding-top: 20px; border-top: 1px solid #333; }
                .tools-section h2 { font-size: 16px; color: #888; margin-bottom: 15px; }
                .tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

                /* MODAL */
                .modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }
                .modal-overlay.active { display: flex; }
                .modal {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 25px;
                    max-width: 450px;
                    width: 90%;
                }
                .modal h2 { margin-bottom: 20px; font-size: 18px; }
                .modal-close { float: right; background: none; border: none; color: #888; font-size: 24px; cursor: pointer; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 6px; color: #888; font-size: 13px; }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #333;
                    border-radius: 4px;
                    background: #111;
                    color: #eee;
                    font-size: 14px;
                }
                .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #555; }
                .form-group textarea { min-height: 80px; resize: vertical; }

                /* MOBILE */
                .hamburger {
                    display: none;
                    position: fixed;
                    top: 15px; left: 15px;
                    z-index: 200;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #fff;
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
                }
            </style>

            <button class="hamburger" id="hamburger">☰</button>

            <div class="container">
                <aside class="sidebar" id="sidebar">
                    <div class="logo">
                        <img src="./blueriot-logo.png" alt="BlueRiot" onerror="this.style.display='none'">
                    </div>
                    <ul class="nav">
                        <li class="nav-item" data-v="tastes">Tastes</li>
                        <li class="nav-item" data-v="routes">Routes</li>
                        <li class="nav-item" data-v="stay">Stay</li>
                        <div class="nav-divider"></div>
                        <li class="nav-item" data-v="node">Node</li>
                    </ul>
                    <button class="logout-btn" id="logoutBtn">Logout</button>
                </aside>

                <main class="main">
                    <div id="home" class="page active">
                        <h1>Dashboard</h1>
                        <div class="content-box">
                            <p style="color:#888;">Seleziona una sezione dal menu.</p>
                        </div>
                    </div>

                    <div id="tastes" class="page">
                        <h1>Tastes</h1>
                        <div class="toolbar">
                            <div></div>
                            <button class="btn btn-add" id="addTaste">+ Aggiungi</button>
                        </div>
                        <div class="content-box" id="tastes-c">
                            <p style="color:#888;">Caricamento...</p>
                        </div>
                    </div>

                    <div id="routes" class="page">
                        <h1>Routes</h1>
                        <div class="toolbar">
                            <div></div>
                            <button class="btn btn-add" id="addRoute">+ Aggiungi</button>
                        </div>
                        <div class="content-box" id="routes-c">
                            <p style="color:#888;">Caricamento...</p>
                        </div>
                    </div>

                    <div id="stay" class="page">
                        <h1>Stay</h1>
                        <div class="toolbar">
                            <div></div>
                            <button class="btn btn-add" id="addStay">+ Aggiungi</button>
                        </div>
                        <div class="content-box" id="stay-c">
                            <p style="color:#888;">Caricamento...</p>
                        </div>
                    </div>

                    <div id="node" class="page">
                        <div id="node-list">
                            <h1>Node - Tours</h1>
                            <div class="content-box" id="node-c">
                                <p style="color:#888;">Caricamento...</p>
                            </div>
                        </div>
                        <div id="node-detail" style="display:none;">
                            <tour-weather-panel></tour-weather-panel>
                            <div class="tools-section">
                                <h2>Tools</h2>
                                <div class="tools-grid">
                                    <div class="content-box">
                                        <h3 style="margin-bottom:10px;">eTickets</h3>
                                        <eticket-panel></eticket-panel>
                                    </div>
                                    <div class="content-box">
                                        <h3 style="margin-bottom:10px;">PDF OCR</h3>
                                        <pdf-ocr-panel></pdf-ocr-panel>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <div class="modal-overlay" id="crudModal">
                <div class="modal">
                    <button class="modal-close" id="modalClose">×</button>
                    <h2 id="modalTitle">Aggiungi</h2>
                    <form id="crudForm"></form>
                    <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
                        <button type="button" class="btn" id="modalCancel">Annulla</button>
                        <button type="submit" class="btn btn-add" id="modalSave">Salva</button>
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
            c.innerHTML = `<p style="color:#f66;">Errore: ${e.message}</p>`;
        }
    }

    renderTastes(c) {
        if (!this.tastesData.length) { c.innerHTML = '<p style="color:#888;">Nessun ristorante.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.tastesData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.name || 'N/A'}</div>
                <div class="card-info">📍 ${r.city || '-'}</div>
                <div class="card-info">🍽️ ${r.cuisine || '-'}</div>
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editTaste(${i})">Modifica</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteTaste('${r.id}')">Elimina</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderRoutes(c) {
        if (!this.routesData.length) { c.innerHTML = '<p style="color:#888;">Nessuna tratta.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.routesData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.start_point || '?'} → ${r.end_point || '?'}</div>
                <div class="card-info">🚗 ${r.transport_type || '-'}</div>
                <div class="card-info">⏱️ ${r.duration || '-'}</div>
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editRoute(${i})">Modifica</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteRoute('${r.id}')">Elimina</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderStay(c) {
        if (!this.stayData.length) { c.innerHTML = '<p style="color:#888;">Nessun hotel.</p>'; return; }
        c.innerHTML = '<div class="grid">' + this.stayData.map((r, i) => `
            <div class="card">
                <div class="card-title">${r.name || 'N/A'}</div>
                <div class="card-info">📍 ${r.location || '-'}</div>
                <div class="card-info">🏨 ${r.type || 'Hotel'}</div>
                <div class="card-actions">
                    <button class="btn" onclick="this.getRootNode().host.editStay(${i})">Modifica</button>
                    <button class="btn btn-danger" onclick="this.getRootNode().host.deleteStay('${r.id}')">Elimina</button>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderTours(c) {
        if (!this.toursData.length) { c.innerHTML = '<p style="color:#888;">Nessun tour.</p>'; return; }
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
        this.shadowRoot.getElementById('modalTitle').textContent = data ? 'Modifica' : 'Aggiungi';

        if (type === 'tastes') {
            form.innerHTML = `
                <div class="form-group"><label>Nome</label><input name="name" value="${data?.name || ''}"></div>
                <div class="form-group"><label>Città</label><input name="city" value="${data?.city || ''}"></div>
                <div class="form-group"><label>Cucina</label><input name="cuisine" value="${data?.cuisine || ''}"></div>
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

    closeModal() { this.shadowRoot.getElementById('crudModal').classList.remove('active'); }

    async saveModal() {
        const form = this.shadowRoot.getElementById('crudForm');
        const obj = Object.fromEntries(new FormData(form));
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
