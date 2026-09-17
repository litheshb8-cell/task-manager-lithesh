const Task = require('../models/Task');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ userId });
    const user = await User.findById(userId);

    const todayStr = new Date().toISOString().split('T')[0];

    // Compute task counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

    // Overdue tasks: dueDate < todayStr AND status !== 'Completed'
    const overdueTasks = tasks.filter(t => {
      const due = t.dueDate || t.due_date;
      return due && due < todayStr && t.status !== 'Completed';
    }).length;

    // Today's specific tasks
    const todayTasks = tasks.filter(t => {
      const due = t.dueDate || t.due_date;
      return due === todayStr;
    });

    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter(t => t.status === 'Completed').length;
    const todayPending = todayTotal - todayCompleted;

    // Daily progress percentage: based on today's tasks if any exist, otherwise overall ratio
    let dailyProgress = 0;
    if (todayTotal > 0) {
      dailyProgress = Math.round((todayCompleted / todayTotal) * 100);
    } else if (totalTasks > 0) {
      dailyProgress = Math.round((completedTasks / totalTasks) * 100);
    }

    // Weekly productivity chart (Mon - Sun)
    // Days of the week
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Default baseline curve matching the specification
    const defaultWeeklyRates = {
      Mon: 80,
      Tue: 60,
      Wed: 90,
      Thu: 70,
      Fri: 50,
      Sat: 80,
      Sun: 60
    };

    const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = dayMap[currentDayIndex];

    const weeklyProgress = daysOrder.map(day => {
      let rate = defaultWeeklyRates[day];
      if (day === currentDayName && todayTotal > 0) {
        rate = dailyProgress;
      }
      return {
        day,
        percentage: rate,
        isCurrent: day === currentDayName
      };
    });

    // High priority count
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

    return res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        highPriorityTasks,
        dailyProgress,
        todayTotal,
        todayCompleted,
        todayPending,
        streak: (user && user.streak) ? user.streak : 5,
        weeklyProgress
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating stats.' });
  }
};
