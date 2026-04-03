const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');

const app = express();

// ========== НАСТРОЙКА CORS (без app.options('*', ...)) ==========
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== MIDDLEWARE ==========
app.use(express.json());

// ========== MIDDLEWARE ДЛЯ АУТЕНТИФИКАЦИИ ==========
app.use((req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  console.log('🔑 Получен токен:', token ? 'Есть' : 'Нет');
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    req.user = decoded;
    console.log('✅ Пользователь авторизован:', req.user.username);
    next();
  } catch (error) {
    console.log('❌ Ошибка токена:', error.message);
    req.user = null;
    next();
  }
});

// ========== ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ ==========
connectDB();

// ========== ПОДКЛЮЧЕНИЕ РОУТОВ ==========
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/threads', require('./routes/threads'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/search', require('./routes/search'));

// ========== РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ (для аватаров) ==========
app.use('/uploads', express.static('uploads'));

// ========== ЗАПУСК СЕРВЕРА ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер успешно запущен на порту ${PORT}`);
  console.log(`📍 API доступен по адресу: http://localhost:${PORT}/api`);
});