// Day Items Controller

import * as dayItemsService from '../services/day-items.service.js';

/**
 * Get all items for a day
 * GET /api/day-items/day/:dayId
 */
export async function getItemsByDay(req, res) {
  try {
    const { dayId } = req.params;

    if (!dayId) {
      return res.status(400).json({ error: 'Day ID is required' });
    }

    const items = await dayItemsService.getItemsByDay(dayId);

    res.json({
      success: true,
      dayId,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Get items by day error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all items for a tour (grouped by day)
 * GET /api/day-items/tour/:tourId
 */
export async function getItemsByTour(req, res) {
  try {
    const { tourId } = req.params;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID is required' });
    }

    const itemsByDay = await dayItemsService.getItemsByTour(tourId);

    res.json({
      success: true,
      tourId,
      itemsByDay
    });
  } catch (error) {
    console.error('Get items by tour error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single item by ID
 * GET /api/day-items/:id
 * Query: ?withLinked=true
 */
export async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const { withLinked } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    let item;
    if (withLinked === 'true') {
      item = await dayItemsService.getItemWithLinkedData(id);
    } else {
      item = await dayItemsService.getItemById(id);
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create new item
 * POST /api/day-items
 */
export async function createItem(req, res) {
  try {
    const itemData = req.body;

    if (!itemData.day_id || !itemData.tour_id || !itemData.item_type) {
      return res.status(400).json({
        error: 'day_id, tour_id, and item_type are required'
      });
    }

    const newItem = await dayItemsService.createItem(itemData);

    res.status(201).json({
      success: true,
      item: newItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update item
 * PUT /api/day-items/:id
 */
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const updatedItem = await dayItemsService.updateItem(id, updates);

    res.json({
      success: true,
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete item
 * DELETE /api/day-items/:id
 */
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    await dayItemsService.deleteItem(id);

    res.json({
      success: true,
      message: 'Item deleted and day items renumbered'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Move item to another day
 * POST /api/day-items/:id/move
 * Body: { newDayId, newPosition }
 */
export async function moveItem(req, res) {
  try {
    const { id } = req.params;
    const { newDayId, newPosition } = req.body;

    if (!id || !newDayId) {
      return res.status(400).json({
        error: 'Item ID and newDayId are required'
      });
    }

    const result = await dayItemsService.moveItemToDay(id, newDayId, newPosition);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Move item error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Reorder items within a day
 * POST /api/day-items/reorder
 * Body: { dayId, itemOrder: [{id, new_position}, ...] }
 */
export async function reorderItems(req, res) {
  try {
    const { dayId, itemOrder } = req.body;

    if (!dayId || !itemOrder) {
      return res.status(400).json({
        error: 'dayId and itemOrder are required'
      });
    }

    const updatedItems = await dayItemsService.reorderItemsInDay(dayId, itemOrder);

    res.json({
      success: true,
      dayId,
      items: updatedItems
    });
  } catch (error) {
    console.error('Reorder items error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Duplicate item to another day
 * POST /api/day-items/:id/duplicate
 * Body: { targetDayId }
 */
export async function duplicateItem(req, res) {
  try {
    const { id } = req.params;
    const { targetDayId } = req.body;

    if (!id || !targetDayId) {
      return res.status(400).json({
        error: 'Item ID and targetDayId are required'
      });
    }

    const duplicatedItem = await dayItemsService.duplicateItem(id, targetDayId);

    res.status(201).json({
      success: true,
      item: duplicatedItem
    });
  } catch (error) {
    console.error('Duplicate item error:', error);
    res.status(500).json({ error: error.message });
  }
}
