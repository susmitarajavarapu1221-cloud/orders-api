import { useState, useEffect } from 'react';
import { AuthState } from '../App';

interface Props {
  auth: AuthState;
  onLogout: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function AdminDashboard({ auth, onLogout }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.accessToken}`
  };

  // Users list fetch చేయండి
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users', { headers });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // User create చేయండి
  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowCreateForm(false);
        setNewUser({ name: '', email: '', password: '', role: 'USER' });
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create user');
    }
  };

  // User update చేయండి
  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/${editUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: editUser.name, email: editUser.email })
      });
      if (res.ok) {
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  // User delete చేయండి
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome, {auth.user.name}!</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* Create User Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 mb-6"
      >
        + Create New User
      </button>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Create New User</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="border rounded-lg px-4 py-2"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="USER">USER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit User Form */}
      {editUser && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Edit User</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              className="border rounded-lg px-4 py-2"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
            <button
              onClick={() => setEditUser(null)}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                    user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => setEditUser(user)}
                    className="bg-yellow-400 text-white px-4 py-1 rounded-lg hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;