let tasks = [];
let taskIdCounter = 1;
let currentCalendarDate = new Date();

const taskTitleInput = document.getElementById('task-title-input');
const taskCategorySelect = document.getElementById('task-category-select');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const themeCheckbox = document.getElementById('theme-checkbox');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    renderCalendar();
    setupTheme();
    renderTasks();
    updateSummary();
    setupEventPropagation();

    console.log('=== Attributes vs Properties Demo ===');
    console.log('Initial getAttribute("value"):', taskTitleInput.getAttribute('value'));
    console.log('Initial .value property:', taskTitleInput.value);
    console.log('They start the same but diverge when user types!');
    console.log('Try typing in the task input, then run in console:');
    console.log('  document.getElementById("task-title-input").value');
    console.log('  document.getElementById("task-title-input").getAttribute("value")');
    console.log('=====================================');
});

function setupTheme() {
    const savedTheme = localStorage.getItem('task-manager-theme') || 'light';
    applyTheme(savedTheme);

    themeCheckbox.addEventListener('change', function () {
        const newTheme = this.checked ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('task-manager-theme', newTheme);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Current theme (via dataset):', document.documentElement.dataset.theme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add('theme-' + theme);
    themeCheckbox.checked = (theme === 'light');
}

addTaskBtn.addEventListener('click', function () {
    addTask();
});

taskTitleInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;

    if (!title) {
        showToast('Please enter a task title!', 'error');
        taskTitleInput.focus();
        return;
    }
    if (!category) {
        showToast('Please select a category!', 'warning');
        taskCategorySelect.focus();
        return;
    }

    console.log('=== Adding Task - Attributes vs Properties ===');
    console.log('input.value (Property - current):', taskTitleInput.value);
    console.log('input.getAttribute("value") (Attribute - initial):', taskTitleInput.getAttribute('value'));
    console.log('Notice: Property changed but Attribute stayed the same!');
    console.log('=============================================');

    const task = {
        id: taskIdCounter++,
        title: title,
        category: category,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveToLocalStorage();
    renderTasks();
    updateSummary();

    taskTitleInput.value = '';
    taskCategorySelect.value = '';
    taskTitleInput.focus();

    showToast('Task added successfully!', 'success');
}

function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const catFilter = filterCategory.value;
    const statusFilter = filterStatus.value;

    let filtered = tasks.filter(function (task) {
        const matchSearch = task.title.toLowerCase().includes(searchTerm);
        const matchCategory = (catFilter === 'all') || (task.category === catFilter);
        const matchStatus = (statusFilter === 'all') || (task.status === statusFilter);
        return matchSearch && matchCategory && matchStatus;
    });

    taskList.innerHTML = '';

    if (filtered.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty-state');

        const emptyIcon = document.createElement('div');
        emptyIcon.classList.add('empty-icon');
        const emptyIconText = document.createTextNode('📋');
        emptyIcon.appendChild(emptyIconText);

        const emptyMsg = document.createElement('p');
        const emptyMsgText = document.createTextNode(
            tasks.length === 0 ? 'No tasks yet!' : 'No tasks match your filters.'
        );
        emptyMsg.appendChild(emptyMsgText);

        const emptyHint = document.createElement('p');
        emptyHint.classList.add('empty-hint');
        const emptyHintText = document.createTextNode(
            tasks.length === 0 ? 'Add your first task above to get started.' : 'Try adjusting your search or filters.'
        );
        emptyHint.appendChild(emptyHintText);

        emptyDiv.appendChild(emptyIcon);
        emptyDiv.appendChild(emptyMsg);
        emptyDiv.appendChild(emptyHint);
        taskList.appendChild(emptyDiv);
        updateBadge(0);
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(function (task) {
        const card = createTaskCard(task);
        fragment.appendChild(card);
    });

    taskList.appendChild(fragment);
    updateBadge(filtered.length);
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.classList.add('task-card');
    if (task.status === 'completed') {
        card.classList.add('completed');
    }

    card.setAttribute('data-id', task.id);
    card.dataset.status = task.status;
    card.dataset.category = task.category;

    console.log('Task card has data-id?', card.hasAttribute('data-id'));

    const statusIndicator = document.createElement('div');
    statusIndicator.classList.add('task-status-indicator');
    statusIndicator.setAttribute('data-action', 'complete');
    const checkText = document.createTextNode(task.status === 'completed' ? '✓' : '');
    statusIndicator.appendChild(checkText);

    const taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    const taskTitle = document.createElement('div');
    taskTitle.classList.add('task-title');
    const titleText = document.createTextNode(task.title);
    taskTitle.appendChild(titleText);

    const taskMeta = document.createElement('div');
    taskMeta.classList.add('task-meta');
    const metaText = document.createTextNode(
        'data-id="' + card.getAttribute('data-id') + '"   ' +
        'data-category="' + card.getAttribute('data-category') + '"   ' +
        'data-status="' + card.getAttribute('data-status') + '"'
    );
    taskMeta.appendChild(metaText);

    taskInfo.append(taskTitle, taskMeta);

    const catBadge = document.createElement('span');
    catBadge.classList.add('task-category-badge', 'cat-' + task.category);
    const catText = document.createTextNode(task.category);
    catBadge.appendChild(catText);

    const statusBadge = document.createElement('span');
    statusBadge.classList.add('task-status-badge');
    statusBadge.classList.add(task.status === 'completed' ? 'status-completed' : 'status-pending');
    const statusText = document.createTextNode(task.status === 'completed' ? 'Completed' : 'Pending');
    statusBadge.appendChild(statusText);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('task-actions');

    const editBtn = document.createElement('button');
    editBtn.classList.add('task-action-btn', 'edit-btn');
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('title', 'Edit Task');
    editBtn.innerHTML = '✏️';

    const completeBtn = document.createElement('button');
    completeBtn.classList.add('task-action-btn', 'complete-btn');
    completeBtn.setAttribute('data-action', 'complete');
    completeBtn.setAttribute('title', 'Toggle Complete');
    completeBtn.innerHTML = '✅';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('task-action-btn', 'delete-btn');
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('title', 'Delete Task');
    deleteBtn.innerHTML = '🗑️';

    actionsDiv.append(editBtn, completeBtn, deleteBtn);

    card.appendChild(statusIndicator);
    card.appendChild(taskInfo);
    card.appendChild(catBadge);
    card.appendChild(statusBadge);
    card.appendChild(actionsDiv);

    return card;
}

taskList.addEventListener('click', function (event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-action');
    const card = actionEl.closest('.task-card');
    if (!card) return;

    const taskId = parseInt(card.getAttribute('data-id'));

    switch (action) {
        case 'edit':
            editTask(taskId, card);
            break;
        case 'complete':
            toggleComplete(taskId);
            break;
        case 'delete':
            deleteTask(taskId, card);
            break;
    }
});

function editTask(taskId, card) {
    const task = tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;

    const titleEl = card.querySelector('.task-title');

    if (card.querySelector('.task-edit-input')) return;

    const editInput = document.createElement('input');
    editInput.classList.add('task-edit-input');
    editInput.type = 'text';
    editInput.value = task.title;

    titleEl.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    function saveEdit() {
        const newTitle = editInput.value.trim();
        if (newTitle && newTitle !== task.title) {
            task.title = newTitle;
            saveToLocalStorage();
            showToast('Task updated!', 'success');
        }
        renderTasks();
    }

    editInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });

    editInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            renderTasks();
        }
    });

    editInput.addEventListener('blur', function () {
        saveEdit();
    });
}

function toggleComplete(taskId) {
    const task = tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;

    task.status = (task.status === 'completed') ? 'pending' : 'completed';

    const card = document.querySelector('[data-id="' + taskId + '"]');
    if (card) {
        card.removeAttribute('data-status');
        card.setAttribute('data-status', task.status);
    }

    saveToLocalStorage();
    renderTasks();
    updateSummary();

    showToast(
        task.status === 'completed' ? 'Task completed! 🎉' : 'Task marked as pending.',
        task.status === 'completed' ? 'success' : 'info'
    );
}

function deleteTask(taskId, card) {
    card.style.animation = 'slideOut 0.3s ease forwards';

    setTimeout(function () {
        card.remove();

        tasks = tasks.filter(function (t) { return t.id !== taskId; });
        saveToLocalStorage();
        renderTasks();
        updateSummary();
        showToast('Task deleted!', 'error');
    }, 300);
}

searchInput.addEventListener('input', function () {
    renderTasks();
});

filterCategory.addEventListener('change', function () {
    renderTasks();
});

filterStatus.addEventListener('change', function () {
    renderTasks();
});

clearCompletedBtn.addEventListener('click', function () {
    const completedCount = tasks.filter(function (t) { return t.status === 'completed'; }).length;
    if (completedCount === 0) {
        showToast('No completed tasks to clear.', 'info');
        return;
    }
    tasks = tasks.filter(function (t) { return t.status !== 'completed'; });
    saveToLocalStorage();
    renderTasks();
    updateSummary();
    showToast(completedCount + ' completed task(s) cleared!', 'success');
});

clearAllBtn.addEventListener('click', function () {
    if (tasks.length === 0) {
        showToast('No tasks to clear.', 'info');
        return;
    }
    if (confirm('Are you sure you want to clear ALL tasks?')) {
        tasks = [];
        saveToLocalStorage();
        renderTasks();
        updateSummary();
        showToast('All tasks cleared!', 'warning');
    }
});

function updateSummary() {
    const total = tasks.length;
    const completed = tasks.filter(function (t) { return t.status === 'completed'; }).length;
    const pending = total - completed;

    document.getElementById('task-summary-text').textContent = 'You have ' + total + ' task' + (total !== 1 ? 's' : '') + ' in total.';
    document.getElementById('task-summary-detail').textContent = completed + ' completed and ' + pending + ' pending.';
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('pending-count').textContent = pending;

    updateDonutChart(total, completed, pending);

    const compPct = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    const pendPct = total > 0 ? ((pending / total) * 100).toFixed(1) : 0;
    document.getElementById('donut-total').textContent = total;
    document.getElementById('legend-completed').textContent = completed + ' (' + compPct + '%)';
    document.getElementById('legend-pending').textContent = pending + ' (' + pendPct + '%)';
    document.getElementById('legend-total').textContent = total + ' (100%)';
}

function updateDonutChart(total, completed, pending) {
    const compCircle = document.getElementById('donut-completed');
    const pendCircle = document.getElementById('donut-pending');

    if (total === 0) {
        compCircle.setAttribute('stroke-dasharray', '0 100');
        pendCircle.setAttribute('stroke-dasharray', '0 100');
        return;
    }

    const compPct = (completed / total) * 100;
    const pendPct = (pending / total) * 100;

    compCircle.setAttribute('stroke-dasharray', compPct + ' ' + (100 - compPct));
    compCircle.setAttribute('stroke-dashoffset', '25');

    const pendOffset = 25 - compPct;
    pendCircle.setAttribute('stroke-dasharray', pendPct + ' ' + (100 - pendPct));
    pendCircle.setAttribute('stroke-dashoffset', pendOffset.toString());
}

function updateBadge(count) {
    document.getElementById('task-count-badge').textContent = count;
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    document.getElementById('calendar-month-year').textContent = monthNames[month] + ' ' + year;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    const today = new Date();

    for (let i = firstDay - 1; i >= 0; i--) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('cal-day', 'other-month');
        dayEl.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(dayEl);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('cal-day');
        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        dayEl.textContent = d;
        calendarDays.appendChild(dayEl);
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('cal-day', 'other-month');
        dayEl.textContent = i;
        calendarDays.appendChild(dayEl);
    }
}

