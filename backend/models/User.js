const mongoose = require('mongoose');
const { getIsConnectedToMongo } = require('../config/db');
const fileStore = require('../data/store');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 5 },
  created_at: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);

class UnifiedUser {
  static async findOne(query) {
    if (getIsConnectedToMongo()) {
      return await MongoUser.findOne(query);
    }
    if (query.email) {
      return fileStore.findUser(u => u.email.toLowerCase() === query.email.toLowerCase());
    }
    if (query._id) {
      return fileStore.findUser(u => u._id === query._id || u.id === query._id);
    }
    return null;
  }

  static async findById(id) {
    if (getIsConnectedToMongo()) {
      return await MongoUser.findById(id).select('-password');
    }
    const u = fileStore.findUser(user => user._id === id || user.id === id);
    if (!u) return null;
    const { password, ...safeUser } = u;
    return safeUser;
  }

  static async create(userData) {
    if (getIsConnectedToMongo()) {
      return await MongoUser.create(userData);
    }
    return fileStore.addUser(userData);
  }

  static async countDocuments() {
    if (getIsConnectedToMongo()) {
      return await MongoUser.countDocuments();
    }
    return fileStore.getUsers().length;
  }
}

UnifiedUser.schema = userSchema;
UnifiedUser.MongoModel = MongoUser;

module.exports = UnifiedUser;
