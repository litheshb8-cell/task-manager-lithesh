const mongoose = require('mongoose');
const { getIsConnectedToMongo } = require('../config/db');
const fileStore = require('../data/store');

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  category: { 
    type: String, 
    enum: ['Programming', 'College', 'Study', 'Project', 'Personal', 'Fitness', 'Other'],
    default: 'Personal'
  },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  dueDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const MongoTask = mongoose.model('Task', taskSchema);

class UnifiedTask {
  static async find(filter = {}) {
    if (getIsConnectedToMongo()) {
      const mongoQuery = {};
      if (filter.userId) mongoQuery.userId = filter.userId;
      if (filter.status && filter.status !== 'All') mongoQuery.status = filter.status;
      if (filter.priority && filter.priority !== 'All') mongoQuery.priority = filter.priority;
      if (filter.category && filter.category !== 'All') mongoQuery.category = filter.category;
      if (filter.search) {
        mongoQuery.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { description: { $regex: filter.search, $options: 'i' } }
        ];
      }
      return await MongoTask.find(mongoQuery).sort({ created_at: -1 });
    }
    return fileStore.findTasks(filter);
  }

  static async findById(id) {
    if (getIsConnectedToMongo()) {
      return await MongoTask.findById(id);
    }
    return fileStore.findTaskById(id);
  }

  static async create(taskData) {
    if (getIsConnectedToMongo()) {
      return await MongoTask.create(taskData);
    }
    return fileStore.addTask(taskData);
  }

  static async findByIdAndUpdate(id, updates, options = { new: true }) {
    if (getIsConnectedToMongo()) {
      return await MongoTask.findByIdAndUpdate(id, updates, options);
    }
    return fileStore.updateTask(id, updates);
  }

  static async findByIdAndDelete(id) {
    if (getIsConnectedToMongo()) {
      return await MongoTask.findByIdAndDelete(id);
    }
    return fileStore.deleteTask(id);
  }

  static async countDocuments(filter = {}) {
    if (getIsConnectedToMongo()) {
      return await MongoTask.countDocuments(filter);
    }
    const tasks = fileStore.findTasks(filter);
    return tasks.length;
  }
}

UnifiedTask.schema = taskSchema;
UnifiedTask.MongoModel = MongoTask;

module.exports = UnifiedTask;
