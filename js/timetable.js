/**
 * StudySync - Timetable Module
 * Handles weekly schedule display, current day highlight, and class management.
 */

const TimetableModule = {
  selectedDay: 'Monday',
  editingClassId: null,
  daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

  init() {
    this.setCurrentDayAsDefault();
    this.bindEvents();
    this.renderDayPills();
    this.renderSchedule();
  },

  setCurrentDayAsDefault() {
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    // map JS getDay() (0=Sun, 1=Mon... 6=Sat) to our array
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.selectedDay = dayNames[todayIndex];
  },

  bindEvents() {
    const addClassBtn = document.getElementById('addClassBtn');
    if (addClassBtn) {
      addClassBtn.addEventListener('click', () => {
        this.openClassModal();
      });
    }

    const classForm = document.getElementById('classForm');
    if (classForm) {
      classForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveClassFromForm();
      });
    }
  },

  renderDayPills() {
    const container = document.getElementById('timetableDayPills');
    if (!container) return;

    const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

    container.innerHTML = this.daysOfWeek.map(day => {
      const isSelected = day === this.selectedDay;
      const isToday = day === currentDayName;
      return `
        <button class="day-pill ${isSelected ? 'active' : ''} ${isToday ? 'today-badge' : ''}" 
                onclick="TimetableModule.selectDay('${day}')">
          <span>${day}</span>
        </button>
      `;
    }).join('');
  },

  selectDay(day) {
    this.selectedDay = day;
    this.renderDayPills();
    this.renderSchedule();
  },

  getClassesForDay(day) {
    const timetable = Storage.getTimetable();
    const dayClasses = timetable.filter(c => c.day === day);
    // sort chronologically by startTime
    dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return dayClasses;
  },

  renderSchedule() {
    const container = document.getElementById('timetableGrid');
    if (!container) return;

    const classes = this.getClassesForDay(this.selectedDay);

    if (classes.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <i class="fa-regular fa-calendar-check"></i>
          </div>
          <h3 class="empty-state-title">No classes scheduled for ${this.selectedDay}</h3>
          <p class="empty-state-desc">Enjoy your free time or schedule a study session!</p>
          <button class="btn btn-primary btn-sm" onclick="TimetableModule.openClassModal('${this.selectedDay}')">
            <i class="fa-solid fa-plus"></i> Add Class to ${this.selectedDay}
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = classes.map(c => {
      const subject = Storage.getSubjectById(c.subjectId);
      const subjectName = subject ? subject.name : 'Unknown Subject';
      const subjectCode = subject ? subject.code : 'GEN';
      const subjectColor = subject ? subject.color : '#6366f1';

      return `
        <div class="schedule-card" style="--subject-color: ${subjectColor}">
          <div>
            <div class="schedule-time-row">
              <span class="schedule-time">
                <i class="fa-regular fa-clock"></i> ${formatTime(c.startTime)} - ${formatTime(c.endTime)}
              </span>
              <span class="badge" style="background: rgba(99, 102, 241, 0.12); color: ${subjectColor}">
                ${subjectCode}
              </span>
            </div>
            <h4 class="schedule-subject">${escapeHtml(subjectName)}</h4>
            <div class="schedule-details">
              <div class="schedule-details-row">
                <i class="fa-solid fa-location-dot"></i>
                <span>Room / Hall: <strong>${escapeHtml(c.room || 'TBA')}</strong></span>
              </div>
              <div class="schedule-details-row">
                <i class="fa-solid fa-user-tie"></i>
                <span>Instructor: <strong>${escapeHtml(c.professor || 'Instructor')}</strong></span>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 16px; border-top: var(--glass-border); padding-top: 10px;">
            <button class="action-icon-btn" onclick="TimetableModule.openClassModal(null, '${c.id}')" title="Edit Class">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="action-icon-btn delete" onclick="TimetableModule.deleteClass('${c.id}')" title="Delete Class">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openClassModal(day = null, classId = null) {
    this.editingClassId = classId;
    const modalTitle = document.getElementById('classModalTitle');
    const form = document.getElementById('classForm');
    const subjectSelect = document.getElementById('classSubjectSelect');

    const subjects = Storage.getSubjects();
    subjectSelect.innerHTML = subjects.map(s => `
      <option value="${s.id}">${escapeHtml(s.name)} (${s.code})</option>
    `).join('');

    if (classId) {
      const cls = Storage.getTimetable().find(c => c.id === classId);
      if (cls) {
        modalTitle.textContent = 'Edit Class Schedule';
        form.classSubject.value = cls.subjectId;
        form.classDay.value = cls.day;
        form.classStartTime.value = cls.startTime;
        form.classEndTime.value = cls.endTime;
        form.classRoom.value = cls.room || '';
        form.classProfessor.value = cls.professor || '';
      }
    } else {
      modalTitle.textContent = 'Add Class Schedule';
      form.reset();
      form.classDay.value = day || this.selectedDay;
      form.classStartTime.value = '09:00';
      form.classEndTime.value = '10:30';
    }

    App.openModal('classModal');
  },

  saveClassFromForm() {
    const form = document.getElementById('classForm');
    const subjectId = form.classSubject.value;
    const day = form.classDay.value;
    const startTime = form.classStartTime.value;
    const endTime = form.classEndTime.value;
    const room = form.classRoom.value.trim();
    const professor = form.classProfessor.value.trim();

    if (!startTime || !endTime) {
      App.showToast('Please specify start and end time', 'warning');
      return;
    }

    const timetable = Storage.getTimetable();

    if (this.editingClassId) {
      const cls = timetable.find(c => c.id === this.editingClassId);
      if (cls) {
        cls.subjectId = subjectId;
        cls.day = day;
        cls.startTime = startTime;
        cls.endTime = endTime;
        cls.room = room;
        cls.professor = professor;
      }
      App.showToast('Class schedule updated', 'success');
    } else {
      const newClass = {
        id: `tt-${Date.now()}`,
        day,
        subjectId,
        startTime,
        endTime,
        room,
        professor
      };
      timetable.push(newClass);
      App.showToast('New class scheduled!', 'success');
    }

    Storage.saveTimetable(timetable);
    App.closeModal('classModal');
    this.selectDay(day);
    App.renderDashboardClasses();
  },

  deleteClass(classId) {
    if (!confirm('Remove this class from timetable?')) return;

    let timetable = Storage.getTimetable();
    timetable = timetable.filter(c => c.id !== classId);
    Storage.saveTimetable(timetable);

    this.renderSchedule();
    App.renderDashboardClasses();
    App.showToast('Class removed', 'info');
  }
};

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}
