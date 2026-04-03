const Post = require('../models/Post');
const Thread = require('../models/Thread');

// Создание поста
const createPost = async (req, res) => {
  try {
    const { content, threadId, parentPostId } = req.body;
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Тема не найдена" });
    }
    const post = new Post({
      content,
      thread: threadId,
      author: req.user ? req.user.id : null,
      parentPost: parentPostId || null
    });
    await post.save();
    res.status(201).json({ message: "Сообщение добавлено", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение постов темы
const getPostsByThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const posts = await Post.find({ thread: threadId, parentPost: null })
      .populate('author', 'username')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username' } })
      .sort({ createdAt: 1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ЛАЙК
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    
    // Проверяем, не лайкнул ли уже
    const alreadyLiked = post.likes?.includes(userId);
    
    if (alreadyLiked) {
      // Убираем лайк
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Добавляем лайк, убираем дизлайк если был
      post.dislikes = post.dislikes?.filter(id => id.toString() !== userId) || [];
      post.likes.push(userId);
    }
    
    post.rating = (post.likes?.length || 0) - (post.dislikes?.length || 0);
    await post.save();
    
    res.json({
      likes: post.likes?.length || 0,
      dislikes: post.dislikes?.length || 0,
      rating: post.rating,
      userLiked: post.likes?.includes(userId),
      userDisliked: post.dislikes?.includes(userId)
    });
  } catch (error) {
    console.error('Ошибка лайка:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ ДИЗЛАЙК
const dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    
    const alreadyDisliked = post.dislikes?.includes(userId);
    
    if (alreadyDisliked) {
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
    } else {
      post.likes = post.likes?.filter(id => id.toString() !== userId) || [];
      post.dislikes.push(userId);
    }
    
    post.rating = (post.likes?.length || 0) - (post.dislikes?.length || 0);
    await post.save();
    
    res.json({
      likes: post.likes?.length || 0,
      dislikes: post.dislikes?.length || 0,
      rating: post.rating,
      userLiked: post.likes?.includes(userId),
      userDisliked: post.dislikes?.includes(userId)
    });
  } catch (error) {
    console.error('Ошибка дизлайка:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getPostsByThread, likePost, dislikePost };