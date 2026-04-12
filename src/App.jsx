import { useState } from 'react';
import { getAccessToken, searchTrackAndArtist } from './services/spotify';
import { classifyByGenre } from './utils/classifier';
import MovieResult from './components/MovieResult';
import SearchBar from './components/SearchBar';
import { Film, Sparkles } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const trackWithGenre = await searchTrackAndArtist(query, token);
      if (trackWithGenre) {
        const classification = classifyByGenre(trackWithGenre.genres, trackWithGenre.name);
        setResult({
          ...classification,
          trackName: trackWithGenre.name, // Nama lagu
          artistName: trackWithGenre.artists[0].name, // Nama artis
          albumCover: trackWithGenre.album.images[0]?.url // AMBIL COVER ALBUM
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-red-500/30">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto py-20 px-6 space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm mb-4">
            <Sparkles size={14} className="text-yellow-500" />
            <span>AI-Powered Soundtrack Analysis</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
            Cinematic <span className="text-red-600">Scorer</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Masukkan lagu favoritmu dan biarkan algoritma kami menentukan di genre film mana lagu itu seharusnya berada.
          </p>
        </header>

        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          onSearch={handleAnalyze} 
          loading={loading} 
        />

        {result ? (
          <MovieResult result={result} />
        ) : (
          /* UX: Empty State */
          <div className="py-20 border-2 border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center text-zinc-700">
            <Film size={48} className="mb-4 opacity-20" />
            <p>Belum ada data untuk dianalisis</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;