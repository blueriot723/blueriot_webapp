/**
 * Cities Database with Region, Country, and Phone Prefix
 * BlueRiot Webapp
 */

export const CITIES_DB = {
    // ITALY
    'roma': { region: 'Lazio', country: 'Italia', prefix: '+39', lat: 41.9028, lng: 12.4964 },
    'milano': { region: 'Lombardia', country: 'Italia', prefix: '+39', lat: 45.4642, lng: 9.19 },
    'firenze': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.7696, lng: 11.2558 },
    'venezia': { region: 'Veneto', country: 'Italia', prefix: '+39', lat: 45.4408, lng: 12.3155 },
    'napoli': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.8518, lng: 14.2681 },
    'torino': { region: 'Piemonte', country: 'Italia', prefix: '+39', lat: 45.0703, lng: 7.6869 },
    'bologna': { region: 'Emilia-Romagna', country: 'Italia', prefix: '+39', lat: 44.4949, lng: 11.3426 },
    'palermo': { region: 'Sicilia', country: 'Italia', prefix: '+39', lat: 38.1157, lng: 13.3615 },
    'genova': { region: 'Liguria', country: 'Italia', prefix: '+39', lat: 44.4056, lng: 8.9463 },
    'bari': { region: 'Puglia', country: 'Italia', prefix: '+39', lat: 41.1171, lng: 16.8719 },
    'catania': { region: 'Sicilia', country: 'Italia', prefix: '+39', lat: 37.5079, lng: 15.083 },
    'verona': { region: 'Veneto', country: 'Italia', prefix: '+39', lat: 45.4384, lng: 10.9916 },
    'pisa': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.7228, lng: 10.4017 },
    'siena': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.3188, lng: 11.3308 },
    'perugia': { region: 'Umbria', country: 'Italia', prefix: '+39', lat: 43.1107, lng: 12.3908 },
    'trieste': { region: 'Friuli-Venezia Giulia', country: 'Italia', prefix: '+39', lat: 45.6495, lng: 13.7768 },
    'trento': { region: 'Trentino-Alto Adige', country: 'Italia', prefix: '+39', lat: 46.0679, lng: 11.1211 },
    'aosta': { region: 'Valle d\'Aosta', country: 'Italia', prefix: '+39', lat: 45.7372, lng: 7.3155 },
    'ancona': { region: 'Marche', country: 'Italia', prefix: '+39', lat: 43.6158, lng: 13.5189 },
    'cagliari': { region: 'Sardegna', country: 'Italia', prefix: '+39', lat: 39.2238, lng: 9.1217 },
    'potenza': { region: 'Basilicata', country: 'Italia', prefix: '+39', lat: 40.6404, lng: 15.8052 },
    'catanzaro': { region: 'Calabria', country: 'Italia', prefix: '+39', lat: 38.9098, lng: 16.5877 },
    'campobasso': { region: 'Molise', country: 'Italia', prefix: '+39', lat: 41.5603, lng: 14.6627 },
    'l\'aquila': { region: 'Abruzzo', country: 'Italia', prefix: '+39', lat: 42.3498, lng: 13.3995 },
    'ravenna': { region: 'Emilia-Romagna', country: 'Italia', prefix: '+39', lat: 44.4184, lng: 12.2035 },
    'rimini': { region: 'Emilia-Romagna', country: 'Italia', prefix: '+39', lat: 44.0593, lng: 12.5681 },
    'modena': { region: 'Emilia-Romagna', country: 'Italia', prefix: '+39', lat: 44.6471, lng: 10.9252 },
    'parma': { region: 'Emilia-Romagna', country: 'Italia', prefix: '+39', lat: 44.8015, lng: 10.328 },
    'bergamo': { region: 'Lombardia', country: 'Italia', prefix: '+39', lat: 45.6983, lng: 9.6773 },
    'brescia': { region: 'Lombardia', country: 'Italia', prefix: '+39', lat: 45.5416, lng: 10.2118 },
    'padova': { region: 'Veneto', country: 'Italia', prefix: '+39', lat: 45.4064, lng: 11.8768 },
    'vicenza': { region: 'Veneto', country: 'Italia', prefix: '+39', lat: 45.5455, lng: 11.5354 },
    'treviso': { region: 'Veneto', country: 'Italia', prefix: '+39', lat: 45.6669, lng: 12.243 },
    'udine': { region: 'Friuli-Venezia Giulia', country: 'Italia', prefix: '+39', lat: 46.0711, lng: 13.2346 },
    'bolzano': { region: 'Trentino-Alto Adige', country: 'Italia', prefix: '+39', lat: 46.4983, lng: 11.3548 },
    'lecce': { region: 'Puglia', country: 'Italia', prefix: '+39', lat: 40.3516, lng: 18.175 },
    'taranto': { region: 'Puglia', country: 'Italia', prefix: '+39', lat: 40.4644, lng: 17.247 },
    'messina': { region: 'Sicilia', country: 'Italia', prefix: '+39', lat: 38.1938, lng: 15.5542 },
    'siracusa': { region: 'Sicilia', country: 'Italia', prefix: '+39', lat: 37.0755, lng: 15.2866 },
    'taormina': { region: 'Sicilia', country: 'Italia', prefix: '+39', lat: 37.8526, lng: 15.2876 },
    'sorrento': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.6263, lng: 14.3758 },
    'amalfi': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.634, lng: 14.6028 },
    'positano': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.6281, lng: 14.485 },
    'capri': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.5533, lng: 14.2225 },
    'ischia': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.7265, lng: 13.9009 },
    'pompei': { region: 'Campania', country: 'Italia', prefix: '+39', lat: 40.7462, lng: 14.5007 },
    'matera': { region: 'Basilicata', country: 'Italia', prefix: '+39', lat: 40.6664, lng: 16.6043 },
    'alberobello': { region: 'Puglia', country: 'Italia', prefix: '+39', lat: 40.7847, lng: 17.2376 },
    'san gimignano': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.4677, lng: 11.0427 },
    'lucca': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.8429, lng: 10.5027 },
    'arezzo': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.4633, lng: 11.8797 },
    'cortona': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.2752, lng: 11.9854 },
    'montepulciano': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.1001, lng: 11.7832 },
    'montalcino': { region: 'Toscana', country: 'Italia', prefix: '+39', lat: 43.0568, lng: 11.4903 },
    'assisi': { region: 'Umbria', country: 'Italia', prefix: '+39', lat: 43.0707, lng: 12.6196 },
    'orvieto': { region: 'Umbria', country: 'Italia', prefix: '+39', lat: 42.7186, lng: 12.1105 },
    'spoleto': { region: 'Umbria', country: 'Italia', prefix: '+39', lat: 42.7311, lng: 12.7378 },
    'todi': { region: 'Umbria', country: 'Italia', prefix: '+39', lat: 42.7818, lng: 12.4076 },
    'cinque terre': { region: 'Liguria', country: 'Italia', prefix: '+39', lat: 44.1461, lng: 9.6439 },
    'portofino': { region: 'Liguria', country: 'Italia', prefix: '+39', lat: 44.3034, lng: 9.2097 },
    'sanremo': { region: 'Liguria', country: 'Italia', prefix: '+39', lat: 43.8184, lng: 7.7756 },
    'como': { region: 'Lombardia', country: 'Italia', prefix: '+39', lat: 45.8081, lng: 9.0852 },
    'bellagio': { region: 'Lombardia', country: 'Italia', prefix: '+39', lat: 45.9867, lng: 9.2621 },
    'stresa': { region: 'Piemonte', country: 'Italia', prefix: '+39', lat: 45.8843, lng: 8.5337 },
    'courmayeur': { region: 'Valle d\'Aosta', country: 'Italia', prefix: '+39', lat: 45.7947, lng: 6.9692 },

    // FRANCE
    'parigi': { region: 'Île-de-France', country: 'Francia', prefix: '+33', lat: 48.8566, lng: 2.3522 },
    'paris': { region: 'Île-de-France', country: 'Francia', prefix: '+33', lat: 48.8566, lng: 2.3522 },
    'nizza': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.7102, lng: 7.262 },
    'nice': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.7102, lng: 7.262 },
    'marsiglia': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.2965, lng: 5.3698 },
    'marseille': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.2965, lng: 5.3698 },
    'lione': { region: 'Auvergne-Rhône-Alpes', country: 'Francia', prefix: '+33', lat: 45.764, lng: 4.8357 },
    'lyon': { region: 'Auvergne-Rhône-Alpes', country: 'Francia', prefix: '+33', lat: 45.764, lng: 4.8357 },
    'bordeaux': { region: 'Nouvelle-Aquitaine', country: 'Francia', prefix: '+33', lat: 44.8378, lng: -0.5792 },
    'strasburgo': { region: 'Grand Est', country: 'Francia', prefix: '+33', lat: 48.5734, lng: 7.7521 },
    'strasbourg': { region: 'Grand Est', country: 'Francia', prefix: '+33', lat: 48.5734, lng: 7.7521 },
    'cannes': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.5528, lng: 7.0174 },
    'monaco': { region: 'Monaco', country: 'Monaco', prefix: '+377', lat: 43.7384, lng: 7.4246 },
    'montecarlo': { region: 'Monaco', country: 'Monaco', prefix: '+377', lat: 43.7402, lng: 7.4266 },
    'avignone': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.9493, lng: 4.8055 },
    'avignon': { region: 'Provence-Alpes-Côte d\'Azur', country: 'Francia', prefix: '+33', lat: 43.9493, lng: 4.8055 },

    // SPAIN
    'barcellona': { region: 'Catalogna', country: 'Spagna', prefix: '+34', lat: 41.3874, lng: 2.1686 },
    'barcelona': { region: 'Catalogna', country: 'Spagna', prefix: '+34', lat: 41.3874, lng: 2.1686 },
    'madrid': { region: 'Comunità di Madrid', country: 'Spagna', prefix: '+34', lat: 40.4168, lng: -3.7038 },
    'siviglia': { region: 'Andalusia', country: 'Spagna', prefix: '+34', lat: 37.3891, lng: -5.9845 },
    'sevilla': { region: 'Andalusia', country: 'Spagna', prefix: '+34', lat: 37.3891, lng: -5.9845 },
    'valencia': { region: 'Comunità Valenciana', country: 'Spagna', prefix: '+34', lat: 39.4699, lng: -0.3763 },
    'granada': { region: 'Andalusia', country: 'Spagna', prefix: '+34', lat: 37.1773, lng: -3.5986 },
    'malaga': { region: 'Andalusia', country: 'Spagna', prefix: '+34', lat: 36.7213, lng: -4.4214 },
    'bilbao': { region: 'Paesi Baschi', country: 'Spagna', prefix: '+34', lat: 43.263, lng: -2.935 },

    // GERMANY
    'berlino': { region: 'Berlino', country: 'Germania', prefix: '+49', lat: 52.52, lng: 13.405 },
    'berlin': { region: 'Berlino', country: 'Germania', prefix: '+49', lat: 52.52, lng: 13.405 },
    'monaco di baviera': { region: 'Baviera', country: 'Germania', prefix: '+49', lat: 48.1351, lng: 11.582 },
    'munich': { region: 'Baviera', country: 'Germania', prefix: '+49', lat: 48.1351, lng: 11.582 },
    'münchen': { region: 'Baviera', country: 'Germania', prefix: '+49', lat: 48.1351, lng: 11.582 },
    'francoforte': { region: 'Assia', country: 'Germania', prefix: '+49', lat: 50.1109, lng: 8.6821 },
    'frankfurt': { region: 'Assia', country: 'Germania', prefix: '+49', lat: 50.1109, lng: 8.6821 },
    'amburgo': { region: 'Amburgo', country: 'Germania', prefix: '+49', lat: 53.5511, lng: 9.9937 },
    'hamburg': { region: 'Amburgo', country: 'Germania', prefix: '+49', lat: 53.5511, lng: 9.9937 },
    'colonia': { region: 'Renania Settentrionale-Vestfalia', country: 'Germania', prefix: '+49', lat: 50.9375, lng: 6.9603 },
    'cologne': { region: 'Renania Settentrionale-Vestfalia', country: 'Germania', prefix: '+49', lat: 50.9375, lng: 6.9603 },

    // UK
    'londra': { region: 'Greater London', country: 'Regno Unito', prefix: '+44', lat: 51.5074, lng: -0.1278 },
    'london': { region: 'Greater London', country: 'Regno Unito', prefix: '+44', lat: 51.5074, lng: -0.1278 },
    'edimburgo': { region: 'Scozia', country: 'Regno Unito', prefix: '+44', lat: 55.9533, lng: -3.1883 },
    'edinburgh': { region: 'Scozia', country: 'Regno Unito', prefix: '+44', lat: 55.9533, lng: -3.1883 },
    'manchester': { region: 'Greater Manchester', country: 'Regno Unito', prefix: '+44', lat: 53.4808, lng: -2.2426 },
    'liverpool': { region: 'Merseyside', country: 'Regno Unito', prefix: '+44', lat: 53.4084, lng: -2.9916 },

    // SWITZERLAND
    'zurigo': { region: 'Zurigo', country: 'Svizzera', prefix: '+41', lat: 47.3769, lng: 8.5417 },
    'zurich': { region: 'Zurigo', country: 'Svizzera', prefix: '+41', lat: 47.3769, lng: 8.5417 },
    'ginevra': { region: 'Ginevra', country: 'Svizzera', prefix: '+41', lat: 46.2044, lng: 6.1432 },
    'geneva': { region: 'Ginevra', country: 'Svizzera', prefix: '+41', lat: 46.2044, lng: 6.1432 },
    'berna': { region: 'Berna', country: 'Svizzera', prefix: '+41', lat: 46.948, lng: 7.4474 },
    'bern': { region: 'Berna', country: 'Svizzera', prefix: '+41', lat: 46.948, lng: 7.4474 },
    'lucerna': { region: 'Lucerna', country: 'Svizzera', prefix: '+41', lat: 47.0502, lng: 8.3093 },
    'lucerne': { region: 'Lucerna', country: 'Svizzera', prefix: '+41', lat: 47.0502, lng: 8.3093 },
    'interlaken': { region: 'Berna', country: 'Svizzera', prefix: '+41', lat: 46.6863, lng: 7.8632 },
    'zermatt': { region: 'Vallese', country: 'Svizzera', prefix: '+41', lat: 46.0207, lng: 7.7491 },

    // AUSTRIA
    'vienna': { region: 'Vienna', country: 'Austria', prefix: '+43', lat: 48.2082, lng: 16.3738 },
    'wien': { region: 'Vienna', country: 'Austria', prefix: '+43', lat: 48.2082, lng: 16.3738 },
    'salisburgo': { region: 'Salisburghese', country: 'Austria', prefix: '+43', lat: 47.8095, lng: 13.055 },
    'salzburg': { region: 'Salisburghese', country: 'Austria', prefix: '+43', lat: 47.8095, lng: 13.055 },
    'innsbruck': { region: 'Tirolo', country: 'Austria', prefix: '+43', lat: 47.2692, lng: 11.4041 },

    // NETHERLANDS
    'amsterdam': { region: 'Olanda Settentrionale', country: 'Paesi Bassi', prefix: '+31', lat: 52.3676, lng: 4.9041 },
    'rotterdam': { region: 'Olanda Meridionale', country: 'Paesi Bassi', prefix: '+31', lat: 51.9244, lng: 4.4777 },

    // BELGIUM
    'bruxelles': { region: 'Bruxelles-Capitale', country: 'Belgio', prefix: '+32', lat: 50.8503, lng: 4.3517 },
    'brussels': { region: 'Bruxelles-Capitale', country: 'Belgio', prefix: '+32', lat: 50.8503, lng: 4.3517 },
    'bruges': { region: 'Fiandre Occidentali', country: 'Belgio', prefix: '+32', lat: 51.2093, lng: 3.2247 },

    // PORTUGAL
    'lisbona': { region: 'Area Metropolitana di Lisbona', country: 'Portogallo', prefix: '+351', lat: 38.7223, lng: -9.1393 },
    'lisbon': { region: 'Area Metropolitana di Lisbona', country: 'Portogallo', prefix: '+351', lat: 38.7223, lng: -9.1393 },
    'porto': { region: 'Norte', country: 'Portogallo', prefix: '+351', lat: 41.1579, lng: -8.6291 },

    // GREECE
    'atene': { region: 'Attica', country: 'Grecia', prefix: '+30', lat: 37.9838, lng: 23.7275 },
    'athens': { region: 'Attica', country: 'Grecia', prefix: '+30', lat: 37.9838, lng: 23.7275 },
    'santorini': { region: 'Egeo Meridionale', country: 'Grecia', prefix: '+30', lat: 36.3932, lng: 25.4615 },
    'mykonos': { region: 'Egeo Meridionale', country: 'Grecia', prefix: '+30', lat: 37.4467, lng: 25.3289 },

    // CROATIA
    'dubrovnik': { region: 'Regione raguseo-narentana', country: 'Croazia', prefix: '+385', lat: 42.6507, lng: 18.0944 },
    'spalato': { region: 'Regione spalatino-dalmata', country: 'Croazia', prefix: '+385', lat: 43.5081, lng: 16.4402 },
    'split': { region: 'Regione spalatino-dalmata', country: 'Croazia', prefix: '+385', lat: 43.5081, lng: 16.4402 },
    'zagabria': { region: 'Città di Zagabria', country: 'Croazia', prefix: '+385', lat: 45.815, lng: 15.9819 },
    'zagreb': { region: 'Città di Zagabria', country: 'Croazia', prefix: '+385', lat: 45.815, lng: 15.9819 },

    // CZECH REPUBLIC
    'praga': { region: 'Praga', country: 'Repubblica Ceca', prefix: '+420', lat: 50.0755, lng: 14.4378 },
    'prague': { region: 'Praga', country: 'Repubblica Ceca', prefix: '+420', lat: 50.0755, lng: 14.4378 },

    // HUNGARY
    'budapest': { region: 'Budapest', country: 'Ungheria', prefix: '+36', lat: 47.4979, lng: 19.0402 },

    // POLAND
    'varsavia': { region: 'Masovia', country: 'Polonia', prefix: '+48', lat: 52.2297, lng: 21.0122 },
    'warsaw': { region: 'Masovia', country: 'Polonia', prefix: '+48', lat: 52.2297, lng: 21.0122 },
    'cracovia': { region: 'Piccola Polonia', country: 'Polonia', prefix: '+48', lat: 50.0647, lng: 19.945 },
    'krakow': { region: 'Piccola Polonia', country: 'Polonia', prefix: '+48', lat: 50.0647, lng: 19.945 },

    // IRELAND
    'dublino': { region: 'Leinster', country: 'Irlanda', prefix: '+353', lat: 53.3498, lng: -6.2603 },
    'dublin': { region: 'Leinster', country: 'Irlanda', prefix: '+353', lat: 53.3498, lng: -6.2603 },

    // TURKEY
    'istanbul': { region: 'Marmara', country: 'Turchia', prefix: '+90', lat: 41.0082, lng: 28.9784 },

    // SLOVENIA
    'lubiana': { region: 'Slovenia Centrale', country: 'Slovenia', prefix: '+386', lat: 46.0569, lng: 14.5058 },
    'ljubljana': { region: 'Slovenia Centrale', country: 'Slovenia', prefix: '+386', lat: 46.0569, lng: 14.5058 },
    'bled': { region: 'Alta Carniola', country: 'Slovenia', prefix: '+386', lat: 46.3683, lng: 14.1146 }
};

