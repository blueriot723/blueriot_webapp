// PDF Controller - OCP Generator

import * as pdfGenerator from '../services/pdf-generator.service.js';

/**
 * Generate SΤΔΥ OCP (Hotel/Accommodation PDF)
 * GET /api/pdf/stay/:stayId
 */
export async function generateStayOCP(req, res) {
  try {
    const { stayId } = req.params;
    const { tourId } = req.query;

    const result = await pdfGenerator.generateStayPDF(stayId, tourId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.pdfBytes));
  } catch (error) {
    console.error('Generate SΤΔΥ OCP error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Generate R0UT35 OCP (Transport PDF)
 * GET /api/pdf/routes/:routeId
 */
export async function generateRoutesOCP(req, res) {
  try {
    const { routeId } = req.params;
    const { tourId } = req.query;

    const result = await pdfGenerator.generateRoutesPDF(routeId, tourId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.pdfBytes));
  } catch (error) {
    console.error('Generate R0UT35 OCP error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Generate NODΞ Daily Operative Plan PDF
 * GET /api/pdf/nodex/day/:dayId
 */
export async function generateNodexDayOCP(req, res) {
  try {
    const { dayId } = req.params;
    const { includeWeather } = req.query;

    const result = await pdfGenerator.generateNodexDayPDF(
      dayId,
      includeWeather !== 'false'
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.pdfBytes));
  } catch (error) {
    console.error('Generate NODΞ day OCP error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Generate complete tour OCP (all days)
 * GET /api/pdf/nodex/tour/:tourId
 */
export async function generateCompleteTourOCP(req, res) {
  try {
    const { tourId } = req.params;
    const { includeWeather } = req.query;

    const result = await pdfGenerator.generateCompleteTourPDF(
      tourId,
      includeWeather !== 'false'
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.pdfBytes));
  } catch (error) {
    console.error('Generate complete tour OCP error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Generate batch OCPs
 * POST /api/pdf/batch
 * Body: { items: [{type, id, tourId?, includeWeather?}] }
 */
export async function generateBatchOCPs(req, res) {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Invalid request. Expected array of items: [{type, id}]'
      });
    }

    const results = await pdfGenerator.generateBatchPDFs(items);

    // Return JSON with success/error for each item
    // The PDFs themselves would need to be handled separately
    // (e.g., zip file, or return URLs)
    res.json({
      success: true,
      count: items.length,
      results: results.map(r => ({
        type: r.type,
        id: r.id,
        success: r.success,
        filename: r.filename,
        error: r.error
      }))
    });
  } catch (error) {
    console.error('Generate batch OCPs error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Preview OCP data (without generating PDF)
 * GET /api/pdf/preview/:type/:id
 */
export async function previewOCP(req, res) {
  try {
    const { type, id } = req.params;

    let result;

    switch (type) {
      case 'stay':
        result = await pdfGenerator.generateStayPDF(id);
        break;
      case 'routes':
        result = await pdfGenerator.generateRoutesPDF(id);
        break;
      case 'day':
        result = await pdfGenerator.generateNodexDayPDF(id);
        break;
      default:
        return res.status(400).json({ error: 'Invalid type. Use: stay, routes, or day' });
    }

    // Return data without PDF bytes
    res.json({
      success: true,
      type,
      filename: result.filename,
      data: result.stayData || result.routeData || result.dayData,
      weatherData: result.weatherData
    });
  } catch (error) {
    console.error('Preview OCP error:', error);
    res.status(500).json({ error: error.message });
  }
}
