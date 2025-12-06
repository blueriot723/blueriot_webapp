/**
 * TASTES Panel Component - Restaurant Database
 * Complete restaurant/venue database with TRON design
 */
import { auth } from '../utils/auth.js';

export class TastesPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.restaurants = [];
        this.currentEdit = null;
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadRestaurants();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('../styles/base.css');
                @import url('../styles/layout.css');
                @import url('../styles/components.css');

                :host {
                    display: block;
                }

                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
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
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
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

                .badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-sm);
                    margin-top: var(--spacing-md);
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-muted);
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

                .modal-backdrop.active {
                    display: flex;
                }

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
                <p style="color: var(--text-secondary);">Gestisci database ristoranti, bar, gelaterie e locali testati</p>
                <button class="btn btn-primary" id="addBtn">+ Aggiungi Locale</button>
            </div>

            <div id="restaurantsList" class="restaurants-grid">
                <div class="empty-state">Caricamento...</div>
            </div>

            <div class="modal-backdrop" id="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="modalTitle">Aggiungi Locale</h3>
                        <button class="modal-close" id="closeBtn">�</button>
                    </div>
                    <div class="modal-body">
                        <form id="restaurantForm">
                            <div class="form-group">
                                <label class="form-label">Nome Locale *</label>
                                <input type="text" class="form-input" id="name" required placeholder="es. Trattoria da Mario">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Citt� *</label>
                                <input type="text" class="form-input" id="city" required placeholder="es. Roma">
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
                                    <option value="restaurant"><} Ristorante</option>
                                    <option value="bar"> Bar/Caff�</option>
                                    <option value="gelateria"><f Gelateria</option>
                                    <option value="pub"><z Pub</option>
                                    <option value="other">=� Altro</option>
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
        `;
    }

    setupEventListeners() {
        const addBtn = this.shadowRoot.getElementById('addBtn');
        const closeBtn = this.shadowRoot.getElementById('closeBtn');
        const cancelBtn = this.shadowRoot.getElementById('cancelBtn');
        const saveBtn = this.shadowRoot.getElementById('saveBtn');
        const modal = this.shadowRoot.getElementById('modal');

        addBtn.addEventListener('click', () => this.openAddModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        saveBtn.addEventListener('click', () => this.handleSave());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    async loadRestaurants() {
        const container = this.shadowRoot.getElementById('restaurantsList');

        try {
            container.innerHTML = '<div class="empty-state">Caricamento...</div>';

            const supabase = window.supabaseClient;
            if (!supabase) throw new Error('Supabase not initialized');

            const response = await supabase
                .from('tastes_database')
                .select('*')
                .order('city', { ascending: true });

            if (response.error) throw response.error;

            this.restaurants = response.data || [];
            this.displayRestaurants();
        } catch (error) {
            console.error('Load error:', error);
            container.innerHTML = '<div class="empty-state" style="color: var(--error);">Errore caricamento</div>';
        }
    }

    displayRestaurants() {
        const container = this.shadowRoot.getElementById('restaurantsList');

        if (this.restaurants.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun locale ancora. Clicca "+ Aggiungi Locale" per iniziare.</div>';
            return;
        }

        const html = [];
        for (const r of this.restaurants) {
            const typeLabel = this.getTypeLabel(r.type || 'restaurant');
            const cityText = r.city || 'N/A';
            const addressHtml = r.address ? '<div class="restaurant-meta"><� ' + r.address + '</div>' : '';
            const phoneHtml = r.phone ? '<div class="restaurant-meta">=� ' + r.phone + '</div>' : '';
            const notesHtml = r.notes ? '<div class="restaurant-meta" style="margin-top: var(--spacing-md);">=� ' + r.notes + '</div>' : '';

            html.push('<div class="restaurant-card">');
            html.push('<div class="restaurant-header">');
            html.push('<div>');
            html.push('<div class="restaurant-title">' + (r.name || 'N/A') + '</div>');
            html.push('<span class="badge badge-cyan">' + typeLabel + '</span>');
            html.push('</div>');
            html.push('<div class="restaurant-actions">');
            html.push('<button class="btn btn-secondary btn-icon" data-id="' + r.id + '" data-action="edit"></button>');
            html.push('<button class="btn btn-danger btn-icon" data-id="' + r.id + '" data-action="delete">=�</button>');
            html.push('</div>');
            html.push('</div>');
            html.push('<div class="restaurant-meta">=� ' + cityText + '</div>');
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
                if (action === 'edit') {
                    this.openEditModal(id);
                } else if (action === 'delete') {
                    this.handleDelete(id);
                }
            });
        });
    }

    getTypeLabel(type) {
        const labels = {
            restaurant: '<} Ristorante',
            bar: ' Bar/Caff�',
            gelateria: '<f Gelateria',
            pub: '<z Pub',
            other: '=� Altro'
        };
        return labels[type] || type;
    }

    openAddModal() {
        this.currentEdit = null;
        const form = this.shadowRoot.getElementById('restaurantForm');
        form.reset();

        this.shadowRoot.getElementById('modalTitle').textContent = 'Aggiungi Locale';
        this.shadowRoot.getElementById('error').style.display = 'none';
        this.shadowRoot.getElementById('modal').classList.add('active');
    }

    openEditModal(id) {
        const restaurant = this.restaurants.find(r => r.id === id);
        if (!restaurant) return;

        this.currentEdit = restaurant;

        this.shadowRoot.getElementById('name').value = restaurant.name || '';
        this.shadowRoot.getElementById('city').value = restaurant.city || '';
        this.shadowRoot.getElementById('address').value = restaurant.address || '';
        this.shadowRoot.getElementById('phone').value = restaurant.phone || '';
        this.shadowRoot.getElementById('type').value = restaurant.type || 'restaurant';
        this.shadowRoot.getElementById('notes').value = restaurant.notes || '';
        this.shadowRoot.getElementById('modalTitle').textContent = 'Modifica Locale';
        this.shadowRoot.getElementById('error').style.display = 'none';
        this.shadowRoot.getElementById('modal').classList.add('active');
    }

    closeModal() {
        this.shadowRoot.getElementById('modal').classList.remove('active');
        this.currentEdit = null;
    }

    async handleSave() {
        const name = this.shadowRoot.getElementById('name').value.trim();
        const city = this.shadowRoot.getElementById('city').value.trim();
        const address = this.shadowRoot.getElementById('address').value.trim();
        const phone = this.shadowRoot.getElementById('phone').value.trim();
        const type = this.shadowRoot.getElementById('type').value;
        const notes = this.shadowRoot.getElementById('notes').value.trim();
        const error = this.shadowRoot.getElementById('error');
        const saveBtn = this.shadowRoot.getElementById('saveBtn');

        if (!name || !city) {
            error.textContent = 'Nome e Citt� sono obbligatori';
            error.style.display = 'block';
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Salvataggio...';
            error.style.display = 'none';

            const data = { name, city, address, phone, type, notes };
            const supabase = window.supabaseClient;

            if (this.currentEdit) {
                const response = await supabase
                    .from('tastes_database')
                    .update(data)
                    .eq('id', this.currentEdit.id);
                if (response.error) throw response.error;
            } else {
                const response = await supabase
                    .from('tastes_database')
                    .insert([data]);
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
            const response = await supabase
                .from('tastes_database')
                .delete()
                .eq('id', id);

            if (response.error) throw response.error;

            await this.loadRestaurants();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Errore durante l eliminazione: ' + err.message);
        }
    }
}

customElements.define('tastes-panel', TastesPanel);
