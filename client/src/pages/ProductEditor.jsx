import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import React from 'react';
const empty = { name: '', description: '', price: '', stock: '', weight_kg: '', image_url: '', category_id: '', is_active: 1 };

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data));
    if (id) api.get(`/products/${id}`).then((res) => setForm(res.data.data));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (id) await api.put(`/products/${id}`, form);
    else await api.post('/products', form);
    navigate('/admin');
  };

  return (
    <div className="auth-card wide">
      <h2>{id ? 'Edit Product' : 'Create Product'}</h2>
      <form onSubmit={submit}>
        <input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input type="number" step="0.01" placeholder="Weight KG" value={form.weight_kg || ''} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
        <input placeholder="Image URL" value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <select value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select Category</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <button className="btn full">Save Product</button>
      </form>
    </div>
  );
};

export default ProductEditor;
