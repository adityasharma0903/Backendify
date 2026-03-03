import React, { useState, useEffect } from 'react';

export default function Profile({ token, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    bio: ''
  });

  // 🎯 FETCH PROFILE DATA ON COMPONENT MOUNT
  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🎯 API CALL - GET PROFILE (Protected)
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch profile');
        return;
      }

      const userData = data.data?.user || data.data || data;
      setUserData(userData);
      setFormData({
        email: userData?.email || '',
        name: userData?.name || 'User',
        bio: userData?.bio || 'No bio added yet'
      });

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      // 🎯 API CALL - UPDATE PROFILE (Protected)
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
        return;
      }

      const userData = data.data?.user || data.data || data;
      setUserData(userData);
      setFormData(prev => ({
        ...prev,
        email: userData?.email || '',
        name: userData?.name || 'User',
        bio: userData?.bio || 'No bio added yet'
      }));
      alert('✅ Profile updated successfully!');

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 🎯 API CALL - LOGOUT (Protected)
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onLogout();
      alert('✅ Logged out successfully!');

    } catch (err) {
      console.error('Logout error:', err);
      onLogout();
    }
  };

  if (loading) {
    return (
      <div>
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', color: '#666' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="message error">{error}</div>}

      <div className="profile-data">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>👤 Your Profile</h2>

        <div className="profile-field">
          <label>Email:</label>
          <span>{formData.email}</span>
        </div>

        <div className="profile-field">
          <label>Registered:</label>
          <span>
            {userData?.createdAt 
              ? new Date(userData.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recently'
            }
          </span>
        </div>

        <div className="profile-field">
          <label>Last Updated:</label>
          <span>
            {userData?.updatedAt 
              ? new Date(userData.updatedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Just now'
            }
          </span>
        </div>
      </div>

      <h3 style={{ color: '#333', marginBottom: '15px' }}>✏️ Update Your Profile</h3>
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={updating}>
          {updating ? 'Updating...' : '💾 Update Profile'}
        </button>
      </form>

      <button onClick={handleLogout} className="btn btn-logout">
        🚪 Logout
      </button>

      <div className="message info" style={{ marginTop: '20px' }}>
        <small>✨ This profile is powered by Backendify - Offline Backend Generation</small>
      </div>
    </div>
  );
}
