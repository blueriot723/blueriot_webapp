import express from 'express';
import multer from 'multer';
import * as vcardController from '../controllers/vcard.controller.js';

const router = express.Router();

// Configure multer for vCard file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/vcard' || file.originalname.endsWith('.vcf')) {
      cb(null, true);
    } else {
      cb(new Error('Only vCard (.vcf) files are allowed'));
    }
  }
});

// Import single vCard
router.post('/import', upload.single('vcard'), vcardController.importVCard);

// Import multiple vCards
router.post('/import/batch', upload.array('vcards', 50), vcardController.importBatch);

// Parse vCard (returns parsed data without saving)
router.post('/parse', upload.single('vcard'), vcardController.parseVCard);

export default router;
