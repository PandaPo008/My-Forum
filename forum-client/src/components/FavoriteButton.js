import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FavoriteButton = ({ threadId, userId, onToggle }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/threads/favorites/user/${userId}`);
        const favorites = res.data;
        setIsFavorite(favorites.some(fav => fav._id === threadId));
      } catch (err) {
        console.error(err);
      }
    };
    checkFavorite();
  }, [threadId, userId]);

  const handleToggle = async () => {
    if (!userId) {
      alert("Войдите чтобы добавить в избранное");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/threads/${threadId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsFavorite(res.data.isFavorite);
      if (onToggle) onToggle(threadId, res.data.isFavorite);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
        isFavorite 
          ? 'bg-yellow-500 text-white' 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
    >
      <span>{isFavorite ? '⭐' : '☆'}</span>
      {isFavorite ? 'В избранном' : 'В избранное'}
    </button>
  );
};

export default FavoriteButton;