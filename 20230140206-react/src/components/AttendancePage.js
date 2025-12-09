import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from './Navbar';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Webcam from 'react-webcam';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function AttendancePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);
  const navigate = useNavigate();

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setError("Gagal mendapatkan lokasi: " + error.message);
        }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = async () => {
    setError('');
    setMessage('');

    if (!coords || !image) {
      setError("Lokasi dan Foto wajib ada!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const blob = await (await fetch(image)).blob();

      const formData = new FormData();
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('image', blob, 'selfie.jpg');

      const response = await axios.post(
        'http://localhost:3001/api/presensi/check-in',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Check-in gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setMessage('');

    if (!coords) {
      setError("Lokasi belum didapatkan. Mohon izinkan akses lokasi.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/presensi/check-out', {
        latitude: coords.lat,
        longitude: coords.lng
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Check-out gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex flex-col items-center p-8 relative overflow-hidden">

        <div className="w-full max-w-6xl space-y-8 relative z-10">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-100 mb-2">
              Lakukan Presensi
            </h2>
            <p className="text-gray-300">Silakan lengkapi data lokasi dan foto untuk melakukan presensi</p>
          </div>

          {/* Alerts */}
          {(message || error) && (
            <div className="max-w-2xl mx-auto transition-all duration-300 ease-in-out">
              {message && (
                <div className="bg-green-500/20 border-l-4 border-green-500 text-green-300 p-4 rounded shadow-md flex items-center" role="alert">
                  <span className="text-2xl mr-2">✅</span>
                  <span className="font-medium">{message}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-500/20 border-l-4 border-red-500 text-red-300 p-4 rounded shadow-md flex items-center" role="alert">
                  <span className="text-2xl mr-2">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Card */}
            <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lokasi Anda
                </h3>
                {coords && (
                  <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full font-medium border border-green-500/50">
                    Terdeteksi
                  </span>
                )}
              </div>

              <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-inner border border-white/10 relative group">
                {coords ? (
                  <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[coords.lat, coords.lng]}>
                      <Popup>Lokasi Presensi Anda</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full w-full bg-gray-800 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                    <svg className="w-12 h-12 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Mencari lokasi...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Card (Camera + Actions) */}
            <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Foto Selfie
                </h3>
                {image ? (
                  <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full font-medium border border-green-500/50">
                    Siap Upload
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full font-medium border border-yellow-500/50">
                    Belum Ada Foto
                  </span>
                )}
              </div>

              <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-white/10 bg-gray-900 relative flex items-center justify-center group mb-4">
                {image ? (
                  <img src={image} alt="Selfie" className="h-full w-full object-cover" />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user", aspectRatio: 1 }}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="mb-8">
                {!image ? (
                  <button
                    onClick={capture}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg transform active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ambil Foto
                  </button>
                ) : (
                  <button
                    onClick={() => setImage(null)}
                    className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg transform active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Foto Ulang
                  </button>
                )}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">Konfirmasi Kehadiran</h4>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCheckIn}
                    disabled={loading}
                    className={`w-full py-4 px-8 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-1 flex items-center justify-center gap-3 ${loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-green-900/50'
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        CHECK-IN MASUK
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className={`w-full py-4 px-8 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-1 flex items-center justify-center gap-3 ${loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 hover:shadow-red-900/50'
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        CHECK-OUT PULANG
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default AttendancePage;