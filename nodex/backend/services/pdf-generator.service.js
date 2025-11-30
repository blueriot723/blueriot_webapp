// PDF Generator Service - Orchestrates OCP generation

import { generateStayOCP } from '../lib/templates/stay.template.js';
import { generateRoutesOCP } from '../lib/templates/routes.template.js';
import { generateNodexOCP } from '../lib/templates/nodex.template.js';
import { supabase } from '../lib/db.js';
import { getWeatherForCityAndDate } from './weather.service.js';

/**
 * Generate SΤΔΥ OCP (Hotel/Accommodation)
 * @param {string} stayId - ID from blueriot_stay table
 * @param {string} tourId - Optional tour ID for context
 * @returns {Promise<Object>} - {success, pdfBytes, filename}
 */
export async function generateStayPDF(stayId, tourId = null) {
  try {
    // Fetch stay data
    const { data: stayData, error } = await supabase
      .from('blueriot_stay')
      .select('*')
      .eq('id', stayId)
      .single();

    if (error) throw error;

    if (!stayData) {
      throw new Error('Stay not found');
    }

    // Fetch tour data if provided
    let tourData = null;
    if (tourId) {
      const { data: tour } = await supabase
        .from('tours')
        .select('tour_name, start_date, end_date')
        .eq('id', tourId)
        .single();

      if (tour) {
        tourData = {
          tour_name: tour.tour_name,
          dates: `${tour.start_date} - ${tour.end_date}`
        };
      }
    }

    // Generate PDF
    const pdfBytes = await generateStayOCP(stayData, tourData);

    const filename = `STAY_${sanitizeFilename(stayData.name)}_${Date.now()}.pdf`;

    return {
      success: true,
      pdfBytes,
      filename,
      stayData
    };
  } catch (error) {
    console.error('Generate SΤΔΥ PDF error:', error);
    throw error;
  }
}

/**
 * Generate R0UT35 OCP (Transport)
 * @param {string} routeId - ID from blueriot_routes table
 * @param {string} tourId - Optional tour ID for context
 * @returns {Promise<Object>} - {success, pdfBytes, filename}
 */
