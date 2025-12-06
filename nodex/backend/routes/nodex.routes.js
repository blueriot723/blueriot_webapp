import express from 'express';
import * as nodexController from '../controllers/nodex.controller.js';

const router = express.Router();

// Get NODΞ dashboard data
router.get('/dashboard', nodexController.getDashboard);

// Get tour operational data
router.get('/tour/:tourId', nodexController.getTourOperationalData);

// Get settings
router.get('/settings', nodexController.getSettings);

// Update settings
router.put('/settings', nodexController.updateSettings);

// Ask NODΞ bot
router.post('/ask', nodexController.askBot);

export default router;
