const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let payments = [];
let paymentCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SPBRA Payment API is running!',
    timestamp: new Date()
  });
});

// Create payment
app.post('/api/payments/venmo-intent', (req, res) => {
  try {
    const { amount, customer } = req.body;
    
    if (!amount || !customer?.name || !customer?.email) {
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
    
    res.json({
      success: true,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: payment.status,
      message: 'Payment created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Get payments
app.get('/api/payments', (req, res) => {
  res.json({
    success: true,
    payments: payments.slice().reverse()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});