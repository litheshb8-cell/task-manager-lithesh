// ==========================================================================
// TASKFLOW - KANBAN BOARD (HTML5 Drag & Drop)
// ==========================================================================

const Kanban = {
  columns: ['Pending', 'In Progress', 'Completed'],
  draggedTaskId: null,

  async init() {
    this.bindDropZones();
    await this.loadCards();
  },

  bindDropZones() {
    const cols = document.querySelectorAll('.kanban-column');
    cols.forEach((col) => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', async (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');

        const targetStatus = col.dataset.status;
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;

        if (taskId && targetStatus) {
          await this.handleCardDrop(taskId, targetStatus);
        }
      });
    });
  },

  async loadCards() {
    const res = await API.getTasks();
    if (!res.success) return;

    const tasks = res.tasks || [];

    // Clear containers
    const containers = {
      'Pending': document.getElementById('kanban-cards-pending'),
      'In Progress': document.getElementById('kanban-cards-progress'),
      'Completed': document.getElementById('kanban-cards-completed')
    };

    Object.values(containers).forEach(c => { if (c) c.innerHTML = ''; });

    const counts = { 'Pending': 0, 'In Progress': 0, 'Completed': 0 };

    tasks.forEach((task) => {
      const status = task.status || 'Pending';
      const container = containers[status];
      if (!container) return;

      counts[status] = (counts[status] || 0) + 1;
      const card = this.createCardElement(task);
      container.appendChild(card);
    });

    // Update column badge counts
    const badgePending = document.getElementById('kanban-count-pending');
    const badgeProgress = document.getElementById('kanban-count-progress');
    const badgeCompleted = document.getElementById('kanban-count-completed');

    if (badgePending) badgePending.textContent = counts['Pending'];
    if (badgeProgress) badgeProgress.textContent = counts['In Progress'];
    if (badgeCompleted) badgeCompleted.textContent = counts['Completed'];
  },

  createCardElement(task) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    const taskId = task._id || task.id;
    card.dataset.taskId = taskId;

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = task.dueDate || task.due_date || todayStr;
    let dueClass = '';
    if (dueDate === todayStr) dueClass = 'today';
    else if (dueDate < todayStr && task.status !== 'Completed') dueClass = 'overdue';

    card.innerHTML = `
      <div class="kanban-card-header">
        <span class="badge-category">${Tasks.getCategoryIcon(task.category)} ${task.category}</span>
        <span class="badge-priority ${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      <div class="kanban-card-title">${task.title}</div>
      ${task.description ? `<div class="kanban-card-desc">${task.description}</div>` : ''}
      <div class="kanban-card-footer">
        <span class="badge-due ${dueClass}">📅 ${dueDate === todayStr ? 'Today' : dueDate}</span>
        <div class="task-actions">
          <button class="btn-icon-subtle" onclick="Tasks.openEditModal('${taskId}')" title="Edit">✏️</button>
          <button class="btn-icon-subtle delete" onclick="Tasks.openDeleteModal('${taskId}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;

    // Drag start & end
    card.addEventListener('dragstart', (e) => {
      this.draggedTaskId = taskId;
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', taskId);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this.draggedTaskId = null;
    });

    return card;
  },

  async handleCardDrop(taskId, newStatus) {
    const res = await API.updateTask(taskId, { status: newStatus });
    if (res.success) {
      if (newStatus === 'Completed') {
        App.triggerConfetti();
        App.showToast('🎉 Moved to Completed!', 'success');
      } else {
        App.showToast(`Moved to ${newStatus}`, 'info');
      }
      await this.loadCards();
      await Dashboard.loadStats();
      await Dashboard.loadTodayTasks();
      if (typeof Tasks !== 'undefined') Tasks.loadTasks();
    }
  }
};
