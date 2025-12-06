/**
 * TASTES Panel Component with NODE Integration
 * Restaurant database with city picker from NODE database
 */
import { auth } from '../utils/auth.js';

export class TastesPanelV2 extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.restaurants = [];
        this.nodes = [];
        this.currentEdit = null;
        this.selectedNodeId = null;
        this.filterNodeId = null;
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadNodes();
        this.loadRestaurants();
    }

    render() {
        this.shadowRoot.innerHTML = \`
            <link rel="stylesheet" href="src/styles/base.css">
            <link rel="stylesheet" href="src/styles/layout.css">
            <link rel="stylesheet" href="src/styles/components.css">

            <style>
                :host { display: block; }
                
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                    flex-wrap: wrap;
                    gap: var(--spacing-md);
                }

                .filter-bar {
                    display: flex;
                    gap: var(--spacing-sm);
                    align-items: center;
                }

                .restaurants-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }

                .restaurant-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    transition: all var(--transition-normal);
                }

                .restaurant-card:hover {
                    border-color: rgba(0, 200, 255, 0.4);
                    box-shadow: 0 0 12px rgba(0, 200, 255, 0.3);
                }

                .restaurant-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: var(--spacing-md);
                }

                .restaurant-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: var(--spacing-xs);
                }

                .restaurant-meta {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin: var(--spacing-xs) 0;
                }

                .restaurant-actions {
                    display: flex;
                    gap: var(--spacing-sm);
                }

                .btn-icon {
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-muted);
                }

                .node-picker-list {
                    max-height: 300px;
                    overflow-y: auto;
                    margin-top: var(--spacing-md);
                }

                .node-item {
                    padding: var(--spacing-md);
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--spacing-sm);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .node-item:hover {
                    border-color: var(--neon-cyan);
                    background: rgba(0, 200, 255, 0.05);
                }

                .node-item-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .node-item-region {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }

                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(5, 5, 5, 0.9);
                    backdrop-filter: blur(8px);
                    z-index: 5000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-lg);
                }

                .modal-backdrop.active { display: flex; }

                .modal-content {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.3);
                    border-radius: var(--radius-lg);
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 0 24px rgba(0, 200, 255, 0.5), 0 0 48px rgba(0, 200, 255, 0.3);
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid rgba(0, 200, 255, 0.2);
                }

                .modal-title {
                    font-size: 20px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--neon-cyan);
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: 1px solid rgba(255, 79, 216, 0.3);
                    border-radius: var(--radius-sm);
                    color: var(--neon-fuchsia);
                    font-size: 20px;
                    cursor: pointer;
                }

                .modal-body {
                    padding: var(--spacing-lg);
                }

                .modal-footer {
                    padding: var(--spacing-lg);
                    border-top: 1px solid rgba(0, 200, 255, 0.2);
                    display: flex;
                    gap: var(--spacing-md);
                    justify-content: flex-end;
                }
            </style>

            <div class="header-actions">
                <div class="filter-bar">
                    <select class="form-select" id="nodeFilter" style="min-width: 200px;">
                        <option value="">Tutte le città</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="addBtn">+ Aggiungi Locale</button>
            </div>

            <div id="restaurantsList" class="restaurants-grid">
                <div class="empty-state">Caricamento...</div>
            </div>

            <!-- Add/Edit Modal -->
            <div class="modal-backdrop" id="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="modalTitle">Aggiungi Locale</h3>
                        <button class="modal-close" id="closeBtn">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="restaurantForm">
                            <div class="form-group">
                                <label class="form-label">Nome Locale *</label>
                                <input type="text" class="form-input" id="name" required placeholder="es. Trattoria da Mario">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Città *</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="text" class="form-input" id="city" required placeholder="es. Roma" style="flex: 1;">
                                    <button type="button" class="btn btn-secondary" id="pickNodeBtn" style="white-space: nowrap;">📍 Da NODE</button>
                                </div>
                                <input type="hidden" id="nodeId">
                                <div id="selectedNodeInfo" style="margin-top: var(--spacing-sm); color: var(--neon-cyan); font-size: 13px; display: none;"></div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Indirizzo</label>
                                <input type="text" class="form-input" id="address" placeholder="es. Via Roma 123">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Telefono</label>
                                <input type="tel" class="form-input" id="phone" placeholder="es. +39 06 1234567">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-select" id="type">
                                    <option value="restaurant">🍽️ Ristorante</option>
                                    <option value="bar">☕ Bar/Caffè</option>
                                    <option value="gelateria">🍦 Gelateria</option>
                                    <option value="pub">🍺 Pub</option>
                                    <option value="other">📍 Altro</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Note</label>
                                <textarea class="form-textarea" id="notes" placeholder="Note aggiuntive..."></textarea>
                            </div>

                            <div class="alert alert-error" id="error" style="display: none;"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelBtn">Annulla</button>
                        <button class="btn btn-primary" id="saveBtn">Salva</button>
                    </div>
                </div>
            </div>

            <!-- Node Picker Modal -->
            <div class="modal-backdrop" id="nodePickerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Seleziona Città da NODE</h3>
                        <button class="modal-close" id="closeNodePickerBtn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="text" class="form-input" id="nodeSearch" placeholder="🔍 Cerca città...">
                        </div>
                        <div id="nodePickerList" class="node-picker-list"></div>
                    </div>
                </div>
            </div>
        \`;
    }

    setupEventListeners() {
        // Main buttons
        this.shadowRoot.getElementById('addBtn').addEventListener('click', () => this.openAddModal());
        this.shadowRoot.getElementById('closeBtn').addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('saveBtn').addEventListener('click', () => this.handleSave());

        // Node picker
        this.shadowRoot.getElementById('pickNodeBtn').addEventListener('click', () => this.openNodePicker());
        this.shadowRoot.getElementById('closeNodePickerBtn').addEventListener('click', () => this.closeNodePicker());

        // Node filter
        this.shadowRoot.getElementById('nodeFilter').addEventListener('change', (e) => {
            this.filterNodeId = e.target.value || null;
            this.displayRestaurants();
        });

        // Node search
        this.shadowRoot.getElementById('nodeSearch').addEventListener('input', (e) => {
            this.filterNodeList(e.target.value);
        });

        // Close modals on backdrop click
        this.shadowRoot.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
        this.shadowRoot.getElementById('nodePickerModal').addEventListener('click', (e) => {
            if (e.target.id === 'nodePickerModal') this.closeNodePicker();
        });
    }

    async loadNodes() {
        try {
            const supabase = window.supabaseClient;
            const response = await supabase.from('nodes').select('*').order('name');
            this.nodes = response.data || [];
            this.updateNodeFilter();
        } catch (error) {
            console.error('Error loading nodes:', error);
        }
    }

    updateNodeFilter() {
        const select = this.shadowRoot.getElementById('nodeFilter');
        const currentValue = select.value;
        
        let html = '<option value="">Tutte le città</option>';
        for (const node of this.nodes) {
            html += '<option value="' + node.id + '">' + node.name + '</option>';
        }
        select.innerHTML = html;
        select.value = currentValue;
    }

    async loadRestaurants() {
        const container = this.shadowRoot.getElementById('restaurantsList');

        try {
            container.innerHTML = '<div class="empty-state">Caricamento...</div>';
            const supabase = window.supabaseClient;
            const response = await supabase.from('tastes_database').select('*').order('city');
            this.restaurants = response.data || [];
            this.displayRestaurants();
        } catch (error) {
            console.error('Load error:', error);
            container.innerHTML = '<div class="empty-state" style="color: var(--error);">Errore caricamento</div>';
        }
    }

    displayRestaurants() {
        const container = this.shadowRoot.getElementById('restaurantsList');

        let filtered = this.restaurants;
        if (this.filterNodeId) {
            filtered = this.restaurants.filter(r => r.node_id === this.filterNodeId);
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun locale trovato</div>';
            return;
        }

        const html = [];
        for (const r of filtered) {
            const typeLabel = this.getTypeLabel(r.type || 'restaurant');
            const cityText = r.city || 'N/A';
            const addressHtml = r.address ? '<div class="restaurant-meta">🏠 ' + r.address + '</div>' : '';
            const phoneHtml = r.phone ? '<div class="restaurant-meta">📞 ' + r.phone + '</div>' : '';
            const notesHtml = r.notes ? '<div class="restaurant-meta" style="margin-top: var(--spacing-md);">💬 ' + r.notes + '</div>' : '';

            // Show NODE badge if linked
            let nodeBadge = '';
            if (r.node_id) {
                const node = this.nodes.find(n => n.id === r.node_id);
                if (node) {
                    nodeBadge = '<span class="badge badge-fuchsia" style="margin-left: 8px;">📍 ' + node.name + '</span>';
                }
            }

            html.push('<div class="restaurant-card">');
            html.push('<div class="restaurant-header">');
            html.push('<div>');
            html.push('<div class="restaurant-title">' + (r.name || 'N/A') + '</div>');
            html.push('<span class="badge badge-cyan">' + typeLabel + '</span>');
            html.push(nodeBadge);
            html.push('</div>');
            html.push('<div class="restaurant-actions">');
            html.push('<button class="btn btn-secondary btn-icon" data-id="' + r.id + '" data-action="edit">✏️</button>');
            html.push('<button class="btn btn-danger btn-icon" data-id="' + r.id + '" data-action="delete">🗑️</button>');
            html.push('</div>');
            html.push('</div>');
            html.push('<div class="restaurant-meta">📍 ' + cityText + '</div>');
            html.push(addressHtml);
            html.push(phoneHtml);
            html.push(notesHtml);
            html.push('</div>');
        }

        container.innerHTML = html.join('');

        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                if (action === 'edit') this.openEditModal(id);
                else if (action === 'delete') this.handleDelete(id);
            });
        });
    }

    getTypeLabel(type) {
        const labels = {
            restaurant: '🍽️ Ristorante',
            bar: '☕ Bar/Caffè',
            gelateria: '🍦 Gelateria',
            pub: '🍺 Pub',
            other: '📍 Altro'
        };
        return labels[type] || type;
    }

    openAddModal() {
        this.currentEdit = null;
        this.selectedNodeId = null;
        this.shadowRoot.getElementById('restaurantForm').reset();
        this.shadowRoot.getElementById('nodeId').value = '';
        this.shadowRoot.getElementById('selectedNodeInfo').style.display = 'none';
        this.shadowRoot.getElementById('modalTitle').textContent = 'Aggiungi Locale';
        this.shadowRoot.getElementById('error').style.display = 'none';
        this.shadowRoot.getElementById('modal').classList.add('active');
    }

    openEditModal(id) {
        const restaurant = this.restaurants.find(r => r.id === id);
        if (!restaurant) return;

        this.currentEdit = restaurant;
        this.selectedNodeId = restaurant.node_id || null;

        this.shadowRoot.getElementById('name').value = restaurant.name || '';
        this.shadowRoot.getElementById('city').value = restaurant.city || '';
        this.shadowRoot.getElementById('address').value = restaurant.address || '';
        this.shadowRoot.getElementById('phone').value = restaurant.phone || '';
        this.shadowRoot.getElementById('type').value = restaurant.type || 'restaurant';
        this.shadowRoot.getElementById('notes').value = restaurant.notes || '';
        this.shadowRoot.getElementById('nodeId').value = restaurant.node_id || '';

        // Show selected node
        if (restaurant.node_id) {
            const node = this.nodes.find(n => n.id === restaurant.node_id);
            if (node) {
                const info = this.shadowRoot.getElementById('selectedNodeInfo');
                info.textContent = '✅ Collegato a: ' + node.name;
                info.style.display = 'block';
            }
        }

        this.shadowRoot.getElementById('modalTitle').textContent = 'Modifica Locale';
        this.shadowRoot.getElementById('error').style.display = 'none';
        this.shadowRoot.getElementById('modal').classList.add('active');
    }

    closeModal() {
        this.shadowRoot.getElementById('modal').classList.remove('active');
        this.currentEdit = null;
        this.selectedNodeId = null;
    }

    openNodePicker() {
        this.filterNodeList('');
        this.shadowRoot.getElementById('nodeSearch').value = '';
        this.shadowRoot.getElementById('nodePickerModal').classList.add('active');
    }

    closeNodePicker() {
        this.shadowRoot.getElementById('nodePickerModal').classList.remove('active');
    }

    filterNodeList(searchTerm) {
        const container = this.shadowRoot.getElementById('nodePickerList');
        const term = searchTerm.toLowerCase();

        const filtered = term ? 
            this.nodes.filter(n => n.name.toLowerCase().includes(term) || (n.region && n.region.toLowerCase().includes(term))) :
            this.nodes;

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessuna città trovata</div>';
            return;
        }

        const html = filtered.map(node => {
            return '<div class="node-item" data-id="' + node.id + '">' +
                '<div class="node-item-name">' + node.name + '</div>' +
                '<div class="node-item-region">' + (node.region || 'N/A') + '</div>' +
                '</div>';
        }).join('');

        container.innerHTML = html;

        container.querySelectorAll('.node-item').forEach(item => {
            item.addEventListener('click', () => {
                const nodeId = item.dataset.id;
                this.selectNode(nodeId);
            });
        });
    }

    selectNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;

        this.selectedNodeId = nodeId;
        this.shadowRoot.getElementById('city').value = node.name;
        this.shadowRoot.getElementById('nodeId').value = nodeId;

        const info = this.shadowRoot.getElementById('selectedNodeInfo');
        info.textContent = '✅ Collegato a: ' + node.name + ' (' + (node.region || 'N/A') + ')';
        info.style.display = 'block';

        this.closeNodePicker();
    }

    async handleSave() {
        const name = this.shadowRoot.getElementById('name').value.trim();
        const city = this.shadowRoot.getElementById('city').value.trim();
        const address = this.shadowRoot.getElementById('address').value.trim();
        const phone = this.shadowRoot.getElementById('phone').value.trim();
        const type = this.shadowRoot.getElementById('type').value;
        const notes = this.shadowRoot.getElementById('notes').value.trim();
        const nodeId = this.shadowRoot.getElementById('nodeId').value || null;
        const error = this.shadowRoot.getElementById('error');
        const saveBtn = this.shadowRoot.getElementById('saveBtn');

        if (!name || !city) {
            error.textContent = 'Nome e Città sono obbligatori';
            error.style.display = 'block';
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Salvataggio...';
            error.style.display = 'none';

            const data = { name, city, address, phone, type, notes, node_id: nodeId };
            const supabase = window.supabaseClient;

            if (this.currentEdit) {
                const response = await supabase.from('tastes_database').update(data).eq('id', this.currentEdit.id);
                if (response.error) throw response.error;
            } else {
                const response = await supabase.from('tastes_database').insert([data]);
                if (response.error) throw response.error;
            }

            await this.loadRestaurants();
            this.closeModal();
        } catch (err) {
            console.error('Save error:', err);
            error.textContent = err.message || 'Errore durante il salvataggio';
            error.style.display = 'block';
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salva';
        }
    }

    async handleDelete(id) {
        const restaurant = this.restaurants.find(r => r.id === id);
        if (!restaurant) return;

        if (!confirm('Eliminare "' + restaurant.name + '"?')) return;

        try {
            const supabase = window.supabaseClient;
            const response = await supabase.from('tastes_database').delete().eq('id', id);
            if (response.error) throw response.error;
            await this.loadRestaurants();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Errore durante l eliminazione: ' + err.message);
        }
    }
}

customElements.define('tastes-panel-v2', TastesPanelV2);
