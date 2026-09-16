/**
 * StudySync - Core Application Orchestrator
 * Manages view routing, themes, dashboard statistics, modals, toasts, and global UI state.
 */

const App = {
  currentView: 'dashboard',

  init() {
    this.initTheme();
    this.bindNavigation();
    this.bindGlobalEvents();
    this.bindSettings();
    this.updateGreeting();
    this.updateDashboardStats();
    this.renderDashboardTasks();
    this.renderDashboardClasses();
    this.renderDashboardNotes();
    this.updateSidebarBadges();

    // Initialize feature modules
    TasksModule.init();
    TimetableModule.init();
    TimerModule.init();
    SubjectsModule.init();
    NotesModule.init();
    AnalyticsModule.init();

    // Handle deep links via URL hash if present
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.navigate(hash);
    }
  },

  // --- Theme Management ---
  initTheme() {
    const settings = Storage.getSettings();
    const savedTheme = settings.theme || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    this.updateThemeToggleUI(savedTheme);
  },

  setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const settings = Storage.getSettings();
    settings.theme = theme;
    Storage.saveSettings(settings);
    this.updateThemeToggleUI(theme);
    this.showToast(`Switched to ${theme} mode`, 'info');
  },

  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  },

  updateThemeToggleUI(theme) {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' 
        ? '<i class="fa-regular fa-sun"></i>' 
        : '<i class="fa-regular fa-moon"></i>';
      themeBtn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
    }

    const settingsThemeToggle = document.getElementById('settingsThemeToggle');
    if (settingsThemeToggle) {
      settingsThemeToggle.checked = theme === 'dark';
    }
  },

  // --- Navigation & Routing ---
  bindNavigation() {
    // Sidebar nav links
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link, .mobile-nav-item');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.view;
        if (targetView) {
          this.navigate(targetView);
        }
      });
    });

    // Mobile sidebar toggle
    const menuBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (menuBtn && sidebar && overlay) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('active');
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        });
      }
    }
  },

  navigate(viewName) {
    const targetSection = document.getElementById(`view-${viewName}`);
    if (!targetSection) return;

    this.currentView = viewName;
    window.location.hash = viewName;

    // Update active section
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    targetSection.classList.add('active');

    // Update active nav links
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');

    // Refresh view specific components
    if (viewName === 'dashboard') {
      this.updateDashboardStats();
      this.renderDashboardTasks();
      this.renderDashboardClasses();
      this.renderDashboardNotes();
    } else if (viewName === 'tasks') {
      TasksModule.renderTasks();
    } else if (viewName === 'timetable') {
      TimetableModule.renderSchedule();
    } else if (viewName === 'pomodoro') {
      TimerModule.updateDisplay();
    } else if (viewName === 'subjects') {
      SubjectsModule.renderSubjects();
    } else if (viewName === 'notes') {
      NotesModule.renderNotes();
    } else if (viewName === 'analytics') {
      AnalyticsModule.renderAnalytics();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- Dynamic Greetings & Header ---
  updateGreeting() {
    const user = Storage.getUser();
    const greetingElem = document.getElementById('dashboardGreeting');
    const quoteElem = document.getElementById('dashboardQuote');
    const dateElem = document.getElementById('dashboardDate');
    const userNameDisplay = document.getElementById('sidebarUserName');
    const userMajorDisplay = document.getElementById('sidebarUserRole');

    const userAvatarDisplay = document.getElementById('sidebarAvatar');

    if (userNameDisplay) userNameDisplay.textContent = user.name || 'Anjali';
    if (userMajorDisplay) userMajorDisplay.textContent = user.major || 'College Student';
    if (userAvatarDisplay) userAvatarDisplay.textContent = (user.name || 'Anjali').charAt(0).toUpperCase();

    const now = new Date();
    const hours = now.getHours();
    let timeGreeting = 'Good evening';
    if (hours < 12) timeGreeting = 'Good morning';
    else if (hours < 18) timeGreeting = 'Good afternoon';

    if (greetingElem) {
      greetingElem.innerHTML = `${timeGreeting}, ${escapeHtml(user.name || 'Anjali')} <span style="animation: wave 2s infinite transform-origin: 70% 70%; display: inline-block;">👋</span>`;
    }

    // Study Quotes
    const quotes = [
      "Ready to conquer your study goals today?",
      "Consistency is the key to mastering complex subjects.",
      "Small daily improvements over time lead to stunning results.",
      "Focus on the process, and the grades will follow."
    ];
    if (quoteElem) {
      quoteElem.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }

    // Nicely formatted date: "Tuesday, September 15, 2026"
    if (dateElem) {
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      dateElem.innerHTML = `<i class="fa-regular fa-calendar"></i> ${now.toLocaleDateString('en-US', options)}`;
    }
  },

  // --- Live Dashboard Stats ---
  updateDashboardStats() {
    const tasks = Storage.getTasks();
    const studyLogs = Storage.getStudyLogs();
    const user = Storage.getUser();
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's Study Hours
    const todayLogs = studyLogs.filter(l => l.date === todayStr);
    const todayMinutes = todayLogs.reduce((acc, log) => acc + (Number(log.minutes) || 0), 0);
    const todayHours = (todayMinutes / 60).toFixed(1);

    // Tasks completed
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Elements
    const statHours = document.getElementById('statStudyHours');
    const statTasks = document.getElementById('statTasksCompleted');
    const statStreak = document.getElementById('statStudyStreak');
    const statProgress = document.getElementById('statOverallProgress');
    const dashProgressRing = document.getElementById('dashProgressRing');
    const dashProgressText = document.getElementById('dashProgressText');

    if (statHours) statHours.textContent = `${todayHours} hrs`;
    if (statTasks) statTasks.textContent = `${completedTasks} / ${totalTasks}`;
    if (statStreak) statStreak.textContent = `${user.streakDays || 12} days`;
    if (statProgress) statProgress.textContent = `${taskProgressPct}%`;

    // Circular Progress Ring (radius = 36, circumference = 2 * PI * 36 ≈ 226.19)
    if (dashProgressRing) {
      const circumference = 2 * Math.PI * 36;
      const offset = circumference - (taskProgressPct / 100) * circumference;
      dashProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
      dashProgressRing.style.strokeDashoffset = offset;
    }
    if (dashProgressText) dashProgressText.textContent = `${taskProgressPct}%`;

    this.updateSidebarBadges();
  },

  updateSidebarBadges() {
    const tasks = Storage.getTasks();
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const badge = document.getElementById('sidebarTasksBadge');
    if (badge) {
      badge.textContent = pendingTasks;
      badge.classList.toggle('highlight', pendingTasks > 0);
    }
  },

  renderDashboardTasks() {
    const container = document.getElementById('dashboardTasksList');
    if (!container) return;

    const tasks = Storage.getTasks();
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4);

    if (pendingTasks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 10px; color: var(--text-muted);">
          <i class="fa-regular fa-circle-check" style="font-size: 28px; color: var(--success); margin-bottom: 8px; display: block;"></i>
          <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">All caught up!</p>
          <p style="font-size: 0.8rem; color: var(--text-subtle);">No pending tasks for today.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = pendingTasks.map(task => {
      const subject = Storage.getSubjectById(task.subjectId);
      const subjectColor = subject ? subject.color : '#6366f1';

      return `
        <div class="widget-task-item">
          <div class="widget-task-left">
            <button class="custom-checkbox ${task.completed ? 'checked' : ''}" onclick="TasksModule.toggleTask('${task.id}')" aria-label="Mark task complete">
              <i class="fa-solid fa-check"></i>
            </button>
            <span class="widget-task-text" onclick="TasksModule.toggleTask('${task.id}')">${escapeHtml(task.title)}</span>
          </div>
          <span class="badge badge-${task.priority}">
            ${capitalize(task.priority)}
          </span>
        </div>
      `;
    }).join('');
  },

  renderDashboardClasses() {
    const container = document.getElementById('dashboardClassesList');
    if (!container) return;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];
    const timetable = Storage.getTimetable();
    const todayClasses = timetable.filter(c => c.day === currentDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayClasses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 10px; color: var(--text-muted);">
          <i class="fa-regular fa-calendar-check" style="font-size: 28px; color: var(--primary-400); margin-bottom: 8px; display: block;"></i>
          <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">No classes today</p>
          <p style="font-size: 0.8rem; color: var(--text-subtle);">Great day for self-study and assignments.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = todayClasses.map(c => {
      const subject = Storage.getSubjectById(c.subjectId);
      const subjectName = subject ? subject.name : 'Class';
      const subjectColor = subject ? subject.color : '#6366f1';

      return `
        <div class="widget-class-item" style="border-left-color: ${subjectColor};">
          <div class="class-time-badge">${formatTime(c.startTime)}</div>
          <div class="class-info">
            <div class="class-title">${escapeHtml(subjectName)}</div>
            <div class="class-meta">
              <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(c.room || 'LH-101')}</span>
              <span><i class="fa-solid fa-user-tie"></i> ${escapeHtml(c.professor || 'Instructor')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderDashboardNotes() {
    const container = document.getElementById('dashboardNotesList');
    if (!container) return;

    const notes = Storage.getNotes().slice(0, 3);
    if (notes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-muted);">
          <p style="font-size: 0.85rem;">No notes yet. Jot down key ideas quickly!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(n => {
      return `
        <div style="padding: 12px; background: var(--bg-input); border-radius: var(--radius-md); border: var(--glass-border); margin-bottom: 10px; cursor: pointer;" onclick="App.navigate('notes')">
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">${escapeHtml(n.title)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(n.content)}</div>
        </div>
      `;
    }).join('');
  },

  // --- Modals Management ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // --- Toast Notification System ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const iconMap = {
      success: 'fa-circle-check',
      danger: 'fa-triangle-exclamation',
      warning: 'fa-circle-exclamation',
      info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${iconMap[type] || 'fa-circle-info'} toast-icon"></i>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  },

  // --- Global Event Handlers & Shortcut Keys ---
  bindGlobalEvents() {
    // Theme toggle button in header
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Keyboard Shortcuts (Cmd/Ctrl + K for search, Escape to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => this.closeModal(m.id));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const headerSearch = document.getElementById('globalSearchInput');
        if (headerSearch) {
          headerSearch.focus();
        }
      }
    });

    // Global Search Bar in Header
    const globalSearch = document.getElementById('globalSearchInput');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length > 0) {
          // If on dashboard, navigate to tasks and search
          if (this.currentView !== 'tasks' && this.currentView !== 'notes') {
            this.navigate('tasks');
          }
          const taskSearch = document.getElementById('taskSearchInput');
          if (taskSearch) {
            taskSearch.value = query;
            TasksModule.searchQuery = query;
            TasksModule.renderTasks();
          }
        }
      });
    }
  },

  // --- Settings Bindings ---
  bindSettings() {
    const user = Storage.getUser();
    const settings = Storage.getSettings();

    const profileNameInput = document.getElementById('settingsProfileName');
    const profileMajorInput = document.getElementById('settingsProfileMajor');
    const profileGoalInput = document.getElementById('settingsDailyGoal');
    const themeToggle = document.getElementById('settingsThemeToggle');
    const soundToggle = document.getElementById('settingsSoundToggle');
    const studyDurationInput = document.getElementById('settingsPomoStudy');
    const breakDurationInput = document.getElementById('settingsPomoBreak');

    if (profileNameInput) profileNameInput.value = user.name || '';
    if (profileMajorInput) profileMajorInput.value = user.major || '';
    if (profileGoalInput) profileGoalInput.value = user.dailyGoalHours || 4.5;
    if (themeToggle) themeToggle.checked = (settings.theme || 'dark') === 'dark';
    if (soundToggle) soundToggle.checked = settings.soundEnabled !== false;
    if (studyDurationInput) studyDurationInput.value = settings.pomodoroStudy || 25;
    if (breakDurationInput) breakDurationInput.value = settings.pomodoroShortBreak || 5;

    // Save Profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => {
        user.name = profileNameInput.value.trim() || 'Anjali';
        user.major = profileMajorInput.value.trim() || 'Computer Science';
        user.dailyGoalHours = parseFloat(profileGoalInput.value) || 4;
        Storage.saveUser(user);
        this.updateGreeting();
        this.showToast('Profile updated successfully!', 'success');
      });
    }

    // Save Settings button
    const saveSettingsBtn = document.getElementById('savePreferencesBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        settings.theme = themeToggle.checked ? 'dark' : 'light';
        settings.soundEnabled = soundToggle.checked;
        settings.pomodoroStudy = parseInt(studyDurationInput.value, 10) || 25;
        settings.pomodoroShortBreak = parseInt(breakDurationInput.value, 10) || 5;
        
        Storage.saveSettings(settings);
        this.setTheme(settings.theme);
        TimerModule.loadSettings();
        TimerModule.updateDisplay();
        this.showToast('Preferences saved!', 'success');
      });
    }

    // Reset Data Button
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset all data to default college student sample records? Any custom additions will be replaced.')) {
          Storage.resetToDefaults();
          this.init();
          this.showToast('Reset to default sample data! 🎉', 'success');
        }
      });
    }

    // Export Backup Button
    const exportBtn = document.getElementById('exportBackupBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = Storage.exportBackup();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StudySync_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Backup JSON downloaded! 💾', 'success');
      });
    }

    // Import Backup Input
    const importInput = document.getElementById('importBackupInput');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const success = Storage.importBackup(event.target.result);
          if (success) {
            this.init();
            this.showToast('Backup restored successfully! 🚀', 'success');
          } else {
            this.showToast('Invalid backup file format.', 'danger');
          }
        };
        reader.readAsText(file);
      });
    }
  }
};

// --- Utility Functions ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Auto Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
