import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({
  query,
  setQuery,
  onSearch,
  loading,
  history = [],
  onPickHistory,
  onClearHistory,
  sceneContext = 'auto',
  onChangeSceneContext,
  contextOptions = [],
  analysisMode = 'metadata',
  onChangeAnalysisMode,
  onInputFocus,
  onInputBlur,
}) => {
  const lensDescription = {
    auto: 'Mode netral. Sistem menilai lagu murni dari genre dan judul.',
    romance: 'Mendorong hasil ke vibe romansa, intimacy, dan chemistry karakter.',
    action: 'Mendorong energi tinggi untuk adegan kejar-kejaran, konflik, dan momentum.',
    horror: 'Mendorong tensi gelap untuk adegan mencekam, misteri, dan jumpscare.',
    epic: 'Mendorong skala megah untuk adegan klimaks, perjalanan pahlawan, atau trailer.',
    chill: 'Mendorong mood tenang-reflektif untuk adegan kontemplatif dan ambience.',
    comedy: 'Mendorong nuansa ringan dan playful untuk adegan fun atau awkward comedy.',
  };

  const activeLensDescription = lensDescription[sceneContext] || lensDescription.auto;

  const modeDescription = analysisMode === 'lyric'
    ? 'Mode Lirik: memakai metadata + sinyal lirik (jika tersedia) untuk membaca tema dan makna lagu.'
    : 'Mode Metadata: analisis dari judul lagu, genre artis, dan Scene Lens.';

  return (
    <div className="max-w-2xl mx-auto w-full space-y-3">
      <form onSubmit={onSearch} className="relative group w-full pb-12 sm:pb-0">
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-orange-500/30 via-red-500/10 to-cyan-500/25 blur opacity-80 group-focus-within:opacity-100 transition-opacity" />
        <label htmlFor="track-search" className="sr-only">Cari lagu atau artis</label>
        <input
          id="track-search"
          type="text"
          value={query}
          placeholder="Cari lagu atau artis..."
          className="relative w-full bg-zinc-900/90 border-2 border-zinc-700 rounded-2xl py-3.5 sm:py-4 px-4 sm:px-6 pl-12 sm:pl-14 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all text-white placeholder:text-zinc-500 text-sm sm:text-base"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <Search className="absolute left-4 sm:left-5 top-[1.1rem] sm:top-1/2 sm:-translate-y-1/2 text-zinc-600 group-focus-within:text-orange-400 transition-colors" size={18} />
        <button
          disabled={loading}
          className="absolute left-0 right-0 bottom-0 sm:left-auto sm:right-2 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 sm:px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Analisis'}
        </button>
      </form>
      <p className="text-sm text-zinc-500 px-1">Tip: coba format judul + artis untuk hasil lebih akurat.</p>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/35 px-3 py-3">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Sumber Analisis</p>
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => onChangeAnalysisMode?.('metadata')}
            className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
              analysisMode === 'metadata'
                ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-100'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500'
            }`}
          >
            Mode Metadata
          </button>
          <button
            type="button"
            onClick={() => onChangeAnalysisMode?.('lyric')}
            className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
              analysisMode === 'lyric'
                ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-100'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500'
            }`}
          >
            Mode Lirik
          </button>
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed">{modeDescription}</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/35 px-3 py-3">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Scene Lens</p>
        <p className="text-sm text-zinc-400 mb-3 leading-relaxed">Pilih konteks adegan untuk mengarahkan hasil klasifikasi sesuai kebutuhanmu.</p>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {contextOptions.map((option) => {
            const active = sceneContext === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChangeSceneContext?.(option.value)}
                className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
                  active
                    ? 'border-orange-400/70 bg-orange-500/20 text-orange-100'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500'
                } whitespace-nowrap`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{activeLensDescription}</p>
      </div>

      {history.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Pencarian Terakhir</p>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Hapus
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPickHistory(item)}
                className="text-xs rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;