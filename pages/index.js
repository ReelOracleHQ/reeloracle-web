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
      setHeroMovie(movies[0]); // Sets highest rated as Movie of the Day
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
        .limit(10);
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
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderPlatforms = (platforms, title) => {
    if (!platforms) return <span className="text-gray-500 italic">Verifying...</span>;
    return platforms.split(',').map((p, i) => (
      <button key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-[#00D4FF] hover:text-black transition-all text-xs font-bold uppercase mr-2 mt-2">
        ▶️ {p.trim()}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-[#060914] text-white font-sans">
      {/* --- NAVBAR & SEARCH --- */}
      <nav className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-[#060914]/80 backdrop-blur-xl z-50">
        <div className="text-2xl font-black tracking-tighter">REEL<span className="text-[#00D4FF]">ORACLE</span></div>
        <input 
          type="text" 
          placeholder="Search 10,000+ movies..." 
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-xl px-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-[#00D4FF] outline-none transition-all"
        />
        <a href="https://t.me/ReelOracleHQBot" className="bg-[#00D4FF] text-black px-6 py-2 rounded-xl font-bold text-sm">TRY BOT</a>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isSearching ? (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {searchResults.map(m => (
              <div key={m.id} className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold">{m.title}</h3>
                <p className="text-[#00D4FF] text-sm">⭐ {m.imdb_rating} | {m.language}</p>
                {renderPlatforms(m.platforms, m.title)}
              </div>
            ))}
          </section>
        ) : (
          <>
            {/* --- HERO SECTION --- */}
            {heroMovie && (
              <section className="flex flex-col lg:flex-row items-center gap-16 py-12 border-b border-white/5 mb-16">
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <span className="text-[#00D4FF] font-black tracking-[0.3em] text-xs uppercase">Movie of the Day</span>
                  <h1 className="text-6xl lg:text-8xl font-black leading-tight tracking-tighter">{heroMovie.title}</h1>
                  <div className="flex justify-center lg:justify-start gap-4 opacity-60 font-bold">
                    <span>⭐ {heroMovie.imdb_rating}</span>
                    <span>•</span>
                    <span>{heroMovie.year}</span>
                    <span>•</span>
                    <span>{heroMovie.language}</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Stream it on:</p>
                    {renderPlatforms(heroMovie.platforms, heroMovie.title)}
                  </div>
                  
                  {/* REFRESH BUTTON FOR ADMIN */}
                  <button 
                    onClick={() => handleRefresh(heroMovie)}
                    disabled={isRefreshing}
                    className="mt-8 text-[10px] font-bold border border-yellow-500/30 text-yellow-500/50 px-4 py-2 rounded-lg hover:border-yellow-500 hover:text-yellow-500 transition-all"
                  >
                    {isRefreshing ? 'REFRESHING...' : '🔄 REFRESH METADATA'}
                  </button>
                </div>

                <div className="flex-1 max-w-sm">
                  <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                    {heroMovie.poster_url ? (
                      <img src={heroMovie.poster_url} alt={heroMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center opacity-20"><span className="text-6xl">🎬</span><p className="mt-4 font-bold uppercase tracking-widest text-xs">Image Pending</p></div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* --- TOP RATED GRID --- */}
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Masterpieces</h2>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {topMovies.slice(1).map(m => (
                <div key={m.id} className="group cursor-pointer">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-4 group-hover:border-[#00D4FF]/50 transition-all bg-white/5">
                    {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center opacity-10">🎬</div>}
                  </div>
                  <h3 className="font-bold truncate">{m.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black">⭐ {m.imdb_rating} | {m.year}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
