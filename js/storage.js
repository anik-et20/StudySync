/**
 * StudySync - Storage & State Management Layer
 * Handles LocalStorage persistence, default seed data, and data export/reset.
 */

const STORAGE_KEYS = {
  USER: 'studysync_user',
  SUBJECTS: 'studysync_subjects',
  TASKS: 'studysync_tasks',
  NOTES: 'studysync_notes',
  TIMETABLE: 'studysync_timetable',
  STUDY_LOGS: 'studysync_study_logs',
  SETTINGS: 'studysync_settings',
  POMODORO_STATS: 'studysync_pomo_stats'
};

// Seed Data for initial load
const SEED_DATA = {
  user: {
    name: 'Aniket',
    fullName: 'Aniket Sharma',
    major: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dailyGoalHours: 4.5,
    streakDays: 12
  },
  settings: {
    theme: 'dark', // default modern dark theme
    pomodoroStudy: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    soundEnabled: true,
    notificationsEnabled: true,
    autoStartBreaks: false
  },
  subjects: [
    {
      id: 'sub-1',
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      color: '#6366f1', // Indigo
      bgLight: 'rgba(99, 102, 241, 0.15)',
      professor: 'Dr. Ramesh Kulkarni',
      room: 'LH-204',
      targetHours: 35,
      studiedMinutes: 1260
    },
    {
      id: 'sub-2',
      name: 'Database Management Systems',
      code: 'CS302',
      color: '#06b6d4', // Cyan
      bgLight: 'rgba(6, 182, 212, 0.15)',
      professor: 'Prof. Sunita Patil',
      room: 'CS-Lab 3',
      targetHours: 25,
      studiedMinutes: 840
    },
    {
      id: 'sub-3',
      name: 'Operating Systems',
      code: 'CS303',
      color: '#ec4899', // Pink
      bgLight: 'rgba(236, 72, 153, 0.15)',
      professor: 'Dr. Anand Verma',
      room: 'LH-102',
      targetHours: 30,
      studiedMinutes: 980
    },
    {
      id: 'sub-4',
      name: 'Machine Learning Fundamentals',
      code: 'CS304',
      color: '#8b5cf6', // Purple
      bgLight: 'rgba(139, 92, 246, 0.15)',
      professor: 'Dr. Priya Nair',
      room: 'AI-Centre 1',
      targetHours: 40,
      studiedMinutes: 1420
    },
    {
      id: 'sub-5',
      name: 'Full Stack Web Development',
      code: 'CS305',
      color: '#10b981', // Emerald
      bgLight: 'rgba(16, 185, 129, 0.15)',
      professor: 'Prof. Vikram Sen',
      room: 'Web Studio B',
      targetHours: 28,
      studiedMinutes: 1100
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Implement Red-Black Tree insertion & deletion in C++',
      description: 'Complete problem set 4 with rotational edge cases and unit tests.',
      subjectId: 'sub-1',
      dueDate: getRelativeDate(0), // Today
      priority: 'high',
      completed: false,
      createdAt: getRelativeDate(-2)
    },
    {
      id: 'task-2',
      title: 'Prepare SQL ER Diagram for Library Management System',
      description: 'Design schema with 3NF normalization and foreign key constraints.',
      subjectId: 'sub-2',
      dueDate: getRelativeDate(0), // Today
      priority: 'medium',
      completed: true,
      completedAt: getRelativeDate(0),
      createdAt: getRelativeDate(-3)
    },
    {
      id: 'task-3',
      title: 'Review CPU Scheduling Algorithms (Round Robin & SJF)',
      description: 'Solve numerical problems on average turnaround and waiting time.',
      subjectId: 'sub-3',
      dueDate: getRelativeDate(1), // Tomorrow
      priority: 'high',
      completed: false,
      createdAt: getRelativeDate(-1)
    },
    {
      id: 'task-4',
      title: 'Build Gradient Descent algorithm from scratch in Python',
      description: 'Implement linear regression with cost function visualization using Matplotlib.',
      subjectId: 'sub-4',
      dueDate: getRelativeDate(2),
      priority: 'high',
      completed: false,
      createdAt: getRelativeDate(-2)
    },
    {
      id: 'task-5',
      title: 'Refactor REST API endpoints with JWT authentication',
      description: 'Add token expiration, refresh token handler, and middleware checks.',
      subjectId: 'sub-5',
      dueDate: getRelativeDate(3),
      priority: 'medium',
      completed: false,
      createdAt: getRelativeDate(-1)
    },
    {
      id: 'task-6',
      title: 'Read chapter 4 on Virtual Memory and Paging',
      description: 'Take summary notes on Translation Lookaside Buffer (TLB) hit ratios.',
      subjectId: 'sub-3',
      dueDate: getRelativeDate(-1),
      priority: 'low',
      completed: true,
      completedAt: getRelativeDate(-1),
      createdAt: getRelativeDate(-4)
    },
    {
      id: 'task-7',
      title: 'Solve LeetCode Graph problems (BFS & DFS traversal)',
      description: 'Do Number of Islands, Course Schedule, and Rotting Oranges.',
      subjectId: 'sub-1',
      dueDate: getRelativeDate(4),
      priority: 'medium',
      completed: false,
      createdAt: getRelativeDate(0)
    },
    {
      id: 'task-8',
      title: 'Submit DBMS Lab Assignment 3 (PL/SQL Triggers)',
      description: 'Verify row-level triggers and auditing table insertions.',
      subjectId: 'sub-2',
      dueDate: getRelativeDate(0),
      priority: 'high',
      completed: true,
      completedAt: getRelativeDate(0),
      createdAt: getRelativeDate(-2)
    }
  ],
  notes: [
    {
      id: 'note-1',
      title: 'Dynamic Programming Patterns & Memoization',
      content: 'Key Patterns to identify DP problems:\n1. Overlapping Subproblems & Optimal Substructure\n2. 0/1 Knapsack variations: Subset sum, equal partition\n3. Longest Common Subsequence (LCS): Edit distance, shortest common supersequence\n4. Matrix Chain Multiplication (MCM): Palindrome partitioning\n\n💡 Pro tip: Always define DP state explicitly: `dp[i][j]` = optimal answer for prefix `i` with capacity `j`.',
      subjectId: 'sub-1',
      isPinned: true,
      color: '#6366f1',
      createdAt: getRelativeDate(-2),
      updatedAt: getRelativeDate(-1)
    },
    {
      id: 'note-2',
      title: 'ACID Properties & Isolation Levels Quick Reference',
      content: 'Atomicity: All or nothing execution.\nConsistency: Database state maintains all integrity constraints.\nIsolation: Concurrent transactions do not interfere.\nDurability: Committed updates survive system crashes.\n\nIsolation Levels:\n• Read Uncommitted (Dirty reads possible)\n• Read Committed (Non-repeatable reads possible)\n• Repeatable Read (Phantom reads possible)\n• Serializable (Strict consistency)',
      subjectId: 'sub-2',
      isPinned: true,
      color: '#06b6d4',
      createdAt: getRelativeDate(-4),
      updatedAt: getRelativeDate(-3)
    },
    {
      id: 'note-3',
      title: 'Semaphores vs Mutex - Operating Systems',
      content: 'Mutex is a locking mechanism used to synchronize access to a resource (ownership belongs to the locking thread).\n\nSemaphore is a signaling mechanism (generalized integer counter):\n- Binary Semaphore (0 or 1): similar to mutex without ownership\n- Counting Semaphore: regulates access to N resources simultaneously.\n\nBeware of: Deadlock conditions (Mutual exclusion, Hold and wait, No preemption, Circular wait).',
      subjectId: 'sub-3',
      isPinned: false,
      color: '#ec4899',
      createdAt: getRelativeDate(-5),
      updatedAt: getRelativeDate(-5)
    },
    {
      id: 'note-4',
      title: 'Gradient Descent Optimization Cheat Sheet',
      content: 'Cost Function: MSE = (1/2m) * Σ(h(x) - y)²\n\nLearning Rate (α):\n- Too small: Very slow convergence\n- Too large: Diverges and overshoots\n\nAdvanced Optimizers:\n• SGD: Fast but noisy updates\n• Momentum: Accelerates through ravines\n• Adam: Adaptive learning rates with momentum (best default choice)',
      subjectId: 'sub-4',
      isPinned: false,
      color: '#8b5cf6',
      createdAt: getRelativeDate(-3),
      updatedAt: getRelativeDate(-1)
    }
  ],
  timetable: [
    // Monday
    { id: 'tt-1', day: 'Monday', subjectId: 'sub-1', startTime: '09:00', endTime: '10:30', room: 'LH-204', professor: 'Dr. Ramesh Kulkarni' },
    { id: 'tt-2', day: 'Monday', subjectId: 'sub-2', startTime: '11:00', endTime: '12:30', room: 'CS-Lab 3', professor: 'Prof. Sunita Patil' },
    { id: 'tt-3', day: 'Monday', subjectId: 'sub-5', startTime: '14:00', endTime: '15:30', room: 'Web Studio B', professor: 'Prof. Vikram Sen' },

    // Tuesday
    { id: 'tt-4', day: 'Tuesday', subjectId: 'sub-3', startTime: '09:30', endTime: '11:00', room: 'LH-102', professor: 'Dr. Anand Verma' },
    { id: 'tt-5', day: 'Tuesday', subjectId: 'sub-4', startTime: '11:30', endTime: '13:00', room: 'AI-Centre 1', professor: 'Dr. Priya Nair' },
    { id: 'tt-6', day: 'Tuesday', subjectId: 'sub-1', startTime: '14:30', endTime: '16:00', room: 'LH-204', professor: 'Dr. Ramesh Kulkarni' },

    // Wednesday
    { id: 'tt-7', day: 'Wednesday', subjectId: 'sub-2', startTime: '09:00', endTime: '10:30', room: 'LH-101', professor: 'Prof. Sunita Patil' },
    { id: 'tt-8', day: 'Wednesday', subjectId: 'sub-5', startTime: '11:00', endTime: '13:00', room: 'Web Studio B (Lab)', professor: 'Prof. Vikram Sen' },
    { id: 'tt-9', day: 'Wednesday', subjectId: 'sub-3', startTime: '14:00', endTime: '15:30', room: 'LH-102', professor: 'Dr. Anand Verma' },

    // Thursday
    { id: 'tt-10', day: 'Thursday', subjectId: 'sub-4', startTime: '09:00', endTime: '10:30', room: 'AI-Centre 1', professor: 'Dr. Priya Nair' },
    { id: 'tt-11', day: 'Thursday', subjectId: 'sub-1', startTime: '11:00', endTime: '13:00', room: 'Algo Lab 2', professor: 'Dr. Ramesh Kulkarni' },
    { id: 'tt-12', day: 'Thursday', subjectId: 'sub-2', startTime: '14:00', endTime: '15:30', room: 'LH-101', professor: 'Prof. Sunita Patil' },

    // Friday
    { id: 'tt-13', day: 'Friday', subjectId: 'sub-3', startTime: '09:30', endTime: '11:00', room: 'OS Lab A', professor: 'Dr. Anand Verma' },
    { id: 'tt-14', day: 'Friday', subjectId: 'sub-4', startTime: '11:30', endTime: '13:00', room: 'AI-Centre 1', professor: 'Dr. Priya Nair' },
    { id: 'tt-15', day: 'Friday', subjectId: 'sub-5', startTime: '14:00', endTime: '15:30', room: 'Web Studio B', professor: 'Prof. Vikram Sen' },

    // Saturday
    { id: 'tt-16', day: 'Saturday', subjectId: 'sub-1', startTime: '10:00', endTime: '12:00', room: 'Library Seminar Hall', professor: 'Guest Lecture / Hackathon' },

    // Sunday - Self Study / Project time
    { id: 'tt-17', day: 'Sunday', subjectId: 'sub-5', startTime: '11:00', endTime: '13:00', room: 'Home Workspace', professor: 'Personal Project Sprint' }
  ],
  studyLogs: generateInitialStudyLogs(),
  pomoStats: {
    sessionsCompleted: 18,
    totalMinutes: 450,
    todaySessions: 4
  }
};

// Helper: generate relative date string YYYY-MM-DD
function getRelativeDate(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate realistic study logs for past 14 days
function generateInitialStudyLogs() {
  const logs = [];
  const subjects = ['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5'];
  const baseMinutes = [180, 240, 210, 270, 300, 150, 220, 260, 280, 240, 310, 190, 250, 270];

  for (let i = 13; i >= 0; i--) {
    const dateStr = getRelativeDate(-i);
    const dayMins = baseMinutes[13 - i] || 200;
    const log1 = Math.round(dayMins * 0.6);
    const log2 = dayMins - log1;
    logs.push({
      id: `log-${i}-1`,
      date: dateStr,
      minutes: log1,
      subjectId: subjects[i % subjects.length]
    });
    if (log2 > 0) {
      logs.push({
        id: `log-${i}-2`,
        date: dateStr,
        minutes: log2,
        subjectId: subjects[(i + 1) % subjects.length]
      });
    }
  }
  return logs;
}

// Storage Service API
const Storage = {
  // Initialize storage with seed data if first time
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      this.resetToDefaults();
    }
  },

  // Generic Get with fallback
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from LocalStorage:`, e);
      return defaultValue;
    }
  },

  // Generic Set
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to LocalStorage:`, e);
      return false;
    }
  },

  // User profile
  getUser() {
    return this.get(STORAGE_KEYS.USER, SEED_DATA.user);
  },
  saveUser(userData) {
    return this.set(STORAGE_KEYS.USER, userData);
  },

  // Settings
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, SEED_DATA.settings);
  },
  saveSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // Subjects
  getSubjects() {
    return this.get(STORAGE_KEYS.SUBJECTS, SEED_DATA.subjects);
  },
  saveSubjects(subjects) {
    return this.set(STORAGE_KEYS.SUBJECTS, subjects);
  },
  getSubjectById(id) {
    const subjects = this.getSubjects();
    return subjects.find(s => s.id === id) || null;
  },

  // Tasks
  getTasks() {
    return this.get(STORAGE_KEYS.TASKS, SEED_DATA.tasks);
  },
  saveTasks(tasks) {
    return this.set(STORAGE_KEYS.TASKS, tasks);
  },

  // Notes
  getNotes() {
    return this.get(STORAGE_KEYS.NOTES, SEED_DATA.notes);
  },
  saveNotes(notes) {
    return this.set(STORAGE_KEYS.NOTES, notes);
  },

  // Timetable
  getTimetable() {
    return this.get(STORAGE_KEYS.TIMETABLE, SEED_DATA.timetable);
  },
  saveTimetable(timetable) {
    return this.set(STORAGE_KEYS.TIMETABLE, timetable);
  },

  // Study Logs
  getStudyLogs() {
    return this.get(STORAGE_KEYS.STUDY_LOGS, SEED_DATA.studyLogs);
  },
  saveStudyLogs(logs) {
    return this.set(STORAGE_KEYS.STUDY_LOGS, logs);
  },
  addStudyLog(minutes, subjectId) {
    const logs = this.getStudyLogs();
    const todayStr = getRelativeDate(0);
    const newLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      minutes: Number(minutes),
      subjectId: subjectId || (this.getSubjects()[0]?.id || '')
    };
    logs.push(newLog);
    this.saveStudyLogs(logs);

    // Also update subject studied minutes
    if (subjectId) {
      const subjects = this.getSubjects();
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) {
        subject.studiedMinutes = (subject.studiedMinutes || 0) + Number(minutes);
        this.saveSubjects(subjects);
      }
    }

    // Update Pomodoro stats
    const pomo = this.getPomoStats();
    pomo.totalMinutes = (pomo.totalMinutes || 0) + Number(minutes);
    pomo.todaySessions = (pomo.todaySessions || 0) + 1;
    pomo.sessionsCompleted = (pomo.sessionsCompleted || 0) + 1;
    this.savePomoStats(pomo);

    return newLog;
  },

  // Pomodoro stats
  getPomoStats() {
    return this.get(STORAGE_KEYS.POMODORO_STATS, SEED_DATA.pomoStats);
  },
  savePomoStats(stats) {
    return this.set(STORAGE_KEYS.POMODORO_STATS, stats);
  },

  // Reset to default seed data
  resetToDefaults() {
    this.set(STORAGE_KEYS.USER, SEED_DATA.user);
    this.set(STORAGE_KEYS.SETTINGS, SEED_DATA.settings);
    this.set(STORAGE_KEYS.SUBJECTS, SEED_DATA.subjects);
    this.set(STORAGE_KEYS.TASKS, SEED_DATA.tasks);
    this.set(STORAGE_KEYS.NOTES, SEED_DATA.notes);
    this.set(STORAGE_KEYS.TIMETABLE, SEED_DATA.timetable);
    this.set(STORAGE_KEYS.STUDY_LOGS, SEED_DATA.studyLogs);
    this.set(STORAGE_KEYS.POMODORO_STATS, SEED_DATA.pomoStats);
  },

  // Clear all data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },

  // Export JSON backup
  exportBackup() {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      settings: this.getSettings(),
      subjects: this.getSubjects(),
      tasks: this.getTasks(),
      notes: this.getNotes(),
      timetable: this.getTimetable(),
      studyLogs: this.getStudyLogs(),
      pomoStats: this.getPomoStats()
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import JSON backup
  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.user) this.saveUser(data.user);
      if (data.settings) this.saveSettings(data.settings);
      if (data.subjects) this.saveSubjects(data.subjects);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.notes) this.saveNotes(data.notes);
      if (data.timetable) this.saveTimetable(data.timetable);
      if (data.studyLogs) this.saveStudyLogs(data.studyLogs);
      if (data.pomoStats) this.savePomoStats(data.pomoStats);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }
};

// Auto initialize on load
Storage.init();
