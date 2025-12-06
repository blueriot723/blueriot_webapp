// QR Code Extractor - Uses jsQR to read QR codes from images

import jsQR from 'jsqr';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';

/**
 * Extract QR code from image buffer
 * @param {Buffer} imageBuffer
 * @returns {Promise<Object>} - {success, data, location}
 */
export async function extractQRFromImage(imageBuffer) {
  try {
    // Convert image to raw RGBA using sharp
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    // Use jsQR to detect QR code
    const code = jsQR(new Uint8ClampedArray(data), width, height, {
      inversionAttempts: 'dontInvert'
    });

    if (!code) {
      return {
        success: false,
        error: 'No QR code found in image',
        data: null
      };
    }

    return {
      success: true,
      data: code.data,
      location: code.location,
      version: code.version,
      errorCorrectionLevel: code.errorCorrectionLevel
    };
  } catch (error) {
    console.error('QR extraction error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Extract multiple QR codes from image
 * (In case there are multiple QR codes in the same image)
 * @param {Buffer} imageBuffer
 * @returns {Promise<Array>}
 */
export async function extractMultipleQRCodes(imageBuffer) {
  try {
    // For now, jsQR only finds one code at a time
    // This is a placeholder for future enhancement
    const result = await extractQRFromImage(imageBuffer);

    if (result.success) {
      return [result];
    }

    return [];
  } catch (error) {
    console.error('Multiple QR extraction error:', error);
    return [];
  }
}

/**
 * Validate QR code data
 * @param {string} qrData
 * @returns {Object} - {isValid, type, parsedData}
 */
export function validateQRData(qrData) {
  if (!qrData || typeof qrData !== 'string') {
    return { isValid: false, type: 'unknown', parsedData: null };
  }

  // Check if it's a URL
  if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
    return {
      isValid: true,
      type: 'url',
      parsedData: { url: qrData }
    };
  }

  // Check if it's JSON
  try {
    const parsed = JSON.parse(qrData);
    return {
      isValid: true,
      type: 'json',
      parsedData: parsed
    };
  } catch (e) {
    // Not JSON, could be plain text ticket data
  }

  // Check for common ticket patterns
  if (qrData.match(/TICKET|BIGLIETTO|PASS|ENTRADA/i)) {
    return {
      isValid: true,
      type: 'ticket_text',
      parsedData: { rawText: qrData }
    };
  }

  // Default: plain text
  return {
    isValid: true,
    type: 'text',
    parsedData: { text: qrData }
  };
}
