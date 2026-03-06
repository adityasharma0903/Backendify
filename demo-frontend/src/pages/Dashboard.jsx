import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulated data
    setStats({
      totalProducts: 24,
      totalUsers: 156,
      totalMessages: 342,
    });
    setRecentActivity([
      { id: 1, activity: 'New user registered', timestamp: new Date() },
      { id: 2, activity: 'Product added', timestamp: new Date() },
      { id: 3, activity: 'New chat message', timestamp: new Date() },
    ]);
  }, []);

  return (
    <div className="page">
      <h2>📊 Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📦 Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
          <small>Total Products</small>
        </div>
        <div className="stat-card">
          <h3>👥 Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
          <small>Total Users</small>
        </div>
        <div className="stat-card">
          <h3>💬 Messages</h3>
          <p className="stat-number">{stats.totalMessages}</p>
          <small>Total Messages</small>
        </div>
      </div>

      <div className="recent-activity">
        <h3>📝 Recent Activity</h3>
        <ul>
          {recentActivity.map(item => (
            <li key={item.id}>{item.activity}</li>
          ))}
        </ul>
      </div>

      <div className="info-box">
        <h3>ℹ️ About This App</h3>
        <p>This is a demo frontend application designed to showcase Backendify's automatic backend generation capabilities.</p>
        <p>It includes:</p>
        <ul>
          <li>Product management with listings</li>
          <li>User management system</li>
          <li>Real-time chat messaging</li>
          <li>Dashboard with statistics</li>
        </ul>
        <p><strong>Next Step:</strong> Run <code>backendify generate</code> to automatically create the backend for this frontend!</p>
      </div>
    </div>
  );
}

export default Dashboard;
