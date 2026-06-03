import { useEffect, useState } from 'react';
import api from '../api/axios';
import React from 'react';
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  const load = async () => {
    const res = await api.get('/categories');
    setCategories(res.data.data);
  };

  const create = async (e) => {
    e.preventDefault();
    await api.post('/categories', { name });
    setName('');
    load();
  };

  const remove = async (id) => {
    await api.delete(`/categories/${id}`);
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="auth-card wide">
      <h2>Manage Categories</h2>
      <form onSubmit={create} className="inline-form">
        <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn">Add</button>
      </form>
      {categories.map((cat) => (
        <div className="admin-row" key={cat.id}>
          <strong>{cat.name}</strong>
          <button className="danger" onClick={() => remove(cat.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Categories;
