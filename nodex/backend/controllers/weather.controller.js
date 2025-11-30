// Weather Controller - Integrated with weather.service.js

import * as weatherService from '../services/weather.service.js';

/**
 * Get weather for city and date
 * GET /api/weather/:city/:date
 */
export async function getWeather(req, res) {
  try {
    const { city, date } = req.params;

    if (!city || !date) {
      return res.status(400).json({ error: 'City and date are required' });
    }

    const weather = await weatherService.getWeatherForCityAndDate(city, date);

    if (!weather) {
      return res.status(404).json({ error: 'Weather data not available' });
    }

    res.json({
      success: true,
      weather
    });
  } catch (error) {
    console.error('Get weather error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get 7-day forecast for city
 * GET /api/weather/forecast/:city
 */
export async function getForecast(req, res) {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const forecast = await weatherService.getForecastForCity(city);

    res.json({
      success: true,
      city,
      days: forecast.length,
      forecast
    });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get weather for all cities in a tour
 * GET /api/weather/tour/:tourId
 */
export async function getWeatherForTour(req, res) {
  try {
    const { tourId } = req.params;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID is required' });
    }

    const weatherData = await weatherService.getWeatherForTour(tourId);

    res.json({
      success: true,
      ...weatherData
    });
  } catch (error) {
    console.error('Get weather for tour error:', error);
    res.status(500).json({ error: error.message });
  }
}
