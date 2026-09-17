const bcrypt = require('bcryptjs');

const DEMO_USER_ID = 'user_lithesh_001';

const getSeedData = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

  const user = {
    _id: DEMO_USER_ID,
    id: DEMO_USER_ID,
    name: 'Lithesh',
    email: 'lithesh@example.com',
    password: hashedPassword,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    streak: 5
  };

  const tasks = [
    {
      _id: 'task_001',
      id: 'task_001',
      userId: DEMO_USER_ID,
      title: 'Complete HTML project',
      description: 'Finish landing page semantic layout and responsive media queries',
      category: 'Programming',
      priority: 'High',
      status: 'Completed',
      dueDate: todayStr,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_002',
      id: 'task_002',
      userId: DEMO_USER_ID,
      title: 'Study C++',
      description: 'Review pointers, memory management, and OOP class templates',
      category: 'College',
      priority: 'High',
      status: 'Completed',
      dueDate: todayStr,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_003',
      id: 'task_003',
      userId: DEMO_USER_ID,
      title: 'Portfolio Website design',
      description: 'Prototype dark glassmorphism theme and interactive widgets',
      category: 'Project',
      priority: 'Medium',
      status: 'Completed',
      dueDate: yesterdayStr,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_004',
      id: 'task_004',
      userId: DEMO_USER_ID,
      title: 'Complete Java Assignment',
      description: 'Implement multi-threaded client-server socket protocol',
      category: 'College',
      priority: 'High',
      status: 'Completed',
      dueDate: todayStr,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_005',
      id: 'task_005',
      userId: DEMO_USER_ID,
      title: 'Practice C++ Algorithms',
      description: 'Solve dynamic programming and graph recursion challenges',
      category: 'College',
      priority: 'Medium',
      status: 'Completed',
      dueDate: todayStr,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_006',
      id: 'task_006',
      userId: DEMO_USER_ID,
      title: 'Read AI Notes',
      description: 'Review neural network backpropagation and attention mechanism summaries',
      category: 'Study',
      priority: 'Low',
      status: 'Completed',
      dueDate: todayStr,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_007',
      id: 'task_007',
      userId: DEMO_USER_ID,
      title: 'Morning 5K Run & Stretching',
      description: 'Maintain cardio routine and 5-day fitness consistency',
      category: 'Fitness',
      priority: 'Low',
      status: 'Completed',
      dueDate: todayStr,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_008',
      id: 'task_008',
      userId: DEMO_USER_ID,
      title: 'Build Portfolio Website',
      description: 'Wire up REST API endpoints and connect dynamic dashboard charts',
      category: 'Project',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: tomorrowStr,
      created_at: new Date().toISOString()
    },
    {
      _id: 'task_009',
      id: 'task_009',
      userId: DEMO_USER_ID,
      title: 'C++ Assignment - Loops & Arrays',
      description: 'Finish arrays, matrix traversal, and nested loops questions',
      category: 'College',
      priority: 'High',
      status: 'Pending',
      dueDate: todayStr,
      created_at: new Date().toISOString()
    },
    {
      _id: 'task_010',
      id: 'task_010',
      userId: DEMO_USER_ID,
      title: 'Submit College Assignment',
      description: 'Upload PDF report and source code to university portal',
      category: 'College',
      priority: 'High',
      status: 'Pending',
      dueDate: yesterdayStr,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'task_011',
      id: 'task_011',
      userId: DEMO_USER_ID,
      title: 'Evening Workout & Strength Training',
      description: 'Upper body resistance training and core stability routine',
      category: 'Fitness',
      priority: 'Low',
      status: 'Pending',
      dueDate: todayStr,
      created_at: new Date().toISOString()
    },
    {
      _id: 'task_012',
      id: 'task_012',
      userId: DEMO_USER_ID,
      title: 'Read Documentation on System Design',
      description: 'Distributed cache invalidation and database indexing trade-offs',
      category: 'Programming',
      priority: 'Low',
      status: 'Pending',
      dueDate: twoDaysAgoStr,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return { user, tasks };
};

module.exports = { getSeedData, DEMO_USER_ID };
