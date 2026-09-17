// ==========================================================================
// TASKFLOW - TASKS MODULE (CRUD, Filters, Table & Grid Views)
// ==========================================================================

const Tasks = {
  currentFilter: 'All',
  currentCategory: 'All',
  searchQuery: '',
  viewMode: 'table', // 'table' or 'grid'
  currentEditingTaskId: null,
  taskToDeleteId: null,

  async init() {
    this.bindEvents();
    await this.loadTasks();
  },

  bindEvents() {
    // Filter pills
    document.querySelectorAll('.filter-pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter || 'All';
        this.loadTasks();
      });
    });

    // Category filter dropdown
    const catSelect = document.getElementById('category-filter-select');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.loadTasks();
      });
    }

    // Search input (debounce)
    const searchInputs = document.querySelectorAll('.task-search-input');
    searchInputs.forEach(input => {
      let timeout = null;
      input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.loadTasks();
        }, 250);
      });
    });

    // View switchers
    const tableBtn = document.getElementById('view-mode-table');
    const gridBtn = document.getElementById('view-mode-grid');
    if (tableBtn && gridBtn) {
      tableBtn.addEventListener('click', () => {
        this.viewMode = 'table';
        tableBtn.classList.add('active');
        gridBtn.classList.remove('active');
        this.renderTasks();
      });
      gridBtn.addEventListener('click', () => {
        this.viewMode = 'grid';
        gridBtn.classList.add('active');
        tableBtn.classList.remove('active');
        this.renderTasks();
      });
    }

    // Task Form Submit
    const form = document.getElementById('task-modal-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveTask(e));
    }

    // Delete Confirmation Button
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());
    }
  },

  async loadTasks() {
    const params = {
      search: this.searchQuery,
      category: this.currentCategory
    };

    if (this.currentFilter === 'Pending') params.status = 'Pending';
    else if (this.currentFilter === 'In Progress') params.status = 'In Progress';
    else if (this.currentFilter === 'Completed') params.status = 'Completed';
    else if (this.currentFilter === 'High Priority') params.priority = 'High';
    else if (this.currentFilter === 'Today\'s Tasks') params.dueDate = 'today';

    const res = await API.getTasks(params);
    if (res.success) {
      this.cachedTasks = res.tasks || [];
      this.renderTasks();
    }
  },

  renderTasks() {
    const tasks = this.cachedTasks || [];
    const tableContainer = document.getElementById('tasks-table-view');
    const gridContainer = document.getElementById('tasks-grid-view');
    const emptyState = document.getElementById('tasks-empty-state');

    if (!tableContainer || !gridContainer) return;

    if (tasks.length === 0) {
      tableContainer.style.display = 'none';
      gridContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (this.viewMode === 'table') {
      tableContainer.style.display = 'block';
      gridContainer.style.display = 'none';
      this.renderTableView(tasks);
    } else {
      tableContainer.style.display = 'none';
      gridContainer.style.display = 'grid';
      this.renderGridView(tasks);
    }
  },

  renderTableView(tasks) {
    const tbody = document.getElementById('tasks-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((task) => {
      const tr = document.createElement('tr');
      const taskId = task._id || task.id;
      const dueDate = task.dueDate || task.due_date || todayStr;

      let dueClass = '';
      let dueText = dueDate;
      if (dueDate === todayStr) {
        dueClass = 'today';
        dueText = 'Today';
      } else if (dueDate < todayStr && task.status !== 'Completed') {
        dueClass = 'overdue';
        dueText = `⚠️ Overdue (${dueDate})`;
      }

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px;">${task.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${task.description || 'No description'}</div>
        </td>
        <td>
          <span class="badge-category">${this.getCategoryIcon(task.category)} ${task.category}</span>
        </td>
        <td>
          <span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span>
        </td>
        <td>
          <span class="badge-due ${dueClass}">${dueText}</span>
        </td>
        <td>
          <select class="status-select-badge status-${task.status.toLowerCase().replace(' ', '')}" 
                  onchange="Tasks.quickUpdateStatus('${taskId}', this.value)">
            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>🟡 In Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
          </select>
        </td>
        <td>
          <div class="task-actions">
            <button class="btn-icon-subtle" onclick="Tasks.openEditModal('${taskId}')" title="Edit Task">✏️</button>
            <button class="btn-icon-subtle delete" onclick="Tasks.openDeleteModal('${taskId}')" title="Delete Task">🗑️</button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  },

  renderGridView(tasks) {
    const gridContainer = document.getElementById('tasks-grid-view');
    gridContainer.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((task) => {
      const card = document.createElement('div');
      card.className = 'task-card-item';
      const taskId = task._id || task.id;
      const dueDate = task.dueDate || task.due_date || todayStr;

      let dueClass = '';
      let dueText = dueDate;
      if (dueDate === todayStr) {
        dueClass = 'today';
        dueText = 'Today';
      } else if (dueDate < todayStr && task.status !== 'Completed') {
        dueClass = 'overdue';
        dueText = `Overdue (${dueDate})`;
      }

      card.innerHTML = `
        <div class="task-card-top">
          <span class="badge-category">${this.getCategoryIcon(task.category)} ${task.category}</span>
          <span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
        <div class="task-card-title">${task.title}</div>
        <div class="task-card-desc">${task.description || 'No description provided.'}</div>
        <div class="task-card-footer">
          <span class="badge-due ${dueClass}">📅 ${dueText}</span>
          <div class="task-actions">
            <select class="status-select-badge" onchange="Tasks.quickUpdateStatus('${taskId}', this.value)">
              <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button class="btn-icon-subtle" onclick="Tasks.openEditModal('${taskId}')" title="Edit">✏️</button>
            <button class="btn-icon-subtle delete" onclick="Tasks.openDeleteModal('${taskId}')" title="Delete">🗑️</button>
          </div>
        </div>
      `;

      gridContainer.appendChild(card);
    });
  },

  getCategoryIcon(category) {
    const icons = {
      'Programming': '💻',
      'College': '🎓',
      'Study': '📚',
      'Project': '💼',
      'Personal': '🏠',
      'Fitness': '🏃'
    };
    return icons[category] || '📌';
  },

  async quickUpdateStatus(id, newStatus) {
    const res = await API.updateTask(id, { status: newStatus });
    if (res.success) {
      if (newStatus === 'Completed') {
        App.triggerConfetti();
        App.showToast('🎉 Task marked as Completed!', 'success');
      } else {
        App.showToast(`Task status updated to ${newStatus}`, 'info');
      }
      this.refreshAllViews();
    }
  },

  openAddModal() {
    this.currentEditingTaskId = null;
    const form = document.getElementById('task-modal-form');
    if (form) form.reset();

    const titleEl = document.getElementById('modal-task-heading');
    if (titleEl) titleEl.textContent = 'Create New Task';

    const submitBtn = document.getElementById('modal-task-submit');
    if (submitBtn) submitBtn.textContent = 'Add Task';

    const dueInput = document.getElementById('task-due-date');
    if (dueInput) {
      dueInput.value = new Date().toISOString().split('T')[0];
    }

    App.openModal('task-modal');
  },

  async openEditModal(id) {
    this.currentEditingTaskId = id;
    const res = await API.getTask(id);
    if (!res.success || !res.task) {
      App.showToast('Failed to load task details', 'danger');
      return;
    }

    const t = res.task;
    document.getElementById('task-title').value = t.title || '';
    document.getElementById('task-description').value = t.description || '';
    document.getElementById('task-priority').value = t.priority || 'Medium';
    document.getElementById('task-category').value = t.category || 'Personal';
    document.getElementById('task-status').value = t.status || 'Pending';
    document.getElementById('task-due-date').value = t.dueDate || t.due_date || new Date().toISOString().split('T')[0];

    const titleEl = document.getElementById('modal-task-heading');
    if (titleEl) titleEl.textContent = 'Edit Task';

    const submitBtn = document.getElementById('modal-task-submit');
    if (submitBtn) submitBtn.textContent = 'Save Changes';

    App.openModal('task-modal');
  },

  async handleSaveTask(e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;
    const status = document.getElementById('task-status').value;
    const dueDate = document.getElementById('task-due-date').value;

    if (!title) {
      App.showToast('Please enter a task title', 'warning');
      return;
    }

    const payload = { title, description, priority, category, status, dueDate };

    if (this.currentEditingTaskId) {
      const res = await API.updateTask(this.currentEditingTaskId, payload);
      if (res.success) {
        App.showToast('Task updated successfully!', 'success');
        App.closeModal('task-modal');
        this.refreshAllViews();
      } else {
        App.showToast(res.message || 'Error updating task', 'danger');
      }
    } else {
      const res = await API.createTask(payload);
      if (res.success) {
        App.showToast('Task created successfully!', 'success');
        App.closeModal('task-modal');
        this.refreshAllViews();
      } else {
        App.showToast(res.message || 'Error creating task', 'danger');
      }
    }
  },

  openDeleteModal(id) {
    this.taskToDeleteId = id;
    App.openModal('delete-modal');
  },

  async handleConfirmDelete() {
    if (!this.taskToDeleteId) return;

    const res = await API.deleteTask(this.taskToDeleteId);
    if (res.success) {
      App.showToast('Task deleted successfully', 'success');
      App.closeModal('delete-modal');
      this.taskToDeleteId = null;
      this.refreshAllViews();
    } else {
      App.showToast(res.message || 'Error deleting task', 'danger');
    }
  },

  async refreshAllViews() {
    await this.loadTasks();
    await Dashboard.init();
    if (typeof Kanban !== 'undefined') await Kanban.loadCards();
    if (typeof MyDay !== 'undefined') await MyDay.loadTasks();
    if (typeof CalendarView !== 'undefined') await CalendarView.render();
  }
};
