const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Thread = require('../models/Thread');
const jwt = require('jsonwebtoken');

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

// Получить пользователя по username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получить посты пользователя
router.get('/:userId/threads', async (req, res) => {
  try {
    const threads = await Thread.find({ author: req.params.userId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ ТОЛЬКО ЗАГРУЗКА АВАТАРА ЧЕРЕЗ BASE64
router.post('/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { base64 } = req.body;
    
    if (!base64 || !base64.trim()) {
      return res.status(400).json({ message: 'Base64 данные обязательны' });
    }
    
    await User.findByIdAndUpdate(userId, { avatar: base64 });
    
    res.json({ avatar: base64 });
  } catch (error) {
    console.error('Ошибка загрузки base64:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;