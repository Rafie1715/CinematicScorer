import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({ query, setQuery, onSearch, loading }) => {
  return (
    <form onSubmit={onSearch} className="relative group max-w-2xl mx-auto w-full">
      <input
        type="text"
        value={query}
        placeholder="Cari lagu atau artis..."
        className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 pl-14 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-white placeholder:text-zinc-600"
        onChange={(e) => setQuery(e.target.value)}
      />
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={20} />
      <button
        disabled={loading}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Analyze'}
      </button>
    </form>
  );
};

export default SearchBar;