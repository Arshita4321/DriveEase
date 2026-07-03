import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('driveease_user');
    return s ? JSON.parse(s) : null;
  });
  const [wishlist, setWishlist] = useState(() => {
    const s = localStorage.getItem('driveease_wishlist');
    return s ? JSON.parse(s) : [];
  });

  const persist = (token, userData) => {
    localStorage.setItem('driveease_token', token);
    localStorage.setItem('driveease_user', JSON.stringify(userData));
    setUser(userData);
  };

  const loadWishlist = async () => {
    try {
      const p = await api.get('/users/profile');
      const wl = (p.data.wishlist || []).map((v) => v._id || v);
      setWishlist(wl);
      localStorage.setItem('driveease_wishlist', JSON.stringify(wl));
    } catch {
      /* ignore */
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    await loadWishlist();
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    persist(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('driveease_token');
    localStorage.removeItem('driveease_user');
    localStorage.removeItem('driveease_wishlist');
    setUser(null);
    setWishlist([]);
  };

  const updateUserLocal = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('driveease_user', JSON.stringify(next));
      return next;
    });
  };

  const toggleWishlist = async (vehicleId) => {
    try {
      const { data } = await api.post(`/users/wishlist/${vehicleId}`);
      const ids = data.wishlist.map((id) => id.toString());
      setWishlist(ids);
      localStorage.setItem('driveease_wishlist', JSON.stringify(ids));
    } catch (err) {
      console.error('Wishlist toggle failed', err);
    }
  };

  const isWishlisted = (vehicleId) => wishlist.includes(vehicleId?.toString());

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, wishlist, toggleWishlist, isWishlisted, updateUserLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
