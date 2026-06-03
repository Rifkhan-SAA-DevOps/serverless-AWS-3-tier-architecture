import { Link } from 'react-router-dom';
import React from 'react';
const NotFound = () => (
  <div className="empty">
    <h1>404 - Page Not Found</h1>
    <Link className="btn" to="/">Back Home</Link>
  </div>
);

export default NotFound;
