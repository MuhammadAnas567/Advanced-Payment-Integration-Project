import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentAPI';
import '../styles/PaymentHistory.css';

export const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [page, filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments(page, 10, filter);
      setPayments(res.data.payments);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
    setLoading(false);
  };

  const handleRefund = async (paymentId, amount) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) return;

    try {
      await paymentService.refundPayment({
        paymentId,
        amount,
        reason: 'requested_by_customer'
      });
      alert('Refund processed successfully');
      fetchPayments();
    } catch (error) {
      alert(error.response?.data?.message || 'Refund failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="payment-history">
      <h2>Payment History</h2>

      <div className="filter">
        <select value={filter} onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}>
          <option value="">All Payments</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <table className="payments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Card</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment._id}>
              <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              <td>${payment.amount.toFixed(2)}</td>
              <td>
                <span className={`status ${payment.status}`}>
                  {payment.status.toUpperCase()}
                </span>
              </td>
              <td>
                {payment.cardDetails ? (
                  `${payment.cardDetails.brand} •••• ${payment.cardDetails.last4}`
                ) : (
                  'N/A'
                )}
              </td>
              <td>
                {payment.status === 'completed' && (
                  <button
                    onClick={() => handleRefund(payment._id, payment.amount)}
                    className="refund-button"
                  >
                    Refund
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={payments.length < 10}>
          Next
        </button>
      </div>
    </div>
  );
};
