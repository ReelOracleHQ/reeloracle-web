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
      .limit(24);

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
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openOTT = (movie, platform) => {
    const cleanPlatform = platform.trim();
    // 1. Try to get link from your 'ott_links' column
    // 2. If missing, use the general 'url' column
    // 3. If still missing, generate a smart Google search link
    let finalLink = movie.ott_links?.[cleanPlatform] || movie.url;

    if (!finalLink || finalLink === "#") {
      finalLink = `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+on+${encodeURIComponent(cleanPlatform)}`;
    }

    window.open(finalLink, '_blank', 'noopener,noreferrer');
  };

  const renderPlatforms = (movie) => {
    if (!movie.platforms) return <span className="text-gray-500 italic text-[10px]">Verifying Platforms...</span>;
    return movie.platforms.split(',').map((p, i) => (
      <button 
        key={i} 
        onClick={(e) => { e.stopPropagation(); openOTT(movie, p); }}
        className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-[#00D4FF] hover:text-black transition-all text-[10px] font-bold uppercase mr-2 mt-2"
      >
        ▶️ {p.trim()}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-[#060914] text-white font-sans selection:bg-[#00D4FF] selection:text-black">
      {/* --- NAVBAR --- */}
      <nav className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-[#060914]/90 backdrop-blur-2xl z-50">
        <div className="text-2xl font-black tracking-tighter cursor-pointer group" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
          REEL<span className="text-[#00D4FF] group-hover:drop-shadow-[0_0_10px_#00D4FF] transition-all">ORACLE</span>
        </div>
        <input 
          type="text" 
          placeholder="Search 10,000+ movies..." 
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-xl px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-[#00D4FF] focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
        />
        <a href="https://t.me/ReelOracleHQBot" target="_blank" className="bg-[#00D4FF] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95">TRY BOT</a>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isSearching ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#00D4FF] mb-12 text-center opacity-50">Discovery Mode</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {searchResults.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); setIsSearching(false); setSearchQuery(''); window.scrollTo({top:0, behavior:'smooth'});}} className="cursor-pointer group">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-3 group-hover:border-[#00D4FF] transition-all group-hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                    {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center bg-white/5">🎬</div>}
                  </div>
                  <h3 className="text-xs font-bold truncate group-hover:text-[#00D4FF]">{m.title}</h3>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            {/* --- HERO SECTION --- */}
            {heroMovie && (
              <section className="flex flex-col lg:flex-row items-center gap-16 py-12 border-b border-white/5 mb-20 animate-in fade-in zoom-in-95 duration-1000">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="inline-block px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5">
                    <span className="text-[#00D4FF] font-black tracking-[0.3em] text-[9px] uppercase">Oracle's Pick</span>
                  </div>
                  <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter">{heroMovie.title}</h1>
                  <div className="flex justify-center lg:justify-start gap-6 opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span>⭐ {heroMovie.imdb_rating || 'N/A'}</span>
                    <span>•</span>
                    <span>{heroMovie.year || '2024'}</span>
                    <span>•</span>
                    <span>{heroMovie.language}</span>
                  </div>
                  
                  <div className="pt-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-4 font-bold">Stream officially on:</p>
                    <div className="flex flex-wrap justify-center lg:justify-start">
                      {renderPlatforms(heroMovie)}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRefresh(heroMovie)}
                    disabled={isRefreshing}
                    className="mt-12 text-[9px] font-bold border border-white/5 text-white/20 px-4 py-2 rounded-lg hover:border-yellow-500/50 hover:text-yellow-500 transition-all uppercase tracking-widest"
                  >
                    {isRefreshing ? '⌛ Syncing...' : '🔄 Refresh Meta'}
                  </button>
                </div>

                <div className="flex-1 max-w-md w-full">
                  <div className="aspect-[2/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-white/5 relative group">
                    {heroMovie.poster_url ? (
                      <img src={heroMovie.poster_url} alt={heroMovie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <span className="text-8xl mb-4">🎬</span>
                        <p className="font-bold uppercase tracking-widest text-xs">Awaiting Data</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* --- MASTERPIECES GRID --- */}
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-12 text-center">Masterpieces Collection</h2>
            <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
              {topMovies.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); window.scrollTo({top: 0, behavior: 'smooth'});}} className="group cursor-pointer">
                  <div className={`aspect-[2/3] rounded-2xl overflow-hidden border transition-all duration-500 mb-4 ${heroMovie?.id === m.id ? 'border-[#00D4FF] shadow-[0_0_30px_rgba(0,212,255,0.2)]' : 'border-white/5 group-hover:border-white/20'}`}>
                    {m.poster_url ? (
                      <img src={m.poster_url} className={`w-full h-full object-cover transition-all duration-500 ${heroMovie?.id === m.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100 group-hover:scale-105'}`} />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-white/5 text-2xl opacity-10">🎬</div>
                    )}
                  </div>
                  <h3 className={`font-bold text-xs truncate transition-colors ${heroMovie?.id === m.id ? 'text-[#00D4FF]' : 'text-gray-400 group-hover:text-white'}`}>{m.title}</h3>
                  <p className="text-[9px] text-gray-600 font-black mt-1 uppercase tracking-tighter">⭐ {m.imdb_rating} • {m.year}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
      
      <footer className="p-20 text-center border-t border-white/5 opacity-20 text-[9px] font-bold uppercase tracking-[0.4em]">
        Reel Oracle HQ • Intelligence by Gemini • Data by TMDB
      </footer>
    </div>
  );
}
