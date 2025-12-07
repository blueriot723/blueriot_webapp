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
                :host {
                    display: block;
                    --neon-cyan: #00f0ff;
                    --neon-fuchsia: #ff00ff;
                    --text-secondary: #8899aa;
                    --bg-card: rgba(10, 14, 39, 0.6);
                    --spacing-xs: 4px;
                    --spacing-sm: 8px;
                    --spacing-md: 12px;
                    --spacing-lg: 16px;
                    --spacing-xl: 24px;
                    --spacing-2xl: 32px;
                    --radius-sm: 4px;
                    --radius-lg: 12px;
                }

                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .restaurants-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }

                .restaurant-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    transition: all 0.3s ease;
                }

                .restaurant-card:hover {
                    border-color: rgba(0, 240, 255, 0.4);
                    box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
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
                    color: #fff;
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

                .btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #00f0ff, #0080ff);
                    color: white;
                }
                .btn-primary:hover {
                    box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
                }

                .btn-secondary {
                    background: rgba(0, 240, 255, 0.1);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    color: var(--neon-cyan);
                }

                .btn-danger {
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    color: #ff4757;
                }

                .btn-icon {
                    width: 36px;
                    height: 36px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    background: rgba(0, 240, 255, 0.15);
                    color: var(--neon-cyan);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-secondary);
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
                    background: #0a0e27;
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    border-radius: var(--radius-lg);
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 0 24px rgba(0, 240, 255, 0.5), 0 0 48px rgba(0, 240, 255, 0.3);
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
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
                    border: 1px solid rgba(255, 0, 255, 0.3);
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
                    border-top: 1px solid rgba(0, 240, 255, 0.2);
                    display: flex;
                    gap: var(--spacing-md);
                    justify-content: flex-end;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    color: var(--text-secondary);
                    font-size: 13px;
                    margin-bottom: 6px;
                }

                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 6px;
                    color: #fff;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--neon-cyan);
                    box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
                }

                .form-textarea {
                    min-height: 80px;
                    resize: vertical;
                }

                .alert-error {
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    color: #ff4757;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 13px;
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
                        <button class="modal-close" id="closeBtn">X</button>
                    </div>
                    <div class="modal-body">
                        <form id="restaurantForm">
                            <div class="form-group">
                                <label class="form-label">Nome Locale *</label>
                                <input type="text" class="form-input" id="name" required placeholder="es. Trattoria da Mario">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Citta *</label>
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
                                    <option value="restaurant">Ristorante</option>
                                    <option value="bar">Bar/Caffe</option>
                                    <option value="gelateria">Gelateria</option>
                                    <option value="pizzeria">Pizzeria</option>
                                    <option value="pub">Pub</option>
                                    <option value="other">Altro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Note</label>
                                <textarea class="form-textarea" id="notes" placeholder="Note aggiuntive..."></textarea>
                            </div>
                            <div class="alert-error" id="error" style="display: none;"></div>
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

            // Try blueriot_tastes first, fall back to shared_restaurants
            let response = await supabase
                .from('blueriot_tastes')
                .select('*')
                .order('city', { ascending: true });

            if (response.error) {
                response = await supabase
                    .from('shared_restaurants')
                    .select('*')
                    .order('city', { ascending: true });
            }

            if (response.error) throw response.error;

            this.restaurants = response.data || [];
            this.displayRestaurants();
        } catch (error) {
            console.error('Load error:', error);
            container.innerHTML = '<div class="empty-state" style="color: #ff4757;">Errore caricamento: ' + error.message + '</div>';
        }
    }

    displayRestaurants() {
        const container = this.shadowRoot.getElementById('restaurantsList');

        if (this.restaurants.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun locale ancora. Clicca "+ Aggiungi Locale" per iniziare.</div>';
            return;
        }

        container.innerHTML = this.restaurants.map(r => {
            const typeLabel = this.getTypeLabel(r.type || r.cuisine || 'restaurant');
            const cityText = r.city || r.location || 'N/A';
            const ratingHtml = r.rating_avg ? `<div class="restaurant-meta">* ${parseFloat(r.rating_avg).toFixed(1)}</div>` : '';

            return `
                <div class="restaurant-card">
                    <div class="restaurant-header">
                        <div>
                            <div class="restaurant-title">${r.name || r.restaurant_name || 'N/A'}</div>
                            <span class="badge">${typeLabel}</span>
                        </div>
                        <div class="restaurant-actions">
                            <button class="btn btn-secondary btn-icon" data-id="${r.id}" data-action="edit">E</button>
                            <button class="btn btn-danger btn-icon" data-id="${r.id}" data-action="delete">X</button>
                        </div>
                    </div>
                    <div class="restaurant-meta">@ ${cityText}</div>
                    ${r.address ? `<div class="restaurant-meta"># ${r.address}</div>` : ''}
                    ${r.phone ? `<div class="restaurant-meta">T ${r.phone}</div>` : ''}
                    ${ratingHtml}
                    ${r.notes ? `<div class="restaurant-meta" style="margin-top: 8px;">N ${r.notes}</div>` : ''}
                </div>
            `;
        }).join('');

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
            restaurant: 'Ristorante',
            ristorante: 'Ristorante',
            bar: 'Bar/Caffe',
            gelateria: 'Gelateria',
            pizzeria: 'Pizzeria',
            pub: 'Pub',
            other: 'Altro'
        };
        return labels[type?.toLowerCase()] || type || 'Locale';
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
        this.shadowRoot.getElementById('city').value = restaurant.city || restaurant.location || '';
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
            error.textContent = 'Nome e Citta sono obbligatori';
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
                    .from('blueriot_tastes')
                    .update(data)
                    .eq('id', this.currentEdit.id);
                if (response.error) throw response.error;
            } else {
                const response = await supabase
                    .from('blueriot_tastes')
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
                .from('blueriot_tastes')
                .delete()
                .eq('id', id);

            if (response.error) throw response.error;

            await this.loadRestaurants();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Errore durante eliminazione: ' + err.message);
        }
    }
}

customElements.define('tastes-panel', TastesPanel);
