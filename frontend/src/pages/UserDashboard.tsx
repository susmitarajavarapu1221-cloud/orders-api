import { AuthState } from '../App';

interface Props {
  auth: AuthState;
  onLogout: () => void;
}

function UserDashboard({ auth, onLogout }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Welcome, {auth.user.name}! 🎉
        </h1>
        <p className="text-gray-500 mb-6">Role: {auth.user.role}</p>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserDashboard;