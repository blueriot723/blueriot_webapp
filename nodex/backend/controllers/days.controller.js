// Days Controller - Integrated with day-engine.service.js

import * as dayEngine from '../services/day-engine.service.js';

/**
 * Get all days for a tour
 * GET /api/days/tour/:tourId
 */
export async function getDaysByTour(req, res) {
  try {
    const { tourId } = req.params;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID is required' });
    }

    const days = await dayEngine.getDaysByTour(tourId);

    res.json({
      success: true,
      tourId,
      count: days.length,
      days
    });
  } catch (error) {
    console.error('Get days by tour error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single day by ID
 * GET /api/days/:id
 * Query param: ?withLinked=true to include linked items
 */
export async function getDayById(req, res) {
  try {
    const { id } = req.params;
    const { withLinked } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Day ID is required' });
    }

    let day;
    if (withLinked === 'true') {
      day = await dayEngine.getDayWithLinkedItems(id);
    } else {
      day = await dayEngine.getDayById(id);
    }

    res.json({
      success: true,
      day
    });
  } catch (error) {
    console.error('Get day by ID error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create new day
 * POST /api/days
 */
export async function createDay(req, res) {
  try {
    const dayData = req.body;

    if (!dayData.tour_id || !dayData.calendar_date) {
      return res.status(400).json({ error: 'tour_id and calendar_date are required' });
    }

    const newDay = await dayEngine.createDay(dayData);

    res.status(201).json({
      success: true,
      day: newDay
    });
  } catch (error) {
    console.error('Create day error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update day
 * PUT /api/days/:id
 */
export async function updateDay(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Day ID is required' });
    }

    const updatedDay = await dayEngine.updateDay(id, updates);

    res.json({
      success: true,
      day: updatedDay
    });
  } catch (error) {
    console.error('Update day error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete day
 * DELETE /api/days/:id
 */
export async function deleteDay(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Day ID is required' });
    }

    await dayEngine.deleteDay(id);

    res.json({
      success: true,
      message: 'Day deleted and remaining days renumbered'
    });
  } catch (error) {
    console.error('Delete day error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Reorder days (drag & drop)
 * POST /api/days/reorder
 * Body: { tourId, dayOrder: [{id, new_logical_day_number}, ...] }
 */
export async function reorderDays(req, res) {
  try {
    const { tourId, dayOrder } = req.body;

    if (!tourId || !dayOrder) {
      return res.status(400).json({ error: 'tourId and dayOrder are required' });
    }

    const updatedDays = await dayEngine.reorderDays(tourId, dayOrder);

    res.json({
      success: true,
      tourId,
      days: updatedDays
    });
  } catch (error) {
    console.error('Reorder days error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Assign items to day
 * POST /api/days/:id/assign
 * Body: { tastes_ids, routes_ids, hotel_id, ticket_ids }
 */
export async function assignItemsToDay(req, res) {
  try {
    const { id } = req.params;
    const assignments = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Day ID is required' });
    }

    const updatedDay = await dayEngine.assignItemsToDay(id, assignments);

    res.json({
      success: true,
      day: updatedDay
    });
  } catch (error) {
    console.error('Assign items error:', error);
    res.status(500).json({ error: error.message });
  }
}
