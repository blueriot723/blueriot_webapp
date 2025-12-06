/**
 * NODE Panel Component - Cities/Points of Interest Database
 */
export class NodePanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.nodes = [];
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadNodes();
    }

    render() {
        this.shadowRoot.innerHTML = \`
            <link rel="stylesheet" href="src/styles/base.css">
            <link rel="stylesheet" href="src/styles/layout.css">
            <link rel="stylesheet" href="src/styles/components.css">

            <style>
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                }

                .nodes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }

                .node-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    transition: all var(--transition-normal);
                }

                .node-card:hover {
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
                <p style="color: var(--text-secondary);">Database città e punti di interesse</p>
                <button class="btn btn-primary" id="addBtn">+ Aggiungi Node</button>
            </div>

            <div id="nodesList" class="nodes-grid">
                <div class="empty-state">Caricamento...</div>
            </div>

            <div class="modal-backdrop" id="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Aggiungi Node</h3>
                        <button class="modal-close" id="closeBtn">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="form">
                            <div class="form-group">
                                <label class="form-label">Nome Località *</label>
                                <input type="text" class="form-input" id="name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Regione/Paese *</label>
                                <input type="text" class="form-input" id="region" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-select" id="type">
                                    <option value="city">🏙️ Città</option>
                                    <option value="town">🏘️ Paese</option>
                                    <option value="poi">📍 Punto di Interesse</option>
                                </select>
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

    async loadNodes() {
        const container = this.shadowRoot.getElementById('nodesList');
        try {
            const supabase = window.supabaseClient;
            const response = await supabase.from('nodes').select('*').order('name');
            this.nodes = response.data || [];
            this.displayNodes();
        } catch (error) {
            container.innerHTML = '<div class="empty-state" style="color: var(--error);">Errore caricamento</div>';
        }
    }

    displayNodes() {
        const container = this.shadowRoot.getElementById('nodesList');
        if (this.nodes.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun node ancora</div>';
            return;
        }
        const html = this.nodes.map(n => \`
            <div class="node-card">
                <h4>\${n.name}</h4>
                <div style="color: var(--text-secondary); margin: 8px 0;">📍 \${n.type || 'city'}</div>
                <div style="color: var(--text-secondary);">🌍 \${n.region}</div>
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
        const region = this.shadowRoot.getElementById('region').value.trim();
        const type = this.shadowRoot.getElementById('type').value;
        const notes = this.shadowRoot.getElementById('notes').value.trim();

        if (!name || !region) return;

        try {
            const supabase = window.supabaseClient;
            await supabase.from('nodes').insert([{ name, region, type, notes }]);
            await this.loadNodes();
            this.closeModal();
        } catch (err) {
            this.shadowRoot.getElementById('error').textContent = err.message;
            this.shadowRoot.getElementById('error').style.display = 'block';
        }
    }
}

customElements.define('node-panel', NodePanel);
