import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const paymentAPI = axios.create({
  baseURL: API_BASE_URL
});

paymentAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

paymentAPI.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const paymentService = {
  createPaymentIntent: (data) => paymentAPI.post('/payment/create-payment-intent', data),
  confirmPayment: (data) => paymentAPI.post('/payment/confirm-payment', data),
  getPayment: (paymentId) => paymentAPI.get(`/payment/payment/${paymentId}`),
  getPayments: (page = 1, limit = 10, status = '') =>
    paymentAPI.get('/payment/payments', {
      params: { page, limit, status }
    }),
  refundPayment: (data) => paymentAPI.post('/payment/refund', data),
  createOrder: (data) => paymentAPI.post('/payment/create-order', data),
  getOrders: (page = 1, limit = 10, status = '') =>
    paymentAPI.get('/payment/orders', {
      params: { page, limit, status }
    })
};

export default paymentService;