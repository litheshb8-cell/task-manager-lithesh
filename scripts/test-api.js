const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting TaskFlow Automated API Verification ---');
  try {
    // 1. Health check
    console.log('1. Checking server health...');
    const health = await request('GET', '/api/health');
    console.log('   Health Status:', health.status, health.body);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Login as Demo User Lithesh
    console.log('2. Testing Login with Lithesh account...');
    const loginRes = await request('POST', '/api/auth/login', {}, {
      email: 'lithesh@example.com',
      password: 'password123'
    });
    console.log('   Login Status:', loginRes.status, 'Message:', loginRes.body.message);
    if (loginRes.status !== 200 || !loginRes.body.token) throw new Error('Login failed');

    const token = loginRes.body.token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // 3. Fetch Dashboard Stats
    console.log('3. Fetching Dashboard Stats...');
    const statsRes = await request('GET', '/api/stats/dashboard', authHeader);
    console.log('   Stats:', statsRes.body.stats);
    if (statsRes.status !== 200) throw new Error('Stats retrieval failed');

    // 4. Fetch All Tasks
    console.log('4. Fetching Task list...');
    const tasksRes = await request('GET', '/api/tasks', authHeader);
    console.log(`   Fetched ${tasksRes.body.count} tasks.`);
    if (tasksRes.body.count < 10) throw new Error('Expected at least 10 seeded tasks');

    // 5. Create Task
    console.log('5. Creating new Task...');
    const createRes = await request('POST', '/api/tasks', authHeader, {
      title: 'Automated Test Task 101',
      description: 'Testing task creation via automated test runner',
      priority: 'High',
      category: 'Programming',
      dueDate: new Date().toISOString().split('T')[0]
    });
    console.log('   Created Task:', createRes.body.task?.title, 'ID:', createRes.body.task?._id || createRes.body.task?.id);
    const createdId = createRes.body.task?._id || createRes.body.task?.id;

    // 6. Update Task
    console.log('6. Updating Task status to In Progress...');
    const updateRes = await request('PUT', `/api/tasks/${createdId}`, authHeader, {
      status: 'In Progress'
    });
    console.log('   Updated Status:', updateRes.body.task?.status);

    // 7. Delete Task
    console.log('7. Deleting Task...');
    const deleteRes = await request('DELETE', `/api/tasks/${createdId}`, authHeader);
    console.log('   Delete Result:', deleteRes.body.message);

    console.log('\n✅ ALL BACKEND API TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
