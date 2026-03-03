import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
    setLoading(false);
  };

  const handleAddUser = async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    };
    
    try {
      const result = await createUser(newUser);
      if (result.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to create user', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  return (
    <div>
      <h1>User Manager</h1>
      <button onClick={handleAddUser}>Add User</button>
      {loading && <p>Loading...</p>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
