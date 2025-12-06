import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">💳 Payment System</Link>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/checkout" className="nav-link">
              🛒 Checkout
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/payment-history" className="nav-link">
              💰 Payment History
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/order-history" className="nav-link">
              📦 Order History
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};