/**
 * StudySync - Subjects Module
 * Handles subject catalog, progress tracking, study targets, and subject creation.
 */

const SubjectsModule = {
  editingSubjectId: null,

  init() {
    this.bindEvents();
    this.renderSubjects();
  },

  bindEvents() {
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    if (addSubjectBtn) {
      addSubjectBtn.addEventListener('click', () => {
        this.openSubjectModal();
      });
    }

    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) {
      subjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSubjectFromForm();
      });
    }
  },

  renderSubjects() {
    const container = document.getElementById('subjectsGrid');
    if (!container) return;

    const subjects = Storage.getSubjects();
    const tasks = Storage.getTasks();

    if (subjects.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h3 class="empty-state-title">No subjects added yet</h3>
          <p class="empty-state-desc">Add your semester subjects to track progress and assignments.</p>
          <button class="btn btn-primary btn-sm" onclick="SubjectsModule.openSubjectModal()">
            <i class="fa-solid fa-plus"></i> Add Your First Subject
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = subjects.map(sub => {
      const subTasks = tasks.filter(t => t.subjectId === sub.id);
      const completedTasks = subTasks.filter(t => t.completed).length;
      const totalTasks = subTasks.length;
      
      const studiedHours = ((sub.studiedMinutes || 0) / 60).toFixed(1);
      const targetHours = sub.targetHours || 30;
      const progressPercent = Math.min(100, Math.round(((sub.studiedMinutes || 0) / (targetHours * 60)) * 100));

      // Find upcoming task
      const pendingTasks = subTasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      const nextTask = pendingTasks[0];

      return `
        <div class="subject-card" style="--subject-color: ${sub.color || '#6366f1'}">
          <div>
            <div class="subject-card-header">
              <div>
                <span class="subject-code-tag" style="color: ${sub.color || '#6366f1'}; background: ${sub.bgLight || 'rgba(99, 102, 241, 0.12)'}">
                  ${escapeHtml(sub.code || 'CS')}
                </span>
                <h3 class="subject-title" style="margin-top: 8px;">${escapeHtml(sub.name)}</h3>
                <p class="subject-prof"><i class="fa-solid fa-user-tie" style="font-size: 11px;"></i> ${escapeHtml(sub.professor || 'Instructor')}</p>
              </div>
              <div class="task-actions">
                <button class="action-icon-btn" onclick="SubjectsModule.openSubjectModal('${sub.id}')" title="Edit Subject">
                  <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="action-icon-btn delete" onclick="SubjectsModule.deleteSubject('${sub.id}')" title="Delete Subject">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>

            <div class="subject-progress-section">
              <div class="subject-progress-label">
                <span>Study Progress</span>
                <span style="color: ${sub.color || '#6366f1'}">${progressPercent}%</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${progressPercent}%; background: ${sub.color || '#6366f1'}"></div>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
              ${nextTask ? `
                <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-input); padding: 8px 12px; border-radius: var(--radius-sm);">
                  <i class="fa-solid fa-bolt" style="color: var(--warning); font-size: 12px;"></i>
                  <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Next: <strong>${escapeHtml(nextTask.title)}</strong></span>
                </div>
              ` : `
                <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-input); padding: 8px 12px; border-radius: var(--radius-sm); color: var(--text-subtle);">
                  <i class="fa-regular fa-circle-check" style="color: var(--success);"></i> All tasks up to date!
                </div>
              `}
            </div>
          </div>

          <div class="subject-stats-row">
            <span><i class="fa-regular fa-clock"></i> <strong>${studiedHours}</strong> / ${targetHours} hrs</span>
            <span><i class="fa-solid fa-tasks"></i> <strong>${completedTasks}</strong> / ${totalTasks} tasks</span>
          </div>
        </div>
      `;
    }).join('');
  },

  openSubjectModal(subjectId = null) {
    this.editingSubjectId = subjectId;
    const modalTitle = document.getElementById('subjectModalTitle');
    const form = document.getElementById('subjectForm');

    if (subjectId) {
      const sub = Storage.getSubjectById(subjectId);
      if (sub) {
        modalTitle.textContent = 'Edit Subject';
        form.subjectName.value = sub.name;
        form.subjectCode.value = sub.code || '';
        form.subjectColor.value = sub.color || '#6366f1';
        form.subjectProfessor.value = sub.professor || '';
        form.subjectRoom.value = sub.room || '';
        form.subjectTargetHours.value = sub.targetHours || 30;
      }
    } else {
      modalTitle.textContent = 'Add New Subject';
      form.reset();
      form.subjectColor.value = '#6366f1';
      form.subjectTargetHours.value = 30;
    }

    App.openModal('subjectModal');
  },

  saveSubjectFromForm() {
    const form = document.getElementById('subjectForm');
    const name = form.subjectName.value.trim();
    const code = form.subjectCode.value.trim().toUpperCase();
    const color = form.subjectColor.value;
    const professor = form.subjectProfessor.value.trim();
    const room = form.subjectRoom.value.trim();
    const targetHours = Number(form.subjectTargetHours.value) || 30;

    if (!name) {
      App.showToast('Please enter subject name', 'warning');
      return;
    }

    const subjects = Storage.getSubjects();

    if (this.editingSubjectId) {
      const sub = subjects.find(s => s.id === this.editingSubjectId);
      if (sub) {
        sub.name = name;
        sub.code = code || 'GEN';
        sub.color = color;
        sub.bgLight = hexToRgba(color, 0.15);
        sub.professor = professor;
        sub.room = room;
        sub.targetHours = targetHours;
      }
      App.showToast('Subject updated successfully', 'success');
    } else {
      const newSubject = {
        id: `sub-${Date.now()}`,
        name,
        code: code || 'GEN',
        color,
        bgLight: hexToRgba(color, 0.15),
        professor: professor || 'Faculty Instructor',
        room: room || 'LH-101',
        targetHours,
        studiedMinutes: 0
      };
      subjects.push(newSubject);
      App.showToast('New subject added!', 'success');
    }

    Storage.saveSubjects(subjects);
    App.closeModal('subjectModal');
    this.renderSubjects();
    if (window.TimerModule) TimerModule.populateSubjectSelector();
    if (window.AnalyticsModule) AnalyticsModule.renderAnalytics();
  },

  deleteSubject(subjectId) {
    if (!confirm('Are you sure you want to delete this subject? Its associated tasks and notes will remain in general.')) return;

    let subjects = Storage.getSubjects();
    subjects = subjects.filter(s => s.id !== subjectId);
    Storage.saveSubjects(subjects);

    this.renderSubjects();
    if (window.TimerModule) TimerModule.populateSubjectSelector();
    if (window.AnalyticsModule) AnalyticsModule.renderAnalytics();
    App.showToast('Subject deleted', 'info');
  }
};

function hexToRgba(hex, alpha) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `,${alpha})`;
  }
  return `rgba(99, 102, 241, ${alpha})`;
}
