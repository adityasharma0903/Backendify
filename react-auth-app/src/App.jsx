import React, { useState, useEffect } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setUserToken(token);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleSignupSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setUserToken(token);
    setIsLoggedIn(true);
    setActiveTab('profile');
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setUserToken(token);
    setIsLoggedIn(true);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUserToken(null);
    setIsLoggedIn(false);
    setActiveTab('login');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🔐 React Auth App</h1>
      <p className="subtitle">Powered by Backendify - Offline Backend Generation</p>

      {isLoggedIn ? (
        <>
          <div className="message info">✅ You are logged in</div>
          <Profile token={userToken} onLogout={handleLogout} />
        </>
      ) : (
        <>
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              📝 Sign Up
            </button>
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              🔑 Log In
            </button>
          </div>

          <div className={`tab-content ${activeTab === 'signup' ? 'active' : ''}`}>
            <Signup onSuccess={handleSignupSuccess} switchToLogin={() => setActiveTab('login')} />
          </div>

          <div className={`tab-content ${activeTab === 'login' ? 'active' : ''}`}>
            <Login onSuccess={handleLoginSuccess} switchToSignup={() => setActiveTab('signup')} />
          </div>
        </>
      )}
    </div>
  );
}
