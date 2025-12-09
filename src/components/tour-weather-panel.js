/**
 * Tour Weather Panel - BlueRiot Cyberpunk Style
 */
import { getWeatherForecast, getWeatherSummary, formatTemp } from '../utils/weather.js';

export class TourWeatherPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tour = null;
        this.tourDays = [];
        this.weatherData = new Map();
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* ===== BLUERIOT CYBERPUNK THEME ===== */
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :host {
                    --primary-blue: #00F0FF;
                    --secondary-blue: #0A7AFF;
                    --dark-bg: #0A0E27;
                    --card-bg: #13182E;
                    --text-primary: #FFFFFF;
                    --text-secondary: #8B9DC3;
                    --border-color: #1E2749;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: var(--text-primary);
                }

                .panel { padding: 0; }

                .back-btn {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    padding: 10px 18px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-family: inherit;
                    margin-bottom: 24px;
                    transition: all 0.2s;
                }
                .back-btn:hover {
                    border-color: var(--primary-blue);
                    color: var(--primary-blue);
                }

                .tour-header {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                }

                .tour-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .tour-code {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--primary-blue);
                    background: rgba(0, 240, 255, 0.1);
                    padding: 6px 12px;
                    border-radius: 6px;
                    display: inline-block;
                    margin-bottom: 16px;
                    letter-spacing: 1px;
                }

                .tour-meta {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .tour-meta span {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .weather-section {
                    margin-top: 24px;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .days-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .day-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px 20px;
                    display: grid;
                    grid-template-columns: 70px 1fr auto;
                    gap: 16px;
                    align-items: center;
                    transition: all 0.2s;
                }

                .day-card:hover {
                    border-color: var(--primary-blue);
                }

                .day-number {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--primary-blue);
                    text-align: center;
                }

                .day-date {
                    font-size: 11px;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .day-info h4 {
                    color: var(--text-primary);
                    margin-bottom: 4px;
                    font-size: 15px;
                    font-weight: 600;
                }

                .day-info p {
                    color: var(--text-secondary);
                    font-size: 13px;
                }

                .day-weather {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    background: var(--dark-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    min-width: 150px;
                }

                .weather-icon {
                    font-size: 30px;
                }

                .weather-temp {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .weather-condition {
                    font-size: 11px;
                    color: var(--text-secondary);
                }

                .weather-rain {
                    font-size: 10px;
                    color: var(--primary-blue);
                }

                .location-input {
                    background: var(--dark-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    color: var(--text-primary);
                    padding: 6px 10px;
                    font-size: 12px;
                    width: 110px;
                    font-family: inherit;
                }
                .location-input:focus {
                    outline: none;
                    border-color: var(--primary-blue);
                    box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.1);
                }
                .location-input::placeholder {
                    color: var(--text-secondary);
                    opacity: 0.6;
                }
                .location-btn {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    font-family: inherit;
                    margin-left: 6px;
                    transition: all 0.2s;
                }
                .location-btn:hover {
                    border-color: var(--primary-blue);
                    color: var(--primary-blue);
                }
                .day-location {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 6px;
                }

                .loading {
                    text-align: center;
                    padding: 48px;
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    width: 36px;
                    height: 36px;
                    border: 3px solid var(--border-color);
                    border-top-color: var(--primary-blue);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 48px 20px;
                    color: var(--text-secondary);
                }

                .empty-state-icon {
                    font-size: 42px;
                    margin-bottom: 16px;
                }

                .forecast-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
                    gap: 12px;
                    margin-top: 24px;
                }

                .forecast-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                    text-align: center;
                    transition: all 0.2s;
                }

                .forecast-card:hover {
                    border-color: var(--primary-blue);
                }

                .forecast-day {
                    font-size: 11px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }

                .forecast-icon {
                    font-size: 26px;
                    margin-bottom: 8px;
                }

                .forecast-temp {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                @media (max-width: 768px) {
                    .day-card {
                        grid-template-columns: 55px 1fr;
                        gap: 12px;
                    }
                    .day-weather {
                        grid-column: span 2;
                        justify-content: center;
                    }
                    .tour-meta {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
            </style>

            <div class="panel">
                <button class="back-btn" id="backBtn">← Torna alla lista</button>
                <div id="content">
                    <div class="empty-state">
                        <div class="empty-state-icon">🌤️</div>
                        <p>Seleziona un tour per vedere il meteo</p>
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
                <p>Caricamento dati tour e meteo...</p>
            </div>
        `;

        try {
            // Load tour days
            const { data: days, error } = await window.supabaseClient
                .from('tour_days')
                .select('*')
                .eq('tour_id', tour.id)
                .order('day_number', { ascending: true });

            if (error) throw error;
            this.tourDays = days || [];

            // Get unique cities from tour
            const cities = new Set();
            if (tour.cities && Array.isArray(tour.cities)) {
                tour.cities.forEach(c => cities.add(c));
            }
            this.tourDays.forEach(day => {
                if (day.city) cities.add(day.city);
                if (day.cities && Array.isArray(day.cities)) {
                    day.cities.forEach(c => cities.add(c));
                }
            });

            // Fetch weather for first city (main destination) or generate based on dates
            let mainCity = tour.cities?.[0] || this.tourDays[0]?.city || 'Roma';
            const forecast = await getWeatherForecast(mainCity);

            if (forecast) {
                forecast.forEach(w => {
                    this.weatherData.set(w.date, w);
                });
            }

            this.renderTourDetail();
        } catch (error) {
            console.error('Load tour error:', error);
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <p>Errore caricamento: ${error.message}</p>
                </div>
            `;
        }
    }

    renderTourDetail() {
        const content = this.shadowRoot.getElementById('content');

        // Format dates
        const startDate = this.tour.start_date ? new Date(this.tour.start_date) : null;
        const endDate = this.tour.end_date ? new Date(this.tour.end_date) : null;
        const dateFormatter = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });

        // Generate days if tour_days is empty but we have dates
        let daysToShow = this.tourDays;
        if (daysToShow.length === 0 && startDate && endDate) {
            daysToShow = this.generateDaysFromDates(startDate, endDate);
        }

        content.innerHTML = `
            <div class="tour-header">
                <div class="tour-code">${this.tour.code || 'TOUR'}</div>
                <h2 class="tour-title">${this.tour.name || 'Tour senza nome'}</h2>
                <div class="tour-meta">
                    <span>📅 ${startDate ? dateFormatter.format(startDate) : 'N/A'} → ${endDate ? dateFormatter.format(endDate) : 'N/A'}</span>
                    <span>👥 ${this.tour.passenger_count || 0} passeggeri</span>
                    <span>📊 ${this.getStatusLabel(this.tour.status)}</span>
                </div>
            </div>

            <div class="weather-section">
                <h3 class="section-title">🌤️ Previsioni Meteo</h3>
                ${daysToShow.length > 0 ? this.renderDaysTimeline(daysToShow) : this.renderForecastGrid()}
            </div>
        `;

        // Setup location input listeners
        this.setupLocationListeners();
    }

    setupLocationListeners() {
        // Refresh weather button
        this.shadowRoot.querySelectorAll('.location-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const dayId = e.target.dataset.dayId;
                const dayNum = parseInt(e.target.dataset.dayNum);
                const input = this.shadowRoot.querySelector(`.location-input[data-day-num="${dayNum}"]`);
                const newCity = input?.value?.trim();

                if (!newCity) return;

                // Save and refresh weather
                await this.updateDayLocation(dayId, dayNum, newCity);
            });
        });

        // Save on Enter key
        this.shadowRoot.querySelectorAll('.location-input').forEach(input => {
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const dayId = e.target.dataset.dayId;
                    const dayNum = parseInt(e.target.dataset.dayNum);
                    const newCity = e.target.value?.trim();

                    if (newCity) {
                        await this.updateDayLocation(dayId, dayNum, newCity);
                    }
                }
            });
        });
    }

    async updateDayLocation(dayId, dayNum, city) {
        try {
            // Update in database if we have an ID
            if (dayId) {
                const { error } = await window.supabaseClient
                    .from('tour_days')
                    .update({ city: city })
                    .eq('id', dayId);

                if (error) throw error;
            }

            // Update local data
            const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);
            if (dayIndex >= 0) {
                this.tourDays[dayIndex].city = city;
            }

            // Fetch weather for the new city
            const forecast = await getWeatherForecast(city);
            if (forecast) {
                // Find the weather for this day's date
                const day = this.tourDays.find(d => d.day_number === dayNum);
                if (day && day.calendar_date) {
                    const dayWeather = forecast.find(w => w.date === day.calendar_date);
                    if (dayWeather) {
                        this.weatherData.set(day.calendar_date, dayWeather);
                    }
                }
            }

            // Re-render
            this.renderTourDetail();

        } catch (error) {
            console.error('Update location error:', error);
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
                title: `Giorno ${dayNum}`
            });
            current.setDate(current.getDate() + 1);
            dayNum++;
        }

        return days;
    }

    renderDaysTimeline(days) {
        const dayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });

        return `
            <div class="days-timeline">
                ${days.map(day => {
                    const date = day.calendar_date;
                    const weather = this.weatherData.get(date);
                    const dateObj = new Date(date);

                    return `
                        <div class="day-card">
                            <div>
                                <div class="day-number">${day.day_number || '?'}</div>
                                <div class="day-date">${dayFormatter.format(dateObj)}</div>
                            </div>
                            <div class="day-info">
                                <h4>${day.title || day.city || 'In viaggio'}</h4>
                                <div class="day-location">
                                    <span>📍</span>
                                    <input type="text" class="location-input"
                                           data-day-id="${day.id || ''}"
                                           data-day-num="${day.day_number}"
                                           value="${day.city || ''}"
                                           placeholder="Città...">
                                    <button class="location-btn" data-day-id="${day.id || ''}" data-day-num="${day.day_number}">↻</button>
                                </div>
                                <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${day.description || ''}</p>
                            </div>
                            <div class="day-weather">
                                ${weather ? `
                                    <div class="weather-icon">${weather.icon}</div>
                                    <div>
                                        <div class="weather-temp">${formatTemp(weather.temp_min, weather.temp_max)}</div>
                                        <div class="weather-condition">${weather.condition}</div>
                                        ${weather.precipitation_mm > 0 ? `<div class="weather-rain">💧 ${weather.precipitation_mm.toFixed(1)} mm</div>` : ''}
                                    </div>
                                ` : `
                                    <div class="weather-icon">❓</div>
                                    <div>
                                        <div class="weather-temp">--°</div>
                                        <div class="weather-condition">N/D</div>
                                    </div>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderForecastGrid() {
        // Show 7-day forecast if no tour days
        const forecast = Array.from(this.weatherData.values()).slice(0, 7);
        const dayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric' });

        if (forecast.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🌡️</div>
                    <p>Previsioni non disponibili</p>
                </div>
            `;
        }

        return `
            <div class="forecast-grid">
                ${forecast.map(w => `
                    <div class="forecast-card">
                        <div class="forecast-day">${dayFormatter.format(new Date(w.date))}</div>
                        <div class="forecast-icon">${w.icon}</div>
                        <div class="forecast-temp">${formatTemp(w.temp_min, w.temp_max)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'upcoming': '🔜 In arrivo',
            'ongoing': '🟢 In corso',
            'completed': '✅ Completato',
            'cancelled': '❌ Annullato'
        };
        return labels[status] || status || 'N/A';
    }
}

customElements.define('tour-weather-panel', TourWeatherPanel);
