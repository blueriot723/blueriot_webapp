import express from 'express';
import * as dayItemsController from '../controllers/day-items.controller.js';

const router = express.Router();

// Get items by day
router.get('/day/:dayId', dayItemsController.getItemsByDay);

// Get items by tour (grouped by day)
router.get('/tour/:tourId', dayItemsController.getItemsByTour);

// Get single item (with optional linked data)
router.get('/:id', dayItemsController.getItemById);

// Create item
router.post('/', dayItemsController.createItem);

// Update item
router.put('/:id', dayItemsController.updateItem);

// Delete item
router.delete('/:id', dayItemsController.deleteItem);

// Move item to another day
router.post('/:id/move', dayItemsController.moveItem);

// Reorder items within a day
router.post('/reorder', dayItemsController.reorderItems);

// Duplicate item to another day
router.post('/:id/duplicate', dayItemsController.duplicateItem);

export default router;
