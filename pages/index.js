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
      .limit(30);

    if (movies && movies.length > 0) {
      setTopMovies(movies);
      setHeroMovie(movies[0]); 
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
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
        alert("✅ Oracle Database Updated!");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openOTT = (movie, platform) => {
    const p = platform.trim().toLowerCase();
    let finalLink = movie.ott_links?.[platform.trim()];

    if (!finalLink || finalLink === "#") {
      const q = encodeURIComponent(movie.title);
      if (p.includes('netflix')) finalLink = `https://www.netflix.com/search?q=${q}`;
      else if (p.includes('prime')) finalLink = `https://www.primevideo.com/search/phrase=${q}`;
      else if (p.includes('hotstar') || p.includes('jio')) finalLink = `https://www.hotstar.com/in/explore?search_query=${q}`;
      else if (p.includes('zee5')) finalLink = `https://www.zee5.com/search?q=${q}`;
      else finalLink = `https://www.google.com/search?q=watch+${q}+on+${p}`;
    }
    window.open(finalLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-[#00D4FF] selection:text-black">
      {/* --- NAVBAR --- */}
      <nav className="px-8 py-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 bg-[#02040a]/80 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
          <div className="w-8 h-8 bg-[#00D4FF] rounded-lg flex items-center justify-center text-black font-black">R</div>
          <div className="text-xl font-black tracking-tighter">REEL<span className="text-[#00D4FF]">ORACLE</span></div>
        </div>
        
        <div className="relative w-full max-w-2xl">
          <input 
            type="text" 
            placeholder="Search our movie intelligence database..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-7 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-[#00D4FF] outline-none transition-all"
          />
        </div>

        <a href="https://t.me/ReelOracleHQBot" target="_blank" className="bg-[#00D4FF] text-black px-8 py-3 rounded-2xl font-black text-sm">ACCESS BOT</a>
      </nav>

      <main className="max-w-[1600px] mx-auto px-8 py-12">
        {isSearching ? (
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {searchResults.map(m => (
              <div key={m.id} onClick={() => {setHeroMovie(m); setIsSearching(false); setSearchQuery(''); window.scrollTo(0,0);}} className="cursor-pointer group">
                <div className="aspect-[2/3] rounded-3xl overflow-hidden border border-white/5 mb-4 group-hover:border-[#00D4FF] transition-all">
                  {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center bg-white/5 opacity-20 text-4xl">🎬</div>}
                </div>
                <h3 className="text-sm font-bold truncate group-hover:text-[#00D4FF]">{m.title}</h3>
              </div>
            ))}
          </section>
        ) : (
          <>
            {heroMovie && (
              <section className="relative min-h-[70vh] flex flex-col lg:flex-row items-center gap-20 py-16 mb-24">
                <div className="flex-1 space-y-10 text-center lg:text-left z-10">
                  <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4">
                    <span className="bg-[#00D4FF]/10 text-[#00D4FF] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00D4FF]/20">Verified by Oracle</span>
                    {/* RELOCATED REFRESH BUTTON */}
                    <button 
                      onClick={() => handleRefresh(heroMovie)}
                      disabled={isRefreshing}
                      className="text-[9px] font-black border border-yellow-500/30 text-yellow-500 px-3 py-1 rounded-full hover:bg-yellow-500 hover:text-black transition-all uppercase"
                    >
                      {isRefreshing ? 'Syncing...' : '🔄 Refresh Data'}
                    </button>
                  </div>
                  
                  <h1 className="text-7xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter drop-shadow-2xl">{heroMovie.title}</h1>

                  <div className="flex justify-center lg:justify-start gap-8 opacity-40 text-[11px] font-black uppercase tracking-[0.3em]">
                    <span>★ {heroMovie.imdb_rating || '8.5'}</span>
                    <span>{heroMovie.year}</span>
                    <span>{heroMovie.language}</span>
                  </div>

                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md max-w-2xl relative">
                    <p className="text-[#00D4FF] text-[10px] font-black uppercase tracking-widest mb-4">The Oracle Verdict</p>
                    <p className="text-gray-400 text-lg leading-relaxed font-medium">
                      {heroMovie.description || `High-priority watch in ${heroMovie.language} cinema.`}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Authorized Streamers</p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                      {heroMovie.platforms?.split(',').map((p, i) => (
                        <button key={i} onClick={() => openOTT(heroMovie, p)} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs hover:bg-[#00D4FF] transition-all flex items-center gap-3">
                          ▶ {p.trim().toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full max-w-xl">
                  <div className="aspect-[2/3] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative">
                    {heroMovie.poster_url ? (
                      <img src={heroMovie.poster_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-white/5 text-9xl opacity-10">🎬</div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <div className="flex items-center justify-between mb-12">
               <h2 className="text-xs font-black uppercase tracking-[0.8em] text-white/20">Masterpieces Collection</h2>
               <div className="h-px flex-1 bg-white/5 mx-8"></div>
            </div>
            
            <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
              {topMovies.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); window.scrollTo({top: 0, behavior: 'smooth'});}} className="group cursor-pointer">
                  <div className={`aspect-[2/3] rounded-[2rem] overflow-hidden border transition-all duration-700 mb-6 ${heroMovie?.id === m.id ? 'border-[#00D4FF]' : 'border-white/5 group-hover:border-white/20'}`}>
                    {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center bg-white/5 text-4xl opacity-10">🎬</div>}
                  </div>
                  <h3 className="font-black text-sm truncate">{m.title}</h3>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
