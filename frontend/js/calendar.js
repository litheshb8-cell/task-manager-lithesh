// ==========================================================================
// TASKFLOW - CALENDAR MODULE
// ==========================================================================

const CalendarView = {
  currentDate: new Date(),

  async init() {
    this.bindNav();
    await this.render();
  },

  bindNav() {
    const prevBtn = document.getElementById('cal-prev-month');
    const nextBtn = document.getElementById('cal-next-month');
    const todayBtn = document.getElementById('cal-today-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.render();
      });
    }
  },

  async render() {
    const monthTitle = document.getElementById('cal-month-title');
    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (monthTitle) {
      monthTitle.textContent = `${monthNames[month]} ${year}`;
    }

    // Fetch all user tasks
    const res = await API.getTasks();
    const tasks = res.success ? res.tasks : [];

    // Map tasks by date YYYY-MM-DD
    const taskDateMap = {};
    tasks.forEach(t => {
      const d = t.dueDate || t.due_date;
      if (d) {
        if (!taskDateMap[d]) taskDateMap[d] = [];
        taskDateMap[d].push(t);
      }
    });

    grid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.style.opacity = '0.35';
      cell.innerHTML = `<div class="cal-day-num">${daysInPrevMonth - i}</div>`;
      grid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      const dayPad = String(day).padStart(2, '0');
      const monthPad = String(month + 1).padStart(2, '0');
      const dateString = `${year}-${monthPad}-${dayPad}`;

      const isToday = (dateString === todayStr);
      cell.className = `cal-day-cell ${isToday ? 'today' : ''}`;

      let cellHtml = `<div class="cal-day-num">${day}</div>`;

      const dayTasks = taskDateMap[dateString] || [];
      dayTasks.slice(0, 3).forEach(t => {
        const isDone = t.status === 'Completed';
        cellHtml += `
          <div class="cal-task-pill ${t.priority.toLowerCase()} ${isDone ? 'completed' : ''}" 
               title="${t.title} (${t.status})">
            ${t.title}
          </div>
        `;
      });

      if (dayTasks.length > 3) {
        cellHtml += `<div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">+${dayTasks.length - 3} more</div>`;
      }

      cell.innerHTML = cellHtml;

      cell.addEventListener('click', () => {
        Tasks.openAddModal();
        const dueInput = document.getElementById('task-due-date');
        if (dueInput) dueInput.value = dateString;
      });

      grid.appendChild(cell);
    }
  }
};
