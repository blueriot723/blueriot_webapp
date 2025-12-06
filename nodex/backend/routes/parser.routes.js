import express from 'express';
import multer from 'multer';
import * as parserController from '../controllers/parser.controller.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// Parse eTicket from PDF
router.post('/eticket/pdf', upload.single('file'), parserController.parseETicketPDF);

// Parse eTicket from image (QR/Barcode)
router.post('/eticket/image', upload.single('file'), parserController.parseETicketImage);

// Parse QR code
router.post('/qr', upload.single('file'), parserController.parseQRCode);

// Parse barcode
router.post('/barcode', upload.single('file'), parserController.parseBarcode);

// Batch parse multiple tickets
router.post('/eticket/batch', upload.array('files', 20), parserController.parseBatchETickets);

export default router;
