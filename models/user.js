const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: String,
  facebookId: String
});

module.exports = mongoose.model('users', UserSchema);
