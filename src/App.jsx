import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { getAccessToken, searchTrackAndArtist } from './services/spotify';
import { classifyByGenre, SCENE_CONTEXT_OPTIONS, TROPES } from './utils/classifier';
import { deriveLyricInsights, fetchLyrics } from './services/lyrics';
import {
  applyCalibrationUpdate,
  CALIBRATION_LOG_STORAGE_KEY,
  createEmptyProfile,
  loadCalibrationHistory,
  normalizeProfile,
  replayFeedbackToProfile,
  saveCalibrationHistory,
} from './utils/calibrationLearning';
import SearchBar from './components/SearchBar';
import { ArrowRight, Download, Film, Heart, PlayCircle, RotateCcw, Sparkles, SlidersHorizontal, Upload, Wand2 } from 'lucide-react';

const loadMovieResult = () => import('./components/MovieResult');
const MovieResult = lazy(loadMovieResult);

const getResultKey = (item) => item.trackId || `${item.trackName}-${item.artistName}`;
const PROFILE_STORAGE_KEY = 'cinematic-scorer-profile-v1';
const ANALYSIS_MODE_STORAGE_KEY = 'cinematic-scorer-analysis-mode-v1';

const inferTropeFromResult = (item) => {
  if (!item) return null;
  if (item.tropeKey && TROPES[item.tropeKey]) return item.tropeKey;
  if (Array.isArray(item.tropeScores) && item.tropeScores.length > 0) {
    const topByScore = [...item.tropeScores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
    if (topByScore?.trope && TROPES[topByScore.trope]) return topByScore.trope;
  }
  const byGenre = Object.entries(TROPES).find(([, trope]) => trope.genre === item.genre);
  return byGenre?.[0] || null;
};

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sceneContext, setSceneContext] = useState('auto');
  const [personalBoosts, setPersonalBoosts] = useState(createEmptyProfile);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('metadata');
  const [showPreferenceTools, setShowPreferenceTools] = useState(false);
  const importInputRef = useRef(null);

  const quickExamples = ['Bohemian Rhapsody', 'Time Hans Zimmer', '505 Arctic Monkeys', 'The Night We Met'];
  const quickSteps = [
    {
      icon: Wand2,
      title: 'Cari lagu',
      description: 'Ketik judul lagu atau nama artis. Coba format "judul + artis" untuk hasil paling akurat.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Pilih konteks',
      description: 'Sesuaikan Scene Lens dan Mode Lirik/Metadata agar hasil lebih cocok dengan kebutuhanmu.',
    },
    {
      icon: PlayCircle,
      title: 'Baca hasil',
      description: 'Lihat genre film, tingkat keyakinan, alasan singkat, lalu buka detail jika ingin tahu lebih dalam.',
    },
  ];
  const valuePills = ['Genre film paling cocok', 'Alasan singkat yang mudah dipahami', 'Detail lanjutan bila dibutuhkan'];

  useEffect(() => {
    const rawHistory = localStorage.getItem('cinematic-scorer-history');
    if (rawHistory) {
      try {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed.slice(0, 5));
        }
      } catch {
        localStorage.removeItem('cinematic-scorer-history');
      }
    }
  }, []);

  useEffect(() => {
    const rawFavorites = localStorage.getItem('cinematic-scorer-favorites');
    if (!rawFavorites) return;

    try {
      const parsed = JSON.parse(rawFavorites);
      if (Array.isArray(parsed)) {
        setFavorites(parsed.slice(0, 8));
      }
    } catch {
      localStorage.removeItem('cinematic-scorer-favorites');
    }
  }, []);

  useEffect(() => {
    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!rawProfile) return;

    try {
      const parsed = JSON.parse(rawProfile);
      if (parsed && typeof parsed === 'object') {
        setPersonalBoosts(normalizeProfile(parsed));
      }
    } catch {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const rawMode = localStorage.getItem(ANALYSIS_MODE_STORAGE_KEY);
    if (rawMode === 'metadata' || rawMode === 'lyric') {
      setAnalysisMode(rawMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ANALYSIS_MODE_STORAGE_KEY, analysisMode);
  }, [analysisMode]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      loadMovieResult();
    }
  }, [query]);

  const addToHistory = (value) => {
    const sanitized = value.trim();
    if (!sanitized) return;

    setSearchHistory((prev) => {
      const unique = [sanitized, ...prev.filter((item) => item.toLowerCase() !== sanitized.toLowerCase())].slice(0, 5);
      localStorage.setItem('cinematic-scorer-history', JSON.stringify(unique));
      return unique;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('cinematic-scorer-history');
  };

  const toggleFavorite = (item) => {
    const key = getResultKey(item);

    setFavorites((prev) => {
      const exists = prev.some((fav) => getResultKey(fav) === key);
      let next;

      if (exists) {
        next = prev.filter((fav) => getResultKey(fav) !== key);
      } else {
        next = [{ ...item, savedAt: Date.now() }, ...prev].slice(0, 8);
      }

      localStorage.setItem('cinematic-scorer-favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    addToHistory(normalizedQuery);

    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      const trackWithGenre = await searchTrackAndArtist(normalizedQuery, token);
      if (trackWithGenre) {
        let lyricalInsights = null;
        if (analysisMode === 'lyric') {
          const lyricsResponse = await fetchLyrics(trackWithGenre.artists[0].name, trackWithGenre.name);
          lyricalInsights = deriveLyricInsights(lyricsResponse);
        }

        const classification = classifyByGenre(
          trackWithGenre.genres,
          trackWithGenre.name,
          sceneContext,
          personalBoosts,
          lyricalInsights,
          analysisMode,
        );

        setResult({
          ...classification,
          trackId: trackWithGenre.id,
          trackName: trackWithGenre.name, // Nama lagu
          artistName: trackWithGenre.artists[0].name, // Nama artis
          albumCover: trackWithGenre.album.images[0]?.url, // AMBIL COVER ALBUM
          durationMs: trackWithGenre.duration_ms,
        });
      } else {
        setResult(null);
        setError('Lagu tidak ditemukan. Coba kata kunci yang lebih spesifik.');
      }
    } catch (err) {
      console.error(err);
      setResult(null);
      setError('Terjadi kendala saat mengambil data Spotify. Coba lagi sebentar lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalibrationFeedback = (targetTrope) => {
    if (!result) return;

    const predictedTrope = inferTropeFromResult(result);
    if (!predictedTrope || !targetTrope || !TROPES[targetTrope]) {
      setFeedbackMessage('Kalibrasi belum bisa disimpan untuk hasil ini. Coba analyze ulang satu kali.');
      return false;
    }

    const calibrationHistory = loadCalibrationHistory();

    setPersonalBoosts((prev) => {
      const update = applyCalibrationUpdate({
        profile: prev,
        history: calibrationHistory,
        predictedTrope,
        targetTrope,
        sceneContext,
        analysisMode,
        trackName: result.trackName || '',
        artistName: result.artistName || '',
      });

      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(update.nextProfile));
      saveCalibrationHistory(update.nextHistory);
      setFeedbackMessage(update.feedbackLabel);
      return update.nextProfile;
    });

    return true;
  };

  const downloadJson = (fileName, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCalibration = () => {
    const history = loadCalibrationHistory();
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      profile: personalBoosts,
      history,
    };
    downloadJson('cinematic-scorer-preferensi-saya.json', payload);
    setFeedbackMessage(`Berhasil disimpan. ${history.length} riwayat feedback dicadangkan.`);
  };

  const handleImportCalibration = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incomingHistory = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.history)
          ? parsed.history
          : [];

      const validHistory = incomingHistory.filter((item) => {
        return item && typeof item === 'object' && typeof item.predictedTrope === 'string' && typeof item.targetTrope === 'string';
      });

      if (validHistory.length === 0) {
        setFeedbackMessage('Gagal memuat preferensi: file tidak berisi data feedback yang valid.');
        return;
      }

      const replayedProfile = replayFeedbackToProfile(validHistory, createEmptyProfile());
      setPersonalBoosts(replayedProfile);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(replayedProfile));
      saveCalibrationHistory(validHistory);
      setFeedbackMessage(`Preferensi berhasil dimuat. ${validHistory.length} riwayat feedback diterapkan.`);
    } catch {
      setFeedbackMessage('Gagal memuat preferensi: format file tidak valid.');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handleResetCalibration = () => {
    const emptyProfile = createEmptyProfile();
    setPersonalBoosts(emptyProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(emptyProfile));
    localStorage.removeItem(CALIBRATION_LOG_STORAGE_KEY);
    setFeedbackMessage('Preferensi dikembalikan ke awal. Riwayat feedback dikosongkan.');
  };

  const currentIsFavorite = result
    ? favorites.some((fav) => getResultKey(fav) === getResultKey(result))
    : false;

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 selection:bg-red-500/30">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-700/20 blur-[140px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[40%] bg-cyan-700/15 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(239,68,68,0.24),transparent_20%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto pt-10 pb-28 md:py-20 px-4 sm:px-6 space-y-10 md:space-y-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-8 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/18 blur-3xl animate-glow-pulse"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-44 -z-10 h-60 w-60 rounded-full bg-cyan-400/12 blur-3xl animate-float-soft"
        />

        <header
          className="text-center space-y-4 md:space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-zinc-900/65 border border-zinc-700 text-zinc-300 text-xs md:text-sm mb-3 md:mb-4 backdrop-blur-sm">
            <Sparkles size={14} className="text-yellow-500" />
            <span>Analisis Soundtrack Berbasis AI</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight italic uppercase leading-[0.95] drop-shadow-[0_8px_28px_rgba(239,68,68,0.3)]">
            <span className="inline-block animate-float-soft">Cinematic</span>{' '}
            <span className="text-orange-500 inline-block animate-glow-pulse">Scorer</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed px-2">
            Masukkan lagu favoritmu dan biarkan algoritma kami menentukan di genre film mana lagu itu seharusnya berada.
          </p>
        </header>

        <section
          className="max-w-4xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-950/45 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              {valuePills.map((pill) => (
                <span
                  key={pill}
                  className="text-xs sm:text-sm rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {quickSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-zinc-800 bg-[#111113] p-4 shadow-[0_1px_0_rgba(255,255,255,0.02)] relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-300 text-xs font-bold border border-orange-400/30">
                      {index + 1}
                    </span>
                    <step.icon size={16} className="text-orange-300" />
                    <h2 className="text-sm sm:text-base font-semibold text-white">{step.title}</h2>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-1">
              <ArrowRight size={12} className="text-orange-400" />
              <span>Hasil akan langsung menjelaskan genre, makna singkat, dan alasan sinematiknya.</span>
            </div>
          </div>
        </section>

        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          onSearch={handleAnalyze} 
          loading={loading}
          history={searchHistory}
          onPickHistory={setQuery}
          onClearHistory={clearHistory}
          sceneContext={sceneContext}
          onChangeSceneContext={setSceneContext}
          contextOptions={SCENE_CONTEXT_OPTIONS}
          analysisMode={analysisMode}
          onChangeAnalysisMode={setAnalysisMode}
          onInputFocus={() => setIsInputFocused(true)}
          onInputBlur={() => setIsInputFocused(false)}
        />

        {error && (
          <div className="max-w-2xl mx-auto w-full rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {feedbackMessage && (
          <div className="max-w-2xl mx-auto w-full rounded-2xl border border-emerald-500/30 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-200">
            {feedbackMessage}
          </div>
        )}

        {result ? (
          <Suspense
            fallback={
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 animate-pulse">
                <div className="h-8 w-48 bg-zinc-800 rounded mb-4" />
                <div className="h-4 w-full bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-4/5 bg-zinc-800 rounded" />
              </div>
            }
          >
            <MovieResult
              result={result}
              onToggleFavorite={toggleFavorite}
              isFavorite={currentIsFavorite}
              onCalibrationFeedback={handleCalibrationFeedback}
              tropeOptions={Object.entries(TROPES).map(([value, data]) => ({ value, label: data.genre }))}
              hideMobileActionBar={isInputFocused}
            />
          </Suspense>
        ) : (
          <div
            className="py-12 md:py-16 border-2 border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center text-zinc-700 px-4 md:px-6"
          >
            <Film size={48} className="mb-4 opacity-20" />
            <p className="text-center mb-6">
              {error ? 'Belum ada hasil. Kamu bisa coba contoh pencarian di bawah.' : 'Belum ada data untuk dianalisis'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {quickExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="text-xs md:text-sm rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={16} className="text-rose-400" />
              <p className="text-sm uppercase tracking-wider text-zinc-400 font-semibold">Hasil Favorit</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {favorites.map((fav) => (
                <button
                  key={getResultKey(fav)}
                  type="button"
                  onClick={() => {
                    setResult(fav);
                    setQuery(`${fav.trackName} ${fav.artistName}`);
                    setError('');
                  }}
                  className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 hover:border-zinc-600 transition-colors"
                >
                  <p className="text-sm text-white font-semibold line-clamp-1">{fav.trackName}</p>
                  <p className="text-xs text-zinc-400 line-clamp-1 mb-1">{fav.artistName}</p>
                  <p className="text-[11px] uppercase tracking-wide text-orange-400">{fav.genre}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-2xl mx-auto w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/35 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Pengaturan Lanjutan</p>
              <p className="text-xs text-zinc-400">Opsional untuk backup atau pindah preferensi klasifikasi ke perangkat lain.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreferenceTools((prev) => !prev)}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              {showPreferenceTools ? 'Sembunyikan' : 'Lihat'}
            </button>
          </div>

          {showPreferenceTools && (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCalibration}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                  title="Simpan preferensi dan riwayat feedback ke file JSON"
                >
                  <Download size={13} />
                  Simpan Preferensi
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-500/20 transition-colors"
                  title="Muat kembali preferensi dari file JSON"
                >
                  <Upload size={13} />
                  Muat Preferensi
                </button>
                <button
                  type="button"
                  onClick={handleResetCalibration}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-500 transition-colors"
                  title="Kembalikan profil preferensi ke nilai awal"
                >
                  <RotateCcw size={13} />
                  Atur Ulang
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportCalibration}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Format file: JSON dari tombol Simpan Preferensi, atau JSON yang berisi properti history.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;