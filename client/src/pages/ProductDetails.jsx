import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import React from 'react';
const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.data));
  }, [id]);

  const add = async () => {
    if (!user) return setMessage('Please login first.');
    await addToCart(product.id, qty);
    setMessage('Added to cart.');
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="details">
      <img src={product.image_url || 'https://placehold.co/600x400'} alt={product.name} />
      <div>
        <span className="badge">{product.category_name}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <h2>${Number(product.price).toFixed(2)}</h2>
        <p>Weight: {product.weight_kg} kg</p>
        <p>Stock: {product.stock}</p>
        <input type="number" min="1" max={product.stock} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        <button className="btn" onClick={add}>Add to Cart</button>
        {message && <p className="notice">{message}</p>}
      </div>
    </div>
  );
};

export default ProductDetails;
