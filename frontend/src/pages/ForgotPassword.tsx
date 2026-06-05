import { useState } from 'react';

interface Props {
  onBack: () => void;
  onResetPassword: () => void;
}

function ForgotPassword({ onBack, onResetPassword }: Props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        setError('Please enter email');
        return;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResetToken(data.resetToken);
        setMessage('Reset token generated successfully!');
        setError('');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Forgot Password
        </h1>

        {message && (
          <p className="text-green-500 text-center mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-center mb-4">
            {error}
          </p>
        )}

        {resetToken && (
          <div className="bg-gray-100 p-3 rounded mb-4 break-all text-xs">
            <p className="font-bold mb-1">Reset Token:</p>
            <p>{resetToken}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <button
          onClick={handleForgotPassword}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold mb-4"
        >
          Get Reset Token
        </button>

        <button
          onClick={onResetPassword}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold mb-4"
        >
          Go To Reset Password
        </button>

        <button
          onClick={onBack}
          className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;