// ==========================================================================
// TASKFLOW - MY DAY MODULE (Focused Daily Routine)
// ==========================================================================

const MyDay = {
  async init() {
    this.renderHeader();
    this.bindQuickAdd();
    await this.loadTasks();
  },

  renderHeader() {
    const dateEl = document.getElementById('myday-current-date');
    if (!dateEl) return;

    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', options);
  },

  bindQuickAdd() {
    const input = document.getElementById('myday-quick-input');
    const addBtn = document.getElementById('myday-quick-btn');

    const handleAdd = async () => {
      const title = input.value.trim();
      if (!title) return;

      const todayStr = new Date().toISOString().split('T')[0];
      const res = await API.createTask({
        title,
        category: 'Personal',
        priority: 'Medium',
        status: 'Pending',
        dueDate: todayStr
      });

      if (res.success) {
        input.value = '';
        App.showToast('Added to My Day!', 'success');
        await this.loadTasks();
        await Dashboard.init();
      }
    };

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdd();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', handleAdd);
    }
  },

  async loadTasks() {
    const res = await API.getTasks({ dueDate: 'today' });
    const listEl = document.getElementById('myday-task-list');
    const barFill = document.getElementById('myday-progress-fill');
    const progressLabel = document.getElementById('myday-progress-percent');

    if (!res.success || !res.tasks) return;

    const tasks = res.tasks;
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (barFill) barFill.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}%`;

    if (!listEl) return;
    listEl.innerHTML = '';

    if (tasks.length === 0) {
      listEl.innerHTML = `
        <li style="padding: 2rem; text-align: center; color: var(--text-muted);">
          ✨ All clear for today! Add a task above to plan your day.
        </li>
      `;
      return;
    }

    tasks.forEach((task) => {
      const isDone = task.status === 'Completed';
      const li = document.createElement('li');
      li.className = `task-item ${isDone ? 'completed' : ''}`;
      const taskId = task._id || task.id;

      li.innerHTML = `
        <div class="task-left">
          <div class="custom-checkbox ${isDone ? 'checked' : ''}" data-task-id="${taskId}"></div>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-desc-sub">${task.description}</div>` : ''}
          </div>
        </div>
        <div class="task-meta-right">
          <span class="badge-category">${Tasks.getCategoryIcon(task.category)} ${task.category}</span>
          <span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span>
          <div class="task-actions">
            <button class="btn-icon-subtle" onclick="Tasks.openEditModal('${taskId}')" title="Edit">✏️</button>
            <button class="btn-icon-subtle delete" onclick="Tasks.openDeleteModal('${taskId}')" title="Delete">🗑️</button>
          </div>
        </div>
      `;

      const cb = li.querySelector('.custom-checkbox');
      cb.addEventListener('click', async (e) => {
        e.stopPropagation();
        const nextStatus = isDone ? 'Pending' : 'Completed';
        const updateRes = await API.updateTask(taskId, { status: nextStatus });
        if (updateRes.success) {
          if (nextStatus === 'Completed') {
            App.triggerConfetti();
            App.showToast(`Completed: ${task.title}`, 'success');
          }
          await MyDay.loadTasks();
          await Dashboard.init();
        }
      });

      listEl.appendChild(li);
    });
  }
};
