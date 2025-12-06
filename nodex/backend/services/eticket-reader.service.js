// eTicket Reader Service - Parses tickets from PDF, QR, and Barcodes

import { extractTextFromPDF } from '../lib/parsers/pdf.extractor.js';
import { extractQRFromImage } from '../lib/parsers/qr.extractor.js';
import { extractBarcodeFromImage, parseBarcodeData } from '../lib/parsers/barcode.extractor.js';
import { supabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse eTicket from PDF file
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @param {string} tourId - Optional
 * @param {string} userId - Who uploaded
 * @returns {Promise<Object>}
 */
export async function parseETicketFromPDF(fileBuffer, filename, tourId = null, userId = null) {
  try {
    // Extract text from PDF
    const pdfResult = await extractTextFromPDF(fileBuffer);

    if (!pdfResult.success) {
      throw new Error(`PDF parsing failed: ${pdfResult.error}`);
    }

    const rawText = pdfResult.text;

    // Extract ticket information using patterns
    const ticketData = extractTicketInfo(rawText);

    // Save to import log
    const importLog = await saveETicketImport({
      filename,
      file_type: 'pdf',
      file_size_bytes: fileBuffer.length,
      parse_status: ticketData ? 'success' : 'partial',
      parse_method: 'pdf_text',
      raw_text: rawText,
      extracted_data: ticketData,
      tour_id: tourId,
      imported_by: userId
    });

    return {
      success: true,
      method: 'pdf',
      raw_text: rawText,
      ticket_data: ticketData,
      import_id: importLog.id
    };
  } catch (error) {
    console.error('Parse PDF eTicket error:', error);
    return {
      success: false,
      error: error.message,
      ticket_data: null
    };
  }
}

/**
 * Parse eTicket from image (QR or Barcode)
 * @param {Buffer} imageBuffer
 * @param {string} filename
 * @param {string} tourId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function parseETicketFromImage(imageBuffer, filename, tourId = null, userId = null) {
  try {
    let parseResult = null;
    let parseMethod = null;

    // Try QR code first
    const qrResult = await extractQRFromImage(imageBuffer);

    if (qrResult.success) {
      parseMethod = 'qr_code';
      parseResult = {
        data: qrResult.data,
        type: 'qr'
      };
    } else {
      // Try barcode
      const barcodeResult = await extractBarcodeFromImage(imageBuffer);

      if (barcodeResult.success) {
        parseMethod = `barcode_${barcodeResult.format.toLowerCase()}`;
        const parsed = parseBarcodeData(barcodeResult.data, barcodeResult.format);

        parseResult = {
          data: barcodeResult.data,
          format: barcodeResult.format,
          type: 'barcode',
          parsed: parsed
        };
      }
    }

    if (!parseResult) {
      throw new Error('No QR code or barcode found in image');
    }

    // Extract ticket info from the decoded data
    const ticketData = extractTicketInfo(parseResult.data);

    // Save to import log
    const importLog = await saveETicketImport({
      filename,
      file_type: parseResult.type === 'qr' ? 'image_qr' : 'image_barcode',
      file_size_bytes: imageBuffer.length,
      parse_status: ticketData ? 'success' : 'partial',
      parse_method: parseMethod,
      raw_text: parseResult.data,
      extracted_data: { ...ticketData, ...parseResult },
      tour_id: tourId,
      imported_by: userId
    });

    return {
      success: true,
      method: parseMethod,
      raw_data: parseResult.data,
      ticket_data: ticketData,
      import_id: importLog.id
    };
  } catch (error) {
    console.error('Parse image eTicket error:', error);
    return {
      success: false,
      error: error.message,
      ticket_data: null
    };
  }
}

/**
 * Extract ticket information from text using patterns
 * @param {string} text
 * @returns {Object}
 */
function extractTicketInfo(text) {
  if (!text) return null;

  const info = {
    ticket_name: null,
    ticket_type: null,
    operator: null,
    valid_from: null,
    valid_to: null,
    ticket_number: null,
    passenger_name: null,
    cities: [],
    zones: [],
    notes: null
  };

  // Ticket number patterns
  const ticketNumberPatterns = [
    /(?:TICKET\s*(?:NUMBER|NO|#)?\s*[:=]?\s*)([A-Z0-9-]+)/i,
    /(?:BIGLIETTO\s*(?:N|NUM)?\s*[:=]?\s*)([A-Z0-9-]+)/i,
    /(?:PASS\s*(?:NUMBER|NO)?\s*[:=]?\s*)([A-Z0-9-]+)/i
  ];

  for (const pattern of ticketNumberPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.ticket_number = match[1].trim();
      break;
    }
  }

  // Operator patterns
  const operatorPatterns = [
    /(?:OPERATOR|COMPANY|OPERATORE|COMPAGNIA)\s*[:=]?\s*([A-Z\s]+?)(?:\n|$|TICKET)/i,
    /(?:TRENITALIA|ITALO|ATAC|GTT|ANM|AMT)/i
  ];

  for (const pattern of operatorPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.operator = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }

  // Date patterns (various formats)
  const datePatterns = {
    valid_from: [
      /(?:VALID FROM|FROM|VALIDO DAL|DESDE)\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /(?:DEPARTURE|PARTENZA|SALIDA)\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i
    ],
    valid_to: [
      /(?:VALID TO|TO|UNTIL|VALIDO FINO|HASTA)\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /(?:ARRIVAL|ARRIVO|LLEGADA)\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i
    ]
  };

  for (const [key, patterns] of Object.entries(datePatterns)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        info[key] = parseDate(match[1]);
        break;
      }
    }
  }

  // Passenger name
  const namePatterns = [
    /(?:PASSENGER|PASSEGGERO|PASAJERO|NAME|NOME)\s*[:=]?\s*([A-Z\s]+?)(?:\n|$|TICKET)/i
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.passenger_name = match[1].trim();
      break;
    }
  }

  // Cities/Zones
  const cityMatch = text.match(/(?:ZONE|ZONA|CITY|CITTÀ)\s*[:=]?\s*([A-Z0-9\s,-]+?)(?:\n|$)/i);
  if (cityMatch) {
    const cities = cityMatch[1].split(/[,;]/).map(c => c.trim()).filter(c => c);
    info.cities = cities.length > 0 ? cities : [];
  }

  // Zone numbers
  const zoneMatch = text.match(/(?:ZONE|ZONA)\s*[:=]?\s*([0-9,-]+)/i);
  if (zoneMatch) {
    info.zones = zoneMatch[1].split(/[,;-]/).map(z => z.trim()).filter(z => z);
  }

  // Ticket type detection
  if (text.match(/DAILY|GIORNALIERO|DIARIO/i)) {
    info.ticket_type = 'daily_pass';
  } else if (text.match(/WEEKLY|SETTIMANALE|SEMANAL/i)) {
    info.ticket_type = 'weekly_pass';
  } else if (text.match(/MUSEUM|MUSEO/i)) {
    info.ticket_type = 'museum_ticket';
  } else if (text.match(/TRAIN|TRENO|BUS|METRO|FERRY/i)) {
    info.ticket_type = 'transport_ticket';
  } else {
    info.ticket_type = 'single_ticket';
  }

  // Ticket name (first significant line)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  if (lines.length > 0) {
    info.ticket_name = lines[0].substring(0, 100);
  }

  return info;
}

/**
 * Parse date string to YYYY-MM-DD
 * @param {string} dateStr
 * @returns {string|null}
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Try various formats
    const formats = [
      /(\d{2})[-/](\d{2})[-/](\d{4})/, // DD-MM-YYYY or DD/MM/YYYY
      /(\d{4})[-/](\d{2})[-/](\d{2})/, // YYYY-MM-DD
      /(\d{2})[-/](\d{2})[-/](\d{2})/  // DD-MM-YY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let [, p1, p2, p3] = match;

        // Handle 2-digit year
        if (p3.length === 2) {
          p3 = `20${p3}`;
        }

        // If format is DD-MM-YYYY
        if (parseInt(p1) > 12 || format === formats[0]) {
          return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
        }

        // If format is YYYY-MM-DD
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }

  return null;
}

/**
 * Save eTicket import to database
 * @param {Object} importData
 * @returns {Promise<Object>}
 */
async function saveETicketImport(importData) {
  const record = {
    id: uuidv4(),
    filename: importData.filename,
    file_type: importData.file_type,
    file_size_bytes: importData.file_size_bytes,
    parse_status: importData.parse_status,
    parse_method: importData.parse_method,
    raw_text: importData.raw_text,
    extracted_data: importData.extracted_data,
    tour_id: importData.tour_id,
    imported_by: importData.imported_by,
    imported_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('eticket_imports')
    .insert([record])
    .select()
    .single();

  if (error) {
    console.error('Save eTicket import error:', error);
    throw error;
  }

  return data;
}

/**
 * Get eTicket import by ID
 * @param {string} importId
 * @returns {Promise<Object>}
 */
export async function getETicketImportById(importId) {
  const { data, error } = await supabase
    .from('eticket_imports')
    .select('*')
    .eq('id', importId)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get all eTicket imports for a tour
 * @param {string} tourId
 * @returns {Promise<Array>}
 */
export async function getETicketImportsByTour(tourId) {
  const { data, error } = await supabase
    .from('eticket_imports')
    .select('*')
    .eq('tour_id', tourId)
    .order('imported_at', { ascending: false });

  if (error) throw error;

  return data || [];
}
