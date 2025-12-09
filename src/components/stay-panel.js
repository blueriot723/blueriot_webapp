/**
 * STAY Panel Component - Hotel/Accommodation Database
 */
export class StayPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.stays = [];
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadStays();
    }

    render() {
        this.shadowRoot.innerHTML = \`
            <style>
                /* CSS variables must be defined inline for Shadow DOM */
                :host {
                    display: block;
                    --spacing-xs: 4px; --spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 24px; --spacing-xl: 32px; --spacing-2xl: 48px;
                    --bg-card: #0D1117; --text-muted: #525866; --radius-lg: 12px;
                    --transition-normal: 300ms ease;
                }

                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                }

                .stays-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }

                .stay-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    transition: all var(--transition-normal);
                }

                .stay-card:hover {
                    border-color: rgba(0, 200, 255, 0.4);
                    box-shadow: 0 0 12px rgba(0, 200, 255, 0.3);
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-muted);
                }
            </style>

            <div class="header-actions">
                <p style="color: var(--text-secondary);">Database hotel, B&B, ostelli e strutture testate</p>
                <button class="btn btn-primary" id="addBtn">+ Aggiungi Struttura</button>
            </div>

            <div id="staysList" class="stays-grid">
                <div class="empty-state">Caricamento...</div>
            </div>

            <div class="modal-backdrop" id="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Aggiungi Struttura</h3>
                        <button class="modal-close" id="closeBtn">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="form">
                            <div class="form-group">
                                <label class="form-label">Nome Struttura *</label>
                                <input type="text" class="form-input" id="name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo *</label>
                                <select class="form-select" id="type" required>
                                    <option value="hotel">🏨 Hotel</option>
                                    <option value="hostel">🛏️ Ostello</option>
                                    <option value="bb">🏡 B&B</option>
                                    <option value="apartment">🏢 Appartamento</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Località *</label>
                                <input type="text" class="form-input" id="location" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fascia Prezzo</label>
                                <input type="text" class="form-input" id="priceRange" placeholder="es. €50-80/notte">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Note</label>
                                <textarea class="form-textarea" id="notes"></textarea>
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
        \`;
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('addBtn').addEventListener('click', () => this.openAddModal());
        this.shadowRoot.getElementById('closeBtn').addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('saveBtn').addEventListener('click', () => this.handleSave());
    }

    async loadStays() {
        const container = this.shadowRoot.getElementById('staysList');
        try {
            const supabase = window.supabaseClient;
            const response = await supabase.from('blueriot_stay').select('*').order('location');
            this.stays = response.data || [];
            this.displayStays();
        } catch (error) {
            container.innerHTML = '<div class="empty-state" style="color: var(--error);">Errore caricamento</div>';
        }
    }

    displayStays() {
        const container = this.shadowRoot.getElementById('staysList');
        if (this.stays.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessuna struttura ancora</div>';
            return;
        }
        const html = this.stays.map(s => \`
            <div class="stay-card">
                <h4>\${s.name}</h4>
                <div style="color: var(--text-secondary); margin: 8px 0;">🏨 \${s.type}</div>
                <div style="color: var(--text-secondary);">📍 \${s.location}</div>
                \${s.price_range ? \`<div style="color: var(--text-secondary);">💰 \${s.price_range}</div>\` : ''}
            </div>
        \`).join('');
        container.innerHTML = html;
    }

    openAddModal() {
        this.shadowRoot.getElementById('modal').classList.add('active');
    }

    closeModal() {
        this.shadowRoot.getElementById('modal').classList.remove('active');
    }

    async handleSave() {
        const name = this.shadowRoot.getElementById('name').value.trim();
        const type = this.shadowRoot.getElementById('type').value;
        const location = this.shadowRoot.getElementById('location').value.trim();
        const priceRange = this.shadowRoot.getElementById('priceRange').value.trim();
        const notes = this.shadowRoot.getElementById('notes').value.trim();

        if (!name || !location) return;

        try {
            const supabase = window.supabaseClient;
            await supabase.from('blueriot_stay').insert([{
                name, type, location,
                price_range: priceRange,
                notes
            }]);
            await this.loadStays();
            this.closeModal();
        } catch (err) {
            this.shadowRoot.getElementById('error').textContent = err.message;
            this.shadowRoot.getElementById('error').style.display = 'block';
        }
    }
}

customElements.define('stay-panel', StayPanel);
