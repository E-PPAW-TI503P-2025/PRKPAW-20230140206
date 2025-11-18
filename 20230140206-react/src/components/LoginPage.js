import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response ? err.response.data.message : 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">

      <div className="backdrop-blur-xl bg-white/5 p-10 rounded-3xl shadow-xl 
        max-w-md w-full border border-white/10">

        <h2 className="text-3xl font-bold text-center mb-6 text-gray-100">
          Welcome Back
        </h2>

        <p className="text-gray-300 text-center mb-8">
          Silakan login untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="text-gray-200 block mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl bg-white/10 text-gray-100 
                placeholder-gray-400 border border-white/10 
                focus:ring-2 focus:ring-gray-400"
              placeholder="Masukkan email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-200 block mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl bg-white/10 text-gray-100 
                placeholder-gray-400 border border-white/10
                focus:ring-2 focus:ring-gray-400"
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-3 mt-4 bg-gray-700 hover:bg-gray-600 
            rounded-xl text-white font-semibold shadow-md duration-200">
            Login
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-center mt-4">{error}</p>
        )}

        <p className="text-gray-300 text-center mt-6">
          Belum punya akun?{" "}
          <span
            className="text-blue-300 cursor-pointer hover:underline"
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;