import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

  return (
    <div className="main-layout">
      <div className="content">
        {/* Приветственный баннер */}
        <div className="reddit-card" style={{ 
          background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
          color: 'white',
          marginBottom: 20
        }}>
          <div style={{ padding: 32 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700 }}>
              Добро пожаловать на ForumHub
            </h1>
            <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 20 }}>
              Место для обсуждений, вопросов и обмена опытом
            </p>
            {!user && (
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/register" style={{ 
                  backgroundColor: 'white', 
                  color: '#FF4500', 
                  padding: '10px 24px', 
                  borderRadius: 9999, 
                  fontWeight: 600,
                  textDecoration: 'none'
                }}>
                  Присоединиться
                </Link>
                <Link to="/login" style={{ 
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  padding: '10px 24px', 
                  borderRadius: 9999, 
                  fontWeight: 600,
                  border: '1px solid white',
                  textDecoration: 'none'
                }}>
                  Войти
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Категории */}
        <div className="reddit-card" style={{ marginBottom: 20 }}>
          <div className="card-header">📂 Категории</div>
          <div style={{ padding: 16 }}>
            {categories.map((category) => (
              <Link key={category._id} to={`/category/${category._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ 
                  padding: 16, 
                  borderBottom: '1px solid #EDEFF1',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F6F7F8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontWeight: 600, color: '#1A1A1B', marginBottom: 4 }}>r/{category.name}</div>
                  <div style={{ fontSize: 13, color: '#878A8C' }}>{category.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Сайдбар */}
      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header">📌 О сообществе</div>
          <div className="sidebar-content">
            <p style={{ fontSize: 14, color: '#878A8C', marginBottom: 16 }}>
              ForumHub — платформа для обсуждений, где можно задать вопросы, делиться опытом и находить единомышленников.
            </p>
            <div style={{ fontSize: 13, color: '#878A8C' }}>
              <div>👥 Участников: 1,234</div>
              <div style={{ marginTop: 8 }}>💬 Всего тем: 567</div>
              <div style={{ marginTop: 8 }}>📅 Создан: 2026</div>
            </div>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-header">📋 Правила</div>
          <div className="sidebar-content">
            <ul style={{ fontSize: 13, color: '#878A8C', listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12 }}>✓ Будьте вежливы с другими</li>
              <li style={{ marginBottom: 12 }}>✓ Проверяйте информацию перед публикацией</li>
              <li style={{ marginBottom: 12 }}>✓ Не спамьте и не флудите</li>
              <li style={{ marginBottom: 12 }}>✓ Указывайте источники</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;