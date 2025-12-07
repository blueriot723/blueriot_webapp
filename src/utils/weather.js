/**
 * Weather Service - Client-side Open-Meteo integration with Supabase caching
 * Uses free Open-Meteo API (no API key required)
 */

const OPEN_METEO_API = 'https://api.open-meteo.com/v1';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1';
const CACHE_HOURS = 6;

// WMO Weather codes to conditions and icons
const WMO_CONDITIONS = {
    0: { condition: 'Sereno', icon: '☀️' },
    1: { condition: 'Prevalentemente sereno', icon: '🌤️' },
    2: { condition: 'Parzialmente nuvoloso', icon: '⛅' },
    3: { condition: 'Nuvoloso', icon: '☁️' },
    45: { condition: 'Nebbia', icon: '🌫️' },
    48: { condition: 'Nebbia con brina', icon: '🌫️' },
    51: { condition: 'Pioggerella leggera', icon: '🌦️' },
    53: { condition: 'Pioggerella', icon: '🌧️' },
    55: { condition: 'Pioggerella intensa', icon: '🌧️' },
    61: { condition: 'Pioggia leggera', icon: '🌧️' },
    63: { condition: 'Pioggia', icon: '🌧️' },
    65: { condition: 'Pioggia intensa', icon: '🌧️' },
    66: { condition: 'Pioggia gelata leggera', icon: '🌨️' },
    67: { condition: 'Pioggia gelata', icon: '🌨️' },
    71: { condition: 'Neve leggera', icon: '🌨️' },
    73: { condition: 'Neve', icon: '❄️' },
    75: { condition: 'Neve intensa', icon: '❄️' },
    77: { condition: 'Granuli di neve', icon: '🌨️' },
    80: { condition: 'Rovesci leggeri', icon: '🌦️' },
    81: { condition: 'Rovesci', icon: '🌧️' },
    82: { condition: 'Rovesci intensi', icon: '⛈️' },
    85: { condition: 'Rovesci di neve leggeri', icon: '🌨️' },
    86: { condition: 'Rovesci di neve', icon: '🌨️' },
    95: { condition: 'Temporale', icon: '⛈️' },
    96: { condition: 'Temporale con grandine', icon: '⛈️' },
    99: { condition: 'Temporale con grandine forte', icon: '⛈️' }
};

// Common Italian cities coordinates cache
const CITY_COORDS_CACHE = {
    'roma': { lat: 41.9028, lon: 12.4964, name: 'Roma' },
    'milano': { lat: 45.4642, lon: 9.1900, name: 'Milano' },
    'firenze': { lat: 43.7696, lon: 11.2558, name: 'Firenze' },
    'venezia': { lat: 45.4408, lon: 12.3155, name: 'Venezia' },
    'napoli': { lat: 40.8518, lon: 14.2681, name: 'Napoli' },
    'torino': { lat: 45.0703, lon: 7.6869, name: 'Torino' },
    'bologna': { lat: 44.4949, lon: 11.3426, name: 'Bologna' },
    'palermo': { lat: 38.1157, lon: 13.3615, name: 'Palermo' },
    'genova': { lat: 44.4056, lon: 8.9463, name: 'Genova' },
    'siena': { lat: 43.3188, lon: 11.3308, name: 'Siena' },
    'pisa': { lat: 43.7228, lon: 10.4017, name: 'Pisa' },
    'verona': { lat: 45.4384, lon: 10.9916, name: 'Verona' },
    'padova': { lat: 45.4064, lon: 11.8768, name: 'Padova' },
    'trieste': { lat: 45.6495, lon: 13.7768, name: 'Trieste' },
    'bari': { lat: 41.1171, lon: 16.8719, name: 'Bari' },
    'catania': { lat: 37.5079, lon: 15.0830, name: 'Catania' },
    'cagliari': { lat: 39.2238, lon: 9.1217, name: 'Cagliari' },
    'perugia': { lat: 43.1107, lon: 12.3908, name: 'Perugia' },
    'ancona': { lat: 43.6158, lon: 13.5189, name: 'Ancona' },
    'amalfi': { lat: 40.6340, lon: 14.6027, name: 'Amalfi' },
    'positano': { lat: 40.6280, lon: 14.4850, name: 'Positano' },
    'sorrento': { lat: 40.6263, lon: 14.3758, name: 'Sorrento' },
    'ravello': { lat: 40.6491, lon: 14.6116, name: 'Ravello' },
    'pompei': { lat: 40.7462, lon: 14.4989, name: 'Pompei' },
    'capri': { lat: 40.5531, lon: 14.2222, name: 'Capri' },
    'ischia': { lat: 40.7300, lon: 13.9000, name: 'Ischia' },
    'taormina': { lat: 37.8526, lon: 15.2866, name: 'Taormina' },
    'siracusa': { lat: 37.0755, lon: 15.2866, name: 'Siracusa' },
    'agrigento': { lat: 37.3111, lon: 13.5766, name: 'Agrigento' },
    'matera': { lat: 40.6664, lon: 16.6043, name: 'Matera' },
    'lecce': { lat: 40.3516, lon: 18.1718, name: 'Lecce' },
    'alberobello': { lat: 40.7846, lon: 17.2376, name: 'Alberobello' },
    'assisi': { lat: 43.0707, lon: 12.6196, name: 'Assisi' },
    'orvieto': { lat: 42.7185, lon: 12.1108, name: 'Orvieto' },
    'cinque terre': { lat: 44.1461, lon: 9.6439, name: 'Cinque Terre' },
    'portofino': { lat: 44.3035, lon: 9.2097, name: 'Portofino' },
    'lucca': { lat: 43.8429, lon: 10.5027, name: 'Lucca' },
    'san gimignano': { lat: 43.4677, lon: 11.0431, name: 'San Gimignano' },
    'cortona': { lat: 43.2756, lon: 11.9853, name: 'Cortona' },
    'montepulciano': { lat: 43.0996, lon: 11.7819, name: 'Montepulciano' },
    'montalcino': { lat: 43.0586, lon: 11.4897, name: 'Montalcino' },
    'arezzo': { lat: 43.4633, lon: 11.8797, name: 'Arezzo' },
    'ravenna': { lat: 44.4184, lon: 12.2035, name: 'Ravenna' },
    'rimini': { lat: 44.0678, lon: 12.5695, name: 'Rimini' },
    'parma': { lat: 44.8015, lon: 10.3279, name: 'Parma' },
    'modena': { lat: 44.6471, lon: 10.9252, name: 'Modena' },
    'ferrara': { lat: 44.8381, lon: 11.6199, name: 'Ferrara' },
    'bergamo': { lat: 45.6983, lon: 9.6773, name: 'Bergamo' },
    'brescia': { lat: 45.5416, lon: 10.2118, name: 'Brescia' },
    'como': { lat: 45.8081, lon: 9.0852, name: 'Como' },
    'bellagio': { lat: 45.9878, lon: 9.2622, name: 'Bellagio' },
    'stresa': { lat: 45.8842, lon: 8.5328, name: 'Stresa' },
    'aosta': { lat: 45.7370, lon: 7.3152, name: 'Aosta' },
    'courmayeur': { lat: 45.7967, lon: 6.9687, name: 'Courmayeur' },
    'cortina': { lat: 46.5369, lon: 12.1356, name: 'Cortina d\'Ampezzo' },
    'bolzano': { lat: 46.4983, lon: 11.3548, name: 'Bolzano' },
    'merano': { lat: 46.6713, lon: 11.1594, name: 'Merano' },
    'trento': { lat: 46.0748, lon: 11.1217, name: 'Trento' }
};

/**
 * Get coordinates for a city (from cache or geocoding API)
 */
async function getCityCoordinates(cityName) {
    const normalized = cityName.toLowerCase().trim();

    // Check local cache first
    if (CITY_COORDS_CACHE[normalized]) {
        return CITY_COORDS_CACHE[normalized];
    }

    // Try geocoding API
    try {
        const url = `${GEOCODING_API}/search?name=${encodeURIComponent(cityName)}&count=1&language=it`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const coords = {
                lat: result.latitude,
                lon: result.longitude,
                name: result.name
            };
            // Cache for future use
            CITY_COORDS_CACHE[normalized] = coords;
            return coords;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }

    return null;
}

/**
 * Get weather condition from WMO code
 */
function getWeatherInfo(code) {
    return WMO_CONDITIONS[code] || { condition: 'Sconosciuto', icon: '🌡️' };
}

/**
 * Check Supabase cache for weather data
 */
async function getCachedWeather(city, date) {
    try {
        const supabase = window.supabaseClient;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('weather_cache')
            .select('*')
            .eq('city', city)
            .eq('forecast_date', date)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (error || !data) return null;

        return {
            city: data.city,
            date: data.forecast_date,
            temp_min: parseFloat(data.temp_min),
            temp_max: parseFloat(data.temp_max),
            precipitation_probability: data.precipitation_probability,
            weather_code: data.weather_code,
            ...getWeatherInfo(data.weather_code),
            cached: true
        };
    } catch (error) {
        return null;
    }
}

/**
 * Save weather to Supabase cache
 */
async function cacheWeather(weatherData) {
    try {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS);

        await supabase
            .from('weather_cache')
            .upsert({
                city: weatherData.city,
                latitude: weatherData.latitude,
                longitude: weatherData.longitude,
                forecast_date: weatherData.date,
                temp_min: weatherData.temp_min,
                temp_max: weatherData.temp_max,
                temp_avg: (weatherData.temp_min + weatherData.temp_max) / 2,
                precipitation_probability: weatherData.precipitation_probability,
                weather_code: weatherData.weather_code,
                condition: weatherData.condition,
                condition_icon: weatherData.icon,
                expires_at: expiresAt.toISOString(),
                api_source: 'open-meteo'
            }, {
                onConflict: 'city,forecast_date'
            });
    } catch (error) {
        console.error('Cache weather error:', error);
    }
}

/**
 * Fetch weather forecast for a city (7 days)
 * @param {string} cityName - City name
 * @returns {Promise<Array>} Array of daily forecasts
 */
export async function getWeatherForecast(cityName) {
    const coords = await getCityCoordinates(cityName);
    if (!coords) {
        console.warn(`City not found: ${cityName}`);
        return null;
    }

    try {
        const url = `${OPEN_METEO_API}/forecast?` + new URLSearchParams({
            latitude: coords.lat,
            longitude: coords.lon,
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode',
            timezone: 'auto',
            forecast_days: '7'
        });

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (!data.daily || !data.daily.time) {
            return null;
        }

        const forecast = data.daily.time.map((date, i) => {
            const weatherInfo = getWeatherInfo(data.daily.weathercode[i]);
            const weatherData = {
                city: coords.name,
                latitude: coords.lat,
                longitude: coords.lon,
                date: date,
                temp_min: Math.round(data.daily.temperature_2m_min[i]),
                temp_max: Math.round(data.daily.temperature_2m_max[i]),
                precipitation_probability: data.daily.precipitation_probability_max[i] || 0,
                weather_code: data.daily.weathercode[i],
                ...weatherInfo
            };

            // Cache each day
            cacheWeather(weatherData);

            return weatherData;
        });

        return forecast;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

/**
 * Get weather for a specific city and date
 * @param {string} cityName - City name
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherForDate(cityName, date) {
    // Check cache first
    const cached = await getCachedWeather(cityName, date);
    if (cached) {
        console.log(`✓ Weather cache hit: ${cityName} ${date}`);
        return cached;
    }

    // Fetch forecast (includes the date we need)
    const forecast = await getWeatherForecast(cityName);
    if (!forecast) return null;

    // Find the specific date
    const dayWeather = forecast.find(d => d.date === date);
    return dayWeather || forecast[0]; // Return first day if date not found
}

/**
 * Get weather for multiple cities on specific dates (for tour days)
 * @param {Array} tourDays - Array of { date, city } objects
 * @returns {Promise<Map>} Map of date -> weather data
 */
export async function getWeatherForTourDays(tourDays) {
    const weatherMap = new Map();

    // Group by city to minimize API calls
    const citiesNeeded = new Set();
    tourDays.forEach(day => {
        if (day.city) citiesNeeded.add(day.city);
    });

    // Fetch forecast for each city
    const cityForecasts = new Map();
    for (const city of citiesNeeded) {
        const forecast = await getWeatherForecast(city);
        if (forecast) {
            cityForecasts.set(city.toLowerCase(), forecast);
        }
    }

    // Map weather to tour days
    tourDays.forEach(day => {
        if (!day.city || !day.date) return;

        const forecast = cityForecasts.get(day.city.toLowerCase());
        if (forecast) {
            const dayWeather = forecast.find(w => w.date === day.date);
            if (dayWeather) {
                weatherMap.set(day.date, dayWeather);
            }
        }
    });

    return weatherMap;
}

/**
 * Format temperature display
 */
export function formatTemp(min, max) {
    return `${max}°/${min}°`;
}

/**
 * Get weather summary for display
 */
export function getWeatherSummary(weather) {
    if (!weather) return { icon: '❓', temp: '--°', condition: 'N/D' };
    return {
        icon: weather.icon,
        temp: formatTemp(weather.temp_min, weather.temp_max),
        condition: weather.condition,
        rain: weather.precipitation_probability
    };
}

export { getWeatherInfo, getCityCoordinates };
