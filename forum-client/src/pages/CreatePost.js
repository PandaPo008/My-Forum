import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createThread } from '../services/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: res.data[0]._id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Заголовок обязателен');
      setLoading(false);
      return;
    }

    try {
      await createThread({
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании поста');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-layout">
      <div className="content">
        <div className="reddit-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="avatar" style={{ width: 40, height: 40, fontSize: 18 }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: 20, marginBottom: 4 }}>Создать пост</h1>
              <p style={{ color: '#878A8C', fontSize: 12 }}>r/{categories.find(c => c._id === formData.categoryId)?.name || 'выберите категорию'}</p>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Выберите категорию</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="auth-input"
                style={{ cursor: 'pointer' }}
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    r/{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Заголовок</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Кратко опишите тему"
                className="auth-input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Текст (необязательно)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Подробно опишите свою мысль..."
                className="auth-input"
                rows={8}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header">📝 Правила публикации</div>
          <div className="sidebar-content">
            <ul style={{ fontSize: 13, color: '#878A8C', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 12 }}>✓ Будьте вежливы с другими</li>
              <li style={{ marginBottom: 12 }}>✓ Проверяйте заголовок на ошибки</li>
              <li style={{ marginBottom: 12 }}>✓ Не спамьте и не флудите</li>
              <li style={{ marginBottom: 12 }}>✓ Указывайте источники информации</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;