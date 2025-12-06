// Barcode Extractor - Uses @zxing/library to read barcodes

import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType
} from '@zxing/library';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';

/**
 * Extract barcode from image buffer
 * Supports: EAN, Code128, Code39, Code93, ITF, UPC, Aztec, DataMatrix, PDF417
 * @param {Buffer} imageBuffer
 * @returns {Promise<Object>} - {success, data, format, type}
 */
export async function extractBarcodeFromImage(imageBuffer) {
  try {
    // Convert buffer to PNG using sharp
    const pngBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();

    // Load image with canvas
    const img = await loadImage(pngBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    // Create reader with hints
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.AZTEC,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);

    // Decode from ImageData
    const result = await reader.decodeFromImageData(
      new Uint8ClampedArray(imageData.data),
      img.width,
      img.height
    );

    if (!result) {
      return {
        success: false,
        error: 'No barcode found in image',
        data: null
      };
    }

    return {
      success: true,
      data: result.getText(),
      format: BarcodeFormat[result.getBarcodeFormat()],
      type: getBarcodeType(result.getBarcodeFormat()),
      rawResult: result
    };
  } catch (error) {
    console.error('Barcode extraction error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Get barcode type category
 * @param {number} format - BarcodeFormat number
 * @returns {string}
 */
function getBarcodeType(format) {
  const formatName = BarcodeFormat[format];

  if (formatName === 'QR_CODE') return 'qr';
  if (['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E'].includes(formatName)) return 'product';
  if (['CODE_128', 'CODE_39', 'CODE_93'].includes(formatName)) return 'code';
  if (formatName === 'PDF_417') return 'pdf417';
  if (formatName === 'AZTEC') return 'aztec';
  if (formatName === 'DATA_MATRIX') return 'datamatrix';
  if (formatName === 'ITF') return 'itf';

  return 'other';
}

/**
 * Parse barcode data based on type
 * @param {string} barcodeData
 * @param {string} format
 * @returns {Object} - {parsedData, ticketInfo}
 */
export function parseBarcodeData(barcodeData, format) {
  if (!barcodeData) {
    return { parsedData: null, ticketInfo: null };
  }

  const parsed = {
    rawData: barcodeData,
    format,
    type: null,
    ticketInfo: {}
  };

  // Try to detect ticket-related patterns
  const patterns = {
    ticketNumber: /(?:TICKET|TKT|#)\s*[:=]?\s*([A-Z0-9-]+)/i,
    passNumber: /(?:PASS|PSS)\s*[:=]?\s*([A-Z0-9-]+)/i,
    validFrom: /(?:VALID FROM|FROM|DESDE)\s*[:=]?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i,
    validTo: /(?:VALID TO|TO|UNTIL|HASTA)\s*[:=]?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i,
    operator: /(?:OPERATOR|OP|COMPANY)\s*[:=]?\s*([A-Z\s]+)/i,
    zone: /(?:ZONE|ZONA)\s*[:=]?\s*([A-Z0-9-]+)/i
  };

  // Check each pattern
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = barcodeData.match(pattern);
    if (match) {
      parsed.ticketInfo[key] = match[1].trim();
      parsed.type = 'ticket';
    }
  }

  // If format is PDF417 or Aztec, likely a ticket
  if (['PDF_417', 'AZTEC'].includes(format)) {
    parsed.type = parsed.type || 'ticket';
  }

  // If no ticket patterns found but contains transport keywords
  if (!parsed.type && /BUS|TRAIN|METRO|FERRY|TRAM|TRENO|AUTOBUS/i.test(barcodeData)) {
    parsed.type = 'transport_ticket';
  }

  return parsed;
}

/**
 * Extract barcode with automatic retry on failure
 * @param {Buffer} imageBuffer
 * @param {number} maxRetries
 * @returns {Promise<Object>}
 */
export async function extractBarcodeWithRetry(imageBuffer, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await extractBarcodeFromImage(imageBuffer);

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // Try image enhancements on retry
      if (attempt < maxRetries) {
        imageBuffer = await sharp(imageBuffer)
          .greyscale()
          .normalize()
          .sharpen()
          .toBuffer();
      }
    } catch (error) {
      lastError = error.message;
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries + 1} attempts: ${lastError}`,
    data: null
  };
}
