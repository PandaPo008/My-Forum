const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPostsByThread, 
  likePost, 
  dislikePost 
} = require('../controllers/postController');

router.post('/', createPost);
router.get('/thread/:threadId', getPostsByThread);
router.post('/:postId/like', likePost);
router.post('/:postId/dislike', dislikePost);

module.exports = router;