/**
 * StudySync - Pomodoro Study Timer Module
 * Handles Pomodoro countdown, interactive Focus vs Break mode switching,
 * custom duration adjustments, radial SVG animation, audio synthesis, and study session logs.
 */

const TimerModule = {
  mode: 'study', // 'study' (Focus) | 'break' (Break)
  isRunning: false,
  timerInterval: null,
  timeLeft: 25 * 60, // in seconds
  totalDuration: 25 * 60,
  customMinutes: 25,
  sessionsCompletedToday: 0,
  activeSubjectId: '',

  // SVG Circle parameters (radius = 120, circumference = 2 * PI * 120 ≈ 753.98)
  circleRadius: 120,
  circumference: 2 * Math.PI * 120,

  init() {
    this.loadSettings();
    this.bindEvents();
    this.populateSubjectSelector();
    this.updateDisplay();
    this.updateStatsDisplay();
  },

  loadSettings() {
    const settings = Storage.getSettings();
    let mins = 25;
    if (this.mode === 'study') {
      mins = settings.pomodoroStudy || 25;
    } else {
      mins = settings.pomodoroShortBreak || 5;
    }

    this.customMinutes = mins;
    this.totalDuration = mins * 60;
    this.timeLeft = this.totalDuration;

    const input = document.getElementById('pomoCustomMinutesInput');
    if (input) input.value = mins;
  },

  bindEvents() {
    // Interactive Mode switcher buttons (Focus vs Break)
    const modeBtns = document.querySelectorAll('.pomo-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedMode = e.currentTarget.dataset.mode;
        this.switchMode(selectedMode);
      });
    });

    // Main play/pause button
    const toggleBtn = document.getElementById('pomoToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleTimer();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('pomoResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetTimer();
      });
    }

    // Skip button
    const skipBtn = document.getElementById('pomoSkipBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.skipTimer();
      });
    }

    // Subject Selector
    const subjectSelect = document.getElementById('pomoSubjectSelect');
    if (subjectSelect) {
      subjectSelect.addEventListener('change', (e) => {
        this.activeSubjectId = e.target.value;
      });
    }

    // Stepper Decrement (-)
    const minusBtn = document.getElementById('pomoMinusBtn');
    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        const step = this.customMinutes <= 5 ? 1 : 5;
        this.adjustMinutes(-step);
      });
    }

    // Stepper Increment (+)
    const plusBtn = document.getElementById('pomoPlusBtn');
    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        const step = this.customMinutes < 5 ? 1 : 5;
        this.adjustMinutes(step);
      });
    }

    // Direct input change
    const minutesInput = document.getElementById('pomoCustomMinutesInput');
    if (minutesInput) {
      minutesInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 180) {
          this.setCustomMinutes(val, true);
        }
      });
      minutesInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 180) val = 180;
        e.target.value = val;
        this.setCustomMinutes(val, true);
      });
    }
  },

  setCustomMinutes(mins, saveToStorage = true) {
    mins = Math.max(1, Math.min(180, parseInt(mins, 10) || 25));
    this.customMinutes = mins;

    if (this.isRunning) {
      this.pauseTimer();
      App.showToast(`Timer adjusted to ${mins} mins (Paused)`, 'info');
    }

    this.totalDuration = mins * 60;
    this.timeLeft = this.totalDuration;

    // Update input field
    const input = document.getElementById('pomoCustomMinutesInput');
    if (input) input.value = mins;

    // Save to settings
    if (saveToStorage) {
      const settings = Storage.getSettings();
      if (this.mode === 'study') settings.pomodoroStudy = mins;
      else settings.pomodoroShortBreak = mins;
      Storage.saveSettings(settings);
    }

    this.updateDisplay();
  },

  adjustMinutes(delta) {
    const newMins = Math.max(1, Math.min(180, this.customMinutes + delta));
    this.setCustomMinutes(newMins, true);
  },

  populateSubjectSelector() {
    const select = document.getElementById('pomoSubjectSelect');
    if (!select) return;
    const subjects = Storage.getSubjects();
    select.innerHTML = `
      <option value="">General Study</option>
      ${subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
    `;
    if (subjects.length > 0 && !this.activeSubjectId) {
      this.activeSubjectId = subjects[0].id;
      select.value = this.activeSubjectId;
    }
  },

  switchMode(newMode) {
    if (this.isRunning) {
      this.pauseTimer();
    }
    this.mode = newMode;

    // Update active button classes
    document.querySelectorAll('.pomo-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    const statusLabel = document.getElementById('pomoStatusLabel');
    const circle = document.getElementById('pomoCircleProgress');

    if (statusLabel) {
      statusLabel.textContent = newMode === 'study' ? 'FOCUS SESSION' : 'BREAK TIME';
      statusLabel.style.color = newMode === 'study' ? 'var(--primary-400)' : 'var(--info)';
    }

    if (circle) {
      circle.style.stroke = newMode === 'study' ? 'var(--primary-500)' : 'var(--info)';
    }

    this.loadSettings();
    this.updateDisplay();
  },

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateControlButtons();

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  },

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.updateControlButtons();
  },

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.totalDuration;
    this.updateDisplay();
    App.showToast('Timer reset', 'info');
  },

  skipTimer() {
    this.pauseTimer();
    if (this.mode === 'study') {
      this.switchMode('break');
    } else {
      this.switchMode('study');
    }
  },

  completeSession() {
    this.pauseTimer();
    this.playChimeSound();

    if (this.mode === 'study') {
      const minutesStudied = Math.round(this.totalDuration / 60);
      Storage.addStudyLog(minutesStudied, this.activeSubjectId);

      App.showToast(`🎉 Focus session complete! Logged ${minutesStudied} mins of study.`, 'success');

      // Update Dashboard & Analytics stats
      App.updateDashboardStats();
      if (window.AnalyticsModule) AnalyticsModule.renderAnalytics();
      if (window.SubjectsModule) SubjectsModule.renderSubjects();

      // Switch to break
      this.switchMode('break');
    } else {
      App.showToast('Break finished! Ready to get back into focus? 🚀', 'info');
      this.switchMode('study');
    }

    this.updateStatsDisplay();
  },

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const countdownElem = document.getElementById('pomoCountdown');
    if (countdownElem) {
      countdownElem.textContent = formatted;
    }

    // Update document title dynamically
    document.title = this.isRunning ? `(${formatted}) StudySync` : 'StudySync - Student Productivity';

    // Update circular progress SVG
    const circle = document.getElementById('pomoCircleProgress');
    if (circle) {
      const progressFraction = (this.totalDuration - this.timeLeft) / this.totalDuration;
      const offset = this.circumference - (progressFraction * this.circumference);
      circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
      circle.style.strokeDashoffset = offset;
    }
  },

  updateControlButtons() {
    const toggleBtn = document.getElementById('pomoToggleBtn');
    if (toggleBtn) {
      toggleBtn.innerHTML = this.isRunning 
        ? '<i class="fa-solid fa-pause"></i>' 
        : '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
      toggleBtn.title = this.isRunning ? 'Pause Timer' : 'Start Timer';
    }
  },

  updateStatsDisplay() {
    const stats = Storage.getPomoStats();
    const todaySessionsElem = document.getElementById('pomoTodaySessions');
    const totalSessionsElem = document.getElementById('pomoTotalSessions');
    const totalHoursElem = document.getElementById('pomoTotalHours');

    if (todaySessionsElem) todaySessionsElem.textContent = stats.todaySessions || 0;
    if (totalSessionsElem) totalSessionsElem.textContent = stats.sessionsCompleted || 0;
    if (totalHoursElem) totalHoursElem.textContent = `${((stats.totalMinutes || 0) / 60).toFixed(1)} hrs`;
  },

  // Pleasant chime synthesizer using Web Audio API
  playChimeSound() {
    const settings = Storage.getSettings();
    if (!settings.soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major arpeggio)
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.8);
      });
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }
};
