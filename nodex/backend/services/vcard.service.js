// vCard Service - Parse and import vCard contacts

import vCard from 'vcf';
import { supabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse vCard from buffer
 * @param {Buffer} vcardBuffer
 * @returns {Object} - Parsed vCard data
 */
export function parseVCard(vcardBuffer) {
  try {
    const vcardString = vcardBuffer.toString('utf-8');
    const card = new vCard().parse(vcardString);

    const parsed = {
      name: null,
      formatted_name: null,
      organization: null,
      phone_numbers: [],
      emails: [],
      websites: [],
      street_address: null,
      city: null,
      postal_code: null,
      country: null,
      full_address: null,
      latitude: null,
      longitude: null,
      notes: null,
      raw_vcard: vcardString
    };

    // Name
    if (card.get('fn')) {
      parsed.formatted_name = card.get('fn').valueOf();
      parsed.name = parsed.formatted_name;
    }

    if (card.get('n')) {
      const n = card.get('n').valueOf();
      if (typeof n === 'string') {
        parsed.name = n;
      }
    }

    // Organization
    if (card.get('org')) {
      parsed.organization = card.get('org').valueOf();
    }

    // Phone numbers
    const tels = card.get('tel');
    if (tels) {
      const phones = Array.isArray(tels) ? tels : [tels];
      parsed.phone_numbers = phones.map(t => t.valueOf()).filter(p => p);
    }

    // Emails
    const emails = card.get('email');
    if (emails) {
      const emailList = Array.isArray(emails) ? emails : [emails];
      parsed.emails = emailList.map(e => e.valueOf()).filter(e => e);
    }

    // Websites
    const urls = card.get('url');
    if (urls) {
      const urlList = Array.isArray(urls) ? urls : [urls];
      parsed.websites = urlList.map(u => u.valueOf()).filter(u => u);
    }

    // Address
    const adr = card.get('adr');
    if (adr) {
      const address = adr.valueOf();
      if (Array.isArray(address)) {
        parsed.street_address = address[2] || null; // Street
        parsed.city = address[3] || null; // City
        parsed.postal_code = address[5] || null; // Postal code
        parsed.country = address[6] || null; // Country
        parsed.full_address = address.filter(a => a).join(', ');
      } else if (typeof address === 'string') {
        parsed.full_address = address;
      }
    }

    // Geolocation
    const geo = card.get('geo');
    if (geo) {
      const geoValue = geo.valueOf();
      if (typeof geoValue === 'string') {
        const [lat, lon] = geoValue.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lon)) {
          parsed.latitude = lat;
          parsed.longitude = lon;
        }
      }
    }

    // Notes
    const note = card.get('note');
    if (note) {
      parsed.notes = note.valueOf();
    }

    return {
      success: true,
      parsed
    };
  } catch (error) {
    console.error('vCard parsing error:', error);
    return {
      success: false,
      error: error.message,
      parsed: null
    };
  }
}

/**
 * Classify vCard contact
 * Determines if it's a restaurant, hotel, driver, emergency, etc.
 * @param {Object} vcardData
 * @returns {Object} - {suggested_type, confidence_score}
 */
export function classifyVCard(vcardData) {
  const { name, organization, notes, full_address, websites } = vcardData;

  const allText = [
    name,
    organization,
    notes,
    full_address
  ].filter(t => t).join(' ').toLowerCase();

  let suggested_type = 'other';
  let confidence_score = 0.3;

  // Restaurant/Bar keywords
  const restaurantKeywords = [
    'ristorante', 'restaurant', 'trattoria', 'osteria',
    'pizzeria', 'bar', 'cafe', 'caffè', 'gelateria',
    'pasticceria', 'bakery', 'bistro', 'taverna'
  ];

  if (restaurantKeywords.some(kw => allText.includes(kw))) {
    suggested_type = 'restaurant';
    confidence_score = 0.85;
  }

  // Hotel keywords
  const hotelKeywords = [
    'hotel', 'albergo', 'b&b', 'bed and breakfast',
    'hostel', 'ostello', 'residence', 'agriturismo',
    'guesthouse', 'locanda', 'pensione'
  ];

  if (hotelKeywords.some(kw => allText.includes(kw))) {
    suggested_type = 'hotel';
    confidence_score = 0.9;
  }

  // Driver/Transport
  const driverKeywords = [
    'driver', 'autista', 'ncc', 'taxi', 'transfer',
    'transport', 'trasporto', 'chauffeur'
  ];

  if (driverKeywords.some(kw => allText.includes(kw))) {
    suggested_type = 'driver';
    confidence_score = 0.8;
  }

  // Emergency contacts
  const emergencyKeywords = [
    'emergency', 'emergenza', 'hospital', 'ospedale',
    'clinic', 'clinica', 'doctor', 'dottore', 'medico',
    'police', 'polizia', 'carabinieri', 'ambulance', 'ambulanza'
  ];

  if (emergencyKeywords.some(kw => allText.includes(kw))) {
    suggested_type = 'emergency';
    confidence_score = 0.95;
  }

  // Guide
  const guideKeywords = [
    'guide', 'guida', 'tour guide', 'guida turistica'
  ];

  if (guideKeywords.some(kw => allText.includes(kw))) {
    suggested_type = 'guide';
    confidence_score = 0.85;
  }

  return {
    suggested_type,
    confidence_score
  };
}

/**
 * Import vCard and save to database
 * @param {Buffer} vcardBuffer
 * @param {string} filename
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function importVCard(vcardBuffer, filename, userId = null) {
  // Parse vCard
  const parseResult = parseVCard(vcardBuffer);

  if (!parseResult.success) {
    throw new Error(`vCard parsing failed: ${parseResult.error}`);
  }

  const vcardData = parseResult.parsed;

  // Classify contact
  const classification = classifyVCard(vcardData);

  // Save to vcard_imports table
  const importRecord = {
    id: uuidv4(),
    filename,
    file_size_bytes: vcardBuffer.length,
    ...vcardData,
    suggested_type: classification.suggested_type,
    confidence_score: classification.confidence_score,
    mapping_status: 'pending',
    reviewed: false,
    imported_by: userId,
    imported_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('vcard_imports')
    .insert([importRecord])
    .select()
    .single();

  if (error) {
    console.error('Save vCard import error:', error);
    throw error;
  }

  return {
    success: true,
    import_id: data.id,
    vcard_data: vcardData,
    classification
  };
}

/**
 * Import multiple vCards (batch)
 * @param {Array} vcardBuffers - Array of {buffer, filename}
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function importBatchVCards(vcardBuffers, userId = null) {
  const results = [];

  for (const { buffer, filename } of vcardBuffers) {
    try {
      const result = await importVCard(buffer, filename, userId);
      results.push({
        filename,
        ...result
      });
    } catch (error) {
      results.push({
        filename,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Map vCard to target module (ΤΔSΤΞ5, SΤΔΥ, emergency)
 * @param {string} importId - vCard import ID
 * @param {string} targetModule - 'tastes', 'stay', 'emergency'
 * @param {Object} additionalData - Extra fields for target module
 * @returns {Promise<Object>}
 */
export async function mapVCardToModule(importId, targetModule, additionalData = {}) {
  // Get vCard import
  const { data: vcardImport, error: fetchError } = await supabase
    .from('vcard_imports')
    .select('*')
    .eq('id', importId)
    .single();

  if (fetchError) throw fetchError;

  let mappedId = null;

  if (targetModule === 'tastes') {
    // Map to blueriot_tastes
    const tastesData = {
      name: vcardImport.name,
      type: additionalData.type || 'restaurant',
      location: vcardImport.city || 'Unknown',
      address: vcardImport.full_address,
      phone: vcardImport.phone_numbers?.[0] || null,
      website: vcardImport.websites?.[0] || null,
      google_maps_link: additionalData.google_maps_link || null,
      notes: vcardImport.notes,
      ...additionalData
    };

    const { data, error } = await supabase
      .from('blueriot_tastes')
      .insert([tastesData])
      .select()
      .single();

    if (error) throw error;
    mappedId = data.id;
  } else if (targetModule === 'stay') {
    // Map to blueriot_stay
    const stayData = {
      name: vcardImport.name,
      type: additionalData.type || 'hotel',
      location: vcardImport.city || 'Unknown',
      address: vcardImport.full_address,
      phone: vcardImport.phone_numbers?.[0] || null,
      website: vcardImport.websites?.[0] || null,
      contact: vcardImport.emails?.[0] || null,
      notes: vcardImport.notes,
      ...additionalData
    };

    const { data, error } = await supabase
      .from('blueriot_stay')
      .insert([stayData])
      .select()
      .single();

    if (error) throw error;
    mappedId = data.id;
  }

  // Update vcard_imports with mapping info
  await supabase
    .from('vcard_imports')
    .update({
      mapping_status: 'mapped',
      mapped_to_module: targetModule,
      mapped_to_id: mappedId,
      reviewed: true
    })
    .eq('id', importId);

  return {
    success: true,
    mapped_to_module: targetModule,
    mapped_to_id: mappedId
  };
}

/**
 * Get all pending vCard imports (not yet mapped)
 * @returns {Promise<Array>}
 */
export async function getPendingVCardImports() {
  const { data, error } = await supabase
    .from('vcard_imports')
    .select('*')
    .eq('mapping_status', 'pending')
    .order('imported_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Get vCard import by ID
 * @param {string} importId
 * @returns {Promise<Object>}
 */
export async function getVCardImportById(importId) {
  const { data, error } = await supabase
    .from('vcard_imports')
    .select('*')
    .eq('id', importId)
    .single();

  if (error) throw error;

  return data;
}
