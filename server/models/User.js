const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''  // URL аватара
  },
  favoriteThreads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread'
  }]
}, { timestamps: true });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);