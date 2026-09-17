// ==========================================================================
// TASKFLOW - DASHBOARD MODULE
// ==========================================================================

const Dashboard = {
  async init() {
    this.updateGreeting();
    await this.loadStats();
    await this.loadTodayTasks();
  },

  updateGreeting() {
    const user = API.getUser() || { name: 'Lithesh' };
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else if (hour >= 17) {
      timeGreeting = 'Good Evening';
    }

    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) {
      greetingEl.textContent = `${timeGreeting}, ${user.name || 'Lithesh'} 👋`;
    }
  },

  async loadStats() {
    const res = await API.getDashboardStats();
    if (!res.success) return;

    const { stats } = res;

    // Stat Cards
    this.animateNumber('stat-total', stats.totalTasks);
    this.animateNumber('stat-completed', stats.completedTasks);
    this.animateNumber('stat-pending', stats.pendingTasks + (stats.inProgressTasks || 0));
    this.animateNumber('stat-overdue', stats.overdueTasks);

    // Circular Progress
    const circle = document.getElementById('progress-circle-fill');
    const percentLabel = document.getElementById('progress-circle-percent');
    const progressVal = stats.dailyProgress || 0;

    if (circle) {
      const circumference = 440;
      const offset = circumference - (circumference * progressVal) / 100;
      circle.style.strokeDashoffset = offset;
    }

    if (percentLabel) {
      percentLabel.textContent = `${progressVal}%`;
    }

    // Streak and Meta
    const streakEl = document.getElementById('dash-streak-badge');
    if (streakEl) {
      streakEl.innerHTML = `🔥 Daily Streak: ${stats.streak || 5} Days`;
    }

    const barFill = document.getElementById('horizontal-progress-fill');
    if (barFill) {
      barFill.style.width = `${progressVal}%`;
    }

    const metaRow = document.getElementById('progress-meta-counts');
    if (metaRow) {
      metaRow.innerHTML = `
        <span>${stats.todayCompleted} Completed</span>
        <span>${stats.todayPending} Remaining</span>
      `;
    }

    // Sidebar mini progress bar
    const miniFill = document.getElementById('mini-progress-fill');
    const miniPercent = document.getElementById('mini-progress-percent');
    if (miniFill) miniFill.style.width = `${progressVal}%`;
    if (miniPercent) miniPercent.textContent = `${progressVal}%`;

    // Weekly Productivity Chart
    this.renderWeeklyChart(stats.weeklyProgress || []);
  },

  renderWeeklyChart(weeklyData) {
    const chartWrap = document.getElementById('weekly-chart');
    if (!chartWrap) return;

    chartWrap.innerHTML = '';

    weeklyData.forEach((item) => {
      const group = document.createElement('div');
      group.className = `chart-bar-group ${item.isCurrent ? 'current' : ''}`;

      group.innerHTML = `
        <span class="chart-percent-tooltip">${item.percentage}%</span>
        <div class="chart-bar-track" title="${item.day}: ${item.percentage}% Productivity">
          <div class="chart-bar-fill" style="height: ${item.percentage}%"></div>
        </div>
        <span class="chart-day-label">${item.day}</span>
      `;

      chartWrap.appendChild(group);
    });
  },

  async loadTodayTasks() {
    const res = await API.getTasks({ dueDate: 'today' });
    const listEl = document.getElementById('today-tasks-checklist');
    if (!listEl) return;

    if (!res.success || !res.tasks || res.tasks.length === 0) {
      listEl.innerHTML = `
        <li style="padding: 1.5rem; text-align: center; color: var(--text-dim);">
          No tasks scheduled for today. Click "+ Add Task" to create one!
        </li>
      `;
      return;
    }

    listEl.innerHTML = '';
    res.tasks.slice(0, 6).forEach((task) => {
      const isCompleted = task.status === 'Completed';
      const li = document.createElement('li');
      li.className = `task-item ${isCompleted ? 'completed' : ''}`;

      const taskId = task._id || task.id;

      li.innerHTML = `
        <div class="task-left">
          <div class="custom-checkbox ${isCompleted ? 'checked' : ''}" 
               data-task-id="${taskId}" 
               title="${isCompleted ? 'Mark Pending' : 'Mark Complete'}">
          </div>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-desc-sub">${task.description}</div>` : ''}
          </div>
        </div>
        <div class="task-meta-right">
          <span class="badge-category">${task.category}</span>
          <span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span>
          <div class="task-actions">
            <button class="btn-icon-subtle" onclick="Tasks.openEditModal('${taskId}')" title="Edit Task">✏️</button>
            <button class="btn-icon-subtle delete" onclick="Tasks.openDeleteModal('${taskId}')" title="Delete Task">🗑️</button>
          </div>
        </div>
      `;

      // Checkbox click toggle
      const cb = li.querySelector('.custom-checkbox');
      cb.addEventListener('click', async (e) => {
        e.stopPropagation();
        const nextStatus = isCompleted ? 'Pending' : 'Completed';
        const updateRes = await API.updateTask(taskId, { status: nextStatus });
        if (updateRes.success) {
          if (nextStatus === 'Completed') {
            App.triggerConfetti();
            App.showToast(`🎉 Completed: "${task.title}"`, 'success');
          } else {
            App.showToast(`Marked "${task.title}" as pending`, 'info');
          }
          await Dashboard.loadStats();
          await Dashboard.loadTodayTasks();
          if (typeof Kanban !== 'undefined') Kanban.loadCards();
          if (typeof MyDay !== 'undefined') MyDay.loadTasks();
        }
      });

      listEl.appendChild(li);
    });
  },

  animateNumber(elId, target) {
    const el = document.getElementById(elId);
    if (!el) return;

    let start = 0;
    const duration = 600;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentVal = Math.floor(progress * target);
      el.textContent = currentVal;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  }
};
