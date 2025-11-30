import express from 'express';
import * as daysController from '../controllers/days.controller.js';

const router = express.Router();

// Get all days for a tour
router.get('/tour/:tourId', daysController.getDaysByTour);

// Get day by ID
router.get('/:id', daysController.getDayById);

// Create day
router.post('/', daysController.createDay);

// Update day
router.put('/:id', daysController.updateDay);

// Delete day
router.delete('/:id', daysController.deleteDay);

// Reorder days
router.post('/reorder', daysController.reorderDays);

// Assign items to day (tastes, routes, stay)
router.post('/:id/assign', daysController.assignItemsToDay);

export default router;
