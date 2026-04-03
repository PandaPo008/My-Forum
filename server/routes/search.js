const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');

// Поиск по заголовку и содержимому
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const threads = await Thread.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('category', 'name')
    .populate('author', 'username')
    .sort({ createdAt: -1 });

    res.json(threads);
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;