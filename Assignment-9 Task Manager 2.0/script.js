(function () {
    'use strict';

    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    const cardLinks = document.querySelectorAll('.card-link[data-section]');
    const backBtns = document.querySelectorAll('.back-btn[data-section]');
    let currentSection = 'dashboard';
    let navigating = false;

    function navigateTo(section) {
        if (navigating || section === currentSection) return;
        navigating = true;

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });

        views.forEach(view => {
            view.classList.remove('active');
        });
        const targetView = document.getElementById('view-' + section);
        if (targetView) {
            targetView.classList.add('active');
        }

        currentSection = section;

        if (section === 'dashboard') {
            updateDashboardProgress();
            renderGoalsPreview();
            renderPlannerPreview();
            renderDashboardTasks();
        }

        setTimeout(() => { navigating = false; }, 300);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.section);
        });
    });

    cardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.section);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.section);
        });
    });

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    function loadData(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    const dateTextEl = document.getElementById('date-text');
    const timeTextEl = document.getElementById('time-text');
    const greetingEl = document.getElementById('greeting-text');

    function updateDateTime() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const dayName = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();

        dateTextEl.textContent = `${dayName}, ${date} ${month} ${year}`;

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const hoursStr = String(hours).padStart(2, '0');
        timeTextEl.textContent = `${hoursStr}:${minutes} ${ampm}`;

        const hour = now.getHours();
        let greeting = 'Good Evening';
        if (hour >= 5 && hour < 12) greeting = 'Good Morning';
        else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
        else greeting = 'Good Evening';

        greetingEl.textContent = `${greeting}! 👋`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    function updateDynamicBackground() {
        const hour = new Date().getHours();
        document.body.classList.remove('time-morning', 'time-afternoon', 'time-evening', 'time-night');

        if (hour >= 5 && hour < 12) {
            document.body.classList.add('time-morning');
        } else if (hour >= 12 && hour < 17) {
            document.body.classList.add('time-afternoon');
        } else if (hour >= 17 && hour < 21) {
            document.body.classList.add('time-evening');
        } else {
            document.body.classList.add('time-night');
        }
    }

    updateDynamicBackground();
    setInterval(updateDynamicBackground, 60000);

    const themeCheckbox = document.getElementById('theme-checkbox');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeCheckbox.checked = theme === 'light';
        saveData('theme', theme);
    }

    const savedTheme = loadData('theme', 'dark');
    applyTheme(savedTheme);

    themeCheckbox.addEventListener('change', () => {
        applyTheme(themeCheckbox.checked ? 'light' : 'dark');
    });

    const demoTodos = [
        { id: 'demo1', text: 'Complete JavaScript assignment', category: 'Study', completed: true, important: true, date: new Date().toISOString() },
        { id: 'demo2', text: 'Review pull request for team project', category: 'Work', completed: true, important: false, date: new Date().toISOString() },
        { id: 'demo3', text: 'Go for a 30-minute morning jog', category: 'Health', completed: true, important: false, date: new Date().toISOString() },
        { id: 'demo4', text: 'Read Chapter 5 of Data Structures book', category: 'Study', completed: false, important: true, date: new Date().toISOString() },
        { id: 'demo5', text: 'Prepare presentation slides for Monday', category: 'Work', completed: false, important: true, date: new Date().toISOString() },
        { id: 'demo6', text: 'Buy groceries and meal prep', category: 'Personal', completed: false, important: false, date: new Date().toISOString() },
        { id: 'demo7', text: 'Practice React hooks with mini project', category: 'Study', completed: false, important: false, date: new Date().toISOString() },
        { id: 'demo8', text: 'Drink 8 glasses of water today', category: 'Health', completed: true, important: false, date: new Date().toISOString() }
    ];
    let todos = loadData('todos', demoTodos);
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');
    const dashboardTaskList = document.getElementById('dashboard-task-list');
    const quickAddTaskBtn = document.getElementById('quick-add-task-btn');

    let todoFilter = 'all';
    let dashboardFilter = 'all';

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function getRelativeDate(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(dateStr);
        taskDate.setHours(0, 0, 0, 0);

        const diff = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[taskDate.getMonth()]} ${taskDate.getDate()}`;
    }

    function filterTodos(filter, list) {
        if (filter === 'completed') return list.filter(t => t.completed);
        if (filter === 'pending') return list.filter(t => !t.completed);
        if (filter === 'important') return list.filter(t => t.important);
        return list;
    }

    function createTaskHTML(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        li.innerHTML = `
            <div class="task-check ${task.completed ? 'checked' : ''}" data-action="toggle">
                ${task.completed ? '<i class="ri-check-line"></i>' : ''}
            </div>
            <div class="task-star ${task.important ? 'important' : ''}" data-action="star">
                <i class="${task.important ? 'ri-star-fill' : 'ri-star-line'}"></i>
            </div>
            <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHTML(task.text)}</span>
            <span class="task-category ${task.category}">${task.category}</span>
            <span class="task-date">${getRelativeDate(task.date)}</span>
            <div class="task-actions">
                <button class="task-action-btn" data-action="edit" title="Edit"><i class="ri-edit-line"></i></button>
                <button class="task-action-btn delete" data-action="delete" title="Delete"><i class="ri-delete-bin-line"></i></button>
            </div>
        `;
        return li;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderTodoList() {
        const filtered = filterTodos(todoFilter, todos);
        todoList.innerHTML = '';
        if (filtered.length === 0) {
            todoList.innerHTML = '<li class="task-empty"><i class="ri-inbox-line" style="font-size:32px;display:block;margin-bottom:8px"></i>No tasks found</li>';
            return;
        }
        filtered.forEach(task => {
            todoList.appendChild(createTaskHTML(task));
        });
    }

    function renderDashboardTasks() {
        const filtered = filterTodos(dashboardFilter, todos);
        dashboardTaskList.innerHTML = '';
        const show = filtered.slice(0, 5);
        if (show.length === 0) {
            dashboardTaskList.innerHTML = '<li class="task-empty"><i class="ri-inbox-line" style="font-size:32px;display:block;margin-bottom:8px"></i>No tasks yet. Add your first task!</li>';
            return;
        }
        show.forEach(task => {
            dashboardTaskList.appendChild(createTaskHTML(task));
        });
    }

    function addTodo(text, category = 'Personal') {
        if (!text.trim()) return;
        const task = {
            id: generateId(),
            text: text.trim(),
            category: category,
            completed: false,
            important: false,
            date: new Date().toISOString()
        };
        todos.unshift(task);
        saveTodos();
        renderTodoList();
        renderDashboardTasks();
        updateDashboardProgress();
    }

    function saveTodos() {
        saveData('todos', todos);
    }

    function handleTaskAction(e) {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;

        const taskItem = actionEl.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;
        const task = todos.find(t => t.id === taskId);
        if (!task) return;

        const action = actionEl.dataset.action;

        if (action === 'toggle') {
            task.completed = !task.completed;
        } else if (action === 'star') {
            task.important = !task.important;
        } else if (action === 'delete') {
            todos = todos.filter(t => t.id !== taskId);
            taskItem.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => {
                saveTodos();
                renderTodoList();
                renderDashboardTasks();
                updateDashboardProgress();
            }, 200);
            return;
        } else if (action === 'edit') {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim()) {
                task.text = newText.trim();
            }
        }

        saveTodos();
        renderTodoList();
        renderDashboardTasks();
        updateDashboardProgress();
    }

    todoList.addEventListener('click', handleTaskAction);
    dashboardTaskList.addEventListener('click', handleTaskAction);

    addTodoBtn.addEventListener('click', () => {
        const category = document.getElementById('todo-category').value;
        addTodo(todoInput.value, category);
        todoInput.value = '';
        todoInput.focus();
    });

    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const category = document.getElementById('todo-category').value;
            addTodo(todoInput.value, category);
            todoInput.value = '';
        }
    });

    document.querySelector('.todo-filters').addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.todo-filters .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            todoFilter = e.target.dataset.filter;
            renderTodoList();
        }
    });

    document.getElementById('task-filters').addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('#task-filters .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            dashboardFilter = e.target.dataset.filter;
            renderDashboardTasks();
        }
    });

    quickAddTaskBtn.addEventListener('click', () => {
        showQuickAddModal();
    });

    function showQuickAddModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <h3><i class="ri-add-circle-line"></i> Add New Task</h3>
                <div class="modal-input-group">
                    <input type="text" id="modal-task-input" placeholder="What do you need to do?" autocomplete="off">
                    <select id="modal-task-category">
                        <option value="Personal">Personal</option>
                        <option value="Work">Work</option>
                        <option value="Study">Study</option>
                        <option value="Health">Health</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" id="modal-cancel">Cancel</button>
                    <button class="btn-primary" id="modal-add">Add Task</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('modal-task-input');
        input.focus();

        document.getElementById('modal-add').addEventListener('click', () => {
            const category = document.getElementById('modal-task-category').value;
            addTodo(input.value, category);
            overlay.remove();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            overlay.remove();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const category = document.getElementById('modal-task-category').value;
                addTodo(input.value, category);
                overlay.remove();
            }
            if (e.key === 'Escape') overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    function updateDashboardProgress() {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const pending = total - completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('stat-completed').textContent = completed;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-total').textContent = total;

        const percentEl = document.querySelector('.percent-num');
        percentEl.textContent = percent;

        const ring = document.getElementById('progress-ring-fill');
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (percent / 100) * circumference;
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
    }

    const demoPlanner = {
        7: { text: 'Morning jog & stretching', category: 'Health' },
        9: { text: 'Data Structures lecture', category: 'Study' },
        11: { text: 'JavaScript assignment work', category: 'Study' },
        13: { text: 'Lunch break & rest', category: 'Personal' },
        15: { text: 'Team project meeting', category: 'Work' },
        17: { text: 'React hooks practice', category: 'Practice' },
        20: { text: 'Read & unwind', category: 'Personal' }
    };
    let plannerData = loadData('planner', demoPlanner);
    const plannerContainer = document.getElementById('planner-container');

    function generateTimeSlots() {
        const slots = [];
        for (let h = 6; h <= 22; h++) {
            const hour12 = h % 12 || 12;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const timeStr = `${String(hour12).padStart(2, '0')}:00 ${ampm}`;
            slots.push({ hour: h, label: timeStr });
        }
        return slots;
    }

    function renderPlanner() {
        const slots = generateTimeSlots();
        const currentHour = new Date().getHours();
        plannerContainer.innerHTML = '';

        slots.forEach(slot => {
            const div = document.createElement('div');
            div.className = 'planner-slot' + (slot.hour === currentHour ? ' current-hour' : '');
            const savedEntry = plannerData[slot.hour] || {};
            div.innerHTML = `
                <span class="planner-slot-time">${slot.label}</span>
                <input type="text" class="planner-slot-input" placeholder="Add plan..." value="${escapeHTML(savedEntry.text || '')}" data-hour="${slot.hour}">
                <select class="planner-slot-category" data-hour="${slot.hour}">
                    <option value="Study" ${savedEntry.category === 'Study' ? 'selected' : ''}>Study</option>
                    <option value="Work" ${savedEntry.category === 'Work' ? 'selected' : ''}>Work</option>
                    <option value="Personal" ${savedEntry.category === 'Personal' ? 'selected' : ''}>Personal</option>
                    <option value="Health" ${savedEntry.category === 'Health' ? 'selected' : ''}>Health</option>
                    <option value="Practice" ${savedEntry.category === 'Practice' ? 'selected' : ''}>Practice</option>
                </select>
            `;
            plannerContainer.appendChild(div);
        });

        plannerContainer.querySelectorAll('.planner-slot-input').forEach(input => {
            input.addEventListener('blur', () => {
                const hour = parseInt(input.dataset.hour);
                const category = plannerContainer.querySelector(`.planner-slot-category[data-hour="${hour}"]`).value;
                if (input.value.trim()) {
                    plannerData[hour] = { text: input.value.trim(), category: category };
                } else {
                    delete plannerData[hour];
                }
                saveData('planner', plannerData);
                renderPlannerPreview();
            });
        });

        plannerContainer.querySelectorAll('.planner-slot-category').forEach(select => {
            select.addEventListener('change', () => {
                const hour = parseInt(select.dataset.hour);
                const input = plannerContainer.querySelector(`.planner-slot-input[data-hour="${hour}"]`);
                if (input.value.trim()) {
                    plannerData[hour] = { text: input.value.trim(), category: select.value };
                    saveData('planner', plannerData);
                    renderPlannerPreview();
                }
            });
        });
    }

    function renderPlannerPreview() {
        const previewList = document.getElementById('planner-preview-list');
        const entries = Object.entries(plannerData).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        const currentHour = new Date().getHours();

        const upcoming = entries.filter(([hour]) => parseInt(hour) >= currentHour).slice(0, 4);

        if (upcoming.length === 0) {
            previewList.innerHTML = '<li class="empty-state"><i class="ri-add-circle-line"></i> Plan your day</li>';
            return;
        }

        const dotColors = ['purple', 'green', 'orange', 'red'];
        const categoryMap = { Study: 'study', Work: 'work', Personal: 'personal', Health: 'health', Practice: 'practice' };

        previewList.innerHTML = upcoming.map(([hour, entry], i) => {
            const h = parseInt(hour);
            const hour12 = h % 12 || 12;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const timeStr = `${String(hour12).padStart(2, '0')}:00 ${ampm}`;
            const cat = categoryMap[entry.category] || 'study';
            return `
                <li>
                    <span class="planner-dot ${dotColors[i % 4]}"></span>
                    <span class="planner-time">${timeStr}</span>
                    <span class="planner-text">${escapeHTML(entry.text)}</span>
                    <span class="planner-tag ${cat}">${entry.category}</span>
                </li>
            `;
        }).join('');
    }

    renderPlanner();
    renderPlannerPreview();

    const demoGoals = [
        { id: 'goal1', text: 'Complete all pending assignments', completed: true },
        { id: 'goal2', text: 'Exercise for at least 30 minutes', completed: true },
        { id: 'goal3', text: 'Learn a new JavaScript concept', completed: false },
        { id: 'goal4', text: 'Read 20 pages of a book', completed: false },
        { id: 'goal5', text: 'No social media before 6 PM', completed: true }
    ];
    let goals = loadData('goals', demoGoals);
    const goalInput = document.getElementById('goal-input');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const goalList = document.getElementById('goal-list');

    function renderGoals() {
        goalList.innerHTML = '';
        if (goals.length === 0) {
            goalList.innerHTML = '<li class="task-empty"><i class="ri-flag-line" style="font-size:32px;display:block;margin-bottom:8px"></i>No goals set. Add your first goal!</li>';
        } else {
            goals.forEach(goal => {
                const li = document.createElement('li');
                li.className = 'goal-item';
                li.dataset.id = goal.id;
                li.innerHTML = `
                    <div class="goal-check ${goal.completed ? 'checked' : ''}" data-action="toggle-goal">
                        ${goal.completed ? '<i class="ri-check-line"></i>' : ''}
                    </div>
                    <span class="goal-text ${goal.completed ? 'completed' : ''}">${escapeHTML(goal.text)}</span>
                    <button class="goal-delete" data-action="delete-goal"><i class="ri-delete-bin-line"></i></button>
                `;
                goalList.appendChild(li);
            });
        }
        updateGoalsProgress();
        renderGoalsPreview();
    }

    function updateGoalsProgress() {
        const total = goals.length;
        const completed = goals.filter(g => g.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('goals-progress-text').textContent = `${completed} of ${total} completed`;
        document.getElementById('goals-progress-percent').textContent = `${percent}%`;
        document.getElementById('goals-progress-fill').style.width = `${percent}%`;
        document.getElementById('goals-count-badge').textContent = `${completed}/${total} Completed`;
    }

    function renderGoalsPreview() {
        const previewList = document.getElementById('goals-preview-list');
        if (goals.length === 0) {
            previewList.innerHTML = '<li class="empty-state"><i class="ri-add-circle-line"></i> Add your first goal</li>';
            return;
        }

        previewList.innerHTML = goals.slice(0, 4).map(goal => `
            <li>
                <div class="goal-checkbox ${goal.completed ? 'checked' : ''}">${goal.completed ? '<i class="ri-check-line"></i>' : ''}</div>
                <span class="goal-text ${goal.completed ? 'completed' : ''}">${escapeHTML(goal.text)}</span>
            </li>
        `).join('');
    }

    addGoalBtn.addEventListener('click', () => {
        if (!goalInput.value.trim()) return;
        goals.push({ id: generateId(), text: goalInput.value.trim(), completed: false });
        saveData('goals', goals);
        goalInput.value = '';
        goalInput.focus();
        renderGoals();
    });

    goalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addGoalBtn.click();
        }
    });

    goalList.addEventListener('click', (e) => {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;
        const item = actionEl.closest('.goal-item');
        if (!item) return;
        const goalId = item.dataset.id;
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        if (actionEl.dataset.action === 'toggle-goal') {
            goal.completed = !goal.completed;
        } else if (actionEl.dataset.action === 'delete-goal') {
            goals = goals.filter(g => g.id !== goalId);
        }

        saveData('goals', goals);
        renderGoals();
    });

    renderGoals();

    const pomoTimeEl = document.getElementById('pomo-time');
    const pomoRingFill = document.getElementById('pomo-ring-fill');
    const pomoSessionLabel = document.getElementById('pomo-session-label');
    const pomoStartBtn = document.getElementById('pomo-start');
    const pomoPauseBtn = document.getElementById('pomo-pause');
    const pomoResetBtn = document.getElementById('pomo-reset');
    const pomoWorkInput = document.getElementById('pomo-work-mins');
    const pomoBreakInput = document.getElementById('pomo-break-mins');

    let pomoInterval = null;
    let pomoTimeLeft = 25 * 60;
    let pomoTotalTime = 25 * 60;
    let pomoIsWork = true;
    let pomoRunning = false;

    const POMO_CIRCUMFERENCE = 2 * Math.PI * 90;

    function formatPomoTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updatePomoDisplay() {
        pomoTimeEl.textContent = formatPomoTime(pomoTimeLeft);
        const progress = 1 - (pomoTimeLeft / pomoTotalTime);
        const offset = POMO_CIRCUMFERENCE * (1 - progress);
        pomoRingFill.style.strokeDasharray = POMO_CIRCUMFERENCE;
        pomoRingFill.style.strokeDashoffset = offset;

        if (pomoIsWork) {
            pomoRingFill.style.stroke = 'var(--accent-primary)';
            pomoSessionLabel.textContent = 'Work Session';
        } else {
            pomoRingFill.style.stroke = 'var(--accent-secondary)';
            pomoSessionLabel.textContent = 'Break Time';
        }
    }

    function startPomo() {
        if (pomoRunning) return;
        pomoRunning = true;

        if (pomoInterval) clearInterval(pomoInterval);

        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            updatePomoDisplay();

            if (pomoTimeLeft <= 0) {
                clearInterval(pomoInterval);
                pomoInterval = null;
                pomoRunning = false;

                if (pomoIsWork) {
                    alert('🎉 Work session complete! Time for a break.');
                    pomoIsWork = false;
                    pomoTotalTime = parseInt(pomoBreakInput.value) * 60;
                } else {
                    alert('⏰ Break is over! Ready to focus again?');
                    pomoIsWork = true;
                    pomoTotalTime = parseInt(pomoWorkInput.value) * 60;
                }
                pomoTimeLeft = pomoTotalTime;
                updatePomoDisplay();
            }
        }, 1000);
    }

    function pausePomo() {
        if (pomoInterval) {
            clearInterval(pomoInterval);
            pomoInterval = null;
        }
        pomoRunning = false;
    }

    function resetPomo() {
        pausePomo();
        pomoIsWork = true;
        pomoTotalTime = parseInt(pomoWorkInput.value) * 60;
        pomoTimeLeft = pomoTotalTime;
        updatePomoDisplay();
    }

    pomoStartBtn.addEventListener('click', startPomo);
    pomoPauseBtn.addEventListener('click', pausePomo);
    pomoResetBtn.addEventListener('click', resetPomo);

    pomoWorkInput.addEventListener('change', () => {
        if (!pomoRunning && pomoIsWork) {
            pomoTotalTime = parseInt(pomoWorkInput.value) * 60;
            pomoTimeLeft = pomoTotalTime;
            updatePomoDisplay();
        }
    });

    pomoBreakInput.addEventListener('change', () => {
        if (!pomoRunning && !pomoIsWork) {
            pomoTotalTime = parseInt(pomoBreakInput.value) * 60;
            pomoTimeLeft = pomoTotalTime;
            updatePomoDisplay();
        }
    });

    updatePomoDisplay();

    const dashboardQuoteText = document.getElementById('dashboard-quote-text');
    const dashboardQuoteAuthor = document.getElementById('dashboard-quote-author');
    const motivationQuoteText = document.getElementById('motivation-quote-text');
    const motivationQuoteAuthor = document.getElementById('motivation-quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const quoteLoader = document.getElementById('quote-loader');

    const fallbackQuotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "Your limitation—it's only your imagination.", author: "Unknown" },
        { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
        { text: "Great things never come from comfort zones.", author: "Unknown" },
        { text: "Dream it. Wish it. Do it.", author: "Unknown" },
        { text: "Stay focused and never give up.", author: "Unknown" },
        { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
        { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" }
    ];

    function setQuote(quote) {
        const text = `"${quote.text}"`;
        const author = `— ${quote.author || 'Unknown'}`;
        dashboardQuoteText.textContent = text;
        dashboardQuoteAuthor.textContent = author;
        motivationQuoteText.textContent = text;
        motivationQuoteAuthor.textContent = author;
    }

    async function fetchNewQuote() {
        quoteLoader.classList.remove('hidden');
        try {
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            setQuote({ text: data.content, author: data.author });
        } catch (e) {
            const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            setQuote(randomQuote);
        } finally {
            quoteLoader.classList.add('hidden');
        }
    }

    newQuoteBtn.addEventListener('click', fetchNewQuote);

    const randomInitial = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    setQuote(randomInitial);

    const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366';
    const weatherLoading = document.getElementById('weather-loading');
    const weatherContent = document.getElementById('weather-content');
    const weatherError = document.getElementById('weather-error');
    const weatherSearchBtn = document.getElementById('weather-search-btn');
    const weatherSearchInput = document.getElementById('weather-search-input');
    const weatherRetryBtn = document.getElementById('weather-retry-btn');

    const weatherIcons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '🌨️', '13n': '🌨️',
        '50d': '🌫️', '50n': '🌫️',
    };

    function showWeatherData(data) {
        weatherLoading.classList.add('hidden');
        weatherError.classList.add('hidden');
        weatherContent.classList.remove('hidden');

        document.getElementById('weather-city').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('weather-temp').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('weather-desc').textContent = data.weather[0].description;
        document.getElementById('weather-humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('weather-wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        document.getElementById('weather-feels').textContent = `${Math.round(data.main.feels_like)}°C`;
        document.getElementById('weather-visibility').textContent = `${Math.round((data.visibility || 10000) / 1000)} km`;

        const iconCode = data.weather[0].icon;
        document.getElementById('weather-icon-big').textContent = weatherIcons[iconCode] || '🌤️';
    }

    function showWeatherError() {
        weatherLoading.classList.add('hidden');
        weatherContent.classList.add('hidden');
        weatherError.classList.remove('hidden');
    }

    async function fetchWeather(query) {
        weatherLoading.classList.remove('hidden');
        weatherContent.classList.add('hidden');
        weatherError.classList.add('hidden');

        try {
            let url;
            if (typeof query === 'string') {
                url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${WEATHER_API_KEY}`;
            } else {
                url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${WEATHER_API_KEY}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather API error');
            const data = await response.json();
            showWeatherData(data);
        } catch (e) {
            showWeatherError();
        }
    }

    function initWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                },
                () => {
                    fetchWeather('New Delhi');
                }
            );
        } else {
            fetchWeather('New Delhi');
        }
    }

    weatherSearchBtn.addEventListener('click', () => {
        const city = weatherSearchInput.value.trim();
        if (city) fetchWeather(city);
    });

    weatherSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = weatherSearchInput.value.trim();
            if (city) fetchWeather(city);
        }
    });

    weatherRetryBtn.addEventListener('click', initWeather);

    initWeather();

    renderTodoList();
    renderDashboardTasks();
    updateDashboardProgress();

})();
