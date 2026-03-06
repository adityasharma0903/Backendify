// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// State
let todos = [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('addTodoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    todoForm.addEventListener('submit', handleAddTodo);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });
}

// API Functions
async function fetchTodos() {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
        throw new Error('Failed to fetch todos');
    }
    return await response.json();
}

async function createTodo(todoData) {
    const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
    });
    if (!response.ok) {
        throw new Error('Failed to create todo');
    }
    return await response.json();
}

async function updateTodo(id, todoData) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
    });
    if (!response.ok) {
        throw new Error('Failed to update todo');
    }
    return await response.json();
}

async function deleteTodo(id) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete todo');
    }
    return await response.json();
}

async function getTodoById(id) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch todo');
    }
    return await response.json();
}

async function getCompletedTodos() {
    const response = await fetch(`${API_BASE_URL}/todos/completed`);
    if (!response.ok) {
        throw new Error('Failed to fetch completed todos');
    }
    return await response.json();
}

async function getActiveTodos() {
    const response = await fetch(`${API_BASE_URL}/todos/active`);
    if (!response.ok) {
        throw new Error('Failed to fetch active todos');
    }
    return await response.json();
}

// UI Functions
function showLoading() {
    loadingDiv.style.display = 'block';
    todoList.style.display = 'none';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
    todoList.style.display = 'block';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Load todos from server
async function loadTodos() {
    try {
        showLoading();
        todos = await fetchTodos();
        renderTodos();
        updateStats();
        hideLoading();
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load todos. Please check if the server is running.');
        hideLoading();
    }
}

// Render todos based on current filter
function renderTodos() {
    let filteredTodos = todos;
    
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }
    
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="loading">No todos found. Add some tasks!</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });
}

// Create todo element
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo._id || todo.id;
    
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            onchange="handleToggleTodo('${todo._id || todo.id}')"
        >
        <span class="todo-text">${escapeHtml(todo.title || todo.text)}</span>
        <div class="todo-actions">
            <button class="delete-btn" onclick="handleDeleteTodo('${todo._id || todo.id}')">
                Delete
            </button>
        </div>
    `;
    
    return li;
}

// Handle add todo
async function handleAddTodo(e) {
    e.preventDefault();
    
    const title = todoInput.value.trim();
    if (!title) return;
    
    try {
        const newTodo = await createTodo({
            title: title,
            completed: false,
        });
        
        todos.push(newTodo);
        renderTodos();
        updateStats();
        todoInput.value = '';
    } catch (error) {
        console.error('Error creating todo:', error);
        showError('Failed to create todo. Please try again.');
    }
}

// Handle toggle todo
async function handleToggleTodo(id) {
    try {
        const todo = todos.find(t => (t._id || t.id) === id);
        if (!todo) return;
        
        const updatedTodo = await updateTodo(id, {
            ...todo,
            completed: !todo.completed,
        });
        
        const index = todos.findIndex(t => (t._id || t.id) === id);
        todos[index] = updatedTodo;
        
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
        renderTodos(); // Re-render to reset checkbox
    }
}

// Handle delete todo
async function handleDeleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        await deleteTodo(id);
        todos = todos.filter(t => (t._id || t.id) !== id);
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions to global scope for onclick handlers
window.handleToggleTodo = handleToggleTodo;
window.handleDeleteTodo = handleDeleteTodo;
