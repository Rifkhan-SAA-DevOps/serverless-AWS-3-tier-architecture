import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        Rifkhan Shop
      </Link>
      <div className="nav-links">
        <NavLink to="/">Products</NavLink>
        {user && <NavLink to="/cart">Cart ({cart.length})</NavLink>}
        {user && <NavLink to="/orders">My Orders</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        {!user ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        ) : (
          <button className="link-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
