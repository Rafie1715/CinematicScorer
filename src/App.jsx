// src/App.jsx
import { useEffect, useState } from 'react';
import { redirectToSpotify, CLIENT_ID } from './utils/auth'; 
import { setAccessToken, getTopTracks, getAudioFeatures } from './services/spotifyApi';
import DNARadar from './components/DNARadar';
import { Music, Activity, Flame, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [token, setToken] = useState(null);
  const [dnaData, setDnaData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

  // 1. FUNGSI BARU: Menukar 'code' dari URL menjadi Access Token
  const fetchToken = async (code) => {
    const codeVerifier = window.localStorage.getItem('code_verifier');

    const payload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    };

    try {
      // Menggunakan URL Endpoint resmi Spotify untuk mendapatkan Token
      const response = await fetch("https://accounts.spotify.com/api/token", payload);
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error saat menukar token:", error);
      return null;
    }
  };

  // 2. USEEFFECT DI-UPDATE: Mendeteksi '?code=' dari URL setelah login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const initLogin = async () => {
      if (code) {
        const accessToken = await fetchToken(code);
        if (accessToken) {
          setToken(accessToken);
          setAccessToken(accessToken);
          // Membersihkan URL agar tidak ada '?code=...' yang panjang dan jelek
          window.history.replaceState({}, document.title, "/"); 
          generatePersona(accessToken);
        }
      }
    };

    initLogin();
  }, []);

  // Fungsi pengambilan data tetap sama
  const generatePersona = async () => {
    setIsLoading(true);
    try {
      const tracks = await getTopTracks();
      const ids = tracks.map(t => t.id).join(',');
      const features = await getAudioFeatures(ids);
      
      const validFeatures = features.filter(f => f !== null);

      const avg = (key) => validFeatures.reduce((acc, curr) => acc + curr[key], 0) / validFeatures.length;
      
      const chartData = [
        { subject: 'Energy', A: Math.round(avg('energy') * 100) },
        { subject: 'Danceability', A: Math.round(avg('danceability') * 100) },
        { subject: 'Valence', A: Math.round(avg('valence') * 100) },
        { subject: 'Acousticness', A: Math.round(avg('acousticness') * 100) },
        { subject: 'Instrumentalness', A: Math.round(avg('instrumentalness') * 100) },
      ];
      
      setDnaData(chartData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilan Halaman Login
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-darkbase px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl font-black mb-6 tracking-tighter text-white">
            Persona<span className="text-spotify">Music</span>
          </h1>
          <p className="text-zinc-400 mb-10 text-lg max-w-md mx-auto">
            Analisis kebiasaan mendengarkanmu dan temukan DNA musik visualmu berdasarkan data Spotify.
          </p>
          
          {/* 3. TOMBOL LOGIN DI-UPDATE: Menggunakan button onClick, bukan <a href> */}
          <button 
            onClick={redirectToSpotify} 
            className="inline-flex items-center gap-3 bg-spotify hover:bg-[#1ed760] text-black font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <Music size={20} />
            Connect with Spotify
          </button>

        </motion.div>
      </div>
    );
  }

  // Tampilan Utama (Dashboard)
  return (
    <div className="min-h-screen bg-darkbase p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <h2 className="text-3xl font-black tracking-tight text-white">Your Music DNA</h2>
          <button 
            onClick={() => { setToken(null); window.location.reload(); }}
            className="text-sm text-zinc-500 hover:text-white transition"
          >
            Logout
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-spotify mb-4" size={40} />
            <p className="text-zinc-400 font-medium">Menganalisis frekuensi audio...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2">
              {dnaData.length > 0 && <DNARadar data={dnaData} />}
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                <Activity className="text-spotify mb-3" size={28} />
                <p className="text-sm text-zinc-400 font-medium mb-1">Dominant Trait</p>
                <p className="text-2xl font-bold text-white">
                  {dnaData.length > 0 ? [...dnaData].sort((a, b) => b.A - a.A)[0].subject : 'Loading'}
                </p>
              </div>

              <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                <Flame className="text-orange-500 mb-3" size={28} />
                <p className="text-sm text-zinc-400 font-medium mb-1">Energy Level</p>
                <p className="text-2xl font-bold text-white">
                  {dnaData.length > 0 ? `${dnaData.find(d => d.subject === 'Energy')?.A}%` : '0%'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;