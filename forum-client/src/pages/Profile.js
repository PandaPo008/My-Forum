import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userThreads, setUserThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/${username}`);
        setUser(userRes.data);

        const threadsRes = await axios.get(`http://localhost:5000/api/users/${userRes.data._id}/threads`);
        setUserThreads(threadsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="main-layout">
        <div className="content">
          <div className="reddit-card" style={{ padding: 40, textAlign: 'center' }}>
            Загрузка...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="main-layout">
        <div className="content">
          <div className="reddit-card" style={{ padding: 40, textAlign: 'center' }}>
            Пользователь не найден
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <div className="content">
        {/* Карточка профиля */}
        <div className="reddit-card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              {/* Аватар - просто буква */}
              <div className="avatar" style={{ width: 100, height: 100, fontSize: 40 }}>
                {user.username[0].toUpperCase()}
              </div>
              
              <div>
                <h1 style={{ fontSize: 24, marginBottom: 4 }}>u/{user.username}</h1>
                <p style={{ color: '#878A8C', fontSize: 14 }}>
                  Пользователь с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>

            <div className="profile-stats" style={{ display: 'flex', gap: 24, paddingTop: 16, borderTop: '1px solid #EDEFF1' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{userThreads.length}</div>
                <div style={{ color: '#878A8C', fontSize: 12 }}>постов</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.karma || 0}</div>
                <div style={{ color: '#878A8C', fontSize: 12 }}>карма</div>
              </div>
            </div>
          </div>
        </div>

        {/* Посты пользователя */}
        <div className="reddit-card">
          <div className="card-header">📄 Посты пользователя</div>
          <div style={{ padding: 16 }}>
            {userThreads.length === 0 ? (
              <p style={{ color: '#878A8C', textAlign: 'center', padding: 20 }}>
                У пользователя пока нет постов
              </p>
            ) : (
              userThreads.map(thread => (
                <div key={thread._id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #EDEFF1' }}>
                  <Link to={`/thread/${thread._id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="profile-post-title" style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1B', marginBottom: 4 }}>
                      {thread.title}
                    </h3>
                  </Link>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#878A8C' }}>
                    <span>r/{thread.category?.name}</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-card profile-sidebar">
          <div className="sidebar-header">📊 Статистика</div>
          <div className="sidebar-content">
            <div style={{ fontSize: 13, color: '#878A8C' }}>
              <div>📅 На сайте: {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} дней</div>
              <div style={{ marginTop: 8 }}>✍️ Всего постов: {userThreads.length}</div>
              <div style={{ marginTop: 8 }}>⭐ Карма: {user.karma || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;