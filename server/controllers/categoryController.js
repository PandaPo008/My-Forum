const Category = require('../models/Category');

// Создание новой категории (только для админа в будущем)
const createCategory = async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Категория с таким названием уже существует" });
    }

    const category = new Category({ name, description, slug });
    await category.save();

    res.status(201).json({
      message: "Категория успешно создана",
      category
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Ошибка при создании категории", 
      error: error.message 
    });
  }
};

// Получение всех категорий
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: "Ошибка при получении категорий", 
      error: error.message 
    });
  }
};

module.exports = { createCategory, getCategories };