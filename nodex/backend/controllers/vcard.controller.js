// vCard Controller - Contact Import Management

import * as vcardService from '../services/vcard.service.js';

/**
 * Import single vCard file
 * POST /api/vcard/import
 */
export async function importVCard(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No vCard file provided' });
    }

    const { userId } = req.body;

    const result = await vcardService.importVCard(
      req.file.buffer,
      req.file.originalname,
      userId
    );

    res.json(result);
  } catch (error) {
    console.error('Import vCard error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Import multiple vCard files (batch)
 * POST /api/vcard/import/batch
 */
export async function importBatch(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No vCard files provided' });
    }

    const { userId } = req.body;

    const vcardBuffers = req.files.map(file => ({
      buffer: file.buffer,
      filename: file.originalname
    }));

    const results = await vcardService.importBatchVCards(vcardBuffers, userId);

    res.json({
      success: true,
      count: req.files.length,
      results
    });
  } catch (error) {
    console.error('Batch vCard import error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Parse vCard without saving (preview)
 * POST /api/vcard/parse
 */
export async function parseVCard(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No vCard file provided' });
    }

    const parseResult = vcardService.parseVCard(req.file.buffer);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }

    const classification = vcardService.classifyVCard(parseResult.parsed);

    res.json({
      success: true,
      vcard_data: parseResult.parsed,
      classification
    });
  } catch (error) {
    console.error('Parse vCard error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Map imported vCard to a module (ΤΔSΤΞ5, SΤΔΥ)
 * POST /api/vcard/:importId/map
 */
export async function mapVCard(req, res) {
  try {
    const { importId } = req.params;
    const { targetModule, additionalData } = req.body;

    if (!['tastes', 'stay'].includes(targetModule)) {
      return res.status(400).json({
        error: 'Invalid target module. Must be "tastes" or "stay"'
      });
    }

    const result = await vcardService.mapVCardToModule(
      importId,
      targetModule,
      additionalData || {}
    );

    res.json(result);
  } catch (error) {
    console.error('Map vCard error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all pending vCard imports (not yet mapped)
 * GET /api/vcard/pending
 */
export async function getPendingImports(req, res) {
  try {
    const pendingImports = await vcardService.getPendingVCardImports();

    res.json({
      success: true,
      count: pendingImports.length,
      imports: pendingImports
    });
  } catch (error) {
    console.error('Get pending vCard imports error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get vCard import by ID
 * GET /api/vcard/:importId
 */
export async function getImportById(req, res) {
  try {
    const { importId } = req.params;

    const importData = await vcardService.getVCardImportById(importId);

    if (!importData) {
      return res.status(404).json({ error: 'vCard import not found' });
    }

    res.json({
      success: true,
      import: importData
    });
  } catch (error) {
    console.error('Get vCard import error:', error);
    res.status(500).json({ error: error.message });
  }
}