/**
 * Get city info from database
 * @param {string} cityName - City name to look up
 * @returns {object|null} City info with region, country, prefix, lat, lng
 */
export function getCityInfo(cityName) {
    if (!cityName) return null;
    const normalized = cityName.toLowerCase().trim();
    return CITIES_DB[normalized] || null;
}

/**
 * Get all cities for autocomplete
 * @returns {string[]} Array of city names
 */
export function getAllCities() {
    return Object.keys(CITIES_DB).map(city =>
        city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
}

/**
 * Search cities by partial match
 * @param {string} query - Search query
 * @returns {Array} Matching cities with their info
 */
export function searchCities(query) {
    if (!query || query.length < 2) return [];
    const normalized = query.toLowerCase().trim();
    const results = [];

    for (const [cityName, info] of Object.entries(CITIES_DB)) {
        if (cityName.includes(normalized)) {
            results.push({
                name: cityName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                ...info
            });
        }
    }

    return results.slice(0, 10); // Limit to 10 results
}

/**
 * Get phone prefix by country name
 * @param {string} country - Country name
 * @returns {string} Phone prefix
 */
export function getPhonePrefix(country) {
    const prefixMap = {
        'Italia': '+39',
        'Francia': '+33',
        'Spagna': '+34',
        'Germania': '+49',
        'Regno Unito': '+44',
        'Svizzera': '+41',
        'Austria': '+43',
        'Paesi Bassi': '+31',
        'Belgio': '+32',
        'Portogallo': '+351',
        'Grecia': '+30',
        'Croazia': '+385',
        'Repubblica Ceca': '+420',
        'Ungheria': '+36',
        'Polonia': '+48',
        'Irlanda': '+353',
        'Turchia': '+90',
        'Slovenia': '+386',
        'Monaco': '+377'
    };
    return prefixMap[country] || '+39';
}

/**
 * Generate Google Maps link from coordinates or address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} [name] - Place name for search
 * @returns {string} Google Maps URL
 */
export function getGoogleMapsLink(lat, lng, name = null) {
    if (lat && lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    if (name) {
        return `https://www.google.com/maps/search/${encodeURIComponent(name)}`;
    }
    return '';
}

/**
 * Generate What3Words link
 * @param {string} words - What3Words address (e.g., "filled.count.soap")
 * @returns {string} What3Words URL
 */
export function getWhat3WordsLink(words) {
    if (!words) return '';
    // Remove /// prefix if present
    const cleanWords = words.replace(/^\/\/\//, '');
    return `https://what3words.com/${cleanWords}`;
}
