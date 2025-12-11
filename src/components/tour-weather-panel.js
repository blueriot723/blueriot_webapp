/**
 * Tour Weather Panel - BlueRiot Bubble Cute Style
 * VERSION: 2024-12-11-v1
 */
import { getWeatherForecast, getWeatherSummary, formatTemp } from '../utils/weather.js';

export class TourWeatherPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tour = null;
        this.tourDays = [];
        this.weatherData = new Map();
        this.tastesData = []; // Ristoranti dal database
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }
                :host {
                    font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 14px;
                    color: #eee;
                }

                .back-btn {
                    background: #111;
                    border: none;
                    color: #888;
                    padding: 12px 18px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-family: 'Quicksand', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    transition: all 0.2s ease;
                }
                .back-btn:hover { background: #1a1a1a; color: #00D4E8; }

                .tour-header {
                    background: #111111;
                    border: 1px solid #222;
                    border-radius: 6px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .tour-title {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 20px;
                    font-weight: 600;
                    color: #00D4E8;
                    margin-bottom: 8px;
                    letter-spacing: 2px;
                }
                .tour-code {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 11px;
                    color: #666;
                    margin-bottom: 12px;
                    letter-spacing: 1px;
                }
                .tour-meta { display: flex; gap: 20px; flex-wrap: wrap; color: #888; font-size: 13px; }

                .section-title {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: #00D4E8;
                    margin-bottom: 15px;
                    letter-spacing: 1px;
                }

                .days-timeline { display: flex; flex-direction: column; gap: 10px; }

                .day-card {
                    background: #111111;
                    border: 1px solid #222;
                    border-radius: 6px;
                    padding: 15px;
                    display: grid;
                    grid-template-columns: 60px 1fr auto;
                    gap: 15px;
                    align-items: center;
                    transition: all 0.2s ease;
                }
                .day-card:hover { border-color: #00D4E8; box-shadow: 0 0 10px rgba(0,240,255,0.1); }

                .day-number {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 20px;
                    font-weight: 600;
                    color: #00D4E8;
                    text-align: center;
                }
                .day-date { font-size: 11px; color: #666; text-align: center; }

                .day-info h4 { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .day-info p { font-size: 12px; color: #888; }

                .day-weather {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: #0A0A0A;
                    border: 1px solid #222;
                    border-radius: 4px;
                    min-width: 130px;
                }
                .weather-icon { font-size: 26px; }
                .weather-temp {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                }
                .weather-condition { font-size: 11px; color: #888; }
                .weather-rain { font-size: 10px; color: #00D4E8; }

                .location-input {
                    background: #0A0A0A;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #eee;
                    padding: 5px 8px;
                    font-size: 12px;
                    width: 100px;
                    transition: border-color 0.2s ease;
                }
                .location-input:focus { outline: none; border-color: #00D4E8; }
                .location-btn {
                    background: #111;
                    border: 1px solid #333;
                    color: #888;
                    padding: 5px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-left: 5px;
                    transition: all 0.2s ease;
                }
                .location-btn:hover { background: #1a1a1a; color: #00D4E8; border-color: #00D4E8; }
                .day-location { display: flex; align-items: center; gap: 5px; margin-top: 5px; }

                .loading { text-align: center; padding: 40px; color: #666; }
                .loading-spinner {
                    width: 30px; height: 30px;
                    border: 3px solid #222;
                    border-top-color: #00D4E8;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .empty-state { text-align: center; padding: 40px; color: #666; }
                .empty-state-icon { font-size: 36px; margin-bottom: 12px; }

                .forecast-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 10px;
                    margin-top: 20px;
                }
                .forecast-card {
                    background: #111111;
                    border: 1px solid #222;
                    border-radius: 6px;
                    padding: 15px;
                    text-align: center;
                    transition: all 0.2s ease;
                }
                .forecast-card:hover { border-color: #00D4E8; }
                .forecast-day { font-size: 11px; color: #666; margin-bottom: 6px; }
                .forecast-icon { font-size: 24px; margin-bottom: 6px; }
                .forecast-temp {
                    font-family: 'Quicksand', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fff;
                }

                /* === SUGGESTED RESTAURANTS === */
                .day-suggestions {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(0, 240, 255, 0.1);
                }

                .suggestions-title {
                    font-size: 11px;
                    color: #ff00ff;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .restaurant-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .restaurant-chip {
                    background: rgba(255, 0, 255, 0.1);
                    border: 1px solid rgba(255, 0, 255, 0.3);
                    border-radius: 16px;
                    padding: 4px 10px;
                    font-size: 11px;
                    color: #ff00ff;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .restaurant-chip:hover {
                    background: rgba(255, 0, 255, 0.2);
                    box-shadow: 0 0 8px rgba(255, 0, 255, 0.3);
                }

                .restaurant-chip .cuisine {
                    color: #8899aa;
                    margin-left: 4px;
                }

                /* === ACTIVITIES SECTION === */
                .day-activities {
                    margin-top: 8px;
                }

                .activities-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 4px;
                    color: #fff;
                    padding: 6px 10px;
                    font-size: 12px;
                    font-family: inherit;
                    resize: none;
                    min-height: 40px;
                }

                .activities-input:focus {
                    outline: none;
                    border-color: #00f0ff;
                    box-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
                }

                .activities-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .no-suggestions {
                    font-size: 11px;
                    color: #6b7280;
                    font-style: italic;
                }

                /* === EXPANDED DAY CARD === */
                .day-card.expanded {
                    grid-template-columns: 80px 1fr;
                }

                .day-card.expanded .day-content {
                    grid-column: span 1;
                }

                .day-details {
                    grid-column: 1 / -1;
                    padding-top: 12px;
                    margin-top: 12px;
                    border-top: 1px solid rgba(0, 240, 255, 0.1);
                }

                .toggle-details {
                    background: none;
                    border: none;
                    color: #00f0ff;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 4px 8px;
                    margin-top: 8px;
                    transition: all 0.2s;
                }

                .toggle-details:hover {
                    text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
                }

                @media (max-width: 768px) {
                    .day-card { grid-template-columns: 50px 1fr; gap: 10px; }
                    .day-weather { grid-column: span 2; justify-content: center; }
                    .tour-meta { flex-direction: column; gap: 8px; }
                }
            </style>

            <div>
                <button class="back-btn" id="backBtn">← TORNA ALLA LISTA</button>
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

    // Get suggested restaurants for a city
    getSuggestedRestaurants(city) {
        if (!city || !this.tastesData.length) return [];

        const cityLower = city.toLowerCase().trim();

        // Match by city, region, or country
        return this.tastesData.filter(r => {
            const rCity = (r.city || '').toLowerCase();
            const rRegion = (r.region || '').toLowerCase();
            const rCountry = (r.country || '').toLowerCase();

            return rCity.includes(cityLower) ||
                   cityLower.includes(rCity) ||
                   rRegion.includes(cityLower) ||
                   cityLower.includes(rRegion);
        }).slice(0, 5); // Max 5 suggestions
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
            <h3 class="section-title">🌤️ PREVISIONI METEO</h3>
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

        // Save activities on blur (when leaving the textarea)
        this.shadowRoot.querySelectorAll('.activities-input').forEach(textarea => {
            textarea.addEventListener('blur', async (e) => {
                const dayId = e.target.dataset.dayId;
                const dayNum = parseInt(e.target.dataset.dayNum);
                const activities = e.target.value?.trim();

                await this.updateDayActivities(dayId, dayNum, activities);
            });
        });

        // Restaurant chip click - show details
        this.shadowRoot.querySelectorAll('.restaurant-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const restaurantId = e.target.closest('.restaurant-chip').dataset.restaurantId;
                const restaurant = this.tastesData.find(r => r.id == restaurantId);
                if (restaurant) {
                    this.showRestaurantDetails(restaurant);
                }
            });
        });
    }

    async updateDayActivities(dayId, dayNum, activities) {
        try {
            // Update in database if we have an ID
            if (dayId) {
                const { error } = await window.supabaseClient
                    .from('tour_days')
                    .update({ activities: activities, description: activities })
                    .eq('id', dayId);

                if (error) {
                    console.warn('Could not save activities (field may not exist):', error);
                }
            }

            // Update local data
            const dayIndex = this.tourDays.findIndex(d => d.day_number === dayNum);
            if (dayIndex >= 0) {
                this.tourDays[dayIndex].activities = activities;
            }
        } catch (error) {
            console.error('Update activities error:', error);
        }
    }

    showRestaurantDetails(restaurant) {
        // Create a simple popup/tooltip with restaurant info
        const existing = this.shadowRoot.querySelector('.restaurant-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'restaurant-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #0a0e27;
            border: 1px solid rgba(255, 0, 255, 0.4);
            border-radius: 12px;
            padding: 20px;
            z-index: 1000;
            max-width: 350px;
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
        `;

        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h3 style="color: #ff00ff; margin: 0; font-size: 18px;">${restaurant.name}</h3>
                <button class="close-popup" style="background: none; border: none; color: #8899aa; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="color: #8899aa; font-size: 13px;">
                ${restaurant.cuisine ? `<p style="margin: 6px 0;">🍽️ <strong>Cucina:</strong> ${restaurant.cuisine}</p>` : ''}
                ${restaurant.address ? `<p style="margin: 6px 0;">📍 <strong>Indirizzo:</strong> ${restaurant.address}</p>` : ''}
                ${restaurant.phone ? `<p style="margin: 6px 0;">📞 <strong>Telefono:</strong> <a href="tel:${restaurant.phone}" style="color: #00f0ff;">${restaurant.phone}</a></p>` : ''}
                ${restaurant.city ? `<p style="margin: 6px 0;">🏙️ ${restaurant.city}${restaurant.region ? ', ' + restaurant.region : ''}${restaurant.country ? ', ' + restaurant.country : ''}</p>` : ''}
                ${restaurant.notes ? `<p style="margin: 10px 0; font-style: italic; color: #6b7280;">${restaurant.notes}</p>` : ''}
            </div>
        `;

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'popup-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 999;
        `;

        this.shadowRoot.appendChild(backdrop);
        this.shadowRoot.appendChild(popup);

        // Close handlers
        const closePopup = () => {
            popup.remove();
            backdrop.remove();
        };

        popup.querySelector('.close-popup').addEventListener('click', closePopup);
        backdrop.addEventListener('click', closePopup);
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
