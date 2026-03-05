import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login');

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setCurrentView(JSON.parse(userData).role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
      } catch (error) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setCurrentView(userData.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    
    // Call logout API
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.clear();
    setUser(null);
    setCurrentView('login');
  };

  if (loading) {
    return (<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <h2>⏳ Loading SaaS Platform...</h2>
    </div>);
  }

  if (!user) {
    return currentView === 'login' ? (
      <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setCurrentView('signup')} />
    ) : (
      <SignupPage onSignup={handleLogin} onSwitchToLogin={() => setCurrentView('login')} />
    );
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h1>🚀 SaaS Platform</h1>
        <div className="nav-menu">
          <button onClick={() => setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard')}>Dashboard</button>
          {user.role === 'admin' && (
            <>
              <button onClick={() => setCurrentView('users')}>Users</button>
              <button onClick={() => setCurrentView('subscriptions')}>Subscriptions</button>
              <button onClick={() => setCurrentView('analytics')}>Analytics</button>
            </>
          )}
          {user.role !== 'admin' && (
            <>
              <button onClick={() => setCurrentView('my-subscription')}>My Plan</button>
              <button onClick={() => setCurrentView('billing')}>Billing</button>
              <button onClick={() => setCurrentView('settings')}>Settings</button>
            </>
          )}
        </div>
        <div className="user-menu">
          <span>👤 {user.firstName} {user.lastName} ({user.role || 'student'})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      
      <main className="main-content">
        {renderView(currentView, user, setCurrentView)}
      </main>
    </div>
  );
}

function renderView(view, user, setCurrentView) {
  switch(view) {
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'user-dashboard':
      return <UserDashboard user={user} />;
    case 'users':
      return <UsersManagement />;
    case 'subscriptions':
      return <SubscriptionsManagement />;
    case 'analytics':
      return <Analytics />;
    case 'my-subscription':
      return <MySubscription user={user} />;
    case 'billing':
      return <Billing user={user} />;
    case 'settings':
      return <Settings user={user} />;
    default:
      return <div>View not found</div>;
  }
}

// ===== LOGIN PAGE =====
function LoginPage({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = 'http://localhost:3001/api/v1';
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(data.data, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Backend not running - start it with: npm start in event-management-backend dir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Login to Event Management</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p>New user? <button onClick={onSwitchToSignup} className="link-btn">Create Account</button></p>
      </div>
    </div>
  );
}

// ===== SIGNUP PAGE =====
function SignupPage({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = 'http://localhost:3001/api/v1';
      const { confirmPassword, ...signupData } = formData;
      
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSignup(data.data, data.token);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Backend not running - start it with: npm start in event-management-backend dir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-signup">
        <h2>🚀 Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
          />
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
        </form>
        <p>Already have an account? <button onClick={onSwitchToLogin} className="link-btn">Login</button></p>
      </div>
    </div>
  );
}
          <button type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Sign Up'}</button>
        </form>
        <p>Already have an account? <button onClick={onSwitchToLogin} className="link-btn">Login</button></p>
      </div>
    </div>
  );
}

// ===== ADMIN DASHBOARD =====
function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, revenue: 0, newUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>📊 Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
        <div className="stat-card"><h3>{stats.activeSubscriptions}</h3><p>Active Subscriptions</p></div>
        <div className="stat-card"><h3>${stats.revenue}</h3><p>Total Revenue</p></div>
        <div className="stat-card"><h3>{stats.newUsers}</h3><p>New This Month</p></div>
      </div>
    </div>
  );
}

// ===== USER DASHBOARD =====
function UserDashboard({ user }) {
  const [usage, setUsage] = useState({ apiCalls: 0, storage: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/usage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Failed to fetch usage');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>👋 Welcome, {user.name}!</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>{usage.apiCalls}/10000</h3><p>API Calls</p></div>
        <div className="stat-card"><h3>{usage.storage}GB/100GB</h3><p>Storage Used</p></div>
        <div className="stat-card"><h3>{usage.users}/5</h3><p>Team Members</p></div>
      </div>
    </div>
  );
}

// ===== USERS MANAGEMENT =====
function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="users-management">
      <h2>👥 User Management</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                <button onClick={() => updateUserStatus(u._id, u.status === 'active' ? 'suspended' : 'active')}>
                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== SUBSCRIPTIONS MANAGEMENT =====
function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading subscriptions...</div>;

  return (
    <div className="subscriptions-management">
      <h2>💳 Subscriptions</h2>
      <table>
        <thead>
          <tr><th>User</th><th>Plan</th><th>Status</th><th>Renewal Date</th></tr>
        </thead>
        <tbody>
          {subscriptions.map(sub => (
            <tr key={sub._id}>
              <td>{sub.userName}</td>
              <td>{sub.plan}</td>
              <td>{sub.status}</td>
              <td>{new Date(sub.renewalDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== ANALYTICS =====
function Analytics() {
  const [analytics, setAnalytics] = useState({ dailySignups: [], revenue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics">
      <h2>📈 Analytics</h2>
      <p>Analytics data will be displayed here</p>
    </div>
  );
}

// ===== MY SUBSCRIPTION =====
function MySubscription({ user }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (newPlan) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${process.env.REACT_APP_API_URL}/api/user/subscription/upgrade`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: newPlan })
      });
      fetchSubscription();
    } catch (error) {
      console.error('Failed to upgrade plan');
    }
  };

  if (loading) return <div>Loading subscription...</div>;

  return (
    <div className="my-subscription">
      <h2>💎 My Subscription</h2>
      {subscription ? (
        <div>
          <p>Current Plan: <strong>{subscription.plan}</strong></p>
          <p>Status: {subscription.status}</p>
          <p>Renewal: {new Date(subscription.renewalDate).toLocaleDateString()}</p>
          <div className="plans">
            <button onClick={() => upgradePlan('basic')}>Basic - $9/mo</button>
            <button onClick={() => upgradePlan('pro')}>Pro - $29/mo</button>
            <button onClick={() => upgradePlan('enterprise')}>Enterprise - $99/mo</button>
          </div>
        </div>
      ) : (
        <div>No active subscription</div>
      )}
    </div>
  );
}

// ===== BILLING =====
function Billing({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading billing...</div>;

  return (
    <div className="billing">
      <h2>💰 Billing History</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Amount</th><th>Status</th><th>Download</th></tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv._id}>
              <td>{new Date(inv.date).toLocaleDateString()}</td>
              <td>${inv.amount}</td>
              <td>{inv.status}</td>
              <td><button>PDF</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== SETTINGS =====
function Settings({ user }) {
  const [settings, setSettings] = useState({
    name: user.name,
    email: user.email,
    company: user.company || '',
    notifications: true
  });

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${process.env.REACT_APP_API_URL}/api/user/settings`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      alert('Settings updated!');
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  return (
    <div className="settings">
      <h2>⚙️ Settings</h2>
      <div>
        <input type="text" value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} />
        <input type="email" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} />
        <input type="text" value={settings.company} onChange={(e) => setSettings({...settings, company: e.target.value})} placeholder="Company" />
        <label>
          <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({...settings, notifications: e.target.checked})} />
          Email Notifications
        </label>
        <button onClick={handleUpdate}>Save Settings</button>
      </div>
    </div>
  );
}

export default App;
