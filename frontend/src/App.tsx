import { useState } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';

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

  const [page, setPage] = useState<
    'login' | 'forgot' | 'reset' | 'change-password'
  >('login');

  const handleLogin = (authData: AuthState) => {
    setAuth(authData);
    setPage('login');
  };

  const handleLogout = () => {
    setAuth(null);
    setPage('login');
  };

  if (!auth) {
    if (page === 'forgot') {
      return (
        <ForgotPassword
          onBack={() => setPage('login')}
          onResetPassword={() => setPage('reset')}
        />
      );
    }

    if (page === 'reset') {
      return (
        <ResetPassword
          onBack={() => setPage('login')}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onForgotPassword={() => setPage('forgot')}
      />
    );
  }

  if (page === 'change-password') {
    return (
      <ChangePassword
        auth={auth}
        onBack={() => setPage('login')}
      />
    );
  }

  if (
    auth.user.role === 'ADMIN' ||
    auth.user.role === 'MANAGER'
  ) {
    return (
      <AdminDashboard
        auth={auth}
        onLogout={handleLogout}
        onChangePassword={() =>
          setPage('change-password')
        }
      />
    );
  }

  return (
    <UserDashboard
  auth={auth}
  onLogout={handleLogout}
  onChangePassword={() => setPage('change-password')}
/>
  );
}

export default App;