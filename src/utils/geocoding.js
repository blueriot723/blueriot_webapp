/**
 * OpenStreetMap Nominatim Geocoding Utility
 * Per autocompletamento località e coordinate per meteo
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Cache per evitare troppe chiamate
const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

/**
 * Cerca località con autocompletamento
 * @param {string} query - Testo di ricerca
 * @param {object} options - Opzioni di ricerca
 * @returns {Promise<Array>} - Lista di risultati
 */
export async function searchLocations(query, options = {}) {
    if (!query || query.length < 2) return [];

    const {
        limit = 5,
        countrycodes = 'it,ch,at,fr,de,es,pt,gb,gr,hr,si', // Paesi europei comuni per tour
        lang = 'it'
    } = options;

    // Check cache
    const cacheKey = `${query}-${limit}-${countrycodes}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: limit.toString(),
            'accept-language': lang
        });

        if (countrycodes) {
            params.append('countrycodes', countrycodes);
        }

        const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
            headers: {
                'User-Agent': 'BlueRiot-Syndicate-TourApp/1.0'
            }
        });

        if (!response.ok) throw new Error('Nominatim API error');

        const data = await response.json();

        const results = data.map(item => ({
            name: item.display_name,
            shortName: formatShortName(item),
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
            class: item.class,
            address: item.address,
            city: item.address?.city || item.address?.town || item.address?.village || item.address?.municipality,
            region: item.address?.state || item.address?.region || item.address?.province,
            country: item.address?.country,
            countryCode: item.address?.country_code?.toUpperCase()
        }));

        // Cache results
        searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

        return results;

    } catch (error) {
        console.error('Geocoding search error:', error);
        return [];
    }
}

/**
 * Formatta nome breve per visualizzazione
 */
function formatShortName(item) {
    const addr = item.address || {};
    const parts = [];

    // Nome principale
    const name = addr.tourism || addr.amenity || addr.natural ||
                 addr.peak || addr.mountain || addr.village ||
                 addr.town || addr.city || item.name?.split(',')[0];
    if (name) parts.push(name);

    // Regione/Provincia
    const region = addr.province || addr.state || addr.region;
    if (region && region !== name) parts.push(region);

    // Paese (abbreviato)
    const country = addr.country_code?.toUpperCase();
    if (country) parts.push(country);

    return parts.join(', ');
}

/**
 * Ottieni coordinate da nome località
 * @param {string} locationName - Nome località
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
export async function getCoordinates(locationName) {
    const results = await searchLocations(locationName, { limit: 1 });
    if (results.length > 0) {
        return { lat: results[0].lat, lon: results[0].lon };
    }
    return null;
}

/**
 * Reverse geocoding - da coordinate a indirizzo
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object|null>}
 */
export async function reverseGeocode(lat, lon) {
    try {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lon: lon.toString(),
            format: 'json',
            addressdetails: '1',
            'accept-language': 'it'
        });

        const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
            headers: {
                'User-Agent': 'BlueRiot-Syndicate-TourApp/1.0'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();

        return {
            name: data.display_name,
            shortName: formatShortName(data),
            address: data.address,
            city: data.address?.city || data.address?.town || data.address?.village,
            region: data.address?.state || data.address?.region,
            country: data.address?.country
        };

    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

/**
 * Crea un componente autocomplete per un input
 * @param {HTMLInputElement} input - Input element
 * @param {object} options - Opzioni
 * @param {function} onSelect - Callback quando selezionato
 */
export function createAutocomplete(input, options = {}, onSelect = null) {
    const {
        minChars = 2,
        delay = 300,
        maxResults = 6,
        countrycodes = 'it,ch,at,fr,de,es,pt,gb,gr,hr,si'
    } = options;

    let debounceTimer = null;
    let dropdown = null;
    let selectedIndex = -1;

    // Crea dropdown
    const createDropdown = () => {
        if (dropdown) return dropdown;

        dropdown = document.createElement('div');
        dropdown.className = 'osm-autocomplete-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #0a0e27;
            border: 1px solid rgba(0, 229, 255, 0.3);
            border-radius: 6px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        // Assicura che il parent abbia position relative
        const parent = input.parentElement;
        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }

        parent.appendChild(dropdown);
        return dropdown;
    };

    // Render results
    const renderResults = (results) => {
        const dd = createDropdown();
        selectedIndex = -1;

        if (results.length === 0) {
            dd.style.display = 'none';
            return;
        }

        dd.innerHTML = results.map((r, i) => `
            <div class="osm-autocomplete-item" data-index="${i}" style="
                padding: 10px 12px;
                cursor: pointer;
                border-bottom: 1px solid rgba(0, 229, 255, 0.1);
                transition: background 0.2s;
                font-size: 13px;
            ">
                <div style="color: #fff; margin-bottom: 2px;">${r.shortName}</div>
                <div style="color: #6b7280; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${r.name}
                </div>
            </div>
        `).join('');

        dd.style.display = 'block';

        // Click handler
        dd.querySelectorAll('.osm-autocomplete-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0, 229, 255, 0.1)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                selectResult(results[idx]);
            });
        });
    };

    // Select result
    const selectResult = (result) => {
        input.value = result.shortName;
        input.dataset.lat = result.lat;
        input.dataset.lon = result.lon;
        input.dataset.city = result.city || '';
        input.dataset.region = result.region || '';
        input.dataset.country = result.country || '';

        if (dropdown) dropdown.style.display = 'none';

        if (onSelect) onSelect(result);
    };

    // Input handler
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        if (query.length < minChars) {
            if (dropdown) dropdown.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            const results = await searchLocations(query, {
                limit: maxResults,
                countrycodes
            });
            renderResults(results);
        }, delay);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (!dropdown || dropdown.style.display === 'none') return;

        const items = dropdown.querySelectorAll('.osm-autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });

    const updateSelection = (items) => {
        items.forEach((item, i) => {
            item.style.background = i === selectedIndex ? 'rgba(0, 229, 255, 0.2)' : 'transparent';
        });
    };

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Focus shows dropdown if has content
    input.addEventListener('focus', () => {
        if (dropdown && dropdown.children.length > 0 && input.value.length >= minChars) {
            dropdown.style.display = 'block';
        }
    });

    return {
        destroy: () => {
            if (dropdown) dropdown.remove();
            clearTimeout(debounceTimer);
        }
    };
}

/**
 * Versione per Shadow DOM - crea autocomplete all'interno di un shadow root
 */
export function createShadowAutocomplete(shadowRoot, input, options = {}, onSelect = null) {
    const {
        minChars = 2,
        delay = 300,
        maxResults = 6,
        countrycodes = 'it,ch,at,fr,de,es,pt,gb,gr,hr,si'
    } = options;

    let debounceTimer = null;
    let dropdown = null;
    let selectedIndex = -1;
    let currentResults = [];

    // Inject styles if not already present
    if (!shadowRoot.querySelector('#osm-autocomplete-styles')) {
        const style = document.createElement('style');
        style.id = 'osm-autocomplete-styles';
        style.textContent = `
            .osm-autocomplete-wrapper {
                position: relative;
                display: inline-block;
                width: 100%;
            }
            .osm-autocomplete-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: #0a0e27;
                border: 1px solid rgba(0, 229, 255, 0.3);
                border-radius: 6px;
                max-height: 250px;
                overflow-y: auto;
                z-index: 9999;
                display: none;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                margin-top: 2px;
            }
            .osm-autocomplete-item {
                padding: 10px 12px;
                cursor: pointer;
                border-bottom: 1px solid rgba(0, 229, 255, 0.1);
                transition: background 0.2s;
                font-size: 13px;
            }
            .osm-autocomplete-item:hover,
            .osm-autocomplete-item.selected {
                background: rgba(0, 229, 255, 0.15);
            }
            .osm-autocomplete-item:last-child {
                border-bottom: none;
            }
            .osm-autocomplete-name {
                color: #fff;
                margin-bottom: 2px;
            }
            .osm-autocomplete-detail {
                color: #6b7280;
                font-size: 11px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .osm-autocomplete-loading {
                padding: 12px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
            }
        `;
        shadowRoot.appendChild(style);
    }

    // Wrap input if needed
    let wrapper = input.parentElement;
    if (!wrapper.classList.contains('osm-autocomplete-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'osm-autocomplete-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    }

    // Create dropdown
    dropdown = document.createElement('div');
    dropdown.className = 'osm-autocomplete-dropdown';
    wrapper.appendChild(dropdown);

    // Render results
    const renderResults = (results) => {
        currentResults = results;
        selectedIndex = -1;

        if (results.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = results.map((r, i) => `
            <div class="osm-autocomplete-item" data-index="${i}">
                <div class="osm-autocomplete-name">${r.shortName}</div>
                <div class="osm-autocomplete-detail">${r.name}</div>
            </div>
        `).join('');

        dropdown.style.display = 'block';

        // Click handlers
        dropdown.querySelectorAll('.osm-autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                selectResult(currentResults[idx]);
            });
        });
    };

    // Show loading
    const showLoading = () => {
        dropdown.innerHTML = '<div class="osm-autocomplete-loading">Ricerca...</div>';
        dropdown.style.display = 'block';
    };

    // Select result
    const selectResult = (result) => {
        input.value = result.shortName;
        input.dataset.lat = result.lat;
        input.dataset.lon = result.lon;
        input.dataset.city = result.city || '';
        input.dataset.region = result.region || '';
        input.dataset.country = result.country || '';

        dropdown.style.display = 'none';

        // Dispatch change event
        input.dispatchEvent(new Event('change', { bubbles: true }));

        if (onSelect) onSelect(result);
    };

    // Input handler
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        if (query.length < minChars) {
            dropdown.style.display = 'none';
            return;
        }

        showLoading();

        debounceTimer = setTimeout(async () => {
            const results = await searchLocations(query, {
                limit: maxResults,
                countrycodes
            });
            renderResults(results);
        }, delay);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (dropdown.style.display === 'none') return;

        const items = dropdown.querySelectorAll('.osm-autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });

    const updateSelection = (items) => {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
        // Scroll into view
        if (items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    };

    // Close on click outside (within shadow root)
    shadowRoot.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Focus shows dropdown if has content
    input.addEventListener('focus', () => {
        if (currentResults.length > 0 && input.value.length >= minChars) {
            dropdown.style.display = 'block';
        }
    });

    return {
        destroy: () => {
            dropdown.remove();
            clearTimeout(debounceTimer);
        },
        refresh: () => {
            if (input.value.length >= minChars) {
                input.dispatchEvent(new Event('input'));
            }
        }
    };
}