export async function generateRoutesPDF(routeId, tourId = null) {
  try {
    // Fetch route data
    const { data: routeData, error } = await supabase
      .from('blueriot_routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (error) throw error;

    if (!routeData) {
      throw new Error('Route not found');
    }

    // Fetch tour data if provided
    let tourData = null;
    if (tourId) {
      const { data: tour } = await supabase
        .from('tours')
        .select('tour_name')
        .eq('id', tourId)
        .single();

      if (tour) {
        tourData = {
          tour_name: tour.tour_name
        };

        // Try to find which day this route belongs to
        const { data: day } = await supabase
          .from('tour_days')
          .select('logical_day_number')
          .eq('tour_id', tourId)
          .contains('routes_ids', [routeId])
          .single();

        if (day) {
          tourData.day_number = day.logical_day_number;
        }
      }
    }

    // Generate PDF
    const pdfBytes = await generateRoutesOCP(routeData, tourData);

    const filename = `ROUTES_${sanitizeFilename(routeData.name || 'transport')}_${Date.now()}.pdf`;

    return {
      success: true,
      pdfBytes,
      filename,
      routeData
    };
  } catch (error) {
    console.error('Generate R0UT35 PDF error:', error);
    throw error;
  }
}

/**
 * Generate NODΞ Daily Operative Plan
 * @param {string} dayId - ID from tour_days table
 * @param {boolean} includeWeather - Whether to include weather forecast
 * @returns {Promise<Object>} - {success, pdfBytes, filename}
 */
export async function generateNodexDayPDF(dayId, includeWeather = true) {
  try {
    // Fetch day data
    const { data: dayData, error: dayError } = await supabase
      .from('tour_days')
      .select('*')
      .eq('id', dayId)
      .single();

    if (dayError) throw dayError;

    if (!dayData) {
      throw new Error('Day not found');
    }

    // Fetch day items
    const { data: items } = await supabase
      .from('day_items')
      .select('*')
      .eq('day_id', dayId)
      .order('position', { ascending: true });

    dayData.items = items || [];

    // Fetch tour data
    let tourData = null;
    if (dayData.tour_id) {
      const { data: tour } = await supabase
        .from('tours')
        .select('tour_name')
        .eq('id', dayData.tour_id)
        .single();

      if (tour) {
        tourData = {
          tour_name: tour.tour_name
        };
      }
    }

    // Fetch hotel data if available
    if (dayData.hotel_id) {
      const { data: hotel } = await supabase
        .from('blueriot_stay')
        .select('name, address, phone')
        .eq('id', dayData.hotel_id)
        .single();

      if (hotel) {
        dayData.hotel_data = hotel;
      }
    }

    // Fetch weather data if requested
    let weatherData = null;
    if (includeWeather && dayData.cities && dayData.cities.length > 0 && dayData.calendar_date) {
      const mainCity = dayData.cities[0];
      try {
        weatherData = await getWeatherForCityAndDate(mainCity, dayData.calendar_date);
      } catch (weatherError) {
        console.warn('Weather fetch failed, continuing without weather:', weatherError.message);
      }
    }

    // Generate PDF
    const pdfBytes = await generateNodexOCP(dayData, tourData, weatherData);

    const dayNumber = dayData.logical_day_number || 1;
    const filename = `NODEX_Day${dayNumber}_${Date.now()}.pdf`;

    return {
      success: true,
      pdfBytes,
      filename,
      dayData,
      weatherData
    };
  } catch (error) {
    console.error('Generate NODΞ PDF error:', error);
    throw error;
  }
}

/**
 * Generate complete tour OCP (all days)
 * @param {string} tourId - Tour ID
 * @param {boolean} includeWeather - Whether to include weather
 * @returns {Promise<Object>} - {success, pdfBytes, filename}
 */
export async function generateCompleteTourPDF(tourId, includeWeather = true) {
  try {
    // Fetch tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError) throw tourError;

    if (!tour) {
      throw new Error('Tour not found');
    }

    // Fetch all days
    const { data: days, error: daysError } = await supabase
      .from('tour_days')
      .select('*')
      .eq('tour_id', tourId)
      .order('logical_day_number', { ascending: true });

    if (daysError) throw daysError;

    if (!days || days.length === 0) {
      throw new Error('No days found for this tour');
    }

    // Generate PDF for each day and merge
    // For now, we'll use pdf-lib to merge pages
    const { PDFDocument } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();

    for (const day of days) {
      const dayPdfResult = await generateNodexDayPDF(day.id, includeWeather);
      const dayPdf = await PDFDocument.load(dayPdfResult.pdfBytes);
      const copiedPages = await mergedPdf.copyPages(dayPdf, dayPdf.getPageIndices());

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    const pdfBytes = await mergedPdf.save();
    const filename = `NODEX_${sanitizeFilename(tour.tour_name)}_Complete_${Date.now()}.pdf`;

    return {
      success: true,
      pdfBytes,
      filename,
      tourData: tour,
      daysCount: days.length
    };
  } catch (error) {
    console.error('Generate complete tour PDF error:', error);
    throw error;
  }
}

/**
 * Generate batch OCPs for multiple items
 * @param {Array} items - Array of {type, id} where type is 'stay', 'routes', or 'day'
 * @returns {Promise<Array>} - Array of results
 */
export async function generateBatchPDFs(items) {
  const results = [];

  for (const item of items) {
    try {
      let result;

      switch (item.type) {
        case 'stay':
          result = await generateStayPDF(item.id, item.tourId);
          break;
        case 'routes':
          result = await generateRoutesPDF(item.id, item.tourId);
          break;
        case 'day':
          result = await generateNodexDayPDF(item.id, item.includeWeather !== false);
          break;
        default:
          throw new Error(`Unknown OCP type: ${item.type}`);
      }

      results.push({
        type: item.type,
        id: item.id,
        ...result
      });
    } catch (error) {
      results.push({
        type: item.type,
        id: item.id,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Sanitize filename
 * @param {string} name
 * @returns {string}
 */
function sanitizeFilename(name) {
  if (!name) return 'document';

  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
}
