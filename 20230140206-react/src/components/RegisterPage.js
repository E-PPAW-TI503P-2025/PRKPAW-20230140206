import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('mahasiswa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:3001/api/auth/register', {
        name,
        role,
        email,
        password
      });

      navigate('/login');
    } catch (err) {
      alert("Registrasi gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">

      <div className="backdrop-blur-xl bg-white/5 p-10 rounded-3xl shadow-xl 
        max-w-md w-full border border-white/10">

        <h2 className="text-3xl font-bold text-center mb-6 text-gray-100">
          Create Account
        </h2>

        <p className="text-gray-300 text-center mb-8">
          Buat akun baru untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="text-gray-200 block mb-1">Nama</label>
            <input
              type="text"
              className="w-full p-3 rounded-xl bg-white/10 text-gray-100
                placeholder-gray-400 border border-white/10
                focus:ring-2 focus:ring-gray-400"
              placeholder="Nama lengkap..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-200 block mb-1">Role</label>
            <select
              className="w-full p-3 rounded-xl bg-white/10 text-gray-100 
                border border-white/10 focus:ring-2 focus:ring-gray-400"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-gray-200 block mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl bg-white/10 text-gray-100
                placeholder-gray-400 border border-white/10
                focus:ring-2 focus:ring-gray-400"
              placeholder="Email aktif..."
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
              placeholder="Password aman..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-3 mt-4 bg-gray-700 hover:bg-gray-600 
            rounded-xl text-white font-semibold shadow-md duration-200">
            Register
          </button>

        </form>

        <p className="text-gray-300 text-center mt-6">
          Sudah punya akun?{" "}
          <span
            className="text-blue-300 cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;