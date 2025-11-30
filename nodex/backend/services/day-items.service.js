// Day Items Service - Movable blocks within days

import { supabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

// Color mapping
const COLOR_MAP = {
  activity: 'orange',
  lunch: 'light_blue',
  dinner: 'blue',
  transport: 'green',
  suggestion: 'purple'
};

/**
 * Get all items for a day
 * @param {string} dayId
 * @returns {Promise<Array>}
 */
export async function getItemsByDay(dayId) {
  const { data, error } = await supabase
    .from('day_items')
    .select('*')
    .eq('day_id', dayId)
    .order('position', { ascending: true });

  if (error) throw error;

  return data || [];
}

/**
 * Get all items for a tour (grouped by day)
 * @param {string} tourId
 * @returns {Promise<Object>}
 */
export async function getItemsByTour(tourId) {
  const { data: items, error } = await supabase
    .from('day_items')
    .select('*')
    .eq('tour_id', tourId)
    .order('position', { ascending: true });

  if (error) throw error;

  // Group by day_id
  const groupedByDay = {};
  items.forEach(item => {
    if (!groupedByDay[item.day_id]) {
      groupedByDay[item.day_id] = [];
    }
    groupedByDay[item.day_id].push(item);
  });

  return groupedByDay;
}

/**
 * Get single item by ID
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
export async function getItemById(itemId) {
  const { data, error } = await supabase
    .from('day_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Create a new day item
 * @param {Object} itemData
 * @returns {Promise<Object>}
 */
export async function createItem(itemData) {
  const { day_id, tour_id, item_type, created_by } = itemData;

  if (!day_id || !tour_id || !item_type) {
    throw new Error('day_id, tour_id, and item_type are required');
  }

  // Get next position for this day
  const { data: existingItems } = await supabase
    .from('day_items')
    .select('position')
    .eq('day_id', day_id)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingItems && existingItems.length > 0
    ? existingItems[0].position + 1
    : 0;

  // Auto-assign color based on type
  const color = itemData.color || COLOR_MAP[item_type] || 'orange';

  const newItem = {
    id: uuidv4(),
    day_id,
    tour_id,
    item_type,
    color,
    position: nextPosition,
    start_time: itemData.start_time || null,
    end_time: itemData.end_time || null,
    duration_minutes: itemData.duration_minutes || null,
    title: itemData.title || `New ${item_type}`,
    description: itemData.description || null,
    location: itemData.location || null,
    notes: itemData.notes || null,
    tastes_id: itemData.tastes_id || null,
    routes_id: itemData.routes_id || null,
    stay_id: itemData.stay_id || null,
    is_confirmed: itemData.is_confirmed || false,
    is_optional: itemData.is_optional || false,
    cost_estimate: itemData.cost_estimate || null,
    booking_required: itemData.booking_required || false,
    booking_url: itemData.booking_url || null,
    created_by: created_by || null
  };

  const { data, error } = await supabase
    .from('day_items')
    .insert([newItem])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update a day item
 * @param {string} itemId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateItem(itemId, updates) {
  const allowedUpdates = {
    title: updates.title,
    description: updates.description,
    location: updates.location,
    notes: updates.notes,
    start_time: updates.start_time,
    end_time: updates.end_time,
    duration_minutes: updates.duration_minutes,
    tastes_id: updates.tastes_id,
    routes_id: updates.routes_id,
    stay_id: updates.stay_id,
    is_confirmed: updates.is_confirmed,
    is_optional: updates.is_optional,
    cost_estimate: updates.cost_estimate,
    booking_required: updates.booking_required,
    booking_url: updates.booking_url,
    updated_at: new Date().toISOString()
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach(key => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  const { data, error } = await supabase
    .from('day_items')
    .update(allowedUpdates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Delete a day item
 * @param {string} itemId
 * @returns {Promise<boolean>}
 */
export async function deleteItem(itemId) {
  // Get item info first for reordering
  const item = await getItemById(itemId);
  const dayId = item.day_id;
  const deletedPosition = item.position;

  // Delete the item
  const { error } = await supabase
    .from('day_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;

  // Renumber remaining items in the same day
  const { data: remainingItems } = await supabase
    .from('day_items')
    .select('id, position')
    .eq('day_id', dayId)
    .gt('position', deletedPosition)
    .order('position', { ascending: true });

  if (remainingItems && remainingItems.length > 0) {
    for (const i of remainingItems) {
      await supabase
        .from('day_items')
        .update({ position: i.position - 1 })
        .eq('id', i.id);
    }
  }

  return true;
}

/**
 * Move item to another day
 * THIS IS THE KEY FUNCTION - allows moving items between days
 * @param {string} itemId
 * @param {string} newDayId
 * @param {number} newPosition - Optional target position in new day
 * @returns {Promise<Object>}
 */
export async function moveItemToDay(itemId, newDayId, newPosition = null) {
  const item = await getItemById(itemId);
  const oldDayId = item.day_id;
  const oldPosition = item.position;

  // If same day, just reorder
  if (oldDayId === newDayId) {
    return reorderItemsInDay(oldDayId, [{ id: itemId, new_position: newPosition || 0 }]);
  }

  // Get tour_id for new day (validation)
  const { data: newDay } = await supabase
    .from('tour_days')
    .select('tour_id')
    .eq('id', newDayId)
    .single();

  if (!newDay) {
    throw new Error('New day not found');
  }

  // Get next position in new day if not specified
  let targetPosition = newPosition;
  if (targetPosition === null) {
    const { data: itemsInNewDay } = await supabase
      .from('day_items')
      .select('position')
      .eq('day_id', newDayId)
      .order('position', { ascending: false })
      .limit(1);

    targetPosition = itemsInNewDay && itemsInNewDay.length > 0
      ? itemsInNewDay[0].position + 1
      : 0;
  }

  // Move the item
  const { data: movedItem, error: moveError } = await supabase
    .from('day_items')
    .update({
      day_id: newDayId,
      position: targetPosition,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .select()
    .single();

  if (moveError) throw moveError;

  // Renumber items in OLD day
  const { data: oldDayItems } = await supabase
    .from('day_items')
    .select('id, position')
    .eq('day_id', oldDayId)
    .gt('position', oldPosition)
    .order('position', { ascending: true });

  if (oldDayItems && oldDayItems.length > 0) {
    for (const i of oldDayItems) {
      await supabase
        .from('day_items')
        .update({ position: i.position - 1 })
        .eq('id', i.id);
    }
  }

  return {
    success: true,
    item: movedItem,
    from_day: oldDayId,
    to_day: newDayId
  };
}

/**
 * Reorder items within a day
 * @param {string} dayId
 * @param {Array} itemOrder - [{id, new_position}, ...]
 * @returns {Promise<Array>}
 */
export async function reorderItemsInDay(dayId, itemOrder) {
  if (!Array.isArray(itemOrder) || itemOrder.length === 0) {
    throw new Error('itemOrder must be a non-empty array');
  }

  // Update each item's position
  for (const item of itemOrder) {
    await supabase
      .from('day_items')
      .update({
        position: item.new_position,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);
  }

  // Return updated items
  const updatedItems = await getItemsByDay(dayId);
  return updatedItems;
}

/**
 * Get item with linked data (restaurant, transport, hotel)
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
export async function getItemWithLinkedData(itemId) {
  const item = await getItemById(itemId);

  const linkedData = {
    ...item,
    linked_tastes: null,
    linked_routes: null,
    linked_stay: null
  };

  // Fetch linked restaurant
  if (item.tastes_id) {
    const { data: tastes } = await supabase
      .from('blueriot_tastes')
      .select('*')
      .eq('id', item.tastes_id)
      .single();

    linkedData.linked_tastes = tastes;
  }

  // Fetch linked transport
  if (item.routes_id) {
    const { data: routes } = await supabase
      .from('blueriot_routes')
      .select('*')
      .eq('id', item.routes_id)
      .single();

    linkedData.linked_routes = routes;
  }

  // Fetch linked hotel
  if (item.stay_id) {
    const { data: stay } = await supabase
      .from('blueriot_stay')
      .select('*')
      .eq('id', item.stay_id)
      .single();

    linkedData.linked_stay = stay;
  }

  return linkedData;
}

/**
 * Duplicate item to another day
 * @param {string} itemId
 * @param {string} targetDayId
 * @returns {Promise<Object>}
 */
export async function duplicateItem(itemId, targetDayId) {
  const originalItem = await getItemById(itemId);

  // Get tour_id for target day
  const { data: targetDay } = await supabase
    .from('tour_days')
    .select('tour_id')
    .eq('id', targetDayId)
    .single();

  if (!targetDay) {
    throw new Error('Target day not found');
  }

  // Create copy with new day_id
  const duplicateData = {
    ...originalItem,
    id: undefined, // Let DB generate new UUID
    day_id: targetDayId,
    tour_id: targetDay.tour_id,
    created_at: undefined,
    updated_at: undefined,
    created_by: originalItem.created_by
  };

  delete duplicateData.id;
  delete duplicateData.created_at;
  delete duplicateData.updated_at;

  return createItem(duplicateData);
}
