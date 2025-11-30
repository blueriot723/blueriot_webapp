// Geo Utils - City coordinates and location helpers

// Major Italian/European cities with coordinates
export const CITY_COORDINATES = {
  // Italy
  'roma': { lat: 41.9028, lon: 12.4964, name: 'Roma' },
  'rome': { lat: 41.9028, lon: 12.4964, name: 'Roma' },
  'firenze': { lat: 43.7696, lon: 11.2558, name: 'Firenze' },
  'florence': { lat: 43.7696, lon: 11.2558, name: 'Firenze' },
  'venezia': { lat: 45.4408, lon: 12.3155, name: 'Venezia' },
  'venice': { lat: 45.4408, lon: 12.3155, name: 'Venezia' },
  'milano': { lat: 45.4642, lon: 9.1900, name: 'Milano' },
  'milan': { lat: 45.4642, lon: 9.1900, name: 'Milano' },
  'napoli': { lat: 40.8518, lon: 14.2681, name: 'Napoli' },
  'naples': { lat: 40.8518, lon: 14.2681, name: 'Napoli' },
  'torino': { lat: 45.0703, lon: 7.6869, name: 'Torino' },
  'turin': { lat: 45.0703, lon: 7.6869, name: 'Torino' },
  'bologna': { lat: 44.4949, lon: 11.3426, name: 'Bologna' },
  'genova': { lat: 44.4056, lon: 8.9463, name: 'Genova' },
  'genoa': { lat: 44.4056, lon: 8.9463, name: 'Genova' },
  'verona': { lat: 45.4384, lon: 10.9916, name: 'Verona' },
  'palermo': { lat: 38.1157, lon: 13.3615, name: 'Palermo' },
  'pisa': { lat: 43.7228, lon: 10.4017, name: 'Pisa' },
  'siena': { lat: 43.3188, lon: 11.3308, name: 'Siena' },
  'perugia': { lat: 43.1107, lon: 12.3908, name: 'Perugia' },
  'assisi': { lat: 43.0706, lon: 12.6186, name: 'Assisi' },
  'cinque terre': { lat: 44.1276, lon: 9.7182, name: 'Cinque Terre' },
  'amalfi': { lat: 40.6340, lon: 14.6027, name: 'Amalfi' },
  'positano': { lat: 40.6280, lon: 14.4850, name: 'Positano' },
  'sorrento': { lat: 40.6260, lon: 14.3757, name: 'Sorrento' },
  'capri': { lat: 40.5508, lon: 14.2417, name: 'Capri' },

  // Other European cities
  'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  'barcelona': { lat: 41.3851, lon: 2.1734, name: 'Barcelona' },
  'madrid': { lat: 40.4168, lon: -3.7038, name: 'Madrid' },
  'berlin': { lat: 52.5200, lon: 13.4050, name: 'Berlin' },
  'munich': { lat: 48.1351, lon: 11.5820, name: 'Munich' },
  'vienna': { lat: 48.2082, lon: 16.3738, name: 'Vienna' },
  'prague': { lat: 50.0755, lon: 14.4378, name: 'Prague' },
  'amsterdam': { lat: 52.3676, lon: 4.9041, name: 'Amsterdam' },
  'london': { lat: 51.5074, lon: -0.1278, name: 'London' },
  'zurich': { lat: 47.3769, lon: 8.5417, name: 'Zurich' },
  'geneva': { lat: 46.2044, lon: 6.1432, name: 'Geneva' },
  'nice': { lat: 43.7102, lon: 7.2620, name: 'Nice' },
  'marseille': { lat: 43.2965, lon: 5.3698, name: 'Marseille' },
  'lyon': { lat: 45.7640, lon: 4.8357, name: 'Lyon' }
};

/**
 * Get coordinates for a city
 * @param {string} cityName - City name (case-insensitive)
 * @returns {Object|null} - {lat, lon, name} or null if not found
 */
export function getCityCoordinates(cityName) {
  if (!cityName) return null;

  const normalized = cityName.toLowerCase().trim();
  const coords = CITY_COORDINATES[normalized];

  return coords || null;
}

/**
 * Calculate distance between two points (Haversine formula)
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} - Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Find nearest known city to coordinates
 * @param {number} lat
 * @param {number} lon
 * @returns {Object} - Nearest city with distance
 */
export function findNearestCity(lat, lon) {
  let nearest = null;
  let minDistance = Infinity;

  for (const [key, city] of Object.entries(CITY_COORDINATES)) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...city, distance };
    }
  }

  return nearest;
}

/**
 * Validate coordinates
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function isValidCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
}
