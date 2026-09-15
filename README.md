# 🎓 StudySync

<div align="center">

  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/LocalStorage-000000?style=for-the-badge&logo=json&logoColor=white" alt="LocalStorage" />
  <img src="https://img.shields.io/badge/License-MIT-green.style=for-the-badge" alt="License" />

  <br /><br />

  **"Plan smarter. Study better. Stay ahead."**
  
  *A modern, responsive, all-in-one student productivity suite built with vanilla web technologies.*

  <br />

  [Explore Features](#-key-features) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Data Persistence](#-data-storage--persistence)

</div>

---

## 📖 Overview

**StudySync** is a student-centric productivity web application designed specifically for college students to organize their academic life in one unified workspace.

From tracking assignments and reviewing class timetables to logging Pomodoro study sessions and viewing productivity analytics, StudySync demonstrates strong frontend fundamentals using **pure HTML5, CSS3, and modern Vanilla JavaScript** with **zero heavy frameworks or external backend dependencies**.

---

## ✨ Key Features

### 1. 📊 Interactive Dashboard
* **Dynamic Time Greeting**: Context-aware greetings (*"Good morning / afternoon / evening"*) with live calendar formatting.
* **Quick Statistic Cards**: Live metrics for today's study hours, active tasks completed (`8/10`), study streak counter (`12 days`), and overall progress percentage.
* **Radial Focus Gauge**: Circular SVG progress ring tracking daily focus goal completion.
* **Today's Priorities**: Interactive task checklist with instant check-off support.
* **Upcoming Classes Widget**: Color-coded lecture schedule for the current day.

### 2. 📝 Full Task Manager
* **CRUD Operations**: Create, edit, delete, and mark tasks as completed.
* **Priority Tagging**: Distinctive color badges for *High*, *Medium*, and *Low* priority tasks.
* **Instant Filtering**: Filter by *All*, *Pending*, *Completed*, or *High Priority*.
* **Real-Time Search**: Search across task titles, descriptions, and subject tags.
* **Dynamic Sync**: Task completions automatically recalculate dashboard and analytics metrics.

### 3. 📅 Weekly College Timetable
* **Day Selector Navigation**: Monday → Sunday schedule pills with automatic `TODAY` indicator.
* **Detailed Schedule Cards**: Subject code, start/end times, room/hall locations, and professor names.
* **Custom Scheduling**: Easily add or modify classes via the modal interface.

### 4. ⏱️ Pomodoro Focus Timer
* **Interactive Mode Switcher**: Vibrant toggle between **Focus** (<i class="fa-solid fa-brain"></i>) and **Break** (<i class="fa-solid fa-mug-hot"></i>) modes with glowing gradient states.
* **Custom Duration Controls**: Stepper buttons (`-` / `+`) and direct numeric input to set any custom duration (1 to 180 minutes).
* **SVG Radial Countdown**: Animated circular stroke progress ring with clean monospace digits.
* **Synthesized Audio Chimes**: Gentle audio alerts upon session completion synthesized via the browser's Web Audio API.
* **Subject Tagging & Auto-Logger**: Automatically attributes studied minutes to the selected subject and records logs for analytics.

### 5. 🎓 Subject & Course Catalog
* **Progress Tracking**: Visual progress bars calculated from target semester hours vs. actual studied hours.
* **Assignment Overview**: Tracks completed vs. pending tasks per subject and alerts you of your next due assignment.
* **Subject Management**: Add or edit subjects with custom color tags, course codes, and target hours.

### 6. 📌 Study Notes Manager
* **Masonry Card Grid**: Clean card layout displaying titles, subject tags, and preview text.
* **Pin to Top**: Pin important notes, cheat sheets, or formulas to stay at the top.
* **Keyword Search & Filter**: Instant search by keywords or filter by academic subject.

### 7. 📈 Study Analytics & Heatmap
* **Weekly Study Hours Bar Chart**: Interactive custom SVG bar chart with daily hours and tooltips (Mon–Sun).
* **Subject Distribution**: Visual breakdown of total study time spent across each subject.
* **Task Velocity**: Completion rate metrics and active task breakdown.
* **28-Day Activity Heatmap**: GitHub-style activity grid visualizing daily study intensity.

### 8. 🌓 Theme Engine & Settings
* **Dark & Light Mode**: Smooth transition between sleek dark mode and high-contrast light mode.
* **Profile Customization**: Update your name, major, and daily study target.
* **Backup & Restore**: Export full workspace data as a JSON file or restore from a previous backup.
* **Sample Data Reset**: One-click reset to preloaded student sample data.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5 (Semantic Structure)
* **Styling**: Vanilla CSS3 (Custom Design System, Flexbox, CSS Grid, CSS Variables)
* **Logic**: Vanilla JavaScript (ES6+ Modules, Clean Architecture)
* **Storage**: Browser HTML5 `LocalStorage` API (100% Client-Side & Offline Ready)
* **Audio**: Native `Web Audio API` (Synthesized chimes with zero external audio assets)
* **Icons & Fonts**: Font Awesome 6.5 & Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*)

---

## 🚀 Getting Started

StudySync requires **no build tools, no node_modules, and no installation**. You can run it instantly in any modern web browser.

### Quick Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anik-et20/StudySync.git
   cd StudySync
   ```

2. **Open in Browser**:
   * **Directly**: Double-click `index.html` to open it in your browser.
   * **Via a local server (Optional)**:
     ```bash
     # Using Python
     python -m http.server 8080

     # Using Node / npx
     npx serve .
     ```
   * Open your browser and navigate to `http://localhost:8080`.

---

## 📁 Project Structure

```
StudySync/
│
├── index.html                 # Main application structure & semantic views
├── README.md                  # Project documentation & guides
│
├── css/
│   ├── style.css              # Design tokens, variables, typography, navigation & dark/light themes
│   └── components.css         # Component-specific styles (cards, timer, charts, modals, toasts)
│
└── js/
    ├── storage.js             # LocalStorage manager, schema validation & sample seed data
    ├── tasks.js               # Task CRUD, filters, priority tagging & search
    ├── timetable.js           # Weekly timetable, day switcher & class scheduling
    ├── timer.js               # Pomodoro radial timer, custom durations & study logging
    ├── subjects.js            # Subject catalog, progress tracking & target hours
    ├── notes.js               # Notes manager, pinning & subject filtering
    ├── analytics.js           # SVG study charts, velocity metrics & streak heatmap
    └── app.js                 # App orchestrator, view routing, greetings & toasts
```

---

## 💾 Data Storage & Persistence

All application state is saved locally in your browser using **HTML5 LocalStorage**:

| Key | Description |
| :--- | :--- |
| `studysync_tasks` | Task items, priorities, due dates, and completion states |
| `studysync_notes` | Notes content, pinned statuses, and creation timestamps |
| `studysync_timetable` | Weekly college schedule, lecture timings, and classrooms |
| `studysync_subjects` | Course catalog, target study hours, and color tags |
| `studysync_study_logs` | Study session logs powering analytics and weekly charts |
| `studysync_user` | Student profile details (*Name, Major, Daily Goal, Streak*) |
| `studysync_settings` | Theme mode (*Dark/Light*), timer preferences, and audio settings |
| `studysync_pomo_stats` | Completed focus sessions count and total study hours |

---

## 💡 Keyboard Shortcuts

* <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>⌘</kbd> + <kbd>K</kbd> : Quick focus global search bar.
* <kbd>Esc</kbd> : Close any open modal dialog.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with ❤️ for students worldwide • <b>StudySync</b>
</div>
