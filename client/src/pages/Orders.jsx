import { useEffect, useState } from 'react';
import api from '../api/axios';
import React from 'react';
const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/my-orders').then((res) => setOrders(res.data.data));
  }, []);

  return (
    <div>
      <h1>My Orders</h1>
      <div className="table-card">
        {orders.map((order) => (
          <div className="order-row" key={order.id}>
            <strong>Order #{order.id}</strong>
            <span>${Number(order.total_amount).toFixed(2)}</span>
            <span className="badge">{order.status}</span>
            <small>{new Date(order.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
