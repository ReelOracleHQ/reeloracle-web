import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: movies } = await supabase
      .from('movies')
      .select('*')
      .order('imdb_rating', { ascending: false })
      .limit(20);

    if (movies && movies.length > 0) {
      setTopMovies(movies);
      setHeroMovie(movies[0]); 
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      const { data } = await supabase
        .from('movies')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(12);
      setSearchResults(data || []);
    } else {
      setIsSearching(false);
    }
  };

  const handleRefresh = async (movie) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, title: movie.title })
      });
      if (res.ok) {
        alert("✅ Oracle has synced fresh data!");
        loadData(); // Reload data without refreshing page
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderPlatforms = (movie) => {
    if (!movie.platforms) return <span className="text-gray-500 italic text-[10px]">Verifying...</span>;
    
    return movie.platforms.split(',').map((p, i) => {
      // Map platform names to links in your DB if they exist
      const link = movie.ott_links?.[p.trim()] || "#";
      return (
        <a 
          key={i} 
          href={link}
          target="_blank"
          className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-[#00D4FF] hover:text-black transition-all text-[10px] font-bold uppercase mr-2 mt-2"
        >
          ▶️ {p.trim()}
        </a>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#060914] text-white font-sans">
      {/* --- NAVBAR --- */}
      <nav className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-[#060914]/80 backdrop-blur-xl z-50">
        <div className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => setIsSearching(false)}>
          REEL<span className="text-[#00D4FF]">ORACLE</span>
        </div>
        <input 
          type="text" 
          placeholder="Search 10,000+ movies..." 
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-xl px-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-[#00D4FF] outline-none transition-all"
        />
        <a href="https://t.me/ReelOracleHQBot" target="_blank" className="bg-[#00D4FF] text-black px-6 py-2 rounded-xl font-bold text-sm">TRY BOT</a>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isSearching ? (
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#00D4FF] mb-8 text-center">Search Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {searchResults.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); setIsSearching(false); window.scrollTo(0,0);}} className="cursor-pointer group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/5 mb-2 group-hover:border-[#00D4FF] transition-all">
                    {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center bg-white/5">🎬</div>}
                  </div>
                  <h3 className="text-xs font-bold truncate">{m.title}</h3>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            {/* --- HERO SECTION --- */}
            {heroMovie && (
              <section className="flex flex-col lg:flex-row items-center gap-16 py-12 border-b border-white/5 mb-16 animate-in fade-in duration-700">
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <span className="text-[#00D4FF] font-black tracking-[0.3em] text-[10px] uppercase">Oracle's Pick</span>
                  <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter">{heroMovie.title}</h1>
                  <div className="flex justify-center lg:justify-start gap-4 opacity-60 text-xs font-bold uppercase tracking-widest">
                    <span>⭐ {heroMovie.imdb_rating}</span>
                    <span>•</span>
                    <span>{heroMovie.year}</span>
                    <span>•</span>
                    <span>{heroMovie.language}</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Available Platforms:</p>
                    {renderPlatforms(heroMovie)}
                  </div>
                  
                  <button 
                    onClick={() => handleRefresh(heroMovie)}
                    disabled={isRefreshing}
                    className="mt-8 text-[9px] font-black border border-yellow-500/20 text-yellow-500/40 px-3 py-2 rounded-lg hover:border-yellow-500 hover:text-yellow-500 transition-all uppercase tracking-widest"
                  >
                    {isRefreshing ? '⌛ Processing...' : '🔄 Update Metadata'}
                  </button>
                </div>

                <div className="flex-1 max-w-sm">
                  <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,212,255,0.1)] bg-white/5">
                    {heroMovie.poster_url ? (
                      <img src={heroMovie.poster_url} alt={heroMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <span className="text-6xl mb-4">🎬</span>
                        <p className="font-bold uppercase tracking-widest text-[10px]">Image Pending</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* --- COLLECTION GRID --- */}
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 mb-8">Your Masterpieces</h2>
            <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {topMovies.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); window.scrollTo({top: 0, behavior: 'smooth'});}} className="group cursor-pointer">
                  <div className={`aspect-[2/3] rounded-2xl overflow-hidden border mb-4 transition-all duration-300 ${heroMovie?.id === m.id ? 'border-[#00D4FF] scale-95' : 'border-white/5 group-hover:border-white/20'}`}>
                    {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <div className="h-full flex items-center justify-center bg-white/5">🎬</div>}
                  </div>
                  <h3 className="font-bold text-sm truncate group-hover:text-[#00D4FF] transition-colors">{m.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">⭐ {m.imdb_rating}</p>
                    <p className="text-[10px] text-gray-400">{m.year}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
      
      <footer className="p-12 text-center border-t border-white/5 opacity-20 text-[10px] font-bold uppercase tracking-[0.3em]">
        © {new Date().getFullYear()} REEL ORACLE • Data by TMDB
      </footer>
    </div>
  );
}
