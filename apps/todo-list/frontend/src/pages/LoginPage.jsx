import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await api.post('/api/auth/signin', { username, password });
    if (response.status == '200') {
      localStorage.setItem('accessToken', response.data.token);
      setIsAuthenticated(true);
      navigate('/todos');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="bg-blue-200 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-black-600 ml-2">
            Todo Login - v1
          </h1>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
