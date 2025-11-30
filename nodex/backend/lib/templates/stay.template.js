// SΤΔΥ Template - Hotel Operational Control Pack Generator

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generate SΤΔΥ OCP (Operational Control Pack) for a hotel
 * @param {Object} stayData - Hotel/accommodation data
 * @param {Object} tourData - Tour information
 * @returns {Promise<Uint8Array>} - PDF bytes
 */
export async function generateStayOCP(stayData, tourData = null) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const blueriotBlue = rgb(0.0, 0.4, 0.8);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  let yPosition = height - 60;

  // Header
  page.drawText('SΤΔΥ', {
    x: 50,
    y: yPosition,
    size: 32,
    font: boldFont,
    color: blueriotBlue
  });

  page.drawText('Operational Control Pack', {
    x: 50,
    y: yPosition - 25,
    size: 12,
    font: italicFont,
    color: lightGray
  });

  yPosition -= 60;

  // Hotel Name
  page.drawText(stayData.name || 'Unknown Hotel', {
    x: 50,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: darkGray
  });

  yPosition -= 30;

  // Type badge
  const typeText = (stayData.type || 'hotel').toUpperCase();
  page.drawRectangle({
    x: 50,
    y: yPosition - 5,
    width: typeText.length * 8 + 20,
    height: 20,
    color: blueriotBlue,
    opacity: 0.2
  });

  page.drawText(typeText, {
    x: 60,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: blueriotBlue
  });

  yPosition -= 40;

  // Divider line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: lightGray,
    opacity: 0.3
  });

  yPosition -= 30;

  // Location section
  if (stayData.location || stayData.address) {
    page.drawText('LOCATION', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotBlue
    });

    yPosition -= 18;

    if (stayData.location) {
      page.drawText(stayData.location, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (stayData.address) {
      page.drawText(stayData.address, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: lightGray
      });
      yPosition -= 25;
    }
  }

  // Contact Information
  page.drawText('CONTACT INFORMATION', {
    x: 50,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: blueriotBlue
  });

  yPosition -= 18;

  if (stayData.phone) {
    page.drawText(`Phone: ${stayData.phone}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: darkGray
    });
    yPosition -= 16;
  }

  if (stayData.contact) {
    page.drawText(`Email: ${stayData.contact}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: darkGray
    });
    yPosition -= 16;
  }

  if (stayData.website) {
    page.drawText(`Website: ${stayData.website}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: blueriotBlue
    });
    yPosition -= 25;
  }

  // Check-in / Check-out times
  if (stayData.check_in_time || stayData.check_out_time) {
    page.drawText('CHECK-IN / CHECK-OUT', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotBlue
    });

    yPosition -= 18;

    if (stayData.check_in_time) {
      page.drawText(`Check-in: ${stayData.check_in_time}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (stayData.check_out_time) {
      page.drawText(`Check-out: ${stayData.check_out_time}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 25;
    }
  }

  // Amenities
  if (stayData.amenities && stayData.amenities.length > 0) {
    page.drawText('AMENITIES', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotBlue
    });

    yPosition -= 18;

    const amenitiesText = Array.isArray(stayData.amenities)
      ? stayData.amenities.join(', ')
      : stayData.amenities;

    const lines = wrapText(amenitiesText, 70);
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 14;
    }

    yPosition -= 10;
  }

  // Notes
  if (stayData.notes) {
    page.drawText('NOTES', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotBlue
    });

    yPosition -= 18;

    const lines = wrapText(stayData.notes, 70);
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 14;

      // Add new page if needed
      if (yPosition < 80) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = newPage.getHeight() - 60;
      }
    }

    yPosition -= 10;
  }

  // Tour context (if provided)
  if (tourData) {
    yPosition -= 20;

    page.drawText('TOUR CONTEXT', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotBlue
    });

    yPosition -= 18;

    if (tourData.tour_name) {
      page.drawText(`Tour: ${tourData.tour_name}`, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 14;
    }

    if (tourData.dates) {
      page.drawText(`Dates: ${tourData.dates}`, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 14;
    }
  }

  // Footer
  page.drawText('Generated by NODΞ - blueriot mαtrιχ', {
    x: 50,
    y: 30,
    size: 8,
    font: italicFont,
    color: lightGray
  });

  const timestamp = new Date().toISOString().split('T')[0];
  page.drawText(timestamp, {
    x: width - 120,
    y: 30,
    size: 8,
    font: italicFont,
    color: lightGray
  });

  return await pdfDoc.save();
}

/**
 * Wrap text to fit within specified character width
 * @param {string} text
 * @param {number} maxCharsPerLine
 * @returns {Array<string>}
 */
function wrapText(text, maxCharsPerLine) {
  if (!text) return [];

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}
