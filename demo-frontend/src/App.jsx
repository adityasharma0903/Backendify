import React, { useState, useEffect } from 'react';
import './App.css';
import ProductsList from './pages/Products';
import UsersList from './pages/Users';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">🚀 Demo Frontend</h1>
          <ul className="nav-links">
            <li>
              <button 
                className={currentPage === 'dashboard' ? 'active' : ''}
                onClick={() => setCurrentPage('dashboard')}
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button 
                className={currentPage === 'products' ? 'active' : ''}
                onClick={() => setCurrentPage('products')}
              >
                🛍️ Products
              </button>
            </li>
            <li>
              <button 
                className={currentPage === 'users' ? 'active' : ''}
                onClick={() => setCurrentPage('users')}
              >
                👥 Users
              </button>
            </li>
            <li>
              <button 
                className={currentPage === 'chat' ? 'active' : ''}
                onClick={() => setCurrentPage('chat')}
              >
                💬 Chat
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'products' && <ProductsList />}
        {currentPage === 'users' && <UsersList />}
        {currentPage === 'chat' && <Chat />}
      </main>

      <footer className="footer">
        <p>Demo Frontend - Ready for Backendify Generation 🎯</p>
      </footer>
    </div>
  );
}

export default App;
