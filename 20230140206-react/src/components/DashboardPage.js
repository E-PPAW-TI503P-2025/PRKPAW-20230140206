import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br 
      from-gray-900 via-gray-800 to-gray-700 
      flex items-center justify-center p-10">

      <div className="backdrop-blur-xl bg-white/5 border border-white/10
        p-12 rounded-3xl shadow-xl max-w-xl w-full text-center">

        <h1 className="text-4xl font-bold text-gray-100 mb-6">
          Dashboard
        </h1>

        <p className="text-gray-300 mb-10">
          Selamat datang! Anda berada di halaman dashboard.
        </p>

        <button
          onClick={handleLogout}
          className="py-3 px-10 bg-red-600 hover:bg-red-500 
            text-white font-semibold rounded-xl shadow-md 
            duration-200"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default DashboardPage;