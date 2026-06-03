import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await api.get(`/products?${params.toString()}`);
    setProducts(res.data.data);
  };

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data.data);
  };

  const handleAdd = async (id) => {
    if (!user) return setMessage('Please login to add products to cart.');
    await addToCart(id, 1);
    setMessage('Product added to cart.');
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [category]);

  return (
    <div>
      <section className="hero">
        <div>
          <h1>Build Strength With Premium Fitness Equipment</h1>
          <p>Buy dumbbells, barbells, plates, kettlebells, and gym accessories for your home or commercial gym.</p>
        </div>
      </section>

      <div className="toolbar">
        <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <button className="btn" onClick={fetchProducts}>Search</button>
      </div>

      {message && <p className="notice">{message}</p>}

      <div className="grid">
        {products.map((product) => <ProductCard key={product.id} product={product} onAdd={handleAdd} />)}
      </div>
    </div>
  );
};

export default Home;
