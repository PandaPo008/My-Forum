import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <span className="logo-icon">📝</span>
          ForumHub
        </Link>

        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Поиск в ForumHub..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="nav-buttons">
          <button onClick={toggleDarkMode} className="btn-icon">
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link to="/submit" className="btn-primary">+ Создать пост</Link>
              <Link 
                to={`/user/${user.username}`} 
                className="avatar" 
                style={{ width: 32, height: 32, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {user.username[0].toUpperCase()}
              </Link>
              <button onClick={handleLogout} className="btn-secondary">Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Войти</Link>
              <Link to="/register" className="btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;