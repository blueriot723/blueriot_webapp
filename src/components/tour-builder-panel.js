/**
 * Tour Builder Panel - Drag & Drop tour builder with TASTES and STAY integration
 * VERSION: 2024-12-11-v1
 */
import { getWeatherForecast, formatTemp } from '../utils/weather.js';
import { createShadowAutocomplete } from '../utils/geocoding.js';

export class TourBuilderPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tour = null;
        this.tourDays = [];
        this.weatherData = new Map();
        this.tastesData = [];  // Ristoranti
        this.stayData = [];    // Hotels
        this.sortableInstances = [];
        this.render();
    }

    connectedCallback() {
        this.loadSortableJS();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        // Cleanup Sortable instances
        this.sortableInstances.forEach(s => s.destroy());
        this.sortableInstances = [];
    }

    async loadSortableJS() {
        // Load SortableJS dynamically
        if (!window.Sortable) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
            script.onload = () => console.log('✅ SortableJS loaded');
            document.head.appendChild(script);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }

                :host {
                    --neon-cyan: #00e5ff;
                    --neon-fuchsia: #ff00ff;
                    --neon-pink: #ff4fd8;
                    --bg-dark: #0a0e27;
                    --bg-darker: #050510;
                    --text-gray: #6b7280;
                }

                .builder-container {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 20px;
                    min-height: calc(100vh - 200px);
                }

                /* === BACK BUTTON === */
                .back-btn {
                    background: rgba(0, 240, 255, 0.1);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    color: #00f0ff;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-bottom: 20px;
                    transition: all 0.2s ease;
                }
                .back-btn:hover {
                    background: rgba(0, 240, 255, 0.2);
                    box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
                }

                /* === PALETTE SIDEBAR === */
                .palette {
                    background: var(--bg-darker);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 12px;
                    padding: 16px;
                    max-height: calc(100vh - 200px);
                    overflow-y: auto;
                }

                .palette-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--neon-cyan);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
                }

                .palette-section {
                    margin-bottom: 20px;
                }

                .palette-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: rgba(255, 0, 255, 0.1);
                    border: 1px solid rgba(255, 0, 255, 0.3);
                    border-radius: 8px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    transition: all 0.2s;
                }

                .palette-section-header:hover {
                    background: rgba(255, 0, 255, 0.15);
                }

                .palette-section-header.tastes {
                    background: rgba(255, 0, 255, 0.1);
                    border-color: rgba(255, 0, 255, 0.3);
                }

                .palette-section-header.stay {
                    background: rgba(0, 240, 255, 0.1);
                    border-color: rgba(0, 240, 255, 0.3);
                }

                .palette-section-title {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .palette-section-header.tastes .palette-section-title { color: var(--neon-fuchsia); }
                .palette-section-header.stay .palette-section-title { color: var(--neon-cyan); }

                .palette-section-count {
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 10px;
                    background: rgba(0,0,0,0.3);
                }

                .palette-items {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 4px;
                }

                .palette-search {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 6px;
                    color: #fff;
                    padding: 8px 12px;
                    font-size: 12px;
                    margin-bottom: 12px;
                }
                .palette-search:focus {
                    outline: none;
                    border-color: var(--neon-cyan);
                }
                .palette-search::placeholder { color: #555; }

                /* === DRAGGABLE BLOCKS === */
                .block {
                    background: rgba(10, 14, 39, 0.8);
                    border: 1px solid rgba(0, 240, 255, 0.15);
                    border-radius: 8px;
                    padding: 10px 12px;
                    cursor: grab;
                    transition: all 0.2s;
                    font-size: 12px;
                }

                .block:hover {
                    border-color: rgba(0, 240, 255, 0.4);
                    transform: translateX(4px);
                    box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
                }

                .block:active {
                    cursor: grabbing;
                }

                .block.taste-block {
                    border-left: 3px solid var(--neon-fuchsia);
                }

                .block.stay-block {
                    border-left: 3px solid var(--neon-cyan);
                }

                .block-name {
                    color: #fff;
                    font-weight: 600;
                    margin-bottom: 2px;
                }

                .block-meta {
                    color: var(--text-gray);
                    font-size: 10px;
                }

                .block-icon {
                    float: right;
                    font-size: 14px;
                    opacity: 0.6;
                }

                /* === TOUR HEADER === */
                .tour-header {
                    background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .tour-title {
                    font-size: 24px;
                    color: var(--neon-cyan);
                    text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
                    margin-bottom: 4px;
                }

                .tour-code {
                    font-size: 12px;
                    color: var(--neon-fuchsia);
                    letter-spacing: 2px;
                    margin-bottom: 12px;
                }

                .tour-meta {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    font-size: 13px;
                    color: var(--text-gray);
                }

                /* === DAYS TIMELINE === */
                .days-container {
                    background: var(--bg-darker);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    min-height: 400px;
                }

                .days-title {
                    font-size: 14px;
                    color: var(--neon-cyan);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .days-title button {
                    background: rgba(0, 240, 255, 0.1);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    color: var(--neon-cyan);
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    margin-left: auto;
                }
                .days-title button:hover {
                    background: rgba(0, 240, 255, 0.2);
                }

                .days-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* === DAY CARD === */
                .day-card {
                    background: rgba(10, 14, 39, 0.6);
                    border: 1px solid rgba(0, 240, 255, 0.15);
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .day-card:hover {
                    border-color: rgba(0, 240, 255, 0.3);
                }

                .day-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    background: rgba(0, 0, 0, 0.3);
                    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
                }

                .day-number {
                    font-size: 28px;
                    font-weight: bold;
                    color: var(--neon-cyan);
                    width: 50px;
                    text-align: center;
                }

                .day-info {
                    flex: 1;
                }

                .day-date {
                    font-size: 13px;
                    color: #fff;
                }

                .day-city {
                    font-size: 11px;
                    color: var(--text-gray);
                    margin-top: 2px;
                }

                .day-city input {
                    background: transparent;
                    border: none;
                    border-bottom: 1px dashed rgba(0, 240, 255, 0.3);
                    color: var(--neon-cyan);
                    font-size: 11px;
                    padding: 2px 4px;
                    width: 120px;
                }
                .day-city input:focus {
                    outline: none;
                    border-color: var(--neon-cyan);
                }

                .day-weather {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 6px;
                    min-width: 120px;
                }

                .weather-icon { font-size: 24px; }
                .weather-temp { font-size: 14px; color: #fff; font-weight: 600; }
                .weather-cond { font-size: 10px; color: var(--text-gray); }

                /* === DROP ZONE === */
                .day-dropzone {
                    min-height: 80px;
                    padding: 12px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .day-dropzone.empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #444;
                    font-size: 12px;
                    font-style: italic;
                    border: 2px dashed rgba(0, 240, 255, 0.1);
                    border-radius: 8px;
                    margin: 8px;
                }

                .day-dropzone.sortable-ghost {
                    background: rgba(0, 240, 255, 0.1);
                }

                /* === DROPPED BLOCKS === */
                .dropped-block {
                    background: rgba(10, 14, 39, 0.9);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: move;
                }

                .dropped-block.taste {
                    border-left: 3px solid var(--neon-fuchsia);
                }

                .dropped-block.stay {
                    border-left: 3px solid var(--neon-cyan);
                }

                .dropped-block .block-name {
                    color: #fff;
                    margin: 0;
                }

                .dropped-block .remove-btn {
                    background: none;
                    border: none;
                    color: #ff4444;
                    cursor: pointer;
                    font-size: 14px;
                    margin-left: auto;
                    padding: 2px 6px;
                    opacity: 0.6;
                }

                .dropped-block .remove-btn:hover {
                    opacity: 1;
                }

                /* === LOADING & EMPTY === */
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-gray);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(0, 240, 255, 0.1);
                    border-top-color: var(--neon-cyan);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-gray);
                }

                .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

                /* === SCROLLBAR === */
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.3); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.5); }

                /* === RESPONSIVE === */
                @media (max-width: 900px) {
                    .builder-container {
                        grid-template-columns: 1fr;
                    }
                    .palette {
                        max-height: 300px;
                    }
                }
            </style>

            <div class="panel">
                <button class="back-btn" id="backBtn">← Torna alla lista</button>
                <div id="content">
                    <div class="empty-state">
                        <div class="empty-icon">🏗️</div>
                        <p>Seleziona un tour per iniziare a costruire</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('backBtn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true }));
        });
    }

    async loadTour(tour) {
        this.tour = tour;
        const content = this.shadowRoot.getElementById('content');

        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Caricamento tour e risorse...</p>
            </div>
        `;

        try {
            // Load tour days, tastes, and stay data in parallel
            const [daysResult, tastesResult, stayResult] = await Promise.all([
                window.supabaseClient
                    .from('tour_days')
                    .select('*')
                    .eq('tour_id', tour.id)
                    .order('day_number', { ascending: true }),
                window.supabaseClient
                    .from('blueriot_tastes')
                    .select('*')
                    .order('city,name'),
                window.supabaseClient
                    .from('blueriot_stay')
                    .select('*')
                    .order('location,name')
            ]);

            if (daysResult.error) throw daysResult.error;
            this.tourDays = daysResult.data || [];
            this.tastesData = tastesResult.data || [];
            this.stayData = stayResult.data || [];

            // Generate days if empty but we have dates
            if (this.tourDays.length === 0 && tour.start_date && tour.end_date) {
                this.tourDays = this.generateDaysFromDates(
                    new Date(tour.start_date),
                    new Date(tour.end_date)
                );
            }

            // Load weather for main city
            const mainCity = tour.cities?.[0] || this.tourDays[0]?.city || 'Roma';
            const forecast = await getWeatherForecast(mainCity);
            if (forecast) {
                forecast.forEach(w => this.weatherData.set(w.date, w));
            }

            this.renderBuilder();
            this.initSortable();

        } catch (error) {
            console.error('Load tour error:', error);
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p>Errore: ${error.message}</p>
                </div>
            `;
        }
    }

    generateDaysFromDates(startDate, endDate) {
        const days = [];
        const current = new Date(startDate);
        let dayNum = 1;

        while (current <= endDate) {
            days.push({
                day_number: dayNum,
                calendar_date: current.toISOString().split('T')[0],
                city: this.tour.cities?.[0] || null,
                title: `Giorno ${dayNum}`,
                blocks: []
            });
            current.setDate(current.getDate() + 1);
            dayNum++;
        }

        return days;
    }

    renderBuilder() {
        const content = this.shadowRoot.getElementById('content');
        const dateFormatter = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
        const startDate = this.tour.start_date ? new Date(this.tour.start_date) : null;
        const endDate = this.tour.end_date ? new Date(this.tour.end_date) : null;

        content.innerHTML = `
            <div class="tour-header">
                <div class="tour-code">${this.tour.code || 'TOUR'}</div>
                <h2 class="tour-title">${this.tour.name || 'Tour senza nome'}</h2>
                <div class="tour-meta">
                    <span>📅 ${startDate ? dateFormatter.format(startDate) : 'N/A'} → ${endDate ? dateFormatter.format(endDate) : 'N/A'}</span>
                    <span>👥 ${this.tour.passenger_count || 0} pax</span>
                    <span>📍 ${this.tour.cities?.join(', ') || 'N/A'}</span>
                </div>
            </div>

            <div class="builder-container">
                <!-- PALETTE SIDEBAR -->
                <aside class="palette">
                    <div class="palette-title">🎨 Blocchi</div>
                    <input type="text" class="palette-search" id="paletteSearch" placeholder="Cerca blocchi...">

                    <!-- TASTES Section -->
                    <div class="palette-section" id="tastesSection">
                        <div class="palette-section-header tastes" data-toggle="tastes">
                            <span class="palette-section-title">🍽️ Tastes</span>
                            <span class="palette-section-count">${this.tastesData.length}</span>
                        </div>
                        <div class="palette-items" id="tastesItems">
                            ${this.renderTastesBlocks()}
                        </div>
                    </div>

                    <!-- STAY Section -->
                    <div class="palette-section" id="staySection">
                        <div class="palette-section-header stay" data-toggle="stay">
                            <span class="palette-section-title">🏨 Stay</span>
                            <span class="palette-section-count">${this.stayData.length}</span>
                        </div>
                        <div class="palette-items" id="stayItems">
                            ${this.renderStayBlocks()}
                        </div>
                    </div>
                </aside>

                <!-- DAYS TIMELINE -->
                <main class="days-container">
                    <div class="days-title">
                        <span>📅 Timeline Giorni</span>
                        <button id="addDayBtn">+ Aggiungi Giorno</button>
                        <button id="saveBtn">💾 Salva</button>
                    </div>
                    <div class="days-timeline" id="daysTimeline">
                        ${this.renderDays()}
                    </div>
                </main>
            </div>
        `;

        // Setup listeners
        this.setupBuilderListeners();
    }

    renderTastesBlocks() {
        if (!this.tastesData.length) {
            return '<div style="color:#555;font-size:11px;padding:8px;">Nessun ristorante</div>';
        }

        return this.tastesData.map(taste => `
            <div class="block taste-block" draggable="true"
                 data-type="taste"
                 data-id="${taste.id}"
                 data-name="${taste.name}"
                 data-city="${taste.city || ''}"
                 data-cuisine="${taste.cuisine || ''}">
                <span class="block-icon">🍽️</span>
                <div class="block-name">${taste.name}</div>
                <div class="block-meta">${taste.city || ''} ${taste.cuisine ? '• ' + taste.cuisine : ''}</div>
            </div>
        `).join('');
    }

    renderStayBlocks() {
        if (!this.stayData.length) {
            return '<div style="color:#555;font-size:11px;padding:8px;">Nessun hotel</div>';
        }

        return this.stayData.map(stay => `
            <div class="block stay-block" draggable="true"
                 data-type="stay"
                 data-id="${stay.id}"
                 data-name="${stay.name}"
                 data-location="${stay.location || ''}"
                 data-stars="${stay.stars || ''}">
                <span class="block-icon">🏨</span>
                <div class="block-name">${stay.name}</div>
                <div class="block-meta">${stay.location || ''} ${stay.stars ? '• ' + '⭐'.repeat(stay.stars) : ''}</div>
            </div>
        `).join('');
    }

    renderDays() {
        if (!this.tourDays.length) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <p>Nessun giorno configurato. Clicca "+ Aggiungi Giorno"</p>
                </div>
            `;
        }

        const dayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });

        return this.tourDays.map(day => {
            const weather = this.weatherData.get(day.calendar_date);
            const dateObj = day.calendar_date ? new Date(day.calendar_date) : null;
            const blocks = day.blocks || [];

            return `
                <div class="day-card" data-day-num="${day.day_number}" data-day-id="${day.id || ''}">
                    <div class="day-header">
                        <div class="day-number">${day.day_number}</div>
                        <div class="day-info">
                            <div class="day-date">${dateObj ? dayFormatter.format(dateObj) : 'Data N/A'}</div>
                            <div class="day-city">
                                📍 <input type="text" class="city-input"
                                         value="${day.city || ''}"
                                         placeholder="Località..."
                                         data-day-num="${day.day_number}">
                            </div>
                        </div>
                        <div class="day-weather">
                            ${weather ? `
                                <span class="weather-icon">${weather.icon}</span>
                                <div>
                                    <div class="weather-temp">${formatTemp(weather.temp_min, weather.temp_max)}</div>
                                    <div class="weather-cond">${weather.condition}</div>
                                </div>
                            ` : `
                                <span class="weather-icon">❓</span>
                                <div><div class="weather-temp">--°</div></div>
                            `}
                        </div>
                    </div>
                    <div class="day-dropzone${blocks.length === 0 ? ' empty' : ''}"
                         data-day-num="${day.day_number}">
                        ${blocks.length === 0 ?
                            'Trascina qui ristoranti e hotel' :
                            blocks.map(b => this.renderDroppedBlock(b)).join('')
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDroppedBlock(block) {
        const isStay = block.type === 'stay';
        return `
            <div class="dropped-block ${block.type}"
                 data-type="${block.type}"
                 data-id="${block.id}"
                 data-name="${block.name}">
                <span>${isStay ? '🏨' : '🍽️'}</span>
                <span class="block-name">${block.name}</span>
                <button class="remove-btn" title="Rimuovi">×</button>
            </div>
        `;
    }

    setupBuilderListeners() {
        // Search filter
        const searchInput = this.shadowRoot.getElementById('paletteSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterPaletteBlocks(e.target.value));
        }

        // Toggle sections
        this.shadowRoot.querySelectorAll('.palette-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const items = header.nextElementSibling;
                items.style.display = items.style.display === 'none' ? 'flex' : 'none';
            });
        });

        // Add day button
        const addDayBtn = this.shadowRoot.getElementById('addDayBtn');
        if (addDayBtn) {
            addDayBtn.addEventListener('click', () => this.addDay());
        }

        // Save button
        const saveBtn = this.shadowRoot.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTour());
        }

        // City input changes
        this.shadowRoot.querySelectorAll('.city-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const dayNum = parseInt(e.target.dataset.dayNum);
                const city = e.target.value.trim();
                this.updateDayCity(dayNum, city);
            });

            // Setup autocomplete
            createShadowAutocomplete(this.shadowRoot, input, {}, (result) => {
                input.value = result.shortName;
                const dayNum = parseInt(input.dataset.dayNum);
                this.updateDayCity(dayNum, result.shortName);
            });
        });

        // Remove block buttons
        this.shadowRoot.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const block = e.target.closest('.dropped-block');
                const dropzone = block.closest('.day-dropzone');
                const dayNum = parseInt(dropzone.dataset.dayNum);
                const blockId = block.dataset.id;
                this.removeBlockFromDay(dayNum, blockId);
            });
        });
    }

    filterPaletteBlocks(query) {
        const lowerQuery = query.toLowerCase();

        // Filter tastes
        this.shadowRoot.querySelectorAll('.taste-block').forEach(block => {
            const name = block.dataset.name?.toLowerCase() || '';
            const city = block.dataset.city?.toLowerCase() || '';
            const matches = name.includes(lowerQuery) || city.includes(lowerQuery);
            block.style.display = matches ? 'block' : 'none';
        });

        // Filter stay
        this.shadowRoot.querySelectorAll('.stay-block').forEach(block => {
            const name = block.dataset.name?.toLowerCase() || '';
            const location = block.dataset.location?.toLowerCase() || '';
            const matches = name.includes(lowerQuery) || location.includes(lowerQuery);
            block.style.display = matches ? 'block' : 'none';
        });
    }

    initSortable() {
        // Wait for SortableJS to load
        if (!window.Sortable) {
            setTimeout(() => this.initSortable(), 100);
            return;
        }

        // Cleanup previous instances
        this.sortableInstances.forEach(s => s.destroy());
        this.sortableInstances = [];

        // Make palette items draggable
        const tastesItems = this.shadowRoot.getElementById('tastesItems');
        if (tastesItems) {
            this.sortableInstances.push(
                new Sortable(tastesItems, {
                    group: { name: 'blocks', pull: 'clone', put: false },
                    sort: false,
                    animation: 150
                })
            );
        }

        const stayItems = this.shadowRoot.getElementById('stayItems');
        if (stayItems) {
            this.sortableInstances.push(
                new Sortable(stayItems, {
                    group: { name: 'blocks', pull: 'clone', put: false },
                    sort: false,
                    animation: 150
                })
            );
        }

        // Make day dropzones accept drops
        this.shadowRoot.querySelectorAll('.day-dropzone').forEach(dropzone => {
            this.sortableInstances.push(
                new Sortable(dropzone, {
                    group: 'blocks',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onAdd: (evt) => this.handleBlockDrop(evt),
                    onSort: (evt) => this.handleBlockSort(evt)
                })
            );
        });
    }

    handleBlockDrop(evt) {
        const item = evt.item;
        const dropzone = evt.to;
        const dayNum = parseInt(dropzone.dataset.dayNum);

        // Convert palette block to dropped block
        const type = item.dataset.type;
        const id = item.dataset.id;
        const name = item.dataset.name;

        // Update day data
        const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);
        if (dayIndex >= 0) {
            if (!this.tourDays[dayIndex].blocks) {
                this.tourDays[dayIndex].blocks = [];
            }
            this.tourDays[dayIndex].blocks.push({ type, id, name });

            // Remove empty class
            dropzone.classList.remove('empty');

            // Replace the dragged element with proper dropped block HTML
            const newBlock = document.createElement('div');
            newBlock.className = `dropped-block ${type}`;
            newBlock.dataset.type = type;
            newBlock.dataset.id = id;
            newBlock.dataset.name = name;
            newBlock.innerHTML = `
                <span>${type === 'stay' ? '🏨' : '🍽️'}</span>
                <span class="block-name">${name}</span>
                <button class="remove-btn" title="Rimuovi">×</button>
            `;

            // Add remove listener
            newBlock.querySelector('.remove-btn').addEventListener('click', () => {
                this.removeBlockFromDay(dayNum, id);
            });

            item.replaceWith(newBlock);
        }
    }

    handleBlockSort(evt) {
        // Update block order in day
        const dropzone = evt.to;
        const dayNum = parseInt(dropzone.dataset.dayNum);
        const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);

        if (dayIndex >= 0) {
            const blocks = [];
            dropzone.querySelectorAll('.dropped-block').forEach(b => {
                blocks.push({
                    type: b.dataset.type,
                    id: b.dataset.id,
                    name: b.dataset.name
                });
            });
            this.tourDays[dayIndex].blocks = blocks;
        }
    }

    removeBlockFromDay(dayNum, blockId) {
        const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);
        if (dayIndex >= 0) {
            this.tourDays[dayIndex].blocks = this.tourDays[dayIndex].blocks.filter(b => b.id !== blockId);

            // Re-render dropzone
            const dropzone = this.shadowRoot.querySelector(`.day-dropzone[data-day-num="${dayNum}"]`);
            if (dropzone) {
                const blocks = this.tourDays[dayIndex].blocks;
                if (blocks.length === 0) {
                    dropzone.classList.add('empty');
                    dropzone.innerHTML = 'Trascina qui ristoranti e hotel';
                } else {
                    dropzone.innerHTML = blocks.map(b => this.renderDroppedBlock(b)).join('');
                    // Re-attach remove listeners
                    dropzone.querySelectorAll('.remove-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const block = e.target.closest('.dropped-block');
                            this.removeBlockFromDay(dayNum, block.dataset.id);
                        });
                    });
                }
            }
        }
    }

    updateDayCity(dayNum, city) {
        const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);
        if (dayIndex >= 0) {
            this.tourDays[dayIndex].city = city;
        }
    }

    addDay() {
        const lastDay = this.tourDays[this.tourDays.length - 1];
        const newDayNum = lastDay ? lastDay.day_number + 1 : 1;

        let newDate = null;
        if (lastDay?.calendar_date) {
            const lastDate = new Date(lastDay.calendar_date);
            lastDate.setDate(lastDate.getDate() + 1);
            newDate = lastDate.toISOString().split('T')[0];
        }

        this.tourDays.push({
            day_number: newDayNum,
            calendar_date: newDate,
            city: lastDay?.city || '',
            title: `Giorno ${newDayNum}`,
            blocks: []
        });

        // Re-render
        this.renderBuilder();
        this.initSortable();
    }

    async saveTour() {
        const saveBtn = this.shadowRoot.getElementById('saveBtn');
        saveBtn.textContent = '⏳ Salvando...';
        saveBtn.disabled = true;

        try {
            // Save each day
            for (const day of this.tourDays) {
                const dayData = {
                    tour_id: this.tour.id,
                    day_number: day.day_number,
                    calendar_date: day.calendar_date,
                    city: day.city,
                    title: day.title,
                    // Store blocks as JSON in description or a dedicated column
                    description: JSON.stringify(day.blocks || [])
                };

                if (day.id) {
                    // Update existing
                    await window.supabaseClient
                        .from('tour_days')
                        .update(dayData)
                        .eq('id', day.id);
                } else {
                    // Insert new
                    const { data } = await window.supabaseClient
                        .from('tour_days')
                        .insert(dayData)
                        .select()
                        .single();
                    if (data) day.id = data.id;
                }
            }

            saveBtn.textContent = '✅ Salvato!';
            setTimeout(() => {
                saveBtn.textContent = '💾 Salva';
                saveBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Save error:', error);
            saveBtn.textContent = '❌ Errore';
            setTimeout(() => {
                saveBtn.textContent = '💾 Salva';
                saveBtn.disabled = false;
            }, 2000);
        }
    }
}

customElements.define('tour-builder-panel', TourBuilderPanel);
