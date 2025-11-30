import express from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';

const router = express.Router();

// Get all tickets for a tour
router.get('/tour/:tourId', ticketsController.getTicketsByTour);

// Get ticket by ID
router.get('/:id', ticketsController.getTicketById);

// Create ticket
router.post('/', ticketsController.createTicket);

// Update ticket
router.put('/:id', ticketsController.updateTicket);

// Delete ticket
router.delete('/:id', ticketsController.deleteTicket);

// Get tickets by day
router.get('/day/:dayId', ticketsController.getTicketsByDay);

export default router;
