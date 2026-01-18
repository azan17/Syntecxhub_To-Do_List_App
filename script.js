document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const pendingCount = document.getElementById('pending-count');
    const clearBtn = document.getElementById('clear-all');
    const dateDisplay = document.getElementById('date-display');

    // App State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- Initialization ---

    // Set Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Initial Render
    renderTasks();

    // --- Event Listeners ---

    addBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveAndRender();
        }
    });

    // --- core Functions ---

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.unshift(newTask); // Add to top
        taskInput.value = '';
        saveAndRender();
        taskInput.focus();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveAndRender();
    }

    function deleteTask(id) {
        // Find element to animate removal
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateX(20px)';
        }

        // Wait for animation
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveAndRender();
        }, 300);
    }

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';

        // Show/Hide Empty State
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
            clearBtn.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            clearBtn.style.display = 'inline-block';
        }

        // Update Pending Count
        const pending = tasks.filter(t => !t.completed).length;
        pendingCount.textContent = `${pending} task${pending !== 1 ? 's' : ''} pending`;

        // Render List
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            li.innerHTML = `
                <div class="task-content">
                    <div class="check-circle"></div>
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete Task">
                    🗑️
                </button>
            `;

            // Event Delegation for this item
            const taskContent = li.querySelector('.task-content');
            taskContent.addEventListener('click', () => toggleTask(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent toggling when deleting
                deleteTask(task.id);
            });

            taskList.appendChild(li);
        });
    }

    // Helper to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
