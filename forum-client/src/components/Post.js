import React, { useState } from 'react';
import axios from 'axios';

const Post = ({ post, currentUser, onVoteUpdate }) => {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [dislikes, setDislikes] = useState(post.dislikes?.length || 0);
  const [userLiked, setUserLiked] = useState(
    currentUser && post.likes?.includes(currentUser.id)
  );
  const [userDisliked, setUserDisliked] = useState(
    currentUser && post.dislikes?.includes(currentUser.id)
  );

  const handleLike = async () => {
    if (!currentUser) {
      alert("Войдите чтобы оценить");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
      setUserLiked(res.data.userLiked);
      setUserDisliked(res.data.userDisliked);
      if (onVoteUpdate) onVoteUpdate(post._id, res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      alert("Войдите чтобы оценить");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${post._id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
      setUserLiked(res.data.userLiked);
      setUserDisliked(res.data.userDisliked);
      if (onVoteUpdate) onVoteUpdate(post._id, res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post">
      <div className="post-container">
        <div className="post-content">
          <div className="post-header">
            <span className="post-author">u/{post.author?.username || 'anonymous'}</span>
            <span className="post-dot">•</span>
            <span className="post-time">{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <p className="post-text">{post.content}</p>
          <div className="post-actions">
            <div className="vote-panel">
              <button 
                onClick={handleLike}
                className={`vote-button up ${userLiked ? 'active' : ''}`}
              >
                👍 {likes}
              </button>
              <span className="vote-count">{likes - dislikes}</span>
              <button 
                onClick={handleDislike}
                className={`vote-button down ${userDisliked ? 'active' : ''}`}
              >
                👎 {dislikes}
              </button>
            </div>
            <button className="post-action">
              💬 Ответить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;