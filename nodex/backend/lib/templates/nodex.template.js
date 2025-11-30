// NODΞ Template - Daily Operative Plan Generator

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generate NODΞ Daily Operative Plan
 * @param {Object} dayData - Day data with linked items
 * @param {Object} tourData - Tour information
 * @param {Object} weatherData - Weather forecast
 * @returns {Promise<Uint8Array>} - PDF bytes
 */
export async function generateNodexOCP(dayData, tourData = null, weatherData = null) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const blueriotRed = rgb(0.8, 0.0, 0.2);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  let yPosition = height - 60;

  // Header
  page.drawText('NODΞ', {
    x: 50,
    y: yPosition,
    size: 32,
    font: boldFont,
    color: blueriotRed
  });

  page.drawText('Daily Operative Plan', {
    x: 50,
    y: yPosition - 25,
    size: 12,
    font: italicFont,
    color: lightGray
  });

  yPosition -= 60;

  // Tour Name & Day Number
  if (tourData && tourData.tour_name) {
    page.drawText(tourData.tour_name, {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: darkGray
    });
    yPosition -= 25;
  }

  // Day Badge
  const dayText = `DAY ${dayData.logical_day_number || 1}`;
  page.drawRectangle({
    x: 50,
    y: yPosition - 5,
    width: dayText.length * 10 + 20,
    height: 25,
    color: blueriotRed,
    opacity: 0.2
  });

  page.drawText(dayText, {
    x: 60,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: blueriotRed
  });

  // Date
  if (dayData.calendar_date) {
    const dateText = new Date(dayData.calendar_date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    page.drawText(dateText, {
      x: 200,
      y: yPosition,
      size: 12,
      font: regularFont,
      color: darkGray
    });
  }

  yPosition -= 35;

  // Divider line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: lightGray,
    opacity: 0.3
  });

  yPosition -= 25;

  // Cities
  if (dayData.cities && dayData.cities.length > 0) {
    const citiesText = Array.isArray(dayData.cities)
      ? dayData.cities.join(' • ')
      : dayData.cities;

    page.drawText(`📍 ${citiesText}`, {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: blueriotRed
    });

    yPosition -= 25;
  }

  // Weather (if provided)
  if (weatherData) {
    const weatherIcon = getWeatherIcon(weatherData.condition);
    const tempText = `${Math.round(weatherData.temp_max)}°C / ${Math.round(weatherData.temp_min)}°C`;

    page.drawText(`${weatherIcon} ${tempText}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: lightGray
    });

    if (weatherData.precipitation_probability > 30) {
      page.drawText(`💧 ${weatherData.precipitation_probability}% rain`, {
        x: 200,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: rgb(0.0, 0.4, 0.8)
      });
    }

    yPosition -= 25;
  }

  // Hiking day indicator
  if (dayData.is_hiking_day) {
    page.drawText('🥾 HIKING DAY', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0.0, 0.6, 0.2)
    });

    yPosition -= 25;
  }

  yPosition -= 10;

  // SCHEDULE SECTION
  page.drawText('SCHEDULE', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: blueriotRed
  });

  yPosition -= 20;

  // Render day items (activities, meals, transport, suggestions)
  if (dayData.items && dayData.items.length > 0) {
    for (const item of dayData.items) {
      // Check if we need a new page
      if (yPosition < 100) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = page.getHeight() - 60;
      }

      const itemColor = getItemColor(item.item_type);

      // Time badge
      if (item.start_time) {
        page.drawRectangle({
          x: 50,
          y: yPosition - 3,
          width: 60,
          height: 16,
          color: itemColor,
          opacity: 0.3
        });

        page.drawText(item.start_time, {
          x: 55,
          y: yPosition,
          size: 9,
          font: boldFont,
          color: darkGray
        });
      }

      // Item title
      const titleX = item.start_time ? 120 : 50;
      page.drawText(item.title || 'Untitled', {
        x: titleX,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: darkGray
      });

      yPosition -= 16;

      // Item description/details
      if (item.description) {
        const lines = wrapText(item.description, 60);
        for (const line of lines) {
          page.drawText(line, {
            x: titleX,
            y: yPosition,
            size: 9,
            font: regularFont,
            color: lightGray
          });
          yPosition -= 12;
        }
      }

      // Linked data (tastes, routes, stay)
      if (item.location) {
        page.drawText(`📍 ${item.location}`, {
          x: titleX,
          y: yPosition,
          size: 8,
          font: italicFont,
          color: lightGray
        });
        yPosition -= 12;
      }

      yPosition -= 8;
    }
  } else {
    // Fallback to legacy schedule fields
    const schedules = [
      { label: 'Morning', text: dayData.morning_schedule },
      { label: 'Afternoon', text: dayData.afternoon_schedule },
      { label: 'Evening', text: dayData.evening_schedule }
    ];

    for (const schedule of schedules) {
      if (schedule.text) {
        if (yPosition < 100) {
          page = pdfDoc.addPage([595.28, 841.89]);
          yPosition = page.getHeight() - 60;
        }

        page.drawText(schedule.label, {
          x: 50,
          y: yPosition,
          size: 10,
          font: boldFont,
          color: blueriotRed
        });

        yPosition -= 16;

        const lines = wrapText(schedule.text, 70);
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
    }
  }

  // Hotel Information
  if (dayData.hotel || dayData.hotel_data) {
    if (yPosition < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = page.getHeight() - 60;
    }

    yPosition -= 20;

    page.drawText('ACCOMMODATION', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotRed
    });

    yPosition -= 18;

    const hotelData = dayData.hotel_data || {};
    const hotelName = hotelData.name || dayData.hotel || 'Hotel TBD';

    page.drawText(hotelName, {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: darkGray
    });

    yPosition -= 16;

    if (hotelData.address) {
      page.drawText(hotelData.address, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: lightGray
      });
      yPosition -= 14;
    }

    if (hotelData.phone) {
      page.drawText(`Phone: ${hotelData.phone}`, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: lightGray
      });
      yPosition -= 14;
    }

    yPosition -= 10;
  }

  // Notes
  if (dayData.notes) {
    if (yPosition < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = page.getHeight() - 60;
    }

    yPosition -= 20;

    page.drawText('NOTES', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: blueriotRed
    });

    yPosition -= 18;

    const lines = wrapText(dayData.notes, 70);
    for (const line of lines) {
      if (yPosition < 80) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = page.getHeight() - 60;
      }

      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: darkGray
      });
      yPosition -= 14;
    }
  }

  // Footer on all pages
  const pages = pdfDoc.getPages();
  for (const p of pages) {
    p.drawText('Generated by NODΞ - blueriot mαtrιχ', {
      x: 50,
      y: 30,
      size: 8,
      font: italicFont,
      color: lightGray
    });

    const timestamp = new Date().toISOString().split('T')[0];
    p.drawText(timestamp, {
      x: width - 120,
      y: 30,
      size: 8,
      font: italicFont,
      color: lightGray
    });
  }

  return await pdfDoc.save();
}

/**
 * Get color for day item type
 * @param {string} itemType
 * @returns {Object} RGB color
 */
function getItemColor(itemType) {
  const colors = {
    activity: rgb(1.0, 0.6, 0.4),     // Orange
    lunch: rgb(0.6, 0.8, 1.0),        // Light blue
    dinner: rgb(0.4, 0.6, 1.0),       // Blue
    transport: rgb(0.6, 1.0, 0.6),    // Green
    suggestion: rgb(0.8, 0.6, 1.0)    // Purple
  };

  return colors[itemType] || rgb(0.7, 0.7, 0.7);
}

/**
 * Get weather icon
 * @param {string} condition
 * @returns {string}
 */
function getWeatherIcon(condition) {
  const icons = {
    clear: '☀️',
    sunny: '☀️',
    cloudy: '☁️',
    partly_cloudy: '⛅',
    rain: '🌧️',
    snow: '❄️',
    storm: '⛈️'
  };

  return icons[condition] || '🌤️';
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
