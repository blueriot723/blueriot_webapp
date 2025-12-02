const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BlueRiot Matrix API - Claude Interface',
    endpoints: {
      '/query': 'POST - Execute SELECT query',
      '/insert': 'POST - Insert data',
      '/update': 'POST - Update data',
      '/delete': 'POST - Delete data',
      '/rpc': 'POST - Call stored function'
    }
  });
});

// Generic query endpoint
app.post('/query', async (req, res) => {
  try {
    const { table, select = '*', filter = {}, order = null, limit = null } = req.body;

    if (!table) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: table' 
      });
    }

    let query = supabase.from(table).select(select);

    // Apply filters
    Object.entries(filter).forEach(([column, value]) => {
      if (typeof value === 'object' && value.operator) {
        // Advanced filter: { operator: 'eq', value: 'something' }
        query = query[value.operator](column, value.value);
      } else {
        // Simple filter: { column: value }
        query = query.eq(column, value);
      }
    });

    // Apply ordering
    if (order) {
      const { column, ascending = true } = order;
      query = query.order(column, { ascending });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      data,
      count: data ? data.length : 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Insert endpoint
app.post('/insert', async (req, res) => {
  try {
    const { table, data } = req.body;

    if (!table || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: table, data' 
      });
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      data: result,
      count: result.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update endpoint
app.post('/update', async (req, res) => {
  try {
    const { table, data, filter = {} } = req.body;

    if (!table || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: table, data' 
      });
    }

    let query = supabase.from(table).update(data);

    // Apply filters
    Object.entries(filter).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { data: result, error } = await query.select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      data: result,
      count: result.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete endpoint
app.post('/delete', async (req, res) => {
  try {
    const { table, filter = {} } = req.body;

    if (!table || Object.keys(filter).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: table, filter (cannot delete without filter)' 
      });
    }

    let query = supabase.from(table).delete();

    // Apply filters
    Object.entries(filter).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { data: result, error } = await query.select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      data: result,
      count: result.length,
      message: `Deleted ${result.length} row(s)`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// RPC endpoint (call stored functions)
app.post('/rpc', async (req, res) => {
  try {
    const { function_name, params = {} } = req.body;

    if (!function_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: function_name' 
      });
    }

    const { data, error } = await supabase.rpc(function_name, params);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Count endpoint (quick count)
app.post('/count', async (req, res) => {
  try {
    const { table, filter = {} } = req.body;

    if (!table) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: table' 
      });
    }

    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    // Apply filters
    Object.entries(filter).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { count, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BlueRiot Matrix API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
});
