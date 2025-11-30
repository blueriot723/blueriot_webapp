import express from 'express';
import * as pdfController from '../controllers/pdf.controller.js';

const router = express.Router();

// Generate SΤΔΥ OCP (hotels list)
router.get('/ocp/stay/:tourId', pdfController.generateStayOCP);

// Generate R0UT35 OCP (transport schedule)
router.get('/ocp/routes/:tourId', pdfController.generateRoutesOCP);

// Generate NODΞ OCP (daily operative plan)
router.get('/ocp/nodex/:tourId', pdfController.generateNodexOCP);

// Generate all OCPs for a tour (zip file)
router.get('/ocp/all/:tourId', pdfController.generateAllOCPs);

// Generate custom PDF from template
router.post('/generate', pdfController.generateCustomPDF);

export default router;
