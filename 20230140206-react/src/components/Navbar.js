import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nama);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserName('');
    setUserRole('');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-xl font-bold hover:text-gray-300">
            Presensi App
          </Link>
          {userName && (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link to="/presensi" className="hover:text-gray-300">
                Presensi
              </Link>
              {userRole === 'admin' && (
                <Link to="/reports" className="hover:text-gray-300">
                  Laporan Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {userName && (
            <>
              <span className="text-gray-300">
                Halo, <span className="font-semibold">{userName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
