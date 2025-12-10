import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Webcam from "react-webcam";

// Fix untuk default marker icon di React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function PresensiCard() {
  const [coords, setCoords] = useState(null); 
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const webcamRef = useRef(null);

  const capture = () => {
    const imgSrc = webcamRef.current.getScreenshot();
    setImage(imgSrc);
  };

  // ======================================================
  // Ambil Lokasi User
  // ======================================================
  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
          setLocationLoading(false);
        }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // ======================================================
  // Handle Check-In
  // ======================================================
  const handleCheckIn = async () => {
    if (!coords || !image) {
      setError("Lokasi dan Foto wajib ada!");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('image', blob, 'selfie.jpg');

      const token = localStorage.getItem("token");
      await axios.post('http://localhost:3001/api/presensi/check-in', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("Check-in berhasil!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan check-in");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Handle Check-Out
  // ======================================================
  const handleCheckOut = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {
          latitude: coords?.lat,
          longitude: coords?.lng
        },
        config
      );

      setMessage(response.data.message);
      setError("");

    } catch (err) {
      setError(err.response?.data?.message || "Gagal melakukan check-out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Presensi Kehadiran</h2>
        <p className="text-gray-300 mb-6">Kelola check-in dan check-out Anda</p>

        {/* ========================== ALERTS ========================== */}
        {message && (
          <div className="bg-green-500/20 border-l-4 border-green-500 text-green-300 p-4 rounded mb-4 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border-l-4 border-red-500 text-red-300 p-4 rounded mb-4 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ========================== MAP ========================== */}
        {locationLoading ? (
          <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10 mb-6">
            <div className="h-80 flex items-center justify-center text-gray-400 animate-pulse">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p>Mencari lokasi Anda...</p>
              </div>
            </div>
          </div>
        ) : coords ? (
          <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10 mb-6">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Lokasi Anda
            </h3>
            <div className="h-80 rounded-xl overflow-hidden border border-white/10">
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[coords.lat, coords.lng]}>
                  <Popup>Lokasi Presensi: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        ) : null}

        {/* ========================== KAMERA & FOTO ========================== */}
        <div className="my-4 border rounded-lg bg-black">
          {image ? (
            <img src={image} className="w-full" />
          ) : (
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full" />
          )}
        </div>
        <div className="mb-4">
          {!image ? (
            <button onClick={capture} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Ambil Foto 📸
            </button>
          ) : (
            <button onClick={() => setImage(null)} className="bg-gray-500 text-white px-4 py-2 rounded w-full">
              Foto Ulang 🔄
            </button>
          )}
        </div>
        {/* ========================== BUTTONS ========================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={loading || !coords}
            className={`py-4 px-6 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !coords
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg hover:shadow-green-900/50'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                CHECK-IN MASUK
              </>
            )}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading}
            className={`py-4 px-6 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-900/50'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                CHECK-OUT PULANG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PresensiCard;