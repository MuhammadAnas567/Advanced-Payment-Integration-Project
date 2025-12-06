import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentAPI';
import '../styles/OrderHistory.css';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getOrders(page, 10, filter);
      setOrders(res.data.orders);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="order-history">
      <h2>Order History</h2>

      <div className="filter">
        <select value={filter} onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}>
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id.slice(-8)}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>${order.finalAmount.toFixed(2)}</td>
              <td>
                <span className={`status ${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
              </td>
              <td>{order.items.length} item(s)</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={orders.length < 10}>
          Next
        </button>
      </div>
    </div>
  );
};
