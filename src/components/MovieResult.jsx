import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Download, Heart, Share2, Sparkles } from 'lucide-react';
import { formatDuration, capitalizeText } from '../utils/formatters';

const FeatureRadar = lazy(() => import('./FeatureRadar'));

const MovieResult = ({
  result,
  onToggleFavorite,
  isFavorite = false,
  onCalibrationFeedback,
  tropeOptions = [],
  hideMobileActionBar = false,
}) => {
  // Gunakan cover album Spotify. Jika tidak ada, baru pakai poster default.
  const imageUrl = result.albumCover || result.poster;
  const confidence = Math.max(0, Math.min(100, result.confidence ?? 0));
  const displayTrackName = result.trackName ? capitalizeText(result.trackName) : '-';
  const displayArtistName = result.artistName ? capitalizeText(result.artistName) : '-';
  const sortedScores = [...(result.tropeScores || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const signalQuality = result.signalQuality || 'medium';

  const signalBadgeClass = signalQuality === 'high'
    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
    : signalQuality === 'medium'
      ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
      : 'bg-red-500/15 border-red-400/40 text-red-200';
  const sceneLabel = result.appliedContext && result.appliedContext !== 'auto'
    ? `Scene Lens: ${result.appliedContext}`
    : 'Scene Lens: auto';
  const analysisModeLabel = result.analysisMode === 'lyric' ? 'Sumber: metadata + lirik' : 'Sumber: metadata';
  const lyricStatusLabel = result.analysisMode === 'lyric'
    ? (result.lyricStatus === 'found' ? 'Lirik: ditemukan' : 'Lirik: tidak tersedia')
    : '';
  const [showCorrectionOptions, setShowCorrectionOptions] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [showMobileActionBar, setShowMobileActionBar] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 8;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (window.innerWidth >= 640) {
        setShowMobileActionBar(true);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY <= 12) {
        setShowMobileActionBar(true);
      } else if (delta > threshold) {
        setShowMobileActionBar(false);
      } else if (delta < -threshold) {
        setShowMobileActionBar(true);
      }

      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (hideMobileActionBar) {
      setShowMobileActionBar(false);
    } else if (window.innerWidth < 640) {
      setShowMobileActionBar(true);
    }
  }, [hideMobileActionBar]);

  const summaryText = [
    `Cinematic Scorer Result`,
    `Track: ${displayTrackName} - ${displayArtistName}`,
    `Predicted Trope: ${result.genre}`,
    `Confidence: ${confidence}%`,
    `${sceneLabel}`,
    result.matchedKeywords?.length ? `Keywords: ${result.matchedKeywords.join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const handleCopySummary = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = summaryText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShareStatus('Summary berhasil disalin ke clipboard.');
    } catch {
      setShareStatus('Gagal menyalin summary. Coba lagi.');
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) {
      setShareStatus('Card tidak ditemukan untuk diunduh.');
      return;
    }

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#09090b',
      });

      const link = document.createElement('a');
      const safeTrackName = displayTrackName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `cinematic-scorer-${safeTrackName || 'result'}.png`;
      link.href = dataUrl;
      link.click();
      setShareStatus('Card berhasil diunduh sebagai PNG.');
    } catch {
      setShareStatus('Gagal mengunduh card. Coba lagi.');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${result.color} p-1 shadow-2xl mt-8 animate-float-soft`}
    >
      <div className="bg-[#09090b]/95 backdrop-blur-xl rounded-[22px] p-4 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-8">
        
        {/* Kolom Kiri: Gambar & Radar */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4 sm:gap-6">
          <img 
            src={imageUrl} 
            alt="Album Cover" 
            className="w-full aspect-square object-cover rounded-xl shadow-lg border border-white/10"
          />
          
          {/* Radar Chart ditampilkan di bawah gambar */}
          {result.stats && (
            <div className="bg-zinc-900/50 rounded-xl p-3 sm:p-4 border border-white/5 overflow-visible">
               <p className="text-xs text-center text-zinc-400 mb-2 font-semibold tracking-wider">AI HEURISTIC STATS</p>
               <Suspense
                 fallback={<div className="h-72 sm:h-80 rounded-lg bg-zinc-800/70 animate-pulse" />}
               >
                 <FeatureRadar data={result.stats} />
               </Suspense>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Teks & Detail */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Prediksi Soundtrack Untuk:
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-3 text-white leading-tight break-words">
            {result.genre}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg mb-5 sm:mb-8 italic leading-relaxed">
            "{result.description}"
          </p>

          <div className="mb-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite?.(result)}
                className={`hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider rounded-full border px-2.5 sm:px-3 py-1.5 transition-colors ${
                  isFavorite
                    ? 'border-rose-400/60 bg-rose-500/15 text-rose-200'
                    : 'border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <Heart size={14} className={isFavorite ? 'fill-rose-300' : ''} />
                {isFavorite ? 'Tersimpan di Favorit' : 'Simpan Hasil'}
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-300 px-2.5 sm:px-3 py-1.5 hover:border-zinc-500 transition-colors"
              >
                <Share2 size={14} />
                Salin Ringkasan
              </button>
              <button
                type="button"
                onClick={handleDownloadCard}
                className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-300 px-2.5 sm:px-3 py-1.5 hover:border-zinc-500 transition-colors"
              >
                <Download size={14} />
                Unduh Kartu
              </button>
            </div>

            {showDetails && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Mesin Heuristik v2</span>
                <span className="text-xs uppercase tracking-wider rounded-full border border-cyan-500/40 px-2 py-1 text-cyan-200 bg-cyan-500/10">
                  {analysisModeLabel}
                </span>
                {lyricStatusLabel && (
                  <span className="text-xs uppercase tracking-wider rounded-full border border-zinc-700 px-2 py-1 text-zinc-300 bg-zinc-900/70">
                    {lyricStatusLabel}
                  </span>
                )}
                <span className={`text-xs uppercase tracking-wider rounded-full border px-2 py-1 ${signalBadgeClass}`}>
                  Sinyal {signalQuality}
                </span>
                <span className="text-xs uppercase tracking-wider rounded-full border border-zinc-700 px-2 py-1 text-zinc-300 bg-zinc-900/70">
                  {sceneLabel}
                </span>
              </div>
            )}
          </div>

          {shareStatus && (
            <p className="text-xs text-cyan-200 mb-4">{shareStatus}</p>
          )}

          <div className="mb-5 sm:mb-6 rounded-xl border border-white/10 bg-zinc-950/40 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              <span>Tingkat Keyakinan</span>
              <span>{confidence}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${confidence}%` }} />
            </div>
            {result.matchedKeywords?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.matchedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-5 sm:mb-6 rounded-xl border border-white/10 bg-zinc-950/40 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">Alasan Singkat</p>
            <p className="text-sm text-zinc-200 leading-relaxed">{result.cinematicReason}</p>
          </div>

          <div className="mb-5 sm:mb-6">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
            </button>
          </div>

          {showDetails && sortedScores.length > 0 && (
            <div className="mb-5 sm:mb-6 rounded-xl border border-white/10 bg-zinc-950/40 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Trope Score Breakdown</p>
              {signalQuality === 'low' && (
                <p className="text-xs text-amber-200 mb-3">
                  Sinyal rendah: {result.signalReason || 'Data genre terlalu minim, hasil bersifat perkiraan.'}
                </p>
              )}
              <div className="space-y-2">
                {sortedScores.map((entry) => (
                  <div key={entry.trope}>
                    <div className="flex items-center justify-between text-xs text-zinc-300 mb-1">
                      <span>{entry.genre}</span>
                      <span>{entry.normalizedScore}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${entry.normalizedScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showDetails && (
            <div className="mb-5 sm:mb-6 rounded-xl border border-white/10 bg-zinc-950/40 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">Tema & Makna Lagu</p>
              <p className="text-sm text-zinc-300 leading-relaxed mb-3">{result.songMeaning}</p>
              {result.lyricExcerpt && (
                <p className="text-xs text-zinc-300 italic border-l-2 border-cyan-500/40 pl-3 mb-3">
                  "{result.lyricExcerpt}"
                </p>
              )}
              {result.inferredThemes?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.inferredThemes.map((theme) => (
                    <span
                      key={theme}
                      className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-zinc-300 leading-relaxed mb-2">{result.explanationBasis}</p>
            </div>
          )}

          {showDetails && result.alternatives?.length > 0 && (
            <div className="mb-5 sm:mb-6 rounded-xl border border-white/10 bg-zinc-950/40 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" />
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Alternatif Vibe Sinematik</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {result.alternatives.map((item) => (
                  <div key={item.trope} className="rounded-lg border border-zinc-700/70 bg-zinc-900/70 p-2.5">
                    <p className="text-xs text-zinc-200 font-semibold">{item.genre}</p>
                    <p className="text-xs text-zinc-300">Keyakinan {item.confidence}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showDetails && (
          <div className="mb-5 sm:mb-6 rounded-xl border border-white/10 bg-zinc-950/40 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Bantu Kalibrasi</p>
            <p className="text-sm text-zinc-400 mb-3">Apakah hasil klasifikasi ini sudah sesuai menurutmu?</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  const success = onCalibrationFeedback?.(result.tropeKey);
                  setCalibrationStatus(success ? 'Feedback tersimpan. Terima kasih.' : 'Feedback gagal disimpan. Coba analyze ulang.');
                  setShowCorrectionOptions(false);
                }}
                className="text-xs rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5 text-emerald-200 hover:bg-emerald-500/25 transition-colors"
              >
                Ya, sudah sesuai
              </button>
              <button
                type="button"
                onClick={() => setShowCorrectionOptions((prev) => !prev)}
                className="text-xs rounded-full border border-amber-400/50 bg-amber-500/15 px-3 py-1.5 text-amber-200 hover:bg-amber-500/25 transition-colors"
              >
                Kurang tepat
              </button>
            </div>

            {showCorrectionOptions && tropeOptions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tropeOptions
                  .filter((option) => option.value !== result.tropeKey)
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const success = onCalibrationFeedback?.(option.value);
                        setCalibrationStatus(success ? `Feedback disimpan: lebih cocok ke ${option.label}.` : 'Feedback gagal disimpan. Coba analyze ulang.');
                        setShowCorrectionOptions(false);
                      }}
                      className="text-xs rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            )}

              {calibrationStatus && (
                <p className="text-xs text-emerald-300 mt-3">{calibrationStatus}</p>
              )}
          </div>
          )}
          
          <div className="border-t border-white/10 pt-5 sm:pt-6 mt-auto">
            <p className="text-sm text-zinc-400 mb-1">Track Dianalisis:</p>
            <p className="text-xl sm:text-2xl font-bold text-white break-words">
              {displayTrackName} <span className="text-zinc-500 font-normal">- {displayArtistName}</span>
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Durasi: {result.durationMs ? formatDuration(result.durationMs) : '-'}
            </p>
          </div>
        </div>
        
      </div>

      <div
        className={`sm:hidden fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-zinc-700 bg-zinc-950/95 backdrop-blur-xl p-2 shadow-2xl transition-all duration-300 ${
          showMobileActionBar && !hideMobileActionBar ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite?.(result)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs uppercase tracking-wide transition-colors ${
              isFavorite
                ? 'border-rose-400/70 bg-rose-500/15 text-rose-200'
                : 'border-zinc-700 bg-zinc-900 text-zinc-200'
            }`}
          >
            <Heart size={13} className={isFavorite ? 'fill-rose-300' : ''} />
            Simpan
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-2 text-xs uppercase tracking-wide"
          >
            <Share2 size={13} />
            Salin
          </button>
          <button
            type="button"
            onClick={handleDownloadCard}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-2 text-xs uppercase tracking-wide"
          >
            <Download size={13} />
            Unduh PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieResult;