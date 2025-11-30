// Parser Controller - eTicket Reader

import * as eticketReader from '../services/eticket-reader.service.js';
import { extractQRFromImage } from '../lib/parsers/qr.extractor.js';
import { extractBarcodeFromImage } from '../lib/parsers/barcode.extractor.js';

/**
 * Parse eTicket from PDF
 * POST /api/parser/eticket/pdf
 */
export async function parseETicketPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { tourId, userId } = req.body;

    const result = await eticketReader.parseETicketFromPDF(
      req.file.buffer,
      req.file.originalname,
      tourId,
      userId
    );

    res.json(result);
  } catch (error) {
    console.error('Parse eTicket PDF error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Parse eTicket from image (QR or Barcode)
 * POST /api/parser/eticket/image
 */
export async function parseETicketImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { tourId, userId } = req.body;

    const result = await eticketReader.parseETicketFromImage(
      req.file.buffer,
      req.file.originalname,
      tourId,
      userId
    );

    res.json(result);
  } catch (error) {
    console.error('Parse eTicket image error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Parse QR code only
 * POST /api/parser/qr
 */
export async function parseQRCode(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await extractQRFromImage(req.file.buffer);

    res.json(result);
  } catch (error) {
    console.error('Parse QR code error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Parse barcode only
 * POST /api/parser/barcode
 */
export async function parseBarcode(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await extractBarcodeFromImage(req.file.buffer);

    res.json(result);
  } catch (error) {
    console.error('Parse barcode error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Parse multiple eTickets (batch)
 * POST /api/parser/eticket/batch
 */
export async function parseBatchETickets(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { tourId, userId } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        let result;

        if (file.mimetype === 'application/pdf') {
          result = await eticketReader.parseETicketFromPDF(
            file.buffer,
            file.originalname,
            tourId,
            userId
          );
        } else {
          result = await eticketReader.parseETicketFromImage(
            file.buffer,
            file.originalname,
            tourId,
            userId
          );
        }

        results.push({
          filename: file.originalname,
          ...result
        });
      } catch (error) {
        results.push({
          filename: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      count: req.files.length,
      results
    });
  } catch (error) {
    console.error('Parse batch eTickets error:', error);
    res.status(500).json({ error: error.message });
  }
}
