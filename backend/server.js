require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getIsConnectedToMongo } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statsRoutes = require('./routes/statsRoutes');
const fileStore = require('./data/store');
const { getSeedData, DEMO_USER_ID } = require('./data/seedData');
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    isMongo: getIsConnectedToMongo(),
    version: '1.0.0'
  });
});

// Seed data initialization function
async function initializeData() {
  try {
    const { user, tasks } = await getSeedData();

    if (getIsConnectedToMongo()) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        console.log('[Seed] Seeding default demo data into MongoDB...');
        await User.create(user);
        for (const t of tasks) {
          await Task.create(t);
        }
        console.log('[Seed] MongoDB seeded successfully!');
      }
    } else {
      const existingUser = fileStore.findUser(u => u.email === user.email);
      if (!existingUser) {
        console.log('[Seed] Seeding default demo data into local store...');
        fileStore.seedIfEmpty([user], tasks);
        console.log('[Seed] Local store seeded successfully!');
      }
    }
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
}

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
const startServer = async () => {
  await connectDB();
  await initializeData();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ TaskFlow Server is running on: http://localhost:${PORT}`);
    console.log(`👤 Demo Account: lithesh@example.com / password123`);
    console.log(`=======================================================`);
  });
};

startServer();

module.exports = app;
