import React from 'react';
import { Link } from 'react-router-dom';
const ProductCard = ({ product, onAdd }) => {
  return (
    <div className="card product-card">
      <img src={product.image_url || 'https://placehold.co/600x400'} alt={product.name} />
      <div className="card-body">
        <span className="badge">{product.category_name}</span>
        <h3>{product.name}</h3>
        <p>{product.description?.slice(0, 90)}...</p>
        <div className="product-meta">
          <strong>${Number(product.price).toFixed(2)}</strong>
          <span>{product.stock} in stock</span>
        </div>
        <div className="actions">
          <Link className="btn secondary" to={`/products/${product.id}`}>View</Link>
          <button className="btn" onClick={() => onAdd(product.id)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
