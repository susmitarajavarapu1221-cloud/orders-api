import { AuthState } from '../App';

interface Props {
  auth: AuthState;
  onLogout: () => void;
  onChangePassword: () => void;
}

function UserDashboard({
  auth,
  onLogout,
  onChangePassword
}: Props) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[500px]">

        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          Welcome, {auth.user.name}!
        </h1>

        <div className="space-y-3 mb-8">
          <div>
            <span className="font-semibold">Name:</span>{' '}
            {auth.user.name}
          </div>

          <div>
            <span className="font-semibold">Email:</span>{' '}
            {auth.user.email}
          </div>

          <div>
            <span className="font-semibold">Role:</span>{' '}
            {auth.user.role}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onChangePassword}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
          >
            Change Password
          </button>

          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default UserDashboard;