/**
 * PDF OCR Panel - Extract data from PDF documents
 * Features:
 * - Extract hotels, restaurants, contacts from contracts
 * - Extract passenger lists from rooming lists
 * - Pattern recognition for Italian documents
 * - One-click add to database
 */
export class PdfOcrPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.extractedData = [];
        this.extractedPassengers = [];
        this.extractionMode = 'entities'; // 'entities' or 'passengers'
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadPdfJs();
    }

    async loadPdfJs() {
        if (window.pdfjsLib) return;

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };
        document.head.appendChild(script);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }

                .mode-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .mode-tab {
                    flex: 1;
                    padding: 16px;
                    background: rgba(10, 20, 30, 0.6);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 8px;
                    color: #8899aa;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }
                .mode-tab:hover {
                    border-color: rgba(0, 212, 255, 0.4);
                }
                .mode-tab.active {
                    background: rgba(0, 212, 255, 0.1);
                    border-color: #00d4ff;
                    color: #00d4ff;
                }
                .mode-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .upload-area {
                    border: 2px dashed rgba(0, 212, 255, 0.3);
                    border-radius: 12px;
                    padding: 48px 24px;
                    text-align: center;
                    margin-bottom: 24px;
                    background: rgba(10, 20, 30, 0.5);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .upload-area:hover {
                    border-color: #00d4ff;
                    background: rgba(0, 212, 255, 0.05);
                }
                .upload-area.dragover {
                    border-color: #ff4fd8;
                    background: rgba(255, 79, 216, 0.05);
                }
                .upload-icon {
                    font-size: 56px;
                    margin-bottom: 16px;
                }

                .processing {
                    text-align: center;
                    padding: 48px;
                    background: rgba(10, 20, 30, 0.5);
                    border-radius: 12px;
                    margin-bottom: 24px;
                }
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(0, 212, 255, 0.2);
                    border-top-color: #00d4ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .results-grid {
                    display: grid;
                    gap: 16px;
                }
                .result-card {
                    background: rgba(10, 20, 30, 0.6);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.3s ease;
                }
                .result-card:hover {
                    border-color: rgba(0, 212, 255, 0.4);
                }
                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 12px;
                }
                .result-title {
                    font-size: 17px;
                    font-weight: 600;
                    color: white;
                }
                .result-type {
                    font-size: 12px;
                    color: #8899aa;
                    margin-top: 4px;
                }
                .result-data {
                    color: #8899aa;
                    font-size: 14px;
                    margin: 6px 0;
                }

                .confidence {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .confidence-high {
                    background: rgba(0, 255, 136, 0.15);
                    color: #00ff88;
                    border: 1px solid rgba(0, 255, 136, 0.3);
                }
                .confidence-medium {
                    background: rgba(255, 193, 7, 0.15);
                    color: #ffc107;
                    border: 1px solid rgba(255, 193, 7, 0.3);
                }
                .confidence-low {
                    background: rgba(255, 71, 87, 0.15);
                    color: #ff4757;
                    border: 1px solid rgba(255, 71, 87, 0.3);
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
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: white;
                }
                .btn-primary:hover {
                    box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
                }
                .btn-success {
                    background: linear-gradient(135deg, #00ff88, #00cc66);
                    color: white;
                }
                .btn-success:hover {
                    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
                }

                .passengers-list {
                    background: rgba(10, 20, 30, 0.6);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .passengers-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: rgba(0, 212, 255, 0.1);
                    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
                }
                .passengers-count {
                    color: #00d4ff;
                    font-weight: 600;
                }
                .passenger-row {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
                }
                .passenger-row:last-child {
                    border-bottom: none;
                }
                .passenger-checkbox {
                    margin-right: 12px;
                    width: 18px;
                    height: 18px;
                    accent-color: #00d4ff;
                }
                .passenger-name {
                    color: white;
                    font-size: 14px;
                }

                .tour-select {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(10, 20, 30, 0.8);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    margin-bottom: 16px;
                }

                .alert {
                    padding: 16px 20px;
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
                .alert-error {
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    color: #ff4757;
                }
            </style>

            <div>
                <h2 style="color: #00d4ff; margin-bottom: 8px;">📄 PDF OCR Engine</h2>
                <p style="color: #8899aa; margin-bottom: 24px;">
                    Estrai automaticamente informazioni da documenti PDF
                </p>

                <!-- Mode Tabs -->
                <div class="mode-tabs">
                    <div class="mode-tab active" data-mode="entities">
                        <div class="mode-icon">🏨</div>
                        Hotel & Ristoranti
                    </div>
                    <div class="mode-tab" data-mode="passengers">
                        <div class="mode-icon">👥</div>
                        Lista Passeggeri
                    </div>
                </div>

                <!-- Upload Area -->
                <div class="upload-area" id="uploadArea">
                    <div class="upload-icon">📄</div>
                    <div style="color: white; margin-bottom: 8px; font-size: 16px;">
                        Trascina qui un file PDF o clicca per selezionare
                    </div>
                    <div style="color: #556677; font-size: 13px;" id="uploadHint">
                        Supporta: contratti hotel, menu ristoranti, rooming list
                    </div>
                    <input type="file" id="fileInput" accept=".pdf" style="display: none;">
                </div>

                <!-- Processing -->
                <div id="processing" style="display: none;" class="processing">
                    <div class="spinner"></div>
                    <div style="color: #00d4ff; font-size: 16px;" id="processingStatus">Elaborazione PDF...</div>
                </div>

                <!-- Entity Results -->
                <div id="entityResults" class="results-grid"></div>

                <!-- Passenger Results -->
                <div id="passengerResults" style="display: none;">
                    <div id="tourSelectSection" style="margin-bottom: 16px;">
                        <label style="color: #8899aa; display: block; margin-bottom: 8px; font-size: 13px;">
                            Seleziona il tour per importare i passeggeri:
                        </label>
                        <select class="tour-select" id="tourSelect">
                            <option value="">-- Carica prima un PDF --</option>
                        </select>
                    </div>
                    <div id="passengersListContainer"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const uploadArea = this.shadowRoot.getElementById('uploadArea');
        const fileInput = this.shadowRoot.getElementById('fileInput');

        // Mode tabs
        this.shadowRoot.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.shadowRoot.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.extractionMode = tab.dataset.mode;
                this.updateUploadHint();
                this.clearResults();
            });
        });

        // File upload
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                this.processPdf(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.processPdf(file);
        });
    }

    updateUploadHint() {
        const hint = this.shadowRoot.getElementById('uploadHint');
        if (this.extractionMode === 'passengers') {
            hint.textContent = 'Carica una rooming list per estrarre i nomi dei passeggeri';
        } else {
            hint.textContent = 'Supporta: contratti hotel, menu ristoranti, guide turistiche';
        }
    }

    clearResults() {
        this.shadowRoot.getElementById('entityResults').innerHTML = '';
        this.shadowRoot.getElementById('entityResults').style.display = 'none';
        this.shadowRoot.getElementById('passengerResults').style.display = 'none';
        this.extractedData = [];
        this.extractedPassengers = [];
    }

    async processPdf(file) {
        const processing = this.shadowRoot.getElementById('processing');
        const status = this.shadowRoot.getElementById('processingStatus');

        processing.style.display = 'block';
        this.clearResults();

        try {
            status.textContent = 'Caricamento PDF...';
            const arrayBuffer = await file.arrayBuffer();

            status.textContent = 'Estrazione testo...';
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                status.textContent = `Pagina ${i} di ${pdf.numPages}...`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            status.textContent = 'Analisi dati...';

            if (this.extractionMode === 'passengers') {
                this.extractedPassengers = this.extractPassengers(fullText);
                processing.style.display = 'none';
                await this.displayPassengerResults();
            } else {
                this.extractedData = this.extractEntities(fullText);
                processing.style.display = 'none';
                this.displayEntityResults();
            }

        } catch (error) {
            console.error('PDF processing error:', error);
            processing.style.display = 'none';

            if (this.extractionMode === 'passengers') {
                this.shadowRoot.getElementById('passengerResults').style.display = 'block';
                this.shadowRoot.getElementById('passengersListContainer').innerHTML =
                    `<div class="alert alert-error">Errore elaborazione: ${error.message}</div>`;
            } else {
                this.shadowRoot.getElementById('entityResults').style.display = 'grid';
                this.shadowRoot.getElementById('entityResults').innerHTML =
                    `<div class="alert alert-error">Errore elaborazione: ${error.message}</div>`;
            }
        }
    }

    extractEntities(text) {
        const entities = [];

        // Extract emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = [...new Set(text.match(emailRegex) || [])];

        // Extract phone numbers (Italian format)
        const phoneRegex = /(?:\+39|0039)?\s?(?:3\d{2}[\s\-.]?\d{6,7}|0\d{1,4}[\s\-.]?\d{5,8})/g;
        const phones = [...new Set(text.match(phoneRegex) || [])].map(p => p.trim());

        // Extract hotel/restaurant names
        const venuePatterns = [
            /(?:Hotel|Albergo|Resort|B&B|Bed\s*&?\s*Breakfast|Pensione|Agriturismo)\s+["']?([A-Z][a-zA-ZàèéìòùÀÈÉÌÒÙ\s']{2,40})["']?/gi,
            /(?:Ristorante|Trattoria|Osteria|Pizzeria|Locanda|Taverna)\s+["']?([A-Z][a-zA-ZàèéìòùÀÈÉÌÒÙ\s']{2,40})["']?/gi
        ];

        venuePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0].trim();
                const isHotel = /hotel|albergo|resort|b&b|bed|pensione|agriturismo/i.test(fullMatch);

                entities.push({
                    type: isHotel ? 'hotel' : 'restaurant',
                    name: fullMatch,
                    email: emails[0] || null,
                    phone: phones[0] || null,
                    city: this.findNearestCity(text, match.index),
                    confidence: 'high'
                });
            }
        });

        // Extract addresses
        const addressRegex = /(?:Via|Viale|Piazza|Corso|Largo|Vicolo)\s+[A-Za-zàèéìòùÀÈÉÌÒÙ\s'.]+\s*,?\s*\d{1,5}/gi;
        const addresses = text.match(addressRegex) || [];

        // If no structured data found but have contacts
        if (entities.length === 0 && (emails.length > 0 || phones.length > 0)) {
            entities.push({
                type: 'contact',
                name: 'Contatti estratti',
                email: emails.join(', '),
                phone: phones.join(', '),
                address: addresses[0] || null,
                city: this.findCitiesInText(text)[0] || null,
                confidence: 'medium'
            });
        }

        // Remove duplicates
        const seen = new Set();
        return entities.filter(e => {
            const key = e.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    findNearestCity(text, position) {
        const cities = this.findCitiesInText(text);
        return cities[0] || null;
    }

    findCitiesInText(text) {
        const italianCities = [
            'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna',
            'Firenze', 'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova',
            'Trieste', 'Brescia', 'Parma', 'Taranto', 'Prato', 'Modena', 'Reggio Calabria',
            'Reggio Emilia', 'Perugia', 'Livorno', 'Ravenna', 'Cagliari', 'Foggia',
            'Rimini', 'Salerno', 'Ferrara', 'Sassari', 'Siracusa', 'Pescara', 'Monza',
            'Bergamo', 'Forlì', 'Trento', 'Vicenza', 'Terni', 'Bolzano', 'Novara',
            'Piacenza', 'Ancona', 'Arezzo', 'Udine', 'La Spezia', 'Lecce', 'Pesaro',
            'Aosta', 'Como', 'Lucca', 'Pisa', 'Siena', 'Sorrento', 'Amalfi', 'Positano',
            'Capri', 'Ischia', 'Taormina', 'Cefalù', 'San Gimignano', 'Cinque Terre',
            'Portofino', 'Matera', 'Alberobello', 'Orvieto', 'Assisi', 'Spoleto'
        ];

        const found = [];
        italianCities.forEach(city => {
            if (text.includes(city)) {
                found.push(city);
            }
        });
        return found;
    }

    extractPassengers(text) {
        const passengers = [];
        const lines = text.split(/[\n\r]+/);

        // Common patterns for passenger names in rooming lists
        const namePatterns = [
            // Pattern: "1. ROSSI MARIO" or "1) Rossi Mario"
            /^\s*\d+[\.\)]\s*([A-ZÀÈÉÌÒÙ][a-zàèéìòù]+)\s+([A-ZÀÈÉÌÒÙ][a-zàèéìòù]+)/,
            /^\s*\d+[\.\)]\s*([A-ZÀÈÉÌÒÙ]+)\s+([A-ZÀÈÉÌÒÙ]+)/,

            // Pattern: "ROSSI Mario" (surname uppercase, name capitalized)
            /^\s*([A-ZÀÈÉÌÒÙ]{2,})\s+([A-Za-zàèéìòù]{2,})/,

            // Pattern: "Mario ROSSI"
            /^\s*([A-Za-zàèéìòù]{2,})\s+([A-ZÀÈÉÌÒÙ]{2,})\s*$/,

            // Pattern: "Sig. Mario Rossi" or "Sig.ra Maria Rossi"
            /(?:Sig\.?|Sig\.?ra|Mr\.?|Mrs\.?|Ms\.?)\s+([A-Za-zàèéìòùÀÈÉÌÒÙ]+)\s+([A-Za-zàèéìòùÀÈÉÌÒÙ]+)/i,

            // Pattern: "PAX: Mario Rossi"
            /(?:PAX|Guest|Ospite|Nome)[\s:]+([A-Za-zàèéìòùÀÈÉÌÒÙ]+)\s+([A-Za-zàèéìòùÀÈÉÌÒÙ]+)/i
        ];

        // Words to exclude (not passenger names)
        const excludeWords = [
            'hotel', 'room', 'camera', 'singola', 'doppia', 'tripla', 'matrimoniale',
            'check', 'date', 'data', 'arrival', 'departure', 'arrivo', 'partenza',
            'tour', 'operador', 'operator', 'agente', 'agenzia', 'conferma', 'totale',
            'prezzo', 'price', 'euro', 'notti', 'nights', 'adulti', 'bambini'
        ];

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.length < 5 || trimmedLine.length > 60) return;

            // Skip lines with excluded words
            const lineLower = trimmedLine.toLowerCase();
            if (excludeWords.some(word => lineLower.includes(word))) return;

            // Try each pattern
            for (const pattern of namePatterns) {
                const match = trimmedLine.match(pattern);
                if (match) {
                    let fullName;
                    if (match[1] && match[2]) {
                        // Normalize: capitalize first letter of each word
                        const name1 = this.capitalizeName(match[1]);
                        const name2 = this.capitalizeName(match[2]);
                        fullName = `${name1} ${name2}`;
                    }

                    if (fullName && fullName.length >= 5 && !this.isDuplicate(passengers, fullName)) {
                        passengers.push({
                            full_name: fullName,
                            source_line: trimmedLine
                        });
                    }
                    break;
                }
            }
        });

        return passengers;
    }

    capitalizeName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    isDuplicate(passengers, name) {
        const normalized = name.toLowerCase().replace(/\s+/g, ' ');
        return passengers.some(p =>
            p.full_name.toLowerCase().replace(/\s+/g, ' ') === normalized
        );
    }

    displayEntityResults() {
        const container = this.shadowRoot.getElementById('entityResults');
        container.style.display = 'grid';
        this.shadowRoot.getElementById('passengerResults').style.display = 'none';

        if (this.extractedData.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    Nessun dato strutturato trovato nel PDF.<br>
                    Prova con un documento diverso o verifica che contenga informazioni su hotel/ristoranti.
                </div>
            `;
            return;
        }

        container.innerHTML = this.extractedData.map((entity, index) => {
            const confidenceClass = `confidence-${entity.confidence}`;
            const typeIcon = entity.type === 'hotel' ? '🏨' :
                            entity.type === 'restaurant' ? '🍽️' : '📋';
            const typeLabel = entity.type === 'hotel' ? 'Hotel' :
                             entity.type === 'restaurant' ? 'Ristorante' : 'Contatto';

            return `
                <div class="result-card">
                    <div class="result-header">
                        <div>
                            <div class="result-title">${entity.name}</div>
                            <div class="result-type">
                                ${typeIcon} ${typeLabel}
                                <span class="confidence ${confidenceClass}">${entity.confidence}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="addBtn${index}">+ Aggiungi</button>
                    </div>
                    ${entity.city ? `<div class="result-data">📍 ${entity.city}</div>` : ''}
                    ${entity.phone ? `<div class="result-data">📞 ${entity.phone}</div>` : ''}
                    ${entity.email ? `<div class="result-data">📧 ${entity.email}</div>` : ''}
                    ${entity.address ? `<div class="result-data">🏠 ${entity.address}</div>` : ''}
                </div>
            `;
        }).join('');

        // Add event listeners
        this.extractedData.forEach((entity, index) => {
            const btn = this.shadowRoot.getElementById(`addBtn${index}`);
            if (btn) {
                btn.addEventListener('click', () => this.addEntityToDatabase(entity));
            }
        });
    }

    async displayPassengerResults() {
        const container = this.shadowRoot.getElementById('passengerResults');
        const listContainer = this.shadowRoot.getElementById('passengersListContainer');
        const tourSelect = this.shadowRoot.getElementById('tourSelect');

        container.style.display = 'block';
        this.shadowRoot.getElementById('entityResults').style.display = 'none';

        // Load tours for selection
        await this.loadTours(tourSelect);

        if (this.extractedPassengers.length === 0) {
            listContainer.innerHTML = `
                <div class="alert alert-info">
                    Nessun passeggero trovato nel PDF.<br>
                    Assicurati che il documento contenga una lista di nomi (rooming list, manifest, ecc.)
                </div>
            `;
            return;
        }

        listContainer.innerHTML = `
            <div class="passengers-list">
                <div class="passengers-header">
                    <div>
                        <input type="checkbox" id="selectAll" class="passenger-checkbox" checked>
                        <label style="color: white; cursor: pointer;" for="selectAll">Seleziona tutti</label>
                    </div>
                    <span class="passengers-count">${this.extractedPassengers.length} passeggeri trovati</span>
                </div>
                ${this.extractedPassengers.map((p, i) => `
                    <div class="passenger-row">
                        <input type="checkbox" class="passenger-checkbox" id="pax${i}" data-index="${i}" checked>
                        <label class="passenger-name" for="pax${i}">${p.full_name}</label>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 16px; text-align: right;">
                <button class="btn btn-success" id="importPassengersBtn">
                    📥 Importa Selezionati nel Tour
                </button>
            </div>
        `;

        // Select all handler
        const selectAll = this.shadowRoot.getElementById('selectAll');
        selectAll.addEventListener('change', (e) => {
            this.shadowRoot.querySelectorAll('.passenger-checkbox:not(#selectAll)').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });

        // Import button
        this.shadowRoot.getElementById('importPassengersBtn').addEventListener('click', () => {
            this.importPassengers();
        });
    }

    async loadTours(select) {
        try {
            const supabase = window.supabaseClient;
            if (!supabase) {
                select.innerHTML = '<option value="">Database non disponibile</option>';
                return;
            }

            const { data: user } = await supabase.auth.getUser();
            if (!user?.user) return;

            const { data: tlProfile } = await supabase
                .from('tl_users')
                .select('id')
                .eq('user_id', user.user.id)
                .single();

            if (!tlProfile) {
                select.innerHTML = '<option value="">Profilo TL non trovato</option>';
                return;
            }

            const { data: tours, error } = await supabase
                .from('tours')
                .select('*')
                .eq('tl_id', tlProfile.id)
                .order('start_date', { ascending: false });

            if (error) throw error;

            select.innerHTML = '<option value="">-- Seleziona un tour --</option>' +
                (tours || []).map(t =>
                    `<option value="${t.id}">${t.code} - ${t.name}</option>`
                ).join('');

        } catch (error) {
            console.error('Error loading tours:', error);
            select.innerHTML = '<option value="">Errore caricamento tour</option>';
        }
    }

    async importPassengers() {
        const tourSelect = this.shadowRoot.getElementById('tourSelect');
        const tourId = tourSelect.value;

        if (!tourId) {
            alert('Seleziona un tour prima di importare');
            return;
        }

        const checkboxes = this.shadowRoot.querySelectorAll('.passenger-checkbox:not(#selectAll):checked');
        const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));

        if (selectedIndexes.length === 0) {
            alert('Seleziona almeno un passeggero');
            return;
        }

        const passengersToImport = selectedIndexes.map(i => ({
            tour_id: tourId,
            full_name: this.extractedPassengers[i].full_name,
            ticket_generated: false
        }));

        try {
            const supabase = window.supabaseClient;
            const { error } = await supabase
                .from('tour_passengers')
                .insert(passengersToImport);

            if (error) throw error;

            alert(`✅ ${passengersToImport.length} passeggeri importati con successo!\n\nVai alla sezione eTickets per generare i biglietti.`);

            // Clear results
            this.clearResults();

        } catch (error) {
            console.error('Error importing passengers:', error);
            alert('Errore importazione: ' + error.message);
        }
    }

    async addEntityToDatabase(entity) {
        const supabase = window.supabaseClient;

        try {
            let table, data;

            if (entity.type === 'hotel') {
                table = 'blueriot_stay';
                data = {
                    name: entity.name.replace(/^(Hotel|Albergo|Resort|B&B)\s+/i, '').trim(),
                    type: 'Hotel',
                    location: entity.city || '',
                    phone: entity.phone || '',
                    notes: 'Estratto da PDF via OCR'
                };
            } else if (entity.type === 'restaurant') {
                table = 'blueriot_tastes';
                data = {
                    name: entity.name.replace(/^(Ristorante|Trattoria|Osteria|Pizzeria)\s+/i, '').trim(),
                    type: 'ristorante',
                    location: entity.city || '',
                    city: entity.city || '',
                    phone: entity.phone || '',
                    notes: 'Estratto da PDF via OCR'
                };
            } else {
                alert('Tipo non riconosciuto. Aggiungi manualmente.');
                return;
            }

            const { error } = await supabase.from(table).insert([data]);

            if (error) throw error;

            alert(`✅ Aggiunto a ${table === 'blueriot_stay' ? 'SΤΔΥ' : 'ΤΔSΤΞ5'}!`);

        } catch (error) {
            console.error('Add error:', error);
            alert('❌ Errore: ' + error.message);
        }
    }
}

customElements.define('pdf-ocr-panel', PdfOcrPanel);
