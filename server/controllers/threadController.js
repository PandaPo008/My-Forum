const Thread = require('../models/Thread');
const Category = require('../models/Category');

// Создание новой темы
const createThread = async (req, res) => {
  try {
    console.log('🔍 req.user в createThread:', req.user);
    
    const { title, content, categoryId } = req.body;

    // Проверяем, существует ли категория
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    const thread = new Thread({
      title,
      content,
      category: categoryId,
      author: req.user ? req.user.id : null
    });

    await thread.save();

    console.log('✅ Тема создана, автор:', thread.author);

    res.status(201).json({
      message: "Тема успешно создана",
      thread
    });
  } catch (error) {
    console.error('Ошибка при создании темы:', error);
    res.status(500).json({
      message: "Ошибка при создании темы",
      error: error.message
    });
  }
};

// Получение всех тем в конкретной категории с пагинацией
const getThreadsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const threads = await Thread.find({ category: categoryId })
      .populate('author', 'username')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Thread.countDocuments({ category: categoryId });

    res.json({
      threads,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении тем",
      error: error.message
    });
  }
};

// Получение одной темы по ID
const getThreadById = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id)
      .populate('author', 'username')
      .populate('category', 'name');
    
    if (!thread) {
      return res.status(404).json({ message: "Тема не найдена" });
    }
    
    res.json(thread);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении темы",
      error: error.message
    });
  }
};

module.exports = { createThread, getThreadsByCategory, getThreadById };