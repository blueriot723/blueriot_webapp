// Day Engine Service - Core day management and reordering logic

import { supabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all days for a tour (ordered by logical_day_number)
 * @param {string} tourId
 * @returns {Promise<Array>}
 */
export async function getDaysByTour(tourId) {
  const { data, error } = await supabase
    .from('tour_days')
    .select('*')
    .eq('tour_id', tourId)
    .order('logical_day_number', { ascending: true });

  if (error) throw error;

  return data || [];
}

/**
 * Get single day by ID
 * @param {string} dayId
 * @returns {Promise<Object>}
 */
export async function getDayById(dayId) {
  const { data, error } = await supabase
    .from('tour_days')
    .select('*')
    .eq('id', dayId)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Create a new tour day
 * @param {Object} dayData
 * @returns {Promise<Object>}
 */
export async function createDay(dayData) {
  const { tour_id, calendar_date, created_by } = dayData;

  if (!tour_id || !calendar_date) {
    throw new Error('tour_id and calendar_date are required');
  }

  // Get next logical_day_number
  const { data: existingDays } = await supabase
    .from('tour_days')
    .select('logical_day_number')
    .eq('tour_id', tour_id)
    .order('logical_day_number', { ascending: false })
    .limit(1);

  const nextLogicalDay = existingDays && existingDays.length > 0
    ? existingDays[0].logical_day_number + 1
    : 1;

  const newDay = {
    id: uuidv4(),
    tour_id,
    calendar_date,
    logical_day_number: nextLogicalDay,
    day_title: dayData.day_title || `Day ${nextLogicalDay}`,
    cities: dayData.cities || [],
    primary_city: dayData.primary_city || null,
    morning_schedule: dayData.morning_schedule || null,
    afternoon_schedule: dayData.afternoon_schedule || null,
    evening_schedule: dayData.evening_schedule || null,
    is_hiking_day: dayData.is_hiking_day || false,
    hiking_distance_km: dayData.hiking_distance_km || null,
    hiking_elevation_m: dayData.hiking_elevation_m || null,
    hiking_difficulty: dayData.hiking_difficulty || null,
    hiking_map_link: dayData.hiking_map_link || null,
    meeting_point: dayData.meeting_point || null,
    meeting_time: dayData.meeting_time || null,
    hotel_id: dayData.hotel_id || null,
    tastes_ids: dayData.tastes_ids || [],
    routes_ids: dayData.routes_ids || [],
    ticket_ids: dayData.ticket_ids || [],
    emergency_contact_id: dayData.emergency_contact_id || null,
    tl_notes: dayData.tl_notes || null,
    passenger_notes: dayData.passenger_notes || null,
    created_by: created_by || null
  };

  const { data, error } = await supabase
    .from('tour_days')
    .insert([newDay])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update a tour day
 * @param {string} dayId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateDay(dayId, updates) {
  const allowedUpdates = {
    day_title: updates.day_title,
    cities: updates.cities,
    primary_city: updates.primary_city,
    morning_schedule: updates.morning_schedule,
    afternoon_schedule: updates.afternoon_schedule,
    evening_schedule: updates.evening_schedule,
    is_hiking_day: updates.is_hiking_day,
    hiking_distance_km: updates.hiking_distance_km,
    hiking_elevation_m: updates.hiking_elevation_m,
    hiking_difficulty: updates.hiking_difficulty,
    hiking_map_link: updates.hiking_map_link,
    meeting_point: updates.meeting_point,
    meeting_time: updates.meeting_time,
    hotel_id: updates.hotel_id,
    tastes_ids: updates.tastes_ids,
    routes_ids: updates.routes_ids,
    ticket_ids: updates.ticket_ids,
    emergency_contact_id: updates.emergency_contact_id,
    tl_notes: updates.tl_notes,
    passenger_notes: updates.passenger_notes,
    updated_at: new Date().toISOString()
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach(key => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  const { data, error } = await supabase
    .from('tour_days')
    .update(allowedUpdates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Delete a tour day
 * @param {string} dayId
 * @returns {Promise<boolean>}
 */
export async function deleteDay(dayId) {
  // Get day info first
  const day = await getDayById(dayId);
  const tourId = day.tour_id;
  const deletedLogicalDay = day.logical_day_number;

  // Delete the day
  const { error } = await supabase
    .from('tour_days')
    .delete()
    .eq('id', dayId);

  if (error) throw error;

  // Renumber remaining days
  const { data: remainingDays } = await supabase
    .from('tour_days')
    .select('id, logical_day_number')
    .eq('tour_id', tourId)
    .gt('logical_day_number', deletedLogicalDay)
    .order('logical_day_number', { ascending: true });

  if (remainingDays && remainingDays.length > 0) {
    for (const d of remainingDays) {
      await supabase
        .from('tour_days')
        .update({ logical_day_number: d.logical_day_number - 1 })
        .eq('id', d.id);
    }
  }

  return true;
}

/**
 * Reorder tour days
 * This allows drag-and-drop reordering of logical_day_number
 * Calendar dates remain unchanged
 *
 * @param {string} tourId
 * @param {Array} dayOrder - Array of {id, new_logical_day_number}
 * @returns {Promise<Array>}
 */
export async function reorderDays(tourId, dayOrder) {
  if (!Array.isArray(dayOrder) || dayOrder.length === 0) {
    throw new Error('dayOrder must be a non-empty array');
  }

  // Validate all days belong to this tour
  const { data: allDays, error: fetchError } = await supabase
    .from('tour_days')
    .select('id')
    .eq('tour_id', tourId);

  if (fetchError) throw fetchError;

  const validIds = new Set(allDays.map(d => d.id));
  for (const item of dayOrder) {
    if (!validIds.has(item.id)) {
      throw new Error(`Invalid day ID: ${item.id}`);
    }
  }

  // Update each day's logical_day_number
  const updates = [];
  for (const item of dayOrder) {
    const { error } = await supabase
      .from('tour_days')
      .update({
        logical_day_number: item.new_logical_day_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) throw error;

    updates.push({
      id: item.id,
      logical_day_number: item.new_logical_day_number
    });
  }

  // Return updated days
  const updatedDays = await getDaysByTour(tourId);
  return updatedDays;
}

/**
 * Assign items (tastes, routes, stay) to a day
 * @param {string} dayId
 * @param {Object} assignments - {tastes_ids, routes_ids, hotel_id}
 * @returns {Promise<Object>}
 */
export async function assignItemsToDay(dayId, assignments) {
  const updates = {};

  if (assignments.tastes_ids !== undefined) {
    updates.tastes_ids = assignments.tastes_ids;
  }

  if (assignments.routes_ids !== undefined) {
    updates.routes_ids = assignments.routes_ids;
  }

  if (assignments.hotel_id !== undefined) {
    updates.hotel_id = assignments.hotel_id;
  }

  if (assignments.ticket_ids !== undefined) {
    updates.ticket_ids = assignments.ticket_ids;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No assignments provided');
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tour_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get full day data with linked items (tastes, routes, stay, tickets)
 * @param {string} dayId
 * @returns {Promise<Object>}
 */
export async function getDayWithLinkedItems(dayId) {
  const day = await getDayById(dayId);

  const linkedData = {
    ...day,
    linked_tastes: [],
    linked_routes: [],
    linked_hotel: null,
    linked_tickets: []
  };

  // Fetch linked tastes
  if (day.tastes_ids && day.tastes_ids.length > 0) {
    const { data: tastes } = await supabase
      .from('blueriot_tastes')
      .select('*')
      .in('id', day.tastes_ids);

    linkedData.linked_tastes = tastes || [];
  }

  // Fetch linked routes
  if (day.routes_ids && day.routes_ids.length > 0) {
    const { data: routes } = await supabase
      .from('blueriot_routes')
      .select('*')
      .in('id', day.routes_ids);

    linkedData.linked_routes = routes || [];
  }

  // Fetch linked hotel
  if (day.hotel_id) {
    const { data: hotel } = await supabase
      .from('blueriot_stay')
      .select('*')
      .eq('id', day.hotel_id)
      .single();

    linkedData.linked_hotel = hotel;
  }

  // Fetch linked tickets
  if (day.ticket_ids && day.ticket_ids.length > 0) {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .in('id', day.ticket_ids);

    linkedData.linked_tickets = tickets || [];
  }

  return linkedData;
}

/**
 * Swap two days (exchange their logical_day_number)
 * @param {string} day1Id
 * @param {string} day2Id
 * @returns {Promise<Object>}
 */
export async function swapDays(day1Id, day2Id) {
  const day1 = await getDayById(day1Id);
  const day2 = await getDayById(day2Id);

  if (day1.tour_id !== day2.tour_id) {
    throw new Error('Days must be from the same tour');
  }

  const temp1 = day1.logical_day_number;
  const temp2 = day2.logical_day_number;

  // Swap logical day numbers
  await supabase
    .from('tour_days')
    .update({ logical_day_number: temp2 })
    .eq('id', day1Id);

  await supabase
    .from('tour_days')
    .update({ logical_day_number: temp1 })
    .eq('id', day2Id);

  return {
    success: true,
    swapped: [
      { id: day1Id, new_logical_day: temp2 },
      { id: day2Id, new_logical_day: temp1 }
    ]
  };
}
