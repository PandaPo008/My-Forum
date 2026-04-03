import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      const searchPosts = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/search?q=${query}`);
          setResults(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      searchPosts();
    }
  }, [query]);

  return (
    <div className="main-layout">
      <div className="content">
        <div className="reddit-card" style={{ padding: 20, marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Поиск: "{query}"</h1>
          <p style={{ color: '#878A8C', fontSize: 14 }}>Найдено {results.length} результатов</p>
        </div>

        {loading ? (
          <div className="reddit-card" style={{ padding: 40, textAlign: 'center' }}>
            Загрузка...
          </div>
        ) : results.length === 0 ? (
          <div className="reddit-card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#878A8C' }}>Ничего не найдено</p>
            <p style={{ color: '#878A8C', fontSize: 13, marginTop: 8 }}>Попробуйте другие ключевые слова</p>
          </div>
        ) : (
          results.map(thread => (
            <div key={thread._id} className="post">
              <div className="vote-panel">
                <button className="vote-button up">▲</button>
                <span className="vote-count">{thread.rating || 0}</span>
                <button className="vote-button down">▼</button>
              </div>
              <div className="post-content">
                <div className="post-header">
                  <Link to={`/category/${thread.category?._id}`} className="subreddit-name">
                    r/{thread.category?.name}
                  </Link>
                  <span className="post-dot">•</span>
                  <span className="post-author">u/{thread.author?.username || 'anonymous'}</span>
                </div>
                <Link to={`/thread/${thread._id}`} className="post-title">
                  {thread.title}
                </Link>
                <p className="post-text">{thread.content?.substring(0, 200)}...</p>
                <div className="post-actions">
                  <button className="post-action">💬 {thread.commentCount || 0} комментариев</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;