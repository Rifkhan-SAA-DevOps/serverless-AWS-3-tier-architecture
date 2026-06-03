import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    if (!user) return setCart([]);
    const res = await api.get('/cart');
    setCart(res.data.data);
  };

  const addToCart = async (product_id, quantity = 1) => {
    await api.post('/cart', { product_id, quantity });
    await fetchCart();
  };

  const updateQuantity = async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (id) => {
    await api.delete(`/cart/${id}`);
    await fetchCart();
  };

  useEffect(() => { fetchCart(); }, [user]);

  const total = cart.reduce((sum, item) => sum + Number(item.subtotal), 0);

  return <CartContext.Provider value={{ cart, total, fetchCart, addToCart, updateQuantity, removeItem }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
