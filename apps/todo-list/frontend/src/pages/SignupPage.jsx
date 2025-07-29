import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/signup', {
        username,
        password,
      });
      if (response.status === 200) {
        alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (err) {
      setError('회원가입에 실패했습니다. 다른 사용자 이름을 시도해보세요.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="bg-blue-200 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold text-black-600 mb-6 text-center">
          Sign Up
        </h1>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Create Account
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
