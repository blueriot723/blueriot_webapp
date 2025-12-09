/**
 * Tour Weather Panel - Simple Dark Style
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
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :host {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    color: #eee;
                }

                .back-btn {
                    background: #222;
                    border: 1px solid #444;
                    color: #ccc;
                    padding: 8px 14px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    margin-bottom: 20px;
                }
                .back-btn:hover { background: #333; color: #fff; }

                .tour-header {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .tour-title { font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 8px; }
                .tour-code { font-size: 12px; color: #888; margin-bottom: 12px; }
                .tour-meta { display: flex; gap: 20px; flex-wrap: wrap; color: #888; font-size: 13px; }

                .section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 15px; }

                .days-timeline { display: flex; flex-direction: column; gap: 10px; }

                .day-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 15px;
                    display: grid;
                    grid-template-columns: 60px 1fr auto;
                    gap: 15px;
                    align-items: center;
                }
                .day-card:hover { border-color: #555; }

                .day-number { font-size: 20px; font-weight: 600; color: #fff; text-align: center; }
                .day-date { font-size: 11px; color: #888; text-align: center; }

                .day-info h4 { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .day-info p { font-size: 12px; color: #888; }

                .day-weather {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: #222;
                    border: 1px solid #333;
                    border-radius: 4px;
                    min-width: 130px;
                }
                .weather-icon { font-size: 26px; }
                .weather-temp { font-size: 14px; font-weight: 600; color: #fff; }
                .weather-condition { font-size: 11px; color: #888; }
                .weather-rain { font-size: 10px; color: #6bf; }

                .location-input {
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #eee;
                    padding: 5px 8px;
                    font-size: 12px;
                    width: 100px;
                }
                .location-input:focus { outline: none; border-color: #555; }
                .location-btn {
                    background: #222;
                    border: 1px solid #333;
                    color: #888;
                    padding: 5px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-left: 5px;
                }
                .location-btn:hover { background: #333; color: #fff; }
                .day-location { display: flex; align-items: center; gap: 5px; margin-top: 5px; }

                .loading { text-align: center; padding: 40px; color: #888; }
                .loading-spinner {
                    width: 30px; height: 30px;
                    border: 3px solid #333;
                    border-top-color: #888;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .empty-state { text-align: center; padding: 40px; color: #888; }
                .empty-state-icon { font-size: 36px; margin-bottom: 12px; }

                .forecast-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 10px;
                    margin-top: 20px;
                }
                .forecast-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 15px;
                    text-align: center;
                }
                .forecast-card:hover { border-color: #555; }
                .forecast-day { font-size: 11px; color: #888; margin-bottom: 6px; }
                .forecast-icon { font-size: 24px; margin-bottom: 6px; }
                .forecast-temp { font-size: 13px; font-weight: 600; color: #fff; }

                @media (max-width: 768px) {
                    .day-card { grid-template-columns: 50px 1fr; gap: 10px; }
                    .day-weather { grid-column: span 2; justify-content: center; }
                    .tour-meta { flex-direction: column; gap: 8px; }
                }
            </style>

            <div>
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

        content.innerHTML = `<div class="loading"><div class="loading-spinner"></div><p>Caricamento meteo...</p></div>`;

        try {
            const { data: days, error } = await window.supabaseClient
                .from('tour_days')
                .select('*')
                .eq('tour_id', tour.id)
                .order('day_number', { ascending: true });

            if (error) throw error;
            this.tourDays = days || [];

            // Get main city for weather
            let mainCity = tour.cities?.[0] || this.tourDays[0]?.city || 'Roma';
            console.log('Weather for city:', mainCity);

            const forecast = await getWeatherForecast(mainCity);
            if (forecast) {
                forecast.forEach(w => this.weatherData.set(w.date, w));
            }

            this.renderTourDetail();
        } catch (error) {
            console.error('Load tour error:', error);
            content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Errore: ${error.message}</p></div>`;
        }
    }

    renderTourDetail() {
        const content = this.shadowRoot.getElementById('content');
        const startDate = this.tour.start_date ? new Date(this.tour.start_date) : null;
        const endDate = this.tour.end_date ? new Date(this.tour.end_date) : null;
        const fmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });

        let daysToShow = this.tourDays;
        if (daysToShow.length === 0 && startDate && endDate) {
            daysToShow = this.generateDaysFromDates(startDate, endDate);
        }

        content.innerHTML = `
            <div class="tour-header">
                <div class="tour-code">${this.tour.code || ''}</div>
                <h2 class="tour-title">${this.tour.name || 'Tour'}</h2>
                <div class="tour-meta">
                    <span>📅 ${startDate ? fmt.format(startDate) : '-'} → ${endDate ? fmt.format(endDate) : '-'}</span>
                    <span>👥 ${this.tour.passenger_count || 0} pax</span>
                    <span>🏙️ ${this.tour.cities?.join(', ') || 'Nessuna città'}</span>
                </div>
            </div>
            <h3 class="section-title">🌤️ Previsioni Meteo</h3>
            ${daysToShow.length > 0 ? this.renderDaysTimeline(daysToShow) : this.renderForecastGrid()}
        `;

        this.setupLocationListeners();
    }

    setupLocationListeners() {
        this.shadowRoot.querySelectorAll('.location-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const dayNum = parseInt(e.target.dataset.dayNum);
                const input = this.shadowRoot.querySelector(`.location-input[data-day-num="${dayNum}"]`);
                const newCity = input?.value?.trim();
                if (newCity) await this.updateDayLocation(e.target.dataset.dayId, dayNum, newCity);
            });
        });

        this.shadowRoot.querySelectorAll('.location-input').forEach(input => {
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const newCity = e.target.value?.trim();
                    if (newCity) await this.updateDayLocation(e.target.dataset.dayId, parseInt(e.target.dataset.dayNum), newCity);
                }
            });
        });
    }

    async updateDayLocation(dayId, dayNum, city) {
        try {
            if (dayId) {
                await window.supabaseClient.from('tour_days').update({ city }).eq('id', dayId);
            }

            const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);
            if (dayIndex >= 0) this.tourDays[dayIndex].city = city;

            const forecast = await getWeatherForecast(city);
            if (forecast) {
                const day = this.tourDays.find(d => d.day_number === dayNum);
                if (day?.calendar_date) {
                    const dayWeather = forecast.find(w => w.date === day.calendar_date);
                    if (dayWeather) this.weatherData.set(day.calendar_date, dayWeather);
                }
            }

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
        const fmt = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
        return `<div class="days-timeline">${days.map(day => {
            const weather = this.weatherData.get(day.calendar_date);
            const dateObj = new Date(day.calendar_date);
            return `
                <div class="day-card">
                    <div>
                        <div class="day-number">${day.day_number || '?'}</div>
                        <div class="day-date">${fmt.format(dateObj)}</div>
                    </div>
                    <div class="day-info">
                        <h4>${day.title || day.city || 'In viaggio'}</h4>
                        <div class="day-location">
                            📍 <input type="text" class="location-input" data-day-id="${day.id || ''}" data-day-num="${day.day_number}" value="${day.city || ''}" placeholder="Città...">
                            <button class="location-btn" data-day-id="${day.id || ''}" data-day-num="${day.day_number}">↻</button>
                        </div>
                    </div>
                    <div class="day-weather">
                        ${weather ? `
                            <div class="weather-icon">${weather.icon}</div>
                            <div>
                                <div class="weather-temp">${formatTemp(weather.temp_min, weather.temp_max)}</div>
                                <div class="weather-condition">${weather.condition}</div>
                                ${weather.precipitation_mm > 0 ? `<div class="weather-rain">💧 ${weather.precipitation_mm.toFixed(1)}mm</div>` : ''}
                            </div>
                        ` : `<div class="weather-icon">❓</div><div><div class="weather-temp">--°</div><div class="weather-condition">N/D</div></div>`}
                    </div>
                </div>
            `;
        }).join('')}</div>`;
    }

    renderForecastGrid() {
        const forecast = Array.from(this.weatherData.values()).slice(0, 7);
        const fmt = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric' });
        if (!forecast.length) return `<div class="empty-state"><div class="empty-state-icon">🌡️</div><p>Previsioni non disponibili</p></div>`;
        return `<div class="forecast-grid">${forecast.map(w => `
            <div class="forecast-card">
                <div class="forecast-day">${fmt.format(new Date(w.date))}</div>
                <div class="forecast-icon">${w.icon}</div>
                <div class="forecast-temp">${formatTemp(w.temp_min, w.temp_max)}</div>
            </div>
        `).join('')}</div>`;
    }
}

customElements.define('tour-weather-panel', TourWeatherPanel);
