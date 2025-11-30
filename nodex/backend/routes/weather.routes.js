import express from 'express';
import * as weatherController from '../controllers/weather.controller.js';

const router = express.Router();

// Get weather for city and date
router.get('/:city/:date', weatherController.getWeather);

// Get weather forecast for city (7 days)
router.get('/forecast/:city', weatherController.getForecast);

// Get weather for all cities in a tour
router.get('/tour/:tourId', weatherController.getWeatherForTour);

export default router;
