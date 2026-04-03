import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ThreadPage = () => {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('new');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        
        const threadRes = await axios.get(`http://localhost:5000/api/threads/${id}`);
        setThread(threadRes.data);
        
        const postsRes = await axios.get(`http://localhost:5000/api/posts/thread/${id}`);
        setPosts(postsRes.data || []);
        
      } catch (error) {
        console.error('Ошибка загрузки темы:', error);
        setThread(null);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [id]);

  const addPost = async (e, parentPostId = null) => {
    e.preventDefault();
    if (!user) {
      alert("Войдите чтобы написать сообщение");
      return;
    }
    const content = parentPostId ? replyTo?.content : newPost;
    if (!content?.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/posts', {
        content: content.trim(),
        threadId: id,
        parentPostId: parentPostId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const postsRes = await axios.get(`http://localhost:5000/api/posts/thread/${id}`);
      setPosts(postsRes.data || []);
      setNewPost('');
      setReplyTo(null);
    } catch (error) {
      console.error(error);
      alert('Ошибка при отправке');
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert("Войдите чтобы оценить");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const updatePostRating = (postList) => {
        return postList.map(post => {
          if (post._id === postId) {
            return { ...post, likes: res.data.likes, dislikes: res.data.dislikes, rating: res.data.rating };
          }
          if (post.replies && post.replies.length > 0) {
            return { ...post, replies: updatePostRating(post.replies) };
          }
          return post;
        });
      };
      setPosts(updatePostRating(posts));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (postId) => {
    if (!user) {
      alert("Войдите чтобы оценить");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/dislike`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const updatePostRating = (postList) => {
        return postList.map(post => {
          if (post._id === postId) {
            return { ...post, likes: res.data.likes, dislikes: res.data.dislikes, rating: res.data.rating };
          }
          if (post.replies && post.replies.length > 0) {
            return { ...post, replies: updatePostRating(post.replies) };
          }
          return post;
        });
      };
      setPosts(updatePostRating(posts));
    } catch (err) {
      console.error(err);
    }
  };

  const getSortedPosts = () => {
    const sorted = [...posts];
    if (sortBy === 'new') {
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'old') {
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'top') {
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  };

  // Безопасное получение количества лайков/дизлайков
  const getLikesCount = (post) => {
    return Array.isArray(post.likes) ? post.likes.length : 0;
  };

  const getDislikesCount = (post) => {
    return Array.isArray(post.dislikes) ? post.dislikes.length : 0;
  };

  const getUserLiked = (post) => {
    if (!user) return false;
    return Array.isArray(post.likes) && post.likes.includes(user.id);
  };

  const getUserDisliked = (post) => {
    if (!user) return false;
    return Array.isArray(post.dislikes) && post.dislikes.includes(user.id);
  };

  const renderPost = (post, isReply = false) => {
    const userLiked = getUserLiked(post);
    const userDisliked = getUserDisliked(post);
    
    return (
      <div key={post._id} className="post" style={{ marginBottom: 12, marginLeft: isReply ? 40 : 0 }}>
        <div className="post-content" style={{ width: '100%' }}>
          <div className="post-header">
            <span className="post-author">u/{post.author?.username || 'anonymous'}</span>
            <span className="post-dot">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
            {post.isEdited && <span className="post-dot">• отредактировано</span>}
          </div>
          {replyTo?.postId === post._id && (
            <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#F6F7F8', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#878A8C', marginBottom: 8 }}>
                Ответ пользователю u/{post.author?.username || 'anonymous'}:
              </div>
              <form onSubmit={(e) => addPost(e, post._id)}>
                <textarea
                  autoFocus
                  placeholder="Напишите ваш ответ..."
                  className="form-input"
                  rows={3}
                  value={replyTo.content}
                  onChange={(e) => setReplyTo({ ...replyTo, content: e.target.value })}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setReplyTo(null)} className="btn-secondary">Отмена</button>
                  <button type="submit" className="btn-primary">Ответить</button>
                </div>
              </form>
            </div>
          )}
          <p className="post-text">{post.content}</p>
          <div className="post-actions">
            <div className="vote-panel" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button 
                onClick={() => handleLike(post._id)}
                className={`vote-button up ${userLiked ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                👍 {getLikesCount(post)}
              </button>
              <span className="vote-count" style={{ fontWeight: 600, minWidth: '32px', textAlign: 'center' }}>{post.rating || 0}</span>
              <button 
                onClick={() => handleDislike(post._id)}
                className={`vote-button down ${userDisliked ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                👎 {getDislikesCount(post)}
              </button>
            </div>
            <button 
              className="post-action" 
              onClick={() => setReplyTo({ postId: post._id, content: '' })}
            >
              💬 Ответить
            </button>
          </div>
          {post.replies && post.replies.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {post.replies.map(reply => renderPost(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="main-layout">
        <div className="content">
          <div className="reddit-card" style={{ padding: 60, textAlign: 'center' }}>
            <div>Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="main-layout">
        <div className="content">
          <div className="reddit-card" style={{ padding: 60, textAlign: 'center' }}>
            <h2>Тема не найдена</h2>
            <p style={{ color: '#878A8C', marginTop: 8 }}>Возможно, тема была удалена или ID указан неверно</p>
            <Link to="/" className="btn-primary" style={{ marginTop: 20, display: 'inline-block' }}>На главную</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <div className="content">
        {/* Основной пост (тема) */}
        <div className="post" style={{ marginBottom: 20 }}>
          <div className="post-content">
            <div className="post-header">
              <span className="post-author">u/{thread.author?.username || 'anonymous'}</span>
              <span className="post-dot">•</span>
              <span>{new Date(thread.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            <h1 className="post-title" style={{ fontSize: 24, marginBottom: 16 }}>{thread.title}</h1>
            <p className="post-text" style={{ fontSize: 16, lineHeight: 1.6 }}>{thread.content}</p>
            <div className="post-actions">
              <div className="vote-panel" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="vote-button up" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  👍 {Array.isArray(thread.likes) ? thread.likes.length : 0}
                </button>
                <span className="vote-count" style={{ fontWeight: 600, minWidth: '32px', textAlign: 'center' }}>{thread.rating || 0}</span>
                <button className="vote-button down" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  👎 {Array.isArray(thread.dislikes) ? thread.dislikes.length : 0}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Блок комментариев */}
        <div className="reddit-card" style={{ marginBottom: 16 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💬 {posts.length} комментариев</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setSortBy('new')} 
                style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: sortBy === 'new' ? '#FF4500' : '#878A8C' }}
              >
                Новые
              </button>
              <button 
                onClick={() => setSortBy('top')} 
                style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: sortBy === 'top' ? '#FF4500' : '#878A8C' }}
              >
                Лучшие
              </button>
              <button 
                onClick={() => setSortBy('old')} 
                style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: sortBy === 'old' ? '#FF4500' : '#878A8C' }}
              >
                Старые
              </button>
            </div>
          </div>

          <div style={{ padding: 16 }}>
            {getSortedPosts().length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#878A8C', fontSize: 16, marginBottom: 8 }}>💬</p>
                <p style={{ color: '#878A8C' }}>Пока нет комментариев</p>
                <p style={{ color: '#878A8C', fontSize: 13, marginTop: 8 }}>Будьте первым, кто оставит комментарий!</p>
              </div>
            ) : (
              getSortedPosts().map(post => renderPost(post))
            )}
          </div>
        </div>

        {/* Форма отправки комментария */}
        <div className="reddit-card">
          <div className="card-header">✍️ Написать комментарий</div>
          <div style={{ padding: 16 }}>
            <form onSubmit={(e) => addPost(e, null)}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={user ? "Напишите ваш комментарий..." : "Войдите чтобы оставить комментарий"}
                className="form-input"
                rows={4}
                style={{ resize: 'vertical', marginBottom: 12 }}
                disabled={!user}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!user || !newPost.trim()}
                >
                  Отправить комментарий
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Сайдбар */}
      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header">📌 Информация</div>
          <div className="sidebar-content">
            <div style={{ fontSize: 14, color: '#1A1A1B', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>О теме</div>
              <div style={{ color: '#878A8C', fontSize: 13 }}>
                <div>📅 Создано: {new Date(thread.createdAt).toLocaleDateString('ru-RU')}</div>
                <div>👤 Автор: u/{thread.author?.username || 'anonymous'}</div>
                <div>💬 Комментариев: {posts.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-header">📋 Правила</div>
          <div className="sidebar-content">
            <ul style={{ fontSize: 12, color: '#878A8C', listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>✓ Будьте вежливы</li>
              <li style={{ marginBottom: 8 }}>✓ Не спамьте</li>
              <li style={{ marginBottom: 8 }}>✓ Проверяйте информацию</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage;