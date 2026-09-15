/**
 * StudySync - Tasks Module
 * Handles Task CRUD, filtering, searching, priority badges, and status toggles.
 */

const TasksModule = {
  currentFilter: 'all',
  searchQuery: '',
  editingTaskId: null,

  init() {
    this.bindEvents();
    this.renderTasks();
  },

  bindEvents() {
    // Filter tabs
    const filterTabs = document.querySelectorAll('#tasksFilterTabs .filter-tab-btn');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter;
        this.renderTasks();
      });
    });

    // Search input
    const searchInput = document.getElementById('taskSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTasks();
      });
    }

    // Add Task Button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        this.openTaskModal();
      });
    }

    // Task Form Submit
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTaskFromForm();
      });
    }
  },

  getFilteredTasks() {
    let tasks = Storage.getTasks();

    // Filter by tab
    if (this.currentFilter === 'pending') {
      tasks = tasks.filter(t => !t.completed);
    } else if (this.currentFilter === 'completed') {
      tasks = tasks.filter(t => t.completed);
    } else if (this.currentFilter === 'high') {
      tasks = tasks.filter(t => t.priority === 'high');
    }

    // Filter by search query
    if (this.searchQuery) {
      tasks = tasks.filter(t => {
        const title = (t.title || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const subject = Storage.getSubjectById(t.subjectId)?.name.toLowerCase() || '';
        return title.includes(this.searchQuery) || desc.includes(this.searchQuery) || subject.includes(this.searchQuery);
      });
    }

    // Sort: Pending first, then by due date
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return tasks;
  },

  renderTasks() {
    const container = document.getElementById('tasksListContainer');
    if (!container) return;

    const tasks = this.getFilteredTasks();

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <h3 class="empty-state-title">No tasks found</h3>
          <p class="empty-state-desc">
            ${this.searchQuery ? 'No tasks matched your search query.' : 'You have no tasks in this category. Add a new task to stay organized!'}
          </p>
          <button class="btn btn-primary btn-sm" onclick="TasksModule.openTaskModal()">
            <i class="fa-solid fa-plus"></i> Add New Task
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(task => {
      const subject = Storage.getSubjectById(task.subjectId);
      const subjectName = subject ? subject.name : 'General';
      const subjectColor = subject ? subject.color : '#6366f1';
      const isDueToday = task.dueDate === new Date().toISOString().split('T')[0];
      
      let dateBadge = `<span class="badge" style="background: var(--badge-bg); color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>`;
      if (isDueToday && !task.completed) {
        dateBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3);"><i class="fa-regular fa-clock"></i> Due Today</span>`;
      }

      return `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
          <div class="task-main">
            <button class="custom-checkbox ${task.completed ? 'checked' : ''}" onclick="TasksModule.toggleTask('${task.id}')" title="Toggle status" aria-label="Toggle task status">
              <i class="fa-solid fa-check"></i>
            </button>
            <div class="task-content">
              <h4 class="task-title" onclick="TasksModule.toggleTask('${task.id}')">${escapeHtml(task.title)}</h4>
              ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
              <div class="task-meta-tags">
                <span class="badge badge-subject" style="border-left: 3px solid ${subjectColor}">
                  <i class="fa-solid fa-book-bookmark" style="color: ${subjectColor}"></i> ${escapeHtml(subjectName)}
                </span>
                <span class="badge badge-${task.priority}">
                  <i class="fa-solid fa-flag"></i> ${capitalize(task.priority)} Priority
                </span>
                ${dateBadge}
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="action-icon-btn" onclick="TasksModule.openTaskModal('${task.id}')" title="Edit Task">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="action-icon-btn delete" onclick="TasksModule.deleteTask('${task.id}')" title="Delete Task">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleTask(taskId) {
    const tasks = Storage.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString().split('T')[0] : null;
    Storage.saveTasks(tasks);

    this.renderTasks();
    App.updateDashboardStats();
    App.renderDashboardTasks();
    if (window.AnalyticsModule) AnalyticsModule.renderAnalytics();

    App.showToast(task.completed ? 'Task completed! Great job! 🎉' : 'Task marked as pending', 'success');
  },

  deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    let tasks = Storage.getTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    Storage.saveTasks(tasks);

    this.renderTasks();
    App.updateDashboardStats();
    App.renderDashboardTasks();
    if (window.AnalyticsModule) AnalyticsModule.renderAnalytics();
    App.showToast('Task deleted successfully', 'info');
  },

  openTaskModal(taskId = null) {
    this.editingTaskId = taskId;
    const modal = document.getElementById('taskModal');
    const titleElem = document.getElementById('taskModalTitle');
    const form = document.getElementById('taskForm');
    const subjectSelect = document.getElementById('taskSubjectSelect');

    // Populate subject dropdown
    const subjects = Storage.getSubjects();
    subjectSelect.innerHTML = subjects.map(s => `
      <option value="${s.id}">${escapeHtml(s.name)} (${s.code})</option>
    `).join('');

    if (taskId) {
      const task = Storage.getTasks().find(t => t.id === taskId);
      if (task) {
        titleElem.textContent = 'Edit Task';
        form.taskTitle.value = task.title;
        form.taskDesc.value = task.description || '';
        form.taskSubject.value = task.subjectId;
        form.taskDueDate.value = task.dueDate;
        form.taskPriority.value = task.priority;
      }
    } else {
      titleElem.textContent = 'Create New Task';
      form.reset();
      form.taskDueDate.value = new Date().toISOString().split('T')[0];
      form.taskPriority.value = 'medium';
    }

    App.openModal('taskModal');
  },

  saveTaskFromForm() {
    const form = document.getElementById('taskForm');
    const title = form.taskTitle.value.trim();
    const description = form.taskDesc.value.trim();
    const subjectId = form.taskSubject.value;
    const dueDate = form.taskDueDate.value;
    const priority = form.taskPriority.value;

    if (!title) {
      App.showToast('Please enter a task title', 'warning');
      return;
    }

    const tasks = Storage.getTasks();

    if (this.editingTaskId) {
      const task = tasks.find(t => t.id === this.editingTaskId);
      if (task) {
        task.title = title;
        task.description = description;
        task.subjectId = subjectId;
        task.dueDate = dueDate;
        task.priority = priority;
      }
      App.showToast('Task updated successfully', 'success');
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        description,
        subjectId,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        priority,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      tasks.unshift(newTask);
      App.showToast('New task added!', 'success');
    }

    Storage.saveTasks(tasks);
    App.closeModal('taskModal');
    this.renderTasks();
    App.updateDashboardStats();
    App.renderDashboardTasks();
    if (window.AnalyticsModule) AnalyticsModule.renderAnalytics();
  }
};
