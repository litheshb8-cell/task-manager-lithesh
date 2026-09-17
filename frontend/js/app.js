// ==========================================================================
// TASKFLOW - MAIN APP CONTROLLER
// ==========================================================================

const App = {
  activeView: 'dashboard',

  async init() {
    this.initTheme();
    this.bindAuthEvents();
    this.bindNavigation();
    this.bindModals();
    this.bindNotifDropdown();
    this.bindProfile();

    // Check Authentication
    const token = API.getToken();
    if (!token) {
      this.showAuthScreen();
    } else {
      this.hideAuthScreen();
      await this.startApp();
    }
  },

  // 1. THEME TOGGLE
  initTheme() {
    const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('taskflow_theme', next);
        this.updateThemeButton(next);
      });
    }
  },

  updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
      btn.title = `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`;
    }
  },

  // 2. AUTHENTICATION HANDLING
  showAuthScreen() {
    const authEl = document.getElementById('auth-container');
    const appEl = document.getElementById('app-layout');
    if (authEl) authEl.style.display = 'flex';
    if (appEl) appEl.style.display = 'none';
  },

  hideAuthScreen() {
    const authEl = document.getElementById('auth-container');
    const appEl = document.getElementById('app-layout');
    if (authEl) authEl.style.display = 'none';
    if (appEl) appEl.style.display = 'flex';
  },

  bindAuthEvents() {
    // Auth Tab switching (Login vs Register)
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
      });
    }

    // Login Form Submit
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const res = await API.login(email, password);
        if (res.success) {
          this.showToast(res.message || 'Login successful!', 'success');
          this.hideAuthScreen();
          await this.startApp();
        } else {
          this.showToast(res.message || 'Invalid credentials', 'danger');
        }
      });
    }

    // Register Form Submit
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm-password').value;

        if (password !== confirm) {
          this.showToast('Passwords do not match.', 'warning');
          return;
        }

        const res = await API.register(name, email, password);
        if (res.success) {
          this.showToast('Account created successfully!', 'success');
          this.hideAuthScreen();
          await this.startApp();
        } else {
          this.showToast(res.message || 'Registration failed', 'danger');
        }
      });
    }

    // 1-Click Demo Login
    const demoBtn = document.getElementById('demo-login-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', async () => {
        const res = await API.login('lithesh@example.com', 'password123');
        if (res.success) {
          this.showToast('Logged in as Lithesh (Demo)!', 'success');
          this.hideAuthScreen();
          await this.startApp();
        } else {
          this.showToast(res.message || 'Demo login failed', 'danger');
        }
      });
    }

    // Logout
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        API.clearToken();
        API.clearUser();
        this.showToast('Logged out successfully.', 'info');
        this.showAuthScreen();
      });
    });
  },

  // 3. START APP WORKFLOW
  async startApp() {
    const user = API.getUser() || { name: 'Lithesh', email: 'lithesh@example.com' };
    
    // Update topbar user name and avatar
    const nameLabel = document.getElementById('topbar-user-name');
    const avatarEl = document.getElementById('topbar-user-avatar');
    if (nameLabel) nameLabel.textContent = user.name || 'Lithesh';
    if (avatarEl) avatarEl.textContent = (user.name || 'L')[0].toUpperCase();

    // Init views
    await Dashboard.init();
    await Tasks.init();
    await Kanban.init();
    await MyDay.init();
    await CalendarView.init();

    this.checkNotifications();
  },

  // 4. NAVIGATION VIEW ROUTING
  bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        this.switchView(targetView);

        // On mobile, close sidebar on link click
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Mobile menu drawer toggle
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },

  switchView(viewName) {
    this.activeView = viewName;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });

    // Show target section
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Refresh specific view data on navigate
    if (viewName === 'dashboard') Dashboard.init();
    else if (viewName === 'tasks') Tasks.loadTasks();
    else if (viewName === 'kanban') Kanban.loadCards();
    else if (viewName === 'myday') MyDay.loadTasks();
    else if (viewName === 'calendar') CalendarView.render();
    else if (viewName === 'profile') this.renderProfile();
  },

  // 5. PROFILE VIEW
  bindProfile() {
    const profileBtn = document.getElementById('topbar-user-profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        this.switchView('profile');
      });
    }
  },

  async renderProfile() {
    const user = API.getUser() || { name: 'Lithesh', email: 'lithesh@example.com' };
    const res = await API.getDashboardStats();
    const stats = res.success ? res.stats : {};

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const avatarEl = document.getElementById('profile-avatar-lg');
    const compEl = document.getElementById('profile-completed-count');
    const prodEl = document.getElementById('profile-productivity-score');
    const streakEl = document.getElementById('profile-streak-count');

    if (nameEl) nameEl.textContent = user.name || 'Lithesh';
    if (emailEl) emailEl.textContent = user.email || 'lithesh@example.com';
    if (avatarEl) avatarEl.textContent = (user.name || 'L')[0].toUpperCase();
    if (compEl) compEl.textContent = stats.completedTasks || 0;
    if (prodEl) prodEl.textContent = `${stats.dailyProgress || 70}%`;
    if (streakEl) streakEl.textContent = `${stats.streak || 5} Days`;
  },

  // 6. NOTIFICATION SYSTEM & DROPDOWN
  async checkNotifications() {
    const res = await API.getTasks();
    if (!res.success) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const tasks = res.tasks || [];

    const dueToday = tasks.filter(t => (t.dueDate === todayStr || t.due_date === todayStr) && t.status !== 'Completed');
    const overdue = tasks.filter(t => {
      const d = t.dueDate || t.due_date;
      return d && d < todayStr && t.status !== 'Completed';
    });

    const notifDot = document.getElementById('notif-badge-dot');
    const notifList = document.getElementById('notif-items-list');
    const totalAlerts = dueToday.length + overdue.length;

    if (notifDot) {
      notifDot.style.display = totalAlerts > 0 ? 'block' : 'none';
    }

    if (notifList) {
      notifList.innerHTML = '';
      if (totalAlerts === 0) {
        notifList.innerHTML = '<li style="padding: 0.8rem; color: var(--text-dim); text-align: center;">No pending alerts</li>';
        return;
      }

      overdue.forEach(t => {
        const li = document.createElement('li');
        li.className = 'notif-item';
        li.innerHTML = `<span>⚠️</span> <div><strong style="color: var(--danger);">${t.title}</strong> is overdue!</div>`;
        notifList.appendChild(li);
      });

      dueToday.forEach(t => {
        const li = document.createElement('li');
        li.className = 'notif-item';
        li.innerHTML = `<span>🔔</span> <div><strong>${t.title}</strong> is due today.</div>`;
        notifList.appendChild(li);
      });
    }
  },

  bindNotifDropdown() {
    const bellBtn = document.getElementById('notif-bell-btn');
    const dropdown = document.getElementById('notif-dropdown');
    if (bellBtn && dropdown) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== bellBtn) {
          dropdown.classList.remove('active');
        }
      });
    }
  },

  // 7. MODALS
  bindModals() {
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // 8. TOAST NOTIFICATIONS
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✅',
      danger: '⚠️',
      warning: '⏳',
      info: '💡'
    };

    toast.innerHTML = `
      <span>${icons[type] || '🔔'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // 9. CONFETTI EFFECT
  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2 - 50,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -10 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frames = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(renderConfetti);
  }
};

// Auto boot on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => App.init());
