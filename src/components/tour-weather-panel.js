/**
 * Tour Weather Panel - Shows tour details with weather forecast, activities and suggested restaurants
 * VERSION: 2024-12-10-v1
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
                /* Note: @import doesn't work reliably in Shadow DOM, styles are inline */
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .panel { padding: 0; }

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

                .tour-header {
                    background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                }

                .tour-title {
                    font-size: 28px;
                    color: #00f0ff;
                    text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
                    margin-bottom: 8px;
                }

                .tour-code {
                    font-size: 14px;
                    color: #ff00ff;
                    letter-spacing: 2px;
                    margin-bottom: 16px;
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
                    gap: 6px;
                }

                .weather-section {
                    margin-top: 24px;
                }

                .section-title {
                    font-size: 18px;
                    color: #fff;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .days-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .day-card {
                    background: rgba(10, 14, 39, 0.6);
                    border: 1px solid rgba(0, 240, 255, 0.15);
                    border-radius: 10px;
                    padding: 16px 20px;
                    display: grid;
                    grid-template-columns: 80px 1fr auto;
                    gap: 16px;
                    align-items: center;
                    transition: all 0.2s ease;
                }

                .day-card:hover {
                    border-color: rgba(0, 240, 255, 0.3);
                    background: rgba(10, 14, 39, 0.8);
                }

                .day-number {
                    font-size: 24px;
                    font-weight: bold;
                    color: #00f0ff;
                    text-align: center;
                }

                .day-date {
                    font-size: 11px;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .day-info h4 {
                    color: #fff;
                    margin-bottom: 4px;
                    font-size: 16px;
                }

                .day-info p {
                    color: var(--text-secondary);
                    font-size: 13px;
                }

                .day-weather {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 16px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    min-width: 150px;
                }

                .weather-icon {
                    font-size: 32px;
                }

                .weather-temp {
                    font-size: 18px;
                    font-weight: bold;
                    color: #fff;
                }

                .weather-condition {
                    font-size: 11px;
                    color: var(--text-secondary);
                }

                .weather-rain {
                    font-size: 10px;
                    color: #00bfff;
                }

                .location-input {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    border-radius: 4px;
                    color: #fff;
                    padding: 4px 8px;
                    font-size: 12px;
                    width: 120px;
                    font-family: inherit;
                }
                .location-input:focus {
                    outline: none;
                    border-color: #00f0ff;
                    box-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
                }
                .location-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
                .location-btn {
                    background: rgba(0, 240, 255, 0.2);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    color: #00f0ff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-left: 4px;
                }
                .location-btn:hover {
                    background: rgba(0, 240, 255, 0.3);
                }
                .day-location {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 4px;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(0, 240, 255, 0.1);
                    border-top-color: #00f0ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }

                .empty-state-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .forecast-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    margin-top: 24px;
                }

                .forecast-card {
                    background: rgba(10, 14, 39, 0.6);
                    border: 1px solid rgba(0, 240, 255, 0.1);
                    border-radius: 8px;
                    padding: 16px;
                    text-align: center;
                    transition: all 0.2s ease;
                }

                .forecast-card:hover {
                    border-color: rgba(0, 240, 255, 0.3);
                }

                .forecast-day {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }

                .forecast-icon {
                    font-size: 28px;
                    margin-bottom: 8px;
                }

                .forecast-temp {
                    font-size: 14px;
                    font-weight: bold;
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
                    .day-card {
                        grid-template-columns: 60px 1fr;
                        gap: 12px;
                    }
                    .day-weather {
                        grid-column: span 2;
                        justify-content: center;
                    }
                    .tour-meta {
                        flex-direction: column;
                        gap: 8px;
                    }
                    .restaurant-chips {
                        flex-direction: column;
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
                <p>Caricamento dati tour, meteo e ristoranti...</p>
            </div>
        `;

        try {
            // Load tour days and restaurants in parallel
            const [daysResult, tastesResult] = await Promise.all([
                window.supabaseClient
                    .from('tour_days')
                    .select('*')
                    .eq('tour_id', tour.id)
                    .order('day_number', { ascending: true }),
                window.supabaseClient
                    .from('blueriot_tastes')
                    .select('*')
                    .order('name')
            ]);

            if (daysResult.error) throw daysResult.error;
            this.tourDays = daysResult.data || [];
            this.tastesData = tastesResult.data || [];

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

        // Save location on Enter key
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
                    const suggestedRestaurants = this.getSuggestedRestaurants(day.city);

                    return `
                        <div class="day-card" data-day-num="${day.day_number}">
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
                                           placeholder="Luogo...">
                                    <button class="location-btn" data-day-id="${day.id || ''}" data-day-num="${day.day_number}">↻</button>
                                </div>

                                <!-- Activities -->
                                <div class="day-activities">
                                    <textarea class="activities-input"
                                              data-day-id="${day.id || ''}"
                                              data-day-num="${day.day_number}"
                                              placeholder="Attività del giorno: visite, escursioni, eventi...">${day.activities || day.description || ''}</textarea>
                                </div>

                                <!-- Suggested Restaurants -->
                                <div class="day-suggestions">
                                    <div class="suggestions-title">🍽️ Ristoranti suggeriti</div>
                                    ${suggestedRestaurants.length > 0 ? `
                                        <div class="restaurant-chips">
                                            ${suggestedRestaurants.map(r => `
                                                <span class="restaurant-chip" data-restaurant-id="${r.id}" title="${r.address || ''}\n${r.phone || ''}">
                                                    ${r.name}
                                                    ${r.cuisine ? `<span class="cuisine">(${r.cuisine})</span>` : ''}
                                                </span>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <span class="no-suggestions">
                                            ${day.city ? `Nessun ristorante in "${day.city}" - aggiungine uno in TASTES` : 'Inserisci una località per vedere i suggerimenti'}
                                        </span>
                                    `}
                                </div>
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
