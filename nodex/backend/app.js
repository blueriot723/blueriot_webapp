import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import nodexRoutes from './routes/nodex.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import daysRoutes from './routes/days.routes.js';
import dayItemsRoutes from './routes/day-items.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import vcardRoutes from './routes/vcard.routes.js';
import parserRoutes from './routes/parser.routes.js';
import pdfRoutes from './routes/pdf.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== MIDDLEWARE =====

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for frontend if needed)
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'NODΞ',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Version info
app.get('/version', (req, res) => {
  res.json({
    module: 'blueriot NODΞ',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'eTicketReader',
      'PDF OCP Generator',
      'vCard Ingestion',
      'Weather Engine',
      'Day Management',
      'Deterministic Bot'
    ]
  });
});

// API Routes
app.use('/api/nodex', nodexRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/days', daysRoutes);
app.use('/api/day-items', dayItemsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/vcard', vcardRoutes);
app.use('/api/parser', parserRoutes);
app.use('/api/pdf', pdfRoutes);

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
