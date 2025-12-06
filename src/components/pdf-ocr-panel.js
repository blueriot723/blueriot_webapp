/**
 * PDF OCR Panel - Extract data from PDF documents
 * Uses PDF.js for client-side PDF parsing
 */
export class PdfOcrPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.extractedData = [];
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
        this.shadowRoot.innerHTML = \`
            <link rel="stylesheet" href="src/styles/base.css">
            <link rel="stylesheet" href="src/styles/layout.css">
            <link rel="stylesheet" href="src/styles/components.css">

            <style>
                :host { display: block; }

                .upload-area {
                    border: 2px dashed rgba(0, 200, 255, 0.3);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-2xl);
                    text-align: center;
                    margin-bottom: var(--spacing-xl);
                    background: var(--bg-card);
                    cursor: pointer;
                    transition: all var(--transition-normal);
                }

                .upload-area:hover {
                    border-color: var(--neon-cyan);
                    background: rgba(0, 200, 255, 0.05);
                }

                .upload-area.dragover {
                    border-color: var(--neon-fuchsia);
                    background: rgba(255, 79, 216, 0.05);
                }

                .upload-icon {
                    font-size: 48px;
                    margin-bottom: var(--spacing-md);
                }

                .processing {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--neon-cyan);
                }

                .results-grid {
                    display: grid;
                    gap: var(--spacing-lg);
                }

                .result-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                }

                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: var(--spacing-md);
                }

                .result-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .result-type {
                    font-size: 12px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }

                .result-data {
                    margin: var(--spacing-sm) 0;
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .confidence {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: 11px;
                    font-weight: 600;
                    margin-left: 8px;
                }

                .confidence-high {
                    background: rgba(0, 255, 136, 0.1);
                    color: var(--success);
                    border: 1px solid var(--success);
                }

                .confidence-medium {
                    background: rgba(255, 193, 7, 0.1);
                    color: var(--warning);
                    border: 1px solid var(--warning);
                }

                .confidence-low {
                    background: rgba(255, 71, 87, 0.1);
                    color: var(--error);
                    border: 1px solid var(--error);
                }
            </style>

            <div>
                <h2 style="color: var(--neon-cyan); margin-bottom: var(--spacing-lg);">📄 PDF OCR Engine</h2>
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xl);">
                    Carica un PDF per estrarre automaticamente informazioni su hotel, ristoranti e città
                </p>

                <div class="upload-area" id="uploadArea">
                    <div class="upload-icon">📄</div>
                    <div style="color: var(--text-primary); margin-bottom: 8px;">
                        Trascina qui un file PDF o clicca per selezionare
                    </div>
                    <div style="color: var(--text-muted); font-size: 13px;">
                        Supporta: contratti hotel, menu ristoranti, guide turistiche
                    </div>
                    <input type="file" id="fileInput" accept=".pdf" style="display: none;">
                </div>

                <div id="processing" style="display: none;" class="processing">
                    <div class="spinner"></div>
                    <div style="margin-top: var(--spacing-lg);" id="processingStatus">Elaborazione PDF...</div>
                </div>

                <div id="results" class="results-grid"></div>
            </div>
        \`;
    }

    setupEventListeners() {
        const uploadArea = this.shadowRoot.getElementById('uploadArea');
        const fileInput = this.shadowRoot.getElementById('fileInput');

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

    async processPdf(file) {
        const processing = this.shadowRoot.getElementById('processing');
        const results = this.shadowRoot.getElementById('results');
        const status = this.shadowRoot.getElementById('processingStatus');

        processing.style.display = 'block';
        results.innerHTML = '';
        this.extractedData = [];

        try {
            status.textContent = 'Caricamento PDF...';
            const arrayBuffer = await file.arrayBuffer();

            status.textContent = 'Estrazione testo...';
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                status.textContent = 'Elaborazione pagina ' + i + ' di ' + pdf.numPages + '...';
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + ' ';
            }

            status.textContent = 'Analisi dati...';
            this.extractedData = this.extractEntities(fullText);

            processing.style.display = 'none';
            this.displayResults();

        } catch (error) {
            console.error('PDF processing error:', error);
            processing.style.display = 'none';
            results.innerHTML = '<div class="alert alert-error">Errore durante l elaborazione del PDF: ' + error.message + '</div>';
        }
    }

    extractEntities(text) {
        const entities = [];

        // Extract emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex) || [];

        // Extract phone numbers (Italian format)
        const phoneRegex = /(\+39|0039)?\s?3\d{2}[\s\-]?\d{6,7}|0\d{1,4}[\s\-]?\d{6,8}/g;
        const phones = text.match(phoneRegex) || [];

        // Extract potential hotel/restaurant names (capitalized words)
        const nameRegex = /(?:Hotel|Ristorante|Trattoria|Osteria|Albergo|B&B|Agriturismo|Pensione)\s+[A-Z][a-zA-Z\s]{2,30}/g;
        const names = text.match(nameRegex) || [];

        // Extract cities (common Italian cities)
        const cities = ['Roma', 'Milano', 'Firenze', 'Venezia', 'Napoli', 'Torino', 'Bologna', 'Genova', 'Palermo', 'Verona'];
        const foundCities = cities.filter(city => text.includes(city));

        // Combine into entities
        names.forEach(name => {
            entities.push({
                type: name.includes('Hotel') || name.includes('Albergo') || name.includes('B&B') ? 'hotel' : 'restaurant',
                name: name.trim(),
                email: emails[0] || null,
                phone: phones[0] || null,
                city: foundCities[0] || null,
                confidence: 'high'
            });
        });

        // If no structured data found, create generic entries
        if (entities.length === 0 && (emails.length > 0 || phones.length > 0)) {
            entities.push({
                type: 'unknown',
                name: 'Informazioni estratte',
                email: emails[0] || null,
                phone: phones[0] || null,
                city: foundCities[0] || null,
                confidence: 'medium'
            });
        }

        return entities;
    }

    displayResults() {
        const container = this.shadowRoot.getElementById('results');

        if (this.extractedData.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessun dato strutturato trovato nel PDF. Prova con un documento diverso.</div>';
            return;
        }

        const html = this.extractedData.map((entity, index) => {
            const confidenceClass = 'confidence-' + entity.confidence;
            const typeLabel = entity.type === 'hotel' ? '🏨 Hotel' : entity.type === 'restaurant' ? '🍽️ Ristorante' : '❓ Generico';

            return '<div class="result-card">' +
                '<div class="result-header">' +
                '<div>' +
                '<div class="result-title">' + entity.name + '</div>' +
                '<div class="result-type">' + typeLabel + 
                '<span class="confidence ' + confidenceClass + '">' + entity.confidence + '</span>' +
                '</div>' +
                '</div>' +
                '<button class="btn btn-primary btn-sm" data-index="' + index + '" id="addBtn' + index + '">+ Aggiungi</button>' +
                '</div>' +
                (entity.city ? '<div class="result-data">📍 ' + entity.city + '</div>' : '') +
                (entity.phone ? '<div class="result-data">📞 ' + entity.phone + '</div>' : '') +
                (entity.email ? '<div class="result-data">📧 ' + entity.email + '</div>' : '') +
                '</div>';
        }).join('');

        container.innerHTML = html;

        // Add event listeners
        this.extractedData.forEach((entity, index) => {
            const btn = this.shadowRoot.getElementById('addBtn' + index);
            if (btn) {
                btn.addEventListener('click', () => this.addToDatabase(entity));
            }
        });
    }

    async addToDatabase(entity) {
        const supabase = window.supabaseClient;
        
        try {
            const table = entity.type === 'hotel' ? 'blueriot_stay' : 
                         entity.type === 'restaurant' ? 'tastes_database' : null;

            if (!table) {
                alert('Tipo non riconosciuto. Aggiungi manualmente.');
                return;
            }

            const data = {
                name: entity.name,
                city: entity.city || '',
                phone: entity.phone || '',
                notes: 'Estratto da PDF'
            };

            if (table === 'blueriot_stay') {
                data.type = 'hotel';
                data.location = entity.city || '';
            } else {
                data.address = '';
                data.type = 'restaurant';
            }

            const response = await supabase.from(table).insert([data]);
            
            if (response.error) throw response.error;

            alert('✅ Aggiunto con successo a ' + (table === 'blueriot_stay' ? 'STAY' : 'TASTES') + '!');
        } catch (error) {
            console.error('Add error:', error);
            alert('❌ Errore: ' + error.message);
        }
    }
}

customElements.define('pdf-ocr-panel', PdfOcrPanel);
