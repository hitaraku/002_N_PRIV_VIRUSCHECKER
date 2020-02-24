const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: String,
  facebookId: String,
  emails: [String],
});

module.exports = mongoose.model('users', UserSchema);
