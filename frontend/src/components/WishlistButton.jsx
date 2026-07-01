import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function WishlistButton({ vehicleId, style = {} }) {
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const navigate = useNavigate();
  const liked    = isWishlisted(vehicleId);

  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    toggleWishlist(vehicleId);
  };

  return (
    <button className={`wishlist-btn ${liked ? 'liked' : ''}`} onClick={handle} style={style} title={liked ? 'Remove from wishlist' : 'Add to wishlist'}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
