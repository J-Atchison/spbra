const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let payments = [];

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SPBRA API running!',
    timestamp: new Date()
  });
});

app.post('/api/payments/venmo-intent', (req, res) => {
  const { amount, customer } = req.body;
  
  const payment = {
    paymentId: `pay_${Date.now()}`,
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
    message: 'Payment created'
  });
});

app.get('/api/payments', (req, res) => {
  res.json({
    success: true,
    payments: payments
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});