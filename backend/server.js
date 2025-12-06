const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

// ============= DATABASE CONNECTION =============
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      
    });
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// ============= MIDDLEWARE =============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============= IMPORT ROUTES =============

const paymentRoutes = require('./routes/payment');

// ============= USE ROUTES =============

app.use('/api/payment', paymentRoutes);

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ============= ERROR HANDLER =============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// ============= START SERVER =============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});