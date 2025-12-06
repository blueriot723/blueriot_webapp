// R0UT35 Template - Transport Operational Control Pack Generator

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generate R0UT35 OCP (Operational Control Pack) for transport
 * @param {Object} routeData - Transport route data
 * @param {Object} tourData - Tour information
 * @returns {Promise<Uint8Array>} - PDF bytes
 */
export async function generateRoutesOCP(routeData, tourData = null) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const blueriotGreen = rgb(0.0, 0.6, 0.4);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  let yPosition = height - 60;

  // Header
  page.drawText('R0UT35', {
    x: 50,
    y: yPosition,
    size: 32,
    font: boldFont,
    color: blueriotGreen
  });

  page.drawText('Transport Operational Control Pack', {
    x: 50,
    y: yPosition - 25,
    size: 12,
    font: italicFont,
    color: lightGray
  });

  yPosition -= 60;

  // Route Name
  page.drawText(routeData.name || 'Transport Route', {
    x: 50,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: darkGray
  });

  yPosition -= 30;

  // Type badge
  const typeText = (routeData.type || 'transport').toUpperCase();
  const typeColor = getTransportColor(routeData.type);

  page.drawRectangle({
    x: 50,
    y: yPosition - 5,
    width: typeText.length * 8 + 20,
    height: 20,
    color: typeColor,
    opacity: 0.2
  });

  page.drawText(typeText, {
    x: 60,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: typeColor
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

  // Origin → Destination
  page.drawText('ROUTE', {
    x: 50,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: blueriotGreen
  });

  yPosition -= 18;

  if (routeData.origin && routeData.destination) {
    const routeText = `${routeData.origin} → ${routeData.destination}`;
    page.drawText(routeText, {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: darkGray
    });
    yPosition -= 25;
  }

  // Departure & Arrival Times
  if (routeData.departure_time || routeData.arrival_time) {
    page.drawText('SCHEDULE', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    if (routeData.departure_time) {
      page.drawText(`Departure: ${routeData.departure_time}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: darkGray
      });

      if (routeData.origin) {
        page.drawText(`from ${routeData.origin}`, {
          x: 200,
          y: yPosition,
          size: 10,
          font: italicFont,
          color: lightGray
        });
      }

      yPosition -= 18;
    }

    if (routeData.arrival_time) {
      page.drawText(`Arrival: ${routeData.arrival_time}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: darkGray
      });

      if (routeData.destination) {
        page.drawText(`at ${routeData.destination}`, {
          x: 200,
          y: yPosition,
          size: 10,
          font: italicFont,
          color: lightGray
        });
      }

      yPosition -= 18;
    }

    // Duration
    if (routeData.duration) {
      page.drawText(`Duration: ${routeData.duration}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: lightGray
      });
      yPosition -= 25;
    }
  }

  // Operator Information
  if (routeData.operator || routeData.vehicle_number) {
    page.drawText('OPERATOR', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    if (routeData.operator) {
      page.drawText(routeData.operator, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (routeData.vehicle_number) {
      page.drawText(`Vehicle: ${routeData.vehicle_number}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (routeData.platform) {
      page.drawText(`Platform/Gate: ${routeData.platform}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 25;
    }
  }

  // Booking Reference
  if (routeData.booking_reference || routeData.ticket_number) {
    page.drawText('BOOKING', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    if (routeData.booking_reference) {
      page.drawText(`Reference: ${routeData.booking_reference}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (routeData.ticket_number) {
      page.drawText(`Ticket: ${routeData.ticket_number}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 25;
    }
  }

  // Passenger Info
  if (routeData.passenger_count || routeData.seat_numbers) {
    page.drawText('PASSENGERS', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    if (routeData.passenger_count) {
      page.drawText(`Count: ${routeData.passenger_count}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (routeData.seat_numbers) {
      const seatsText = Array.isArray(routeData.seat_numbers)
        ? routeData.seat_numbers.join(', ')
        : routeData.seat_numbers;

      page.drawText(`Seats: ${seatsText}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 25;
    }
  }

  // Price
  if (routeData.price || routeData.currency) {
    page.drawText('PRICE', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    const priceText = routeData.currency
      ? `${routeData.price} ${routeData.currency}`
      : routeData.price;

    page.drawText(priceText, {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: darkGray
    });

    yPosition -= 25;
  }

  // Contact
  if (routeData.contact_phone || routeData.contact_email) {
    page.drawText('CONTACT', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    if (routeData.contact_phone) {
      page.drawText(`Phone: ${routeData.contact_phone}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 16;
    }

    if (routeData.contact_email) {
      page.drawText(`Email: ${routeData.contact_email}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 25;
    }
  }

  // Notes
  if (routeData.notes) {
    page.drawText('NOTES', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
    });

    yPosition -= 18;

    const lines = wrapText(routeData.notes, 70);
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

  // Tour context (if provided)
  if (tourData) {
    yPosition -= 20;

    page.drawText('TOUR CONTEXT', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotGreen
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

    if (tourData.day_number) {
      page.drawText(`Day: ${tourData.day_number}`, {
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
 * Get color for transport type
 * @param {string} type
 * @returns {Object} RGB color
 */
function getTransportColor(type) {
  const colors = {
    bus: rgb(0.0, 0.6, 0.4),
    train: rgb(0.0, 0.4, 0.8),
    flight: rgb(0.6, 0.0, 0.8),
    ferry: rgb(0.0, 0.5, 0.7),
    car: rgb(0.4, 0.4, 0.4),
    metro: rgb(0.8, 0.4, 0.0)
  };

  return colors[type] || rgb(0.0, 0.6, 0.4);
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
