import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import { PaymentCheckout } from '../components/PaymentCheckout';
import { PaymentHistory } from '../components/paymentHistory';
import { OrderHistory } from '../components/OrderHistory';
import { Navbar } from '../components/Navbar';

function App() {
  // Sample cart items
  const [cartItems, setCartItems] = useState([
    {
      productId: '1',
      productName: 'Premium Plan',
      quantity: 1,
      price: 99.99
    },
    {
      productId: '2',
      productName: 'Extended Support',
      quantity: 1,
      price: 49.99
    }
  ]);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* ============= PAYMENT ROUTES ============= */}
            <Route 
              path="/checkout" 
              element={<PaymentCheckout items={cartItems} />} 
            />

            <Route 
              path="/payment-history" 
              element={<PaymentHistory />} 
            />

            <Route 
              path="/order-history" 
              element={<OrderHistory />} 
            />

            <Route 
              path="/payment-success" 
              element={
                <div className="success-page">
                  <h1>✅ Payment Successful!</h1>
                  <p>Your payment has been processed successfully.</p>
                  <a href="/payment-history">View Payment History</a>
                </div>
              } 
            />

            {/* ============= DEFAULT ROUTE ============= */}
            <Route 
              path="/" 
              element={<Navigate to="/checkout" replace />} 
            />
            
            <Route 
              path="*" 
              element={<Navigate to="/checkout" replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
