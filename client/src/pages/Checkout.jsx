import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import React from 'react';
const Checkout = () => {
  const [form, setForm] = useState({ shipping_address: '', phone: '' });
  const [error, setError] = useState('');
  const { total, fetchCart } = useCart();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', form);
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="auth-card">
      <h2>Checkout</h2>
      <h3>Total: ${total.toFixed(2)}</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <textarea placeholder="Shipping address" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
        <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="btn full">Place Order</button>
      </form>
    </div>
  );
};

export default Checkout;
