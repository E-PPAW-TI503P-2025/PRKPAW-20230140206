import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      navigate("/login");
      return;
    }

    // Fetch reports on component mount
    fetchReports("");
  }, [navigate]);

  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = "http://localhost:3001/api/reports/daily";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("nama", searchTerm);
      }

      if (dateFilter) {
        params.append("tanggal", dateFilter);
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReports(response.data.data || []);
    } catch (err) {
      setReports([]);
      setError(
        err.response ? err.response.data.message : "Gagal mengambil data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDateFilter(newDate);
    // Trigger search with new date
    setTimeout(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);

      let url = "http://localhost:3001/api/reports/daily";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("nama", searchTerm);
      }

      if (newDate) {
        params.append("tanggal", newDate);
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setReports(response.data.data || []);
        })
        .catch((err) => {
          setReports([]);
          setError(
            err.response ? err.response.data.message : "Gagal mengambil data"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition"
            >
              Cari
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="dateFilter" className="font-semibold text-gray-700">
              Filter Tanggal:
            </label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("");
                  setSearchTerm("");
                  fetchReports("");
                }}
                className="py-2 px-4 bg-gray-400 text-white font-semibold rounded-md shadow-sm hover:bg-gray-500 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}
      {!error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-Out
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Sedang memuat data...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((presensi) => (
                  <tr key={presensi.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {presensi.user ? presensi.user.nama : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.user ? presensi.user.email : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.checkIn
                        ? new Date(presensi.checkIn).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.checkOut
                        ? new Date(presensi.checkOut).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "Belum Check-Out"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReportPage;