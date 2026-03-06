import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [products, setProducts] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTodos()
    loadProducts()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      // Testing hardcoded relative API URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`)
      const data = await response.json()
      setTodos(Array.isArray(data) ? data : (data.data || []))
    } catch (error) {
      console.log('Todos not available yet:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      // Testing hardcoded absolute localhost URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : (data.data || []))
    } catch (error) {
      console.log('Products not available yet:', error.message)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, completed: false })
      })
      const data = await response.json()
      setTodos([...todos, data])
      setNewTodo('')
    } catch (error) {
      console.log('Could not add todo:', error.message)
    }
  }

  const toggleTodo = async (id, completed) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      setTodos(todos.map(t => t.id === id ? {...t, completed: !completed} : t))
    } catch (error) {
      console.log('Could not toggle todo:', error.message)
    }
  }

  return (
    <div className="App">
      <h1>🚀 Backendify Deploy Test</h1>
      <p>Testing auto-connect feature with API calls</p>
      
      <div className="card">
        <h2>Todos</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                style={{ marginRight: '0.5rem', padding: '0.5rem' }}
              />
              <button onClick={addTodo}>Add</button>
            </div>
            
            {todos.length === 0 ? (
              <p>No todos yet. Backend not connected.</p>
            ) : (
              <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                {todos.map((todo) => (
                  <li key={todo.id} style={{ marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                    />
                    <span style={{ marginLeft: '0.5rem', textDecoration: todo.completed ? 'line-through' : 'none' }}>
                      {todo.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2>Products</h2>
        {products.length === 0 ? (
          <p>No products yet. Backend not connected.</p>
        ) : (
          <ul style={{ textAlign: 'left' }}>
            {products.map((product) => (
              <li key={product.id}>{product.name} - ${product.price}</li>
            ))}
          </ul>
        )}
      </div>

      <p className="read-the-docs">
        API URLs will auto-convert to environment variables on deploy
      </p>
    </div>
  )
}

export default App
