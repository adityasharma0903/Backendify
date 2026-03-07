import { useState, useEffect } from 'react';
import { getAllTodos, createTodo, updateTodo, deleteTodo } from './api/todo';

const API_URL = 'http://localhost:5000/api';

function App() {
  // Local state - NO API calls yet!
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    try {
      const payload = await getAllTodos();
      setTodos(payload.data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const [newTodo, setNewTodo] = useState({ title: '', priority: 'medium' });

  // Add new todo (API call)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    const todo = {
      title: newTodo.title,
      completed: false,
      priority: newTodo.priority
    };

    try {
      await createTodo(todo);
      setNewTodo({ title: '', priority: 'medium' });
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Toggle todo completion (API call)
  const handleToggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t._id === id);
      if (!todo) return;

      await updateTodo(id, { completed: !todo.completed });
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  // Delete todo (API call)
  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div className="app">
      <header className="header">
        <h1>📝 Todo App</h1>
        <p className="subtitle">Built with React + Backendify! ✨</p>
      </header>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{totalTodos}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pendingTodos}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedTodos}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            className="todo-input"
          />
          <select
            value={newTodo.priority}
            onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
            className="priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="add-button">+ Add Task</button>
        </form>

        <div className="todos-list">
          {todos.length === 0 ? (
            <p className="empty-state">No tasks yet! Add one above.</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo._id)}
                  className="todo-checkbox"
                />
                <div className="todo-content">
                  <span className="todo-title">{todo.title}</span>
                  <span className={`priority-badge ${todo.priority}`}>
                    {todo.priority}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo._id)}
                  className="delete-button"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="footer">
        <p>✅ Backend is live! Data persists in MongoDB.</p>
      </footer>
    </div>
  );
}

export default App;
