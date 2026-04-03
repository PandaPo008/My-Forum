const express = require('express');
const router = express.Router();
const { createThread, getThreadsByCategory, getThreadById } = require('../controllers/threadController');

router.post('/', createThread);
router.get('/category/:categoryId', getThreadsByCategory);
router.get('/:id', getThreadById);

module.exports = router;