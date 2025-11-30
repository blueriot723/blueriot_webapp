// Weather Controller

export async function getWeather(req, res) {
  try {
    const { city, date } = req.params;
    // TODO: Implement weather fetching
    res.json({ city, date, weather: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getForecast(req, res) {
  try {
    const { city } = req.params;
    // TODO: Implement forecast fetching (7 days)
    res.json({ city, forecast: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getWeatherForTour(req, res) {
  try {
    const { tourId } = req.params;
    // TODO: Fetch weather for all cities in tour
    res.json({ tourId, weather: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
