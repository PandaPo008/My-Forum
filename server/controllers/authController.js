const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Регистрация
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким email или username уже существует" });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      message: "Регистрация прошла успешно",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({
      message: "Ошибка сервера при регистрации",
      error: error.message
    });
  }
};

// Логин
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      'your_jwt_secret_key',  // ← ТОТ ЖЕ КЛЮЧ, ЧТО В server.js
      { expiresIn: "7d" }
    );

    res.json({
      message: "Вход выполнен успешно",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Ошибка логина:", error);
    res.status(500).json({
      message: "Ошибка сервера при входе",
      error: error.message
    });
  }
};

module.exports = { register, login };