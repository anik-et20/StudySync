/**
 * StudySync - Notes Module
 * Handles Note CRUD, search, subject tagging, pinning, and card rendering.
 */

const NotesModule = {
  editingNoteId: null,
  searchQuery: '',
  subjectFilter: 'all',

  init() {
    this.bindEvents();
    this.populateFilterDropdown();
    this.renderNotes();
  },

  bindEvents() {
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => {
        this.openNoteModal();
      });
    }

    const noteSearchInput = document.getElementById('noteSearchInput');
    if (noteSearchInput) {
      noteSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderNotes();
      });
    }

    const noteSubjectFilter = document.getElementById('noteSubjectFilter');
    if (noteSubjectFilter) {
      noteSubjectFilter.addEventListener('change', (e) => {
        this.subjectFilter = e.target.value;
        this.renderNotes();
      });
    }

    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNoteFromForm();
      });
    }
  },

  populateFilterDropdown() {
    const select = document.getElementById('noteSubjectFilter');
    if (!select) return;
    const subjects = Storage.getSubjects();
    select.innerHTML = `
      <option value="all">All Subjects</option>
      ${subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
    `;
  },

  getFilteredNotes() {
    let notes = Storage.getNotes();

    // Filter by subject
    if (this.subjectFilter !== 'all') {
      notes = notes.filter(n => n.subjectId === this.subjectFilter);
    }

    // Filter by search query
    if (this.searchQuery) {
      notes = notes.filter(n => {
        const title = (n.title || '').toLowerCase();
        const content = (n.content || '').toLowerCase();
        return title.includes(this.searchQuery) || content.includes(this.searchQuery);
      });
    }

    // Sort: Pinned first, then by date descending
    notes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    return notes;
  },

  renderNotes() {
    const container = document.getElementById('notesGrid');
    if (!container) return;

    const notes = this.getFilteredNotes();

    if (notes.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <i class="fa-regular fa-note-sticky"></i>
          </div>
          <h3 class="empty-state-title">No notes found</h3>
          <p class="empty-state-desc">Capture lecture notes, code snippets, and study references.</p>
          <button class="btn btn-primary btn-sm" onclick="NotesModule.openNoteModal()">
            <i class="fa-solid fa-plus"></i> Create First Note
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(note => {
      const subject = Storage.getSubjectById(note.subjectId);
      const subjectName = subject ? subject.name : 'General Note';
      const subjectColor = subject ? subject.color : (note.color || '#6366f1');

      return `
        <div class="note-card" onclick="NotesModule.openNoteModal('${note.id}')">
          ${note.isPinned ? '<div class="note-pin-badge" title="Pinned Note"><i class="fa-solid fa-thumbtack"></i></div>' : ''}
          
          <div>
            <h4 class="note-title">${escapeHtml(note.title)}</h4>
            <div class="note-preview">${escapeHtml(note.content || 'No text content...')}</div>
          </div>

          <div class="note-footer" onclick="event.stopPropagation()">
            <span class="badge" style="background: rgba(99, 102, 241, 0.12); color: ${subjectColor}; border: 1px solid rgba(99, 102, 241, 0.2);">
              ${escapeHtml(subjectName)}
            </span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button class="action-icon-btn" onclick="NotesModule.togglePin('${note.id}')" title="${note.isPinned ? 'Unpin' : 'Pin to top'}">
                <i class="fa-${note.isPinned ? 'solid' : 'regular'} fa-thumbtack" style="color: ${note.isPinned ? 'var(--primary-500)' : 'inherit'}"></i>
              </button>
              <button class="action-icon-btn delete" onclick="NotesModule.deleteNote('${note.id}')" title="Delete Note">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  togglePin(noteId) {
    const notes = Storage.getNotes();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    note.isPinned = !note.isPinned;
    Storage.saveNotes(notes);
    this.renderNotes();
    App.renderDashboardNotes();
    App.showToast(note.isPinned ? 'Note pinned to top 📌' : 'Note unpinned', 'info');
  },

  openNoteModal(noteId = null) {
    this.editingNoteId = noteId;
    const modalTitle = document.getElementById('noteModalTitle');
    const form = document.getElementById('noteForm');
    const subjectSelect = document.getElementById('noteSubjectSelect');

    const subjects = Storage.getSubjects();
    subjectSelect.innerHTML = `
      <option value="">General Notes</option>
      ${subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
    `;

    if (noteId) {
      const note = Storage.getNotes().find(n => n.id === noteId);
      if (note) {
        modalTitle.textContent = 'Edit Note';
        form.noteTitle.value = note.title;
        form.noteContent.value = note.content;
        form.noteSubject.value = note.subjectId || '';
        form.notePinned.checked = !!note.isPinned;
      }
    } else {
      modalTitle.textContent = 'Create New Note';
      form.reset();
      form.notePinned.checked = false;
    }

    App.openModal('noteModal');
  },

  saveNoteFromForm() {
    const form = document.getElementById('noteForm');
    const title = form.noteTitle.value.trim();
    const content = form.noteContent.value.trim();
    const subjectId = form.noteSubject.value;
    const isPinned = form.notePinned.checked;

    if (!title) {
      App.showToast('Please enter a note title', 'warning');
      return;
    }

    const notes = Storage.getNotes();
    const todayStr = new Date().toISOString().split('T')[0];

    if (this.editingNoteId) {
      const note = notes.find(n => n.id === this.editingNoteId);
      if (note) {
        note.title = title;
        note.content = content;
        note.subjectId = subjectId;
        note.isPinned = isPinned;
        note.updatedAt = todayStr;
      }
      App.showToast('Note updated successfully', 'success');
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        title,
        content,
        subjectId,
        isPinned,
        color: '#6366f1',
        createdAt: todayStr,
        updatedAt: todayStr
      };
      notes.unshift(newNote);
      App.showToast('Note saved! 📝', 'success');
    }

    Storage.saveNotes(notes);
    App.closeModal('noteModal');
    this.renderNotes();
    App.renderDashboardNotes();
  },

  deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    let notes = Storage.getNotes();
    notes = notes.filter(n => n.id !== noteId);
    Storage.saveNotes(notes);

    this.renderNotes();
    App.renderDashboardNotes();
    App.showToast('Note deleted', 'info');
  }
};
