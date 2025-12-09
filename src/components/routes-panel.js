/**
 * ROUTES Panel Component - Transport Database
 */
export class RoutesPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.routes = [];
        this.currentEdit = null;
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadRoutes();
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

                .routes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }

                .route-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    transition: all var(--transition-normal);
                }

                .route-card:hover {
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
                <p style="color: var(--text-secondary);">Database trasporti: bus, treni, ferry, taxi, NCC</p>
                <button class="btn btn-primary" id="addBtn">+ Aggiungi Trasporto</button>
            </div>

            <div id="routesList" class="routes-grid">
                <div class="empty-state">Caricamento...</div>
            </div>

            <div class="modal-backdrop" id="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Aggiungi Trasporto</h3>
                        <button class="modal-close" id="closeBtn">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="form">
                            <div class="form-group">
                                <label class="form-label">Tipo Trasporto *</label>
                                <select class="form-select" id="transportType" required>
                                    <option value="bus">🚌 Bus</option>
                                    <option value="train">🚂 Treno</option>
                                    <option value="ferry">⛴️ Ferry</option>
                                    <option value="taxi">🚕 Taxi</option>
                                    <option value="ncc">🚗 NCC</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Operatore *</label>
                                <input type="text" class="form-input" id="operatorName" required placeholder="es. Trenitalia">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Area Servita</label>
                                <input type="text" class="form-input" id="areaServed" placeholder="es. Toscana">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Prezzo</label>
                                <input type="text" class="form-input" id="price" placeholder="es. €25-45">
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

    async loadRoutes() {
        const container = this.shadowRoot.getElementById('routesList');
        try {
            const supabase = window.supabaseClient;
            const response = await supabase.from('blueriot_routes').select('*').order('area_served');
            this.routes = response.data || [];
            this.displayRoutes();
        } catch (error) {
            container.innerHTML = '<div class="empty-state" style="color: var(--error);">Errore caricamento</div>';
        }
    }

    displayRoutes() {
        const container = this.shadowRoot.getElementById('routesList');
        if (this.routes.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun trasporto ancora</div>';
            return;
        }
        const html = this.routes.map(r => \`
            <div class="route-card">
                <h4>\${r.operator_name}</h4>
                <div style="color: var(--text-secondary); margin: 8px 0;">🚌 \${r.transport_type}</div>
                <div style="color: var(--text-secondary);">📍 \${r.area_served || 'N/A'}</div>
                \${r.price ? \`<div style="color: var(--text-secondary);">💰 \${r.price}</div>\` : ''}
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
        const transportType = this.shadowRoot.getElementById('transportType').value;
        const operatorName = this.shadowRoot.getElementById('operatorName').value.trim();
        const areaServed = this.shadowRoot.getElementById('areaServed').value.trim();
        const price = this.shadowRoot.getElementById('price').value.trim();
        const notes = this.shadowRoot.getElementById('notes').value.trim();

        if (!operatorName) return;

        try {
            const supabase = window.supabaseClient;
            await supabase.from('blueriot_routes').insert([{
                transport_type: transportType,
                operator_name: operatorName,
                area_served: areaServed,
                price,
                notes
            }]);
            await this.loadRoutes();
            this.closeModal();
        } catch (err) {
            this.shadowRoot.getElementById('error').textContent = err.message;
            this.shadowRoot.getElementById('error').style.display = 'block';
        }
    }
}

customElements.define('routes-panel', RoutesPanel);
