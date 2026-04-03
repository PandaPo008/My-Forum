import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [threadsRes, categoriesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/threads/category/${id}`),
          axios.get('http://localhost:5000/api/categories')
        ]);
        setThreads(threadsRes.data.threads || threadsRes.data || []);
        setCategory(categoriesRes.data.find(c => c._id === id));
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ЛАЙК - ПРОСТОЙ РАБОЧИЙ КОД
  const handleLike = async (threadId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Войдите в аккаунт");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${threadId}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Обновляем рейтинг в списке
      setThreads(prev => prev.map(t => 
        t._id === threadId 
          ? { ...t, likes: response.data.likes, dislikes: response.data.dislikes, rating: response.data.rating }
          : t
      ));
    } catch (error) {
      console.error('Лайк ошибка:', error);
      alert('Не удалось поставить лайк');
    }
  };

  // ДИЗЛАЙК
  const handleDislike = async (threadId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Войдите в аккаунт");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${threadId}/dislike`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setThreads(prev => prev.map(t => 
        t._id === threadId 
          ? { ...t, likes: response.data.likes, dislikes: response.data.dislikes, rating: response.data.rating }
          : t
      ));
    } catch (error) {
      console.error('Дизлайк ошибка:', error);
      alert('Не удалось поставить дизлайк');
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Войдите в аккаунт");
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/threads', {
        title: newThread.title,
        content: newThread.content,
        categoryId: id
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setShowForm(false);
      setNewThread({ title: '', content: '' });
      const res = await axios.get(`http://localhost:5000/api/threads/category/${id}`);
      setThreads(res.data.threads || res.data || []);
    } catch (err) {
      alert("Ошибка создания темы");
    }
  };

  if (loading) return <div className="main-layout"><div className="content"><div className="reddit-card" style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div></div></div>;
  if (!category) return <div className="main-layout"><div className="content"><div className="reddit-card" style={{ padding: 40, textAlign: 'center' }}>Категория не найдена</div></div></div>;

  return (
    <div className="main-layout">
      <div className="content">
        <div className="reddit-card" style={{ padding: 20, marginBottom: 16 }}>
          <h1>r/{category.name}</h1>
          <p style={{ color: '#878A8C' }}>{category.description}</p>
        </div>

        <div className="create-post-card" style={{ marginBottom: 16 }}>
          <div className="create-post-header">
            <div className="avatar">{user ? user.username[0].toUpperCase() : '?'}</div>
            <button onClick={() => setShowForm(!showForm)} className="create-post-input">Создать пост</button>
          </div>
        </div>

        {showForm && (
          <div className="post-form">
            <form onSubmit={handleCreateThread}>
              <input type="text" placeholder="Заголовок" className="form-input" value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} />
              <textarea placeholder="Текст" className="form-input" rows={6} value={newThread.content} onChange={(e) => setNewThread({...newThread, content: e.target.value})} />
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Отмена</button>
                <button type="submit" className="btn-primary">Опубликовать</button>
              </div>
            </form>
          </div>
        )}

        {threads.map(thread => (
          <div key={thread._id} className="post">
            <div className="post-content">
              <div className="post-header">
                <span>u/{thread.author?.username || 'anonymous'}</span>
                <span>•</span>
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
              <Link to={`/thread/${thread._id}`} className="post-title">{thread.title}</Link>
              <p className="post-text">{thread.content?.substring(0, 200)}...</p>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 10 }}>
                <button onClick={() => handleLike(thread._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>👍 {thread.likes?.length || 0}</button>
                <span>{thread.rating || 0}</span>
                <button onClick={() => handleDislike(thread._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>👎 {thread.dislikes?.length || 0}</button>
                <Link to={`/thread/${thread._id}`}>💬 {thread.commentCount || 0} комментариев</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;