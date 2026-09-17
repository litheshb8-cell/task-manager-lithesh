const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const storeFilePath = path.join(__dirname, 'store.json');

const defaultData = {
  users: [],
  tasks: []
};

// Initialize file if not exists
function loadData() {
  try {
    if (!fs.existsSync(storeFilePath)) {
      fs.writeFileSync(storeFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store.json, reinitializing:', err.message);
    return defaultData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err.message);
  }
}

// Memory cache synced to disk
let currentData = loadData();

const fileStore = {
  getUsers: () => currentData.users,
  getTasks: () => currentData.tasks,

  findUser: (predicate) => {
    return currentData.users.find(predicate) || null;
  },

  addUser: (userObj) => {
    const user = {
      _id: userObj._id || crypto.randomUUID(),
      id: userObj.id || crypto.randomUUID(),
      name: userObj.name,
      email: userObj.email.toLowerCase(),
      password: userObj.password,
      created_at: userObj.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    currentData.users.push(user);
    saveData(currentData);
    return user;
  },

  findTaskById: (id) => {
    return currentData.tasks.find(t => (t._id === id || t.id === id)) || null;
  },

  findTasks: (query = {}) => {
    let list = [...currentData.tasks];
    if (query.userId) {
      list = list.filter(t => t.userId === query.userId || t.user_id === query.userId);
    }
    if (query.status && query.status !== 'All') {
      list = list.filter(t => t.status.toLowerCase() === query.status.toLowerCase());
    }
    if (query.priority && query.priority !== 'All') {
      list = list.filter(t => t.priority.toLowerCase() === query.priority.toLowerCase());
    }
    if (query.category && query.category !== 'All') {
      list = list.filter(t => t.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.search) {
      const term = query.search.toLowerCase();
      list = list.filter(t => 
        (t.title && t.title.toLowerCase().includes(term)) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    return list;
  },

  addTask: (taskObj) => {
    const id = taskObj._id || crypto.randomUUID();
    const task = {
      _id: id,
      id: id,
      userId: taskObj.userId || taskObj.user_id,
      user_id: taskObj.userId || taskObj.user_id,
      title: taskObj.title,
      description: taskObj.description || '',
      category: taskObj.category || 'General',
      priority: taskObj.priority || 'Medium',
      status: taskObj.status || 'Pending',
      due_date: taskObj.due_date || taskObj.dueDate || new Date().toISOString().split('T')[0],
      dueDate: taskObj.due_date || taskObj.dueDate || new Date().toISOString().split('T')[0],
      created_at: taskObj.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    currentData.tasks.unshift(task);
    saveData(currentData);
    return task;
  },

  updateTask: (id, updates) => {
    const idx = currentData.tasks.findIndex(t => t._id === id || t.id === id);
    if (idx === -1) return null;

    const existing = currentData.tasks[idx];
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (updates.due_date) {
      updated.dueDate = updates.due_date;
    } else if (updates.dueDate) {
      updated.due_date = updates.dueDate;
    }
    currentData.tasks[idx] = updated;
    saveData(currentData);
    return updated;
  },

  deleteTask: (id) => {
    const initialLen = currentData.tasks.length;
    currentData.tasks = currentData.tasks.filter(t => t._id !== id && t.id !== id);
    saveData(currentData);
    return currentData.tasks.length < initialLen;
  },

  seedIfEmpty: (seedUsers, seedTasks) => {
    let changed = false;
    if (currentData.users.length === 0 && seedUsers && seedUsers.length > 0) {
      currentData.users = seedUsers;
      changed = true;
    }
    if (currentData.tasks.length === 0 && seedTasks && seedTasks.length > 0) {
      currentData.tasks = seedTasks;
      changed = true;
    }
    if (changed) {
      saveData(currentData);
    }
  }
};

module.exports = fileStore;
