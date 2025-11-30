// PDF Text Extractor - Uses pdfjs-dist to extract text from PDF files

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Extract all text from a PDF buffer
 * @param {Buffer} pdfBuffer - PDF file as Buffer
 * @returns {Promise<Object>} - {text, pages, metadata}
 */
export async function extractTextFromPDF(pdfBuffer) {
  try {
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0 // Suppress warnings
    });

    const pdfDocument = await loadingTask.promise;

    const numPages = pdfDocument.numPages;
    const metadata = await pdfDocument.getMetadata().catch(() => null);

    const pages = [];
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concatenate text items
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      pages.push({
        pageNumber: pageNum,
        text: pageText
      });

      fullText += pageText + '\n';
    }

    return {
      success: true,
      text: fullText.trim(),
      numPages,
      pages,
      metadata: metadata ? {
        title: metadata.info?.Title || null,
        author: metadata.info?.Author || null,
        subject: metadata.info?.Subject || null,
        creator: metadata.info?.Creator || null,
        producer: metadata.info?.Producer || null,
        creationDate: metadata.info?.CreationDate || null
      } : null
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      error: error.message,
      text: null,
      pages: []
    };
  }
}

/**
 * Extract text from specific page
 * @param {Buffer} pdfBuffer
 * @param {number} pageNumber - 1-indexed
 * @returns {Promise<string>}
 */
export async function extractTextFromPage(pdfBuffer, pageNumber) {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0
    });

    const pdfDocument = await loadingTask.promise;
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map(item => item.str)
      .join(' ');

    return pageText.trim();
  } catch (error) {
    console.error('Page extraction error:', error);
    return null;
  }
}

/**
 * Search for pattern in PDF text
 * @param {Buffer} pdfBuffer
 * @param {RegExp} pattern
 * @returns {Promise<Array>} - Array of matches
 */
export async function searchInPDF(pdfBuffer, pattern) {
  const result = await extractTextFromPDF(pdfBuffer);

  if (!result.success) {
    return [];
  }

  const matches = [];
  const regex = new RegExp(pattern, 'gi');
  let match;

  while ((match = regex.exec(result.text)) !== null) {
    matches.push({
      match: match[0],
      index: match.index,
      groups: match.groups || {}
    });
  }

  return matches;
}
