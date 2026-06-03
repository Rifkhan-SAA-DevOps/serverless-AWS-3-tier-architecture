import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import React from 'react';
const Cart = () => {
  const { cart, total, updateQuantity, removeItem } = useCart();

  if (!cart.length) return <div className="empty"><h2>Your cart is empty</h2><Link className="btn" to="/">Shop Now</Link></div>;

  return (
    <div>
      <h1>Your Cart</h1>
      <div className="table-card">
        {cart.map((item) => (
          <div className="cart-row" key={item.id}>
            <img src={item.image_url || 'https://placehold.co/100'} alt={item.name} />
            <div><h3>{item.name}</h3><p>${Number(item.price).toFixed(2)}</p></div>
            <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.id, Number(e.target.value))} />
            <strong>${Number(item.subtotal).toFixed(2)}</strong>
            <button className="danger" onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="summary">
        <h2>Total: ${total.toFixed(2)}</h2>
        <Link className="btn" to="/checkout">Checkout</Link>
      </div>
    </div>
  );
};

export default Cart;
