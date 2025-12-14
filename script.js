// script.js - foundational data model and persistence utilities for Colorful Todo

/**
 * Task class representing a single todo item.
 * @param {string|number} id - Unique identifier for the task.
 * @param {string} text - The description of the task.
 * @param {boolean} [completed=false] - Completion status.
 */
class Task {
  constructor(id, text, completed = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
  }
}

// Global task collection
let tasks = [];

// Current filter state (default to 'all')
let currentFilter = 'all';

// Key used for localStorage persistence
const STORAGE_KEY = 'colorfulTodoTasks';

/**
 * Load tasks from localStorage, parse them, and instantiate Task objects.
 * If no data exists or parsing fails, tasks will remain an empty array.
 */
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    tasks = [];
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    // Ensure we have an array; otherwise reset.
    if (!Array.isArray(parsed)) {
      tasks = [];
      return;
    }
    tasks = parsed.map(item => new Task(item.id, item.text, !!item.completed));
  } catch (e) {
    console.error('Failed to load tasks from localStorage:', e);
    tasks = [];
  }
}

/**
 * Save the current tasks array to localStorage as JSON.
 */
function saveTasks() {
  try {
    const serialized = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

/**
 * Render tasks to the DOM based on the provided filter.
 * @param {string} [filter='all'] - The filter criteria (e.g., 'all', 'active', 'completed').
 */
function renderTasks(filter = 'all') {
  // Obtain the tasks that should be visible according to the filter.
  const visibleTasks = typeof filterTasks === 'function' ? filterTasks(filter) : tasks;

  const listEl = document.getElementById('task-list');
  if (!listEl) {
    console.error('renderTasks: No element with id "task-list" found in DOM.');
    return;
  }

  // Clear existing list items.
  listEl.innerHTML = '';

  visibleTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('data-id', task.id);
    li.setAttribute('draggable', 'true');

    // Drag event listeners – handlers will be defined elsewhere.
    if (typeof handleDragStart === 'function') li.addEventListener('dragstart', handleDragStart);
    if (typeof handleDragOver === 'function') li.addEventListener('dragover', handleDragOver);
    if (typeof handleDrop === 'function') li.addEventListener('drop', handleDrop);
    if (typeof handleDragEnd === 'function') li.addEventListener('dragend', handleDragEnd);

    // Checkbox for completion status.
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'complete-checkbox';
    if (task.completed) checkbox.checked = true;
    // Listener for toggling completion will be attached later.
    li.appendChild(checkbox);

    // Task text.
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    li.appendChild(span);

    // Edit button.
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✎';
    // Edit handler to be defined later.
    li.appendChild(editBtn);

    // Delete button.
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✖';
    // Delete handler to be defined later.
    li.appendChild(deleteBtn);

    listEl.appendChild(li);
  });
}

/**
 * Add a new task with the provided text.
 * Generates a UUID for the task, adds it to the collection, persists, and re‑renders.
 * @param {string} text - The description of the new task.
 */
function addTask(text) {
  const id = crypto.randomUUID();
  const newTask = new Task(id, text);
  tasks.push(newTask);
  saveTasks();
  // Use the current filter if defined, otherwise default to 'all'.
  const filter = typeof currentFilter !== 'undefined' ? currentFilter : 'all';
  renderTasks(filter);
}

/**
 * Edit the text of an existing task identified by id.
 * @param {string} id - The unique identifier of the task to edit.
 * @param {string} newText - The new text content for the task.
 */
function editTask(id, newText) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.text = newText;
  saveTasks();
  const filter = typeof currentFilter !== 'undefined' ? currentFilter : 'all';
  renderTasks(filter);
}

/**
 * Delete a task from the collection.
 * @param {string} id - The unique identifier of the task to delete.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  const filter = typeof currentFilter !== 'undefined' ? currentFilter : 'all';
  renderTasks(filter);
}

/**
 * Toggle the completed state of a task.
 * @param {string} id - The unique identifier of the task to toggle.
 */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  const filter = typeof currentFilter !== 'undefined' ? currentFilter : 'all';
  renderTasks(filter);
}

// Export functions to the global window object for use in other scripts.
window.loadTasks = loadTasks;
window.saveTasks = saveTasks;
window.renderTasks = renderTasks;

// Export CRUD operations.
window.addTask = addTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleComplete = toggleComplete;

// Also expose Task class and tasks array for potential debugging / future modules.
window.Task = Task;
window.tasks = tasks;
window.currentFilter = currentFilter;

/**
 * UI Event Listeners – tie DOM interactions to the task logic.
 */
function setupEventListeners() {
  // Add task via button click.
  const addBtn = document.getElementById('add-task-btn');
  const inputEl = document.getElementById('new-task');
  if (addBtn && inputEl) {
    addBtn.addEventListener('click', () => {
      const text = inputEl.value.trim();
      if (text) {
        addTask(text);
        inputEl.value = '';
      }
    });

    // Add task on Enter key press within the input.
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (text) {
          addTask(text);
          inputEl.value = '';
        }
      }
    });
  }

  // Delegate actions within the task list.
  const listEl = document.getElementById('task-list');
  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const target = e.target;
      const li = target.closest('li[data-id]');
      if (!li) return;
      const id = li.getAttribute('data-id');

      // Edit button.
      if (target.matches('.edit-btn')) {
        const currentText = li.querySelector('.task-text')?.textContent || '';
        const newText = prompt('Edit task:', currentText);
        if (newText !== null) {
          const trimmed = newText.trim();
          if (trimmed) editTask(id, trimmed);
        }
        return;
      }

      // Delete button.
      if (target.matches('.delete-btn')) {
        if (confirm('Delete this task?')) {
          deleteTask(id);
        }
        return;
      }

      // Completion checkbox.
      if (target.matches('.complete-checkbox')) {
        toggleComplete(id);
        return;
      }
    });
  }

  // Filter buttons.
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (filter) {
        currentFilter = filter;
        renderTasks(currentFilter);
      }
    });
  });

  // Theme selector.
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.className = 'theme-' + value;
      }
    });
  }
}

/**
 * -----------------------
 * Calculator Functionality
 * -----------------------
 */
// Scope variables for the calculator. Guard against missing DOM element.
const display = document.getElementById('display');
let currentInput = '';
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;

function updateDisplay(value) {
  if (display) display.textContent = value;
}

function clearAll() {
  currentInput = '';
  previousValue = null;
  operator = null;
  shouldResetDisplay = false;
  updateDisplay('0');
}

function calculate() {
  if (operator && previousValue !== null && currentInput !== '') {
    const a = parseFloat(previousValue);
    const b = parseFloat(currentInput);
    let result;
    switch (operator) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        result = b !== 0 ? a / b : 'Error';
        break;
      default:
        result = 'Error';
    }
    updateDisplay(result);
    previousValue = result;
    currentInput = '';
    shouldResetDisplay = true;
  }
}

function handleNumber(e) {
  const value = e.target.dataset.value;
  if (shouldResetDisplay) {
    currentInput = value;
    shouldResetDisplay = false;
  } else {
    currentInput += value;
  }
  updateDisplay(currentInput || '0');
}

function handleOperator(e) {
  const op = e.target.dataset.value;
  if (currentInput === '' && previousValue === null) return;
  if (previousValue !== null && currentInput !== '') {
    calculate();
  }
  operator = op;
  previousValue = currentInput !== '' ? currentInput : previousValue;
  currentInput = '';
}

function handleEquals() {
  calculate();
}

function handleClear() {
  clearAll();
}

function wireCalculator() {
  // Ensure we have buttons to bind.
  const buttons = document.querySelectorAll('button[data-value]');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    const val = btn.dataset.value;
    if (!isNaN(val)) {
      btn.addEventListener('click', handleNumber);
    } else if (['+', '-', '*', '/'].includes(val)) {
      btn.addEventListener('click', handleOperator);
    } else if (val === 'C') {
      btn.addEventListener('click', handleClear);
    } else if (val === '=') {
      btn.addEventListener('click', handleEquals);
    }
  });
  // Start with a clean display.
  clearAll();
}

// Initialize both Todo and Calculator on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  // Todo app initialization.
  loadTasks();
  currentFilter = 'all';
  renderTasks(currentFilter);
  setupEventListeners();

  // Calculator initialization.
  wireCalculator();
});

// Optional module export for future extensions.
if (typeof module !== 'undefined') {
  module.exports = { updateDisplay, clearAll, calculate };
}
