const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority, category, search, dueDate } = req.query;

    const filter = { userId };
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (category && category !== 'All') filter.category = category;
    if (search && search.trim()) filter.search = search.trim();

    let tasks = await Task.find(filter);

    // Filter by specific due date or "today" if requested
    if (dueDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (dueDate === 'today') {
        tasks = tasks.filter(t => (t.dueDate === todayStr || t.due_date === todayStr));
      } else {
        tasks = tasks.filter(t => (t.dueDate === dueDate || t.due_date === dueDate));
      }
    }

    return res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving tasks.' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    if ((task.userId || task.user_id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this task.' });
    }
    return res.json({ success: true, task });
  } catch (error) {
    console.error('getTaskById error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving task.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, priority, status, dueDate, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const effectiveDueDate = dueDate || due_date || new Date().toISOString().split('T')[0];

    const newTask = await Task.create({
      userId,
      user_id: userId,
      title: title.trim(),
      description: (description || '').trim(),
      category: category || 'Personal',
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate: effectiveDueDate,
      due_date: effectiveDueDate,
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task: newTask
    });
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating task.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    if ((task.userId || task.user_id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this task.' });
    }

    const updates = { ...req.body };
    if (updates.dueDate) updates.due_date = updates.dueDate;
    if (updates.due_date) updates.dueDate = updates.due_date;
    updates.updated_at = new Date().toISOString();

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });

    return res.json({
      success: true,
      message: 'Task updated successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    if ((task.userId || task.user_id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Task deleted successfully!'
    });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting task.' });
  }
};
