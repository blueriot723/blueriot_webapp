/**
 * eTicket Panel - Sistema generazione biglietti per passeggeri
 * Funzionalità:
 * - Upload template biglietto
 * - Gestione lista passeggeri
 * - Posizionamento nome con click
 * - Generazione biglietti con Canvas
 * - Download singolo/multiplo
 */
export class EticketPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tours = [];
        this.currentTour = null;
        this.passengers = [];
        this.template = null;
        this.namePosition = { x: 50, y: 50 }; // percentuale
        this.generatedTickets = [];
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadTours();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }

                .section { margin-bottom: 24px; }
                .section-title {
                    color: #00d4ff;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tour-select {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(10, 20, 30, 0.8);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                }
                .tour-select:focus {
                    outline: none;
                    border-color: #00d4ff;
                    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
                }

                .upload-area {
                    border: 2px dashed rgba(0, 212, 255, 0.3);
                    border-radius: 12px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(10, 20, 30, 0.5);
                }
                .upload-area:hover {
                    border-color: #00d4ff;
                    background: rgba(0, 212, 255, 0.05);
                }
                .upload-area.has-template {
                    padding: 20px;
                }

                .template-preview {
                    position: relative;
                    display: inline-block;
                    max-width: 100%;
                    cursor: crosshair;
                }
                .template-preview img {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 212, 255, 0.3);
                }
                .name-marker {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    background: #ff4fd8;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 0 15px rgba(255, 79, 216, 0.5);
                    pointer-events: none;
                }

                .passengers-controls {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: white;
                }
                .btn-primary:hover {
                    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
                }
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .btn-success {
                    background: linear-gradient(135deg, #00ff88, #00cc66);
                    color: white;
                }
                .btn-success:hover {
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
                }

                .passengers-list {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 8px;
                    background: rgba(10, 20, 30, 0.5);
                }

                .passenger-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
                }
                .passenger-item:last-child {
                    border-bottom: none;
                }
                .passenger-name {
                    color: white;
                    font-size: 14px;
                }
                .passenger-status {
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .status-pending {
                    background: rgba(255, 193, 7, 0.2);
                    color: #ffc107;
                }
                .status-generated {
                    background: rgba(0, 255, 136, 0.2);
                    color: #00ff88;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #8899aa;
                }

                .modal-backdrop {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                }
                .modal-backdrop.active {
                    display: flex;
                }
                .modal-content {
                    background: #0d1520;
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 12px;
                    padding: 24px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .modal-title {
                    color: #00d4ff;
                    font-size: 18px;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    color: #8899aa;
                    font-size: 12px;
                    margin-bottom: 6px;
                }
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 12px;
                    background: rgba(10, 20, 30, 0.8);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 6px;
                    color: white;
                    font-size: 14px;
                }
                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                .generated-tickets {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }
                .ticket-card {
                    background: rgba(10, 20, 30, 0.6);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                }
                .ticket-card img {
                    max-width: 100%;
                    height: 120px;
                    object-fit: contain;
                    border-radius: 4px;
                    margin-bottom: 8px;
                }
                .ticket-name {
                    color: white;
                    font-size: 13px;
                    margin-bottom: 8px;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(0, 212, 255, 0.2);
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 16px 0;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00d4ff, #ff4fd8);
                    transition: width 0.3s ease;
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                .alert-info {
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    color: #00d4ff;
                }
                .alert-success {
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    color: #00ff88;
                }
            </style>

            <div>
                <h2 style="color: #00d4ff; margin-bottom: 8px;">🎫 Sistema eTickets</h2>
                <p style="color: #8899aa; margin-bottom: 24px;">Genera biglietti personalizzati per i passeggeri del tour</p>

                <!-- Step 1: Seleziona Tour -->
                <div class="section">
                    <div class="section-title">1️⃣ Seleziona Tour</div>
                    <select class="tour-select" id="tourSelect">
                        <option value="">-- Seleziona un tour --</option>
                    </select>
                </div>

                <!-- Step 2: Template -->
                <div class="section" id="templateSection" style="display: none;">
                    <div class="section-title">2️⃣ Template Biglietto</div>
                    <div class="upload-area" id="uploadArea">
                        <div style="font-size: 48px; margin-bottom: 12px;">📤</div>
                        <div style="color: white; margin-bottom: 8px;">Carica immagine template</div>
                        <div style="color: #556677; font-size: 13px;">JPG, PNG - Clicca poi sull'immagine per posizionare il nome</div>
                        <input type="file" id="templateInput" accept="image/*" style="display: none;">
                    </div>
                    <div id="templatePreview" style="display: none; margin-top: 16px;">
                        <p style="color: #8899aa; font-size: 12px; margin-bottom: 8px;">👆 Clicca dove vuoi posizionare il nome del passeggero</p>
                        <div class="template-preview" id="previewContainer">
                            <img id="previewImage" alt="Template">
                            <div class="name-marker" id="nameMarker" style="display: none;">NOME</div>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Passeggeri -->
                <div class="section" id="passengersSection" style="display: none;">
                    <div class="section-title">3️⃣ Lista Passeggeri</div>
                    <div class="passengers-controls">
                        <button class="btn btn-primary" id="addPassengerBtn">+ Aggiungi Singolo</button>
                        <button class="btn btn-secondary" id="bulkAddBtn">📋 Aggiungi Multipli</button>
                        <button class="btn btn-secondary" id="importPdfBtn">📄 Importa da PDF</button>
                    </div>
                    <div class="passengers-list" id="passengersList">
                        <div class="empty-state">Nessun passeggero aggiunto</div>
                    </div>
                </div>

                <!-- Step 4: Genera -->
                <div class="section" id="generateSection" style="display: none;">
                    <div class="section-title">4️⃣ Genera Biglietti</div>
                    <div id="generateControls">
                        <button class="btn btn-success" id="generateAllBtn" style="width: 100%;">
                            🎫 Genera Tutti i Biglietti
                        </button>
                    </div>
                    <div id="progressContainer" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill" style="width: 0%;"></div>
                        </div>
                        <p id="progressText" style="color: #8899aa; text-align: center; font-size: 13px;">Generazione in corso...</p>
                    </div>
                </div>

                <!-- Step 5: Risultati -->
                <div class="section" id="resultsSection" style="display: none;">
                    <div class="section-title">5️⃣ Biglietti Generati</div>
                    <div class="passengers-controls">
                        <button class="btn btn-success" id="downloadAllBtn">📥 Scarica Tutti (ZIP)</button>
                    </div>
                    <div class="generated-tickets" id="ticketsList"></div>
                </div>
            </div>

            <!-- Modal Aggiungi Passeggero -->
            <div class="modal-backdrop" id="addModal">
                <div class="modal-content">
                    <div class="modal-title">Aggiungi Passeggero</div>
                    <div class="form-group">
                        <label class="form-label">Nome Completo *</label>
                        <input type="text" class="form-input" id="passengerName" placeholder="Mario Rossi">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email (opzionale)</label>
                        <input type="email" class="form-input" id="passengerEmail" placeholder="mario@email.com">
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn-secondary" id="cancelAddBtn">Annulla</button>
                        <button class="btn btn-primary" id="confirmAddBtn">Aggiungi</button>
                    </div>
                </div>
            </div>

            <!-- Modal Bulk Add -->
            <div class="modal-backdrop" id="bulkModal">
                <div class="modal-content">
                    <div class="modal-title">Aggiungi Multipli Passeggeri</div>
                    <div class="form-group">
                        <label class="form-label">Inserisci un nome per riga</label>
                        <textarea class="form-textarea" id="bulkNames" placeholder="Mario Rossi
Giuseppe Verdi
Anna Bianchi"></textarea>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn-secondary" id="cancelBulkBtn">Annulla</button>
                        <button class="btn btn-primary" id="confirmBulkBtn">Aggiungi Tutti</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tour selection
        this.shadowRoot.getElementById('tourSelect').addEventListener('change', (e) => {
            this.selectTour(e.target.value);
        });

        // Template upload
        const uploadArea = this.shadowRoot.getElementById('uploadArea');
        const templateInput = this.shadowRoot.getElementById('templateInput');

        uploadArea.addEventListener('click', () => templateInput.click());
        templateInput.addEventListener('change', (e) => this.handleTemplateUpload(e));

        // Template click for name position
        this.shadowRoot.getElementById('previewContainer').addEventListener('click', (e) => {
            this.handleTemplateClick(e);
        });

        // Passenger modals
        this.shadowRoot.getElementById('addPassengerBtn').addEventListener('click', () => {
            this.shadowRoot.getElementById('addModal').classList.add('active');
        });
        this.shadowRoot.getElementById('cancelAddBtn').addEventListener('click', () => {
            this.shadowRoot.getElementById('addModal').classList.remove('active');
        });
        this.shadowRoot.getElementById('confirmAddBtn').addEventListener('click', () => this.addSinglePassenger());

        this.shadowRoot.getElementById('bulkAddBtn').addEventListener('click', () => {
            this.shadowRoot.getElementById('bulkModal').classList.add('active');
        });
        this.shadowRoot.getElementById('cancelBulkBtn').addEventListener('click', () => {
            this.shadowRoot.getElementById('bulkModal').classList.remove('active');
        });
        this.shadowRoot.getElementById('confirmBulkBtn').addEventListener('click', () => this.addBulkPassengers());

        // PDF import
        this.shadowRoot.getElementById('importPdfBtn').addEventListener('click', () => {
            alert('Per importare passeggeri da PDF:\n1. Vai alla sezione PDF OCR\n2. Carica il PDF della rooming list\n3. I passeggeri saranno estratti automaticamente');
        });

        // Generate tickets
        this.shadowRoot.getElementById('generateAllBtn').addEventListener('click', () => this.generateAllTickets());

        // Download all
        this.shadowRoot.getElementById('downloadAllBtn').addEventListener('click', () => this.downloadAllTickets());
    }

    async loadTours() {
        const select = this.shadowRoot.getElementById('tourSelect');

        try {
            const supabase = window.supabaseClient;
            if (!supabase) {
                select.innerHTML = '<option value="">Database non disponibile</option>';
                return;
            }

            const { data: user } = await supabase.auth.getUser();
            if (!user?.user) return;

            // Get TL profile
            const { data: tlProfile } = await supabase
                .from('tl_users')
                .select('id')
                .eq('user_id', user.user.id)
                .single();

            if (!tlProfile) {
                select.innerHTML = '<option value="">Profilo TL non trovato</option>';
                return;
            }

            // Get tours
            const { data: tours, error } = await supabase
                .from('tours')
                .select('*')
                .eq('tl_id', tlProfile.id)
                .order('start_date', { ascending: false });

            if (error) throw error;

            this.tours = tours || [];

            select.innerHTML = '<option value="">-- Seleziona un tour --</option>' +
                this.tours.map(t =>
                    `<option value="${t.id}">${t.code} - ${t.name} (${t.start_date})</option>`
                ).join('');

        } catch (error) {
            console.error('Error loading tours:', error);
            select.innerHTML = '<option value="">Errore caricamento</option>';
        }
    }

    async selectTour(tourId) {
        if (!tourId) {
            this.currentTour = null;
            this.shadowRoot.getElementById('templateSection').style.display = 'none';
            this.shadowRoot.getElementById('passengersSection').style.display = 'none';
            this.shadowRoot.getElementById('generateSection').style.display = 'none';
            this.shadowRoot.getElementById('resultsSection').style.display = 'none';
            return;
        }

        this.currentTour = this.tours.find(t => t.id === tourId);
        this.shadowRoot.getElementById('templateSection').style.display = 'block';
        this.shadowRoot.getElementById('passengersSection').style.display = 'block';

        // Load existing template
        await this.loadTemplate();

        // Load existing passengers
        await this.loadPassengers();
    }

    async loadTemplate() {
        if (!this.currentTour) return;

        try {
            const supabase = window.supabaseClient;
            const { data } = await supabase
                .from('ticket_templates')
                .select('*')
                .eq('tour_id', this.currentTour.id)
                .single();

            if (data) {
                this.template = data;
                this.namePosition = {
                    x: data.name_position_x || 50,
                    y: data.name_position_y || 50
                };
                this.displayTemplate(data.template_file_url);
            }
        } catch (error) {
            // No template yet, that's OK
        }
    }

    async loadPassengers() {
        if (!this.currentTour) return;

        try {
            const supabase = window.supabaseClient;
            const { data, error } = await supabase
                .from('tour_passengers')
                .select('*')
                .eq('tour_id', this.currentTour.id)
                .order('full_name');

            if (error) throw error;

            this.passengers = data || [];
            this.displayPassengers();
            this.updateGenerateSection();

        } catch (error) {
            console.error('Error loading passengers:', error);
        }
    }

    displayPassengers() {
        const container = this.shadowRoot.getElementById('passengersList');

        if (this.passengers.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun passeggero aggiunto</div>';
            return;
        }

        container.innerHTML = this.passengers.map(p => `
            <div class="passenger-item">
                <span class="passenger-name">${p.full_name}</span>
                <span class="passenger-status ${p.ticket_generated ? 'status-generated' : 'status-pending'}">
                    ${p.ticket_generated ? '✅ Generato' : '⏳ In attesa'}
                </span>
            </div>
        `).join('');
    }

    updateGenerateSection() {
        const section = this.shadowRoot.getElementById('generateSection');
        const pendingCount = this.passengers.filter(p => !p.ticket_generated).length;

        if (this.template && this.passengers.length > 0 && pendingCount > 0) {
            section.style.display = 'block';
        } else if (this.passengers.length > 0) {
            section.style.display = 'none';
            this.shadowRoot.getElementById('resultsSection').style.display = 'block';
        }
    }

    async handleTemplateUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target.result;

                // Save to database
                const supabase = window.supabaseClient;
                const templateData = {
                    tour_id: this.currentTour.id,
                    template_name: file.name,
                    template_file_url: base64,
                    name_position_x: this.namePosition.x,
                    name_position_y: this.namePosition.y
                };

                const { data, error } = await supabase
                    .from('ticket_templates')
                    .upsert(templateData, { onConflict: 'tour_id' })
                    .select()
                    .single();

                if (error) throw error;

                this.template = data;
                this.displayTemplate(base64);
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error uploading template:', error);
            alert('Errore upload: ' + error.message);
        }
    }

    displayTemplate(url) {
        const uploadArea = this.shadowRoot.getElementById('uploadArea');
        const preview = this.shadowRoot.getElementById('templatePreview');
        const img = this.shadowRoot.getElementById('previewImage');
        const marker = this.shadowRoot.getElementById('nameMarker');

        uploadArea.classList.add('has-template');
        uploadArea.innerHTML = `
            <div style="color: #00ff88; margin-bottom: 8px;">✅ Template caricato</div>
            <div style="color: #556677; font-size: 12px;">Clicca per sostituire</div>
            <input type="file" id="templateInput" accept="image/*" style="display: none;">
        `;

        // Re-attach event listener
        const newInput = uploadArea.querySelector('#templateInput');
        uploadArea.addEventListener('click', () => newInput.click());
        newInput.addEventListener('change', (e) => this.handleTemplateUpload(e));

        img.src = url;
        preview.style.display = 'block';

        marker.style.display = 'block';
        marker.style.left = this.namePosition.x + '%';
        marker.style.top = this.namePosition.y + '%';

        this.updateGenerateSection();
    }

    handleTemplateClick(e) {
        const container = this.shadowRoot.getElementById('previewContainer');
        const marker = this.shadowRoot.getElementById('nameMarker');
        const rect = container.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        this.namePosition = { x, y };
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.style.display = 'block';

        // Update in database
        if (this.template) {
            window.supabaseClient
                .from('ticket_templates')
                .update({ name_position_x: Math.round(x), name_position_y: Math.round(y) })
                .eq('id', this.template.id)
                .then(() => console.log('Position saved'));
        }
    }

    async addSinglePassenger() {
        const nameInput = this.shadowRoot.getElementById('passengerName');
        const emailInput = this.shadowRoot.getElementById('passengerEmail');
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
            alert('Inserisci il nome del passeggero');
            return;
        }

        try {
            const supabase = window.supabaseClient;
            const { error } = await supabase
                .from('tour_passengers')
                .insert([{
                    tour_id: this.currentTour.id,
                    full_name: name,
                    email: email || null,
                    ticket_generated: false
                }]);

            if (error) throw error;

            nameInput.value = '';
            emailInput.value = '';
            this.shadowRoot.getElementById('addModal').classList.remove('active');

            await this.loadPassengers();

        } catch (error) {
            console.error('Error adding passenger:', error);
            alert('Errore: ' + error.message);
        }
    }

    async addBulkPassengers() {
        const textarea = this.shadowRoot.getElementById('bulkNames');
        const lines = textarea.value.split('\n').map(l => l.trim()).filter(l => l);

        if (lines.length === 0) {
            alert('Inserisci almeno un nome');
            return;
        }

        try {
            const supabase = window.supabaseClient;
            const passengers = lines.map(name => ({
                tour_id: this.currentTour.id,
                full_name: name,
                ticket_generated: false
            }));

            const { error } = await supabase
                .from('tour_passengers')
                .insert(passengers);

            if (error) throw error;

            textarea.value = '';
            this.shadowRoot.getElementById('bulkModal').classList.remove('active');

            await this.loadPassengers();
            alert(`✅ ${lines.length} passeggeri aggiunti!`);

        } catch (error) {
            console.error('Error adding passengers:', error);
            alert('Errore: ' + error.message);
        }
    }

    async generateAllTickets() {
        if (!this.template || this.passengers.length === 0) {
            alert('Carica un template e aggiungi passeggeri prima');
            return;
        }

        const pendingPassengers = this.passengers.filter(p => !p.ticket_generated);
        if (pendingPassengers.length === 0) {
            alert('Tutti i biglietti sono già stati generati');
            return;
        }

        const controls = this.shadowRoot.getElementById('generateControls');
        const progress = this.shadowRoot.getElementById('progressContainer');
        const progressFill = this.shadowRoot.getElementById('progressFill');
        const progressText = this.shadowRoot.getElementById('progressText');

        controls.style.display = 'none';
        progress.style.display = 'block';

        this.generatedTickets = [];

        for (let i = 0; i < pendingPassengers.length; i++) {
            const passenger = pendingPassengers[i];
            const pct = Math.round(((i + 1) / pendingPassengers.length) * 100);

            progressFill.style.width = pct + '%';
            progressText.textContent = `Generazione ${i + 1}/${pendingPassengers.length}: ${passenger.full_name}`;

            try {
                const ticketUrl = await this.generateSingleTicket(passenger.full_name);
                this.generatedTickets.push({
                    passenger,
                    url: ticketUrl
                });

                // Update passenger in database
                await window.supabaseClient
                    .from('tour_passengers')
                    .update({ ticket_generated: true, ticket_url: ticketUrl })
                    .eq('id', passenger.id);

            } catch (error) {
                console.error('Error generating ticket for', passenger.full_name, error);
            }

            // Small delay for visual feedback
            await new Promise(r => setTimeout(r, 100));
        }

        progress.style.display = 'none';
        controls.style.display = 'block';

        await this.loadPassengers();
        this.displayGeneratedTickets();
    }

    async generateSingleTicket(passengerName) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw template
                ctx.drawImage(img, 0, 0);

                // Calculate position
                const x = (this.namePosition.x / 100) * img.width;
                const y = (this.namePosition.y / 100) * img.height;

                // Draw name
                const fontSize = Math.max(24, Math.floor(img.width / 20));
                ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                ctx.fillStyle = this.template.font_color || '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Add shadow for readability
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 4;
                ctx.fillText(passengerName, x, y);

                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = reject;
            img.src = this.template.template_file_url;
        });
    }

    displayGeneratedTickets() {
        const section = this.shadowRoot.getElementById('resultsSection');
        const container = this.shadowRoot.getElementById('ticketsList');

        section.style.display = 'block';

        container.innerHTML = this.generatedTickets.map((t, i) => `
            <div class="ticket-card">
                <img src="${t.url}" alt="Ticket">
                <div class="ticket-name">${t.passenger.full_name}</div>
                <button class="btn btn-secondary" style="width: 100%; font-size: 12px;" onclick="this.getRootNode().host.downloadSingleTicket(${i})">
                    📥 Scarica
                </button>
            </div>
        `).join('');
    }

    downloadSingleTicket(index) {
        const ticket = this.generatedTickets[index];
        if (!ticket) return;

        const link = document.createElement('a');
        link.href = ticket.url;
        link.download = `ticket_${ticket.passenger.full_name.replace(/\s+/g, '_')}.png`;
        link.click();
    }

    async downloadAllTickets() {
        if (this.generatedTickets.length === 0) {
            alert('Nessun biglietto da scaricare');
            return;
        }

        // Simple approach: download each one
        for (const ticket of this.generatedTickets) {
            const link = document.createElement('a');
            link.href = ticket.url;
            link.download = `ticket_${ticket.passenger.full_name.replace(/\s+/g, '_')}.png`;
            link.click();
            await new Promise(r => setTimeout(r, 300));
        }
    }
}

customElements.define('eticket-panel', EticketPanel);
