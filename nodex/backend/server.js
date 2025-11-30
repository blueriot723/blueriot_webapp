import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  🔴 NODΞ - blueriot mαtrιχ Operational Control');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`  Environment:  ${ENV}`);
  console.log(`  Port:         ${PORT}`);
  console.log(`  URL:          http://localhost:${PORT}`);
  console.log('');
  console.log('  Modules:');
  console.log('    ✓ eTicket Reader');
  console.log('    ✓ PDF OCP Generator');
  console.log('    ✓ vCard Ingestion');
  console.log('    ✓ Weather Engine');
  console.log('    ✓ Day Management');
  console.log('    ✓ Deterministic Bot');
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET  /health');
  console.log('    GET  /version');
  console.log('    POST /api/parser/eticket');
  console.log('    POST /api/pdf/generate');
  console.log('    POST /api/vcard/import');
  console.log('    GET  /api/weather/:city/:date');
  console.log('    GET  /api/days/tour/:id');
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
