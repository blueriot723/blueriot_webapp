-- =====================================================
-- MIGRATION 004: WEATHER CACHE
-- =====================================================
-- Cache weather data to reduce API calls

CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Location
    city VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    -- Date
    forecast_date DATE NOT NULL,

    -- Weather data
    temp_min DECIMAL(4,1),
    temp_max DECIMAL(4,1),
    temp_avg DECIMAL(4,1),
    feels_like DECIMAL(4,1),

    precipitation_mm DECIMAL(5,1),
    precipitation_probability INTEGER, -- 0-100

    wind_speed_kmh DECIMAL(5,1),
    wind_direction INTEGER, -- 0-360 degrees

    weather_code INTEGER, -- WMO weather code
    condition VARCHAR(100), -- clear, cloudy, rain, snow, etc.
    condition_icon VARCHAR(50),

    sunrise TIME,
    sunset TIME,

    -- Full API response (for future use)
    raw_data JSONB,

    -- Cache metadata
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    api_source VARCHAR(100) DEFAULT 'open-meteo'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weather_city ON weather_cache(city);
CREATE INDEX IF NOT EXISTS idx_weather_date ON weather_cache(forecast_date);
CREATE INDEX IF NOT EXISTS idx_weather_expires ON weather_cache(expires_at);

-- Unique constraint (one cache entry per city+date)
CREATE UNIQUE INDEX IF NOT EXISTS idx_weather_unique
    ON weather_cache(city, forecast_date);

-- Comments
COMMENT ON TABLE weather_cache IS 'Cached weather forecasts from Open-Meteo API';
COMMENT ON COLUMN weather_cache.weather_code IS 'WMO weather interpretation code';
COMMENT ON COLUMN weather_cache.expires_at IS 'Cache expiration (typically 6-12 hours)';
