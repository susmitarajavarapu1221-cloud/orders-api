import { useState } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User;
  accessToken: string;
}

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  const handleLogin = (authData: AuthState) => {
    setAuth(authData);
  };

  const handleLogout = () => {
    setAuth(null);
  };

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  if (auth.user.role === 'ADMIN') {
    return <AdminDashboard auth={auth} onLogout={handleLogout} />;
  }

  return <UserDashboard auth={auth} onLogout={handleLogout} />;
}

export default App;