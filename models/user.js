const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: String,
  facebookId: String,
  email: String,
});

module.exports = mongoose.model('users', UserSchema);
