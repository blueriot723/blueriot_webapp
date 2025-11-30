// Weather Service - Open-Meteo API integration with caching

import fetch from 'node-fetch';
import { supabase } from '../lib/db.js';
import { getCityCoordinates } from '../lib/utils/geo.utils.js';
import { formatDateForAPI, getDateRange, addDaysToDate } from '../lib/utils/date.utils.js';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1';
const CACHE_HOURS = 6; // Cache weather for 6 hours

/**
 * Get weather for a specific city and date
 * @param {string} cityName
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function getWeatherForCityAndDate(cityName, date) {
  // Check cache first
  const cached = await getCachedWeather(cityName, date);
  if (cached) {
    console.log(`✓ Weather cache hit: ${cityName} ${date}`);
    return cached;
  }

  // Fetch from API
  console.log(`→ Fetching weather from API: ${cityName} ${date}`);
  const weather = await fetchWeatherFromAPI(cityName, date);

  // Cache the result
  if (weather) {
    await cacheWeather(cityName, date, weather);
  }

  return weather;
}

/**
 * Get 7-day forecast for a city
 * @param {string} cityName
 * @returns {Promise<Array>}
 */
export async function getForecastForCity(cityName) {
  const coords = getCityCoordinates(cityName);
  if (!coords) {
    throw new Error(`City not found: ${cityName}`);
  }

  const today = new Date();
  const dates = getDateRange(today, 7);

  const url = `${OPEN_METEO_API}/forecast?` + new URLSearchParams({
    latitude: coords.lat,
    longitude: coords.lon,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode',
    timezone: 'auto'
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse and cache each day
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const weatherData = {
        city: coords.name,
        latitude: coords.lat,
        longitude: coords.lon,
        forecast_date: data.daily.time[i],
        temp_min: data.daily.temperature_2m_min[i],
        temp_max: data.daily.temperature_2m_max[i],
        temp_avg: (data.daily.temperature_2m_min[i] + data.daily.temperature_2m_max[i]) / 2,
        precipitation_mm: data.daily.precipitation_sum[i] || 0,
        precipitation_probability: data.daily.precipitation_probability_max[i] || 0,
        wind_speed_kmh: data.daily.windspeed_10m_max[i] || 0,
        weather_code: data.daily.weathercode[i],
        condition: getWeatherCondition(data.daily.weathercode[i]),
        condition_icon: getWeatherIcon(data.daily.weathercode[i])
      };

      forecast.push(weatherData);

      // Cache each day
      await cacheWeather(coords.name, data.daily.time[i], weatherData);
    }

    return forecast;
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
}

/**
 * Get weather for all cities in a tour
 * @param {string} tourId
 * @returns {Promise<Object>}
 */
export async function getWeatherForTour(tourId) {
  try {
    // Get all days for the tour
    const { data: days, error } = await supabase
      .from('tour_days')
      .select('id, calendar_date, cities')
      .eq('tour_id', tourId)
      .order('calendar_date', { ascending: true });

    if (error) throw error;

    // Collect unique cities
    const citySet = new Set();
    days.forEach(day => {
      if (day.cities && Array.isArray(day.cities)) {
        day.cities.forEach(city => citySet.add(city.toLowerCase()));
      }
    });

    const cities = Array.from(citySet);

    // Fetch weather for each city and date
    const weatherByDay = {};

    for (const day of days) {
      const dayWeather = [];

      if (day.cities && Array.isArray(day.cities)) {
        for (const city of day.cities) {
          try {
            const weather = await getWeatherForCityAndDate(city, day.calendar_date);
            if (weather) {
              dayWeather.push(weather);
            }
          } catch (err) {
            console.error(`Error fetching weather for ${city}:`, err.message);
          }
        }
      }

      weatherByDay[day.id] = {
        date: day.calendar_date,
        cities: day.cities || [],
        weather: dayWeather
      };
    }

    return {
      tourId,
      totalDays: days.length,
      cities: Array.from(citySet),
      weatherByDay
    };
  } catch (error) {
    console.error('Get weather for tour error:', error);
    throw error;
  }
}

/**
 * Fetch weather from Open-Meteo API
 * @param {string} cityName
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Object>}
 */
async function fetchWeatherFromAPI(cityName, date) {
  const coords = getCityCoordinates(cityName);
  if (!coords) {
    throw new Error(`City not found: ${cityName}`);
  }

  const url = `${OPEN_METEO_API}/forecast?` + new URLSearchParams({
    latitude: coords.lat,
    longitude: coords.lon,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode,sunrise,sunset',
    start_date: date,
    end_date: date,
    timezone: 'auto'
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      return null;
    }

    return {
      city: coords.name,
      latitude: coords.lat,
      longitude: coords.lon,
      forecast_date: data.daily.time[0],
      temp_min: data.daily.temperature_2m_min[0],
      temp_max: data.daily.temperature_2m_max[0],
      temp_avg: (data.daily.temperature_2m_min[0] + data.daily.temperature_2m_max[0]) / 2,
      precipitation_mm: data.daily.precipitation_sum[0] || 0,
      precipitation_probability: data.daily.precipitation_probability_max[0] || 0,
      wind_speed_kmh: data.daily.windspeed_10m_max[0] || 0,
      weather_code: data.daily.weathercode[0],
      condition: getWeatherCondition(data.daily.weathercode[0]),
      condition_icon: getWeatherIcon(data.daily.weathercode[0]),
      sunrise: data.daily.sunrise ? data.daily.sunrise[0] : null,
      sunset: data.daily.sunset ? data.daily.sunset[0] : null
    };
  } catch (error) {
    console.error('Fetch weather error:', error);
    throw error;
  }
}

/**
 * Get cached weather from database
 * @param {string} cityName
 * @param {string} date
 * @returns {Promise<Object|null>}
 */
async function getCachedWeather(cityName, date) {
  try {
    const { data, error } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('city', cityName)
      .eq('forecast_date', date)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;

    return {
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      forecast_date: data.forecast_date,
      temp_min: parseFloat(data.temp_min),
      temp_max: parseFloat(data.temp_max),
      temp_avg: parseFloat(data.temp_avg),
      precipitation_mm: parseFloat(data.precipitation_mm),
      precipitation_probability: data.precipitation_probability,
      wind_speed_kmh: parseFloat(data.wind_speed_kmh),
      weather_code: data.weather_code,
      condition: data.condition,
      condition_icon: data.condition_icon,
      sunrise: data.sunrise,
      sunset: data.sunset,
      cached: true
    };
  } catch (error) {
    console.error('Get cached weather error:', error);
    return null;
  }
}

/**
 * Cache weather data in database
 * @param {string} cityName
 * @param {string} date
 * @param {Object} weatherData
 */
async function cacheWeather(cityName, date, weatherData) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS);

    const cacheData = {
      city: cityName,
      latitude: weatherData.latitude,
      longitude: weatherData.longitude,
      forecast_date: date,
      temp_min: weatherData.temp_min,
      temp_max: weatherData.temp_max,
      temp_avg: weatherData.temp_avg,
      precipitation_mm: weatherData.precipitation_mm,
      precipitation_probability: weatherData.precipitation_probability,
      wind_speed_kmh: weatherData.wind_speed_kmh,
      weather_code: weatherData.weather_code,
      condition: weatherData.condition,
      condition_icon: weatherData.condition_icon,
      sunrise: weatherData.sunrise || null,
      sunset: weatherData.sunset || null,
      expires_at: expiresAt.toISOString(),
      api_source: 'open-meteo'
    };

    const { error } = await supabase
      .from('weather_cache')
      .upsert(cacheData, {
        onConflict: 'city,forecast_date'
      });

    if (error) {
      console.error('Cache weather error:', error);
    }
  } catch (error) {
    console.error('Cache weather error:', error);
  }
}

/**
 * Get weather condition from WMO code
 * @param {number} code
 * @returns {string}
 */
function getWeatherCondition(code) {
  const conditions = {
    0: 'clear',
    1: 'mainly_clear',
    2: 'partly_cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'fog',
    51: 'light_drizzle',
    53: 'drizzle',
    55: 'heavy_drizzle',
    61: 'light_rain',
    63: 'rain',
    65: 'heavy_rain',
    71: 'light_snow',
    73: 'snow',
    75: 'heavy_snow',
    77: 'snow_grains',
    80: 'light_rain_showers',
    81: 'rain_showers',
    82: 'heavy_rain_showers',
    85: 'light_snow_showers',
    86: 'snow_showers',
    95: 'thunderstorm',
    96: 'thunderstorm_hail',
    99: 'thunderstorm_heavy_hail'
  };

  return conditions[code] || 'unknown';
}

/**
 * Get weather icon emoji from WMO code
 * @param {number} code
 * @returns {string}
 */
function getWeatherIcon(code) {
  const icons = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌧️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '🌨️',
    73: '❄️',
    75: '❄️',
    77: '🌨️',
    80: '🌦️',
    81: '🌧️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
  };

  return icons[code] || '🌡️';
}
