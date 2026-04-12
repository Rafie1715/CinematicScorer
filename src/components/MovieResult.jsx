import { motion } from 'framer-motion';
import FeatureRadar from './FeatureRadar';

const MovieResult = ({ result }) => {
  // Gunakan cover album Spotify. Jika tidak ada, baru pakai poster default.
  const imageUrl = result.albumCover || result.poster;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${result.color} p-1 shadow-2xl mt-8`}
    >
      <div className="bg-[#09090b]/95 backdrop-blur-xl rounded-[22px] p-6 flex flex-col md:flex-row gap-8">
        
        {/* Kolom Kiri: Gambar & Radar */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-6">
          <img 
            src={imageUrl} 
            alt="Album Cover" 
            className="w-full aspect-square object-cover rounded-xl shadow-lg border border-white/10"
          />
          
          {/* Radar Chart ditampilkan di bawah gambar */}
          {result.stats && (
            <div className="bg-zinc-900/50 rounded-xl p-2 border border-white/5">
               <p className="text-xs text-center text-zinc-500 mb-2 font-semibold tracking-wider">AI HEURISTIC STATS</p>
               <FeatureRadar data={result.stats} />
            </div>
          )}
        </div>

        {/* Kolom Kanan: Teks & Detail */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Predicted Soundtrack For:
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-3 text-white leading-tight">
            {result.genre}
          </h2>
          <p className="text-zinc-400 text-lg mb-8 italic">
            "{result.description}"
          </p>
          
          <div className="border-t border-white/10 pt-6 mt-auto">
            <p className="text-sm text-zinc-500 mb-1">Analyzed Track:</p>
            <p className="text-2xl font-bold text-white">
              {result.trackName} <span className="text-zinc-500 font-normal">— {result.artistName}</span>
            </p>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};

export default MovieResult;