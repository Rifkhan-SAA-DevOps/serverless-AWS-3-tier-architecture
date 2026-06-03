import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import React from 'react';
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const [p, o] = await Promise.all([api.get('/products'), api.get('/orders')]);
    setProducts(p.data.data);
    setOrders(o.data.data);
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <div className="actions">
          <Link className="btn" to="/admin/products/new">New Product</Link>
          <Link className="btn secondary" to="/admin/categories">Categories</Link>
        </div>
      </div>

      <h2>Products</h2>
      <div className="table-card">
        {products.map((product) => (
          <div className="admin-row" key={product.id}>
            <strong>{product.name}</strong>
            <span>${Number(product.price).toFixed(2)}</span>
            <span>Stock: {product.stock}</span>
            <Link className="btn secondary" to={`/admin/products/${product.id}/edit`}>Edit</Link>
            <button className="danger" onClick={() => remove(product.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2>Orders</h2>
      <div className="table-card">
        {orders.map((order) => (
          <div className="admin-row" key={order.id}>
            <strong>#{order.id} - {order.customer_name}</strong>
            <span>${Number(order.total_amount).toFixed(2)}</span>
            <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