document.getElementById('cal-prev').addEventListener('click', function () {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('cal-next').addEventListener('click', function () {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
});

function setupEventPropagation() {
    const grandparentBubble = document.getElementById('grandparent-bubble');
    const parentBubble = document.getElementById('parent-bubble');
    const childBubble = document.getElementById('child-bubble');

    grandparentBubble.addEventListener('click', function () {
        console.log('%c[BUBBLING] Grandparent clicked', 'color: #f59e0b; font-weight: bold');
        this.classList.add('prop-highlight');
        setTimeout(function () { grandparentBubble.classList.remove('prop-highlight'); }, 500);
    });

    parentBubble.addEventListener('click', function () {
        console.log('%c[BUBBLING] Parent clicked', 'color: #3b82f6; font-weight: bold');
        this.classList.add('prop-highlight');
        setTimeout(function () { parentBubble.classList.remove('prop-highlight'); }, 500);
    });

    childBubble.addEventListener('click', function () {
        console.log('%c[BUBBLING] Child clicked', 'color: #22c55e; font-weight: bold');
        console.log('%c  → Event bubbles: Child → Parent → Grandparent', 'color: #888');
        this.classList.add('prop-highlight');
        setTimeout(function () { childBubble.classList.remove('prop-highlight'); }, 500);
    });

    const grandparentCapture = document.getElementById('grandparent-capture');
    const parentCapture = document.getElementById('parent-capture');
    const childCapture = document.getElementById('child-capture');

    grandparentCapture.addEventListener('click', function () {
        console.log('%c[CAPTURING] Grandparent clicked', 'color: #f59e0b; font-weight: bold');
        this.classList.add('prop-highlight');
        setTimeout(function () { grandparentCapture.classList.remove('prop-highlight'); }, 500);
    }, true);

    parentCapture.addEventListener('click', function () {
        console.log('%c[CAPTURING] Parent clicked', 'color: #3b82f6; font-weight: bold');
        this.classList.add('prop-highlight');
        setTimeout(function () { parentCapture.classList.remove('prop-highlight'); }, 500);
    }, true);

    childCapture.addEventListener('click', function () {
        console.log('%c[CAPTURING] Child clicked', 'color: #22c55e; font-weight: bold');
        console.log('%c  → Event captures: Grandparent → Parent → Child', 'color: #888');
        this.classList.add('prop-highlight');
        setTimeout(function () { childCapture.classList.remove('prop-highlight'); }, 500);
    }, true);
}

function prependTaskNotice() {
    const notice = document.createElement('div');
    notice.classList.add('empty-state');
    notice.innerHTML = '<p style="color: var(--accent-primary);">📌 New task pinned to top!</p>';
    taskList.prepend(notice);
    setTimeout(function () { notice.remove(); }, 2000);
}

function insertBeforeDemo(referenceCard) {
    const divider = document.createElement('hr');
    divider.style.border = '1px dashed var(--accent-primary)';
    divider.style.margin = '4px 0';
    referenceCard.before(divider);
    setTimeout(function () { divider.remove(); }, 2000);
}

function insertAfterDemo(referenceCard) {
    const note = document.createElement('div');
    note.style.cssText = 'padding:8px;font-size:0.8rem;color:var(--accent-green);text-align:center;';
    note.textContent = '↑ Task above was modified';
    referenceCard.after(note);
    setTimeout(function () { note.remove(); }, 2000);
}

function saveToLocalStorage() {
    localStorage.setItem('task-manager-tasks', JSON.stringify(tasks));
    localStorage.setItem('task-manager-counter', taskIdCounter.toString());
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('task-manager-tasks');
    const savedCounter = localStorage.getItem('task-manager-counter');

    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (e) {
            tasks = [];
        }
    }

    if (savedCounter) {
        taskIdCounter = parseInt(savedCounter) || 1;
    }

    if (tasks.length === 0) {
        tasks = [
            { id: taskIdCounter++, title: 'Learn DOM Manipulation', category: 'Learning', status: 'pending', createdAt: new Date().toISOString() },
            { id: taskIdCounter++, title: 'Build Task Manager Project', category: 'Project', status: 'pending', createdAt: new Date().toISOString() },
            { id: taskIdCounter++, title: 'Complete JavaScript Course', category: 'Learning', status: 'completed', createdAt: new Date().toISOString() },
            { id: taskIdCounter++, title: 'Go to the Gym', category: 'Personal', status: 'completed', createdAt: new Date().toISOString() },
            { id: taskIdCounter++, title: 'Read 20 Pages of Book', category: 'Personal', status: 'pending', createdAt: new Date().toISOString() },
            { id: taskIdCounter++, title: 'Prepare for Interviews', category: 'Career', status: 'pending', createdAt: new Date().toISOString() }
        ];
        saveToLocalStorage();
    }
}

function showToast(message, type) {
    type = type || 'info';
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.classList.add('toast-container');
        document.body.appendChild(container);
    }

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.classList.add('toast', 'toast-' + type);

    const icon = document.createElement('span');
    icon.textContent = icons[type] || 'ℹ️';

    const text = document.createElement('span');
    text.textContent = message;

    toast.append(icon, text);
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add('toast-out');
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
}
