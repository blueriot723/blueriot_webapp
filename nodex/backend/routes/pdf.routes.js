import express from 'express';
import * as pdfController from '../controllers/pdf.controller.js';

const router = express.Router();

// Generate SΤΔΥ OCP (hotel PDF)
// GET /api/pdf/stay/:stayId?tourId=xxx
router.get('/stay/:stayId', pdfController.generateStayOCP);

// Generate R0UT35 OCP (transport PDF)
// GET /api/pdf/routes/:routeId?tourId=xxx
router.get('/routes/:routeId', pdfController.generateRoutesOCP);

// Generate NODΞ Daily Operative Plan PDF
// GET /api/pdf/nodex/day/:dayId?includeWeather=true
router.get('/nodex/day/:dayId', pdfController.generateNodexDayOCP);

// Generate complete tour OCP (all days)
// GET /api/pdf/nodex/tour/:tourId?includeWeather=true
router.get('/nodex/tour/:tourId', pdfController.generateCompleteTourOCP);

// Generate batch OCPs
// POST /api/pdf/batch
// Body: { items: [{type, id, tourId?, includeWeather?}] }
router.post('/batch', pdfController.generateBatchOCPs);

// Preview OCP data (without generating PDF)
// GET /api/pdf/preview/:type/:id
router.get('/preview/:type/:id', pdfController.previewOCP);

export default router;
