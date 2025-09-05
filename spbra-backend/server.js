const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// In-memory storage
let payments = [];
let paymentCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SPBRA Payment API is running on Render!',
    timestamp: new Date(),
    totalPayments: payments.length
  });
});

// Create payment
app.post('/api/payments/venmo-intent', (req, res) => {
  try {
    console.log('Payment request:', req.body);
    
    const { amount, customer } = req.body;
    
    if (!amount || !customer || !customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const payment = {
      paymentId: `pay_${Date.now()}_${paymentCounter++}`,
      amount: parseFloat(amount),
      customerName: customer.name,
      customerEmail: customer.email,
      status: 'initiated',
      createdAt: new Date()
    };
    
    payments.push(payment);
    
    console.log('Payment created:', payment.paymentId);
    
    res.json({
      success: true,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: payment.status,
      message: 'Payment created successfully'
    });
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Get payments
app.get('/api/payments', (req, res) => {
  try {
    res.json({
      success: true,
      payments: payments.slice().reverse() // Newest first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    });
  }
});

// Update payment status
app.put('/api/payments/:paymentId/status', (req, res) => {
  try {
    const { status } = req.body;
    const payment = payments.find(p => p.paymentId === req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    payment.status = status;
    payment.updatedAt = new Date();
    
    res.json({
      success: true,
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SPBRA Payment API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      createPayment: 'POST /api/payments/venmo-intent',
      getPayments: '/api/payments'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SPBRA Payment API running on port ${PORT}`);
});

module.exports = app;