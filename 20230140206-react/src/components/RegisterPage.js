import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('mahasiswa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi form
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Semua field harus diisi.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        nama: name,
        role,
        email,
        password
      });

      // Sukses registrasi
      console.log('Registrasi sukses:', response.data);
      navigate('/login');
    } catch (err) {
      console.error('Error registrasi:', err);
      const errorMessage = err.response?.data?.message || err.message || "Registrasi gagal. Coba lagi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/20 border-l-4 border-red-500 text-red-300 p-4 rounded flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        )}

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
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-gray-200 block mb-1">Role</label>
            <select
              className="w-full p-3 rounded-xl bg-white/10 text-gray-100 
                border border-white/10 focus:ring-2 focus:ring-gray-400"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
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
              required
              disabled={loading}
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
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 rounded-xl text-white font-semibold shadow-md duration-200 flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Register'
            )}
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