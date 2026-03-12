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

  const openOTT = (movie, platform) => {
    const p = platform.trim().toLowerCase();
    let finalLink = movie.ott_links?.[platform.trim()];

    // STRATEGIC FALLBACK: Direct Deep-Linking
    if (!finalLink || finalLink === "#") {
      const q = encodeURIComponent(movie.title);
      if (p.includes('netflix')) finalLink = `https://www.netflix.com/search?q=${q}`;
      else if (p.includes('prime')) finalLink = `https://www.primevideo.com/search?phrase=${q}`;
      else if (p.includes('hotstar') || p.includes('jio')) finalLink = `https://www.hotstar.com/in/explore?search_query=${q}`;
      else if (p.includes('zee5')) finalLink = `https://www.zee5.com/search?q=${q}`;
      else finalLink = `https://www.google.com/search?q=watch+${q}+on+${p}`;
    }

    window.open(finalLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-[#00D4FF] selection:text-black">
      {/* --- PREMIUM NAVBAR --- */}
      <nav className="px-8 py-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 bg-[#02040a]/80 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
          <div className="w-8 h-8 bg-[#00D4FF] rounded-lg flex items-center justify-center text-black font-black">R</div>
          <div className="text-xl font-black tracking-tighter">REEL<span className="text-[#00D4FF]">ORACLE</span></div>
        </div>
        
        <div className="relative w-full max-w-2xl">
          <input 
            type="text" 
            placeholder="Search our 10,000+ movie intelligence database..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-7 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-[#00D4FF] focus:bg-white/10 outline-none transition-all placeholder:text-gray-600 font-medium"
          />
          {isSearching && <div className="absolute right-5 top-4 animate-spin h-5 w-5 border-2 border-[#00D4FF] border-t-transparent rounded-full"></div>}
        </div>

        <a href="https://t.me/ReelOracleHQBot" target="_blank" className="bg-[#00D4FF] hover:bg-[#00b8e6] text-black px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">ACCESS BOT</a>
      </nav>

      <main className="max-w-[1600px] mx-auto px-8 py-12">
        {isSearching ? (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-1 bg-white/10"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.6em] text-[#00D4FF]">Oracle Search Results</h2>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {searchResults.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); setIsSearching(false); setSearchQuery(''); window.scrollTo({top:0, behavior:'smooth'});}} className="cursor-pointer group">
                  <div className="aspect-[2/3] rounded-3xl overflow-hidden border border-white/5 mb-4 group-hover:border-[#00D4FF] transition-all relative">
                    {m.poster_url ? <img src={m.poster_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="h-full flex items-center justify-center bg-white/5 opacity-20 text-4xl">🎬</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <span className="text-[10px] font-black bg-[#00D4FF] text-black px-2 py-1 rounded">VIEW INTEL</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold truncate group-hover:text-[#00D4FF]">{m.title}</h3>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            {/* --- CINEMATIC HERO --- */}
            {heroMovie && (
              <section className="relative min-h-[70vh] flex flex-col lg:flex-row items-center gap-20 py-16 mb-24 animate-in fade-in zoom-in-95 duration-1000">
                <div className="flex-1 space-y-10 text-center lg:text-left z-10">
                  <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4">
                    <span className="bg-[#00D4FF]/10 text-[#00D4FF] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00D4FF]/20">Verified by Oracle</span>
                    <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Global Ranking #1</span>
                  </div>
                  
                  <h1 className="text-7xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter drop-shadow-2xl">
                    {heroMovie.title}
                  </h1>

                  <div className="flex justify-center lg:justify-start gap-8 opacity-40 text-[11px] font-black uppercase tracking-[0.3em]">
                    <span className="flex items-center gap-2"><span className="text-[#00D4FF]">★</span> {heroMovie.imdb_rating || '8.5'}</span>
                    <span>{heroMovie.year || '2024'}</span>
                    <span>{heroMovie.language}</span>
                    <span className="hidden md:block">ULTRA HD</span>
                  </div>

                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md max-w-2xl">
                    <p className="text-[#00D4FF] text-[10px] font-black uppercase tracking-widest mb-4">The Oracle Verdict</p>
                    <p className="text-gray-400 text-lg leading-relaxed font-medium">
                      {heroMovie.description || `An exceptional masterpiece in ${heroMovie.language} cinema. Our intelligence suggests this is a high-priority watch for fans of quality storytelling.`}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Authorized Streamers</p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                      {heroMovie.platforms?.split(',').map((p, i) => (
                        <button 
                          key={i} 
                          onClick={() => openOTT(heroMovie, p)}
                          className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs hover:bg-[#00D4FF] transition-all flex items-center gap-3 group"
                        >
                          <span className="group-hover:scale-125 transition-transform">▶</span> {p.trim().toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full max-w-xl relative group">
                  <div className="absolute -inset-4 bg-[#00D4FF]/20 rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
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

            {/* --- COMPETITOR-BEATING GRID --- */}
            <div className="flex items-center justify-between mb-12">
               <h2 className="text-xs font-black uppercase tracking-[0.8em] text-white/20">Masterpieces Collection</h2>
               <div className="h-px flex-1 bg-white/5 mx-8"></div>
               <span className="text-[10px] font-black text-[#00D4FF]/40 uppercase tracking-widest">{topMovies.length} ENTRIES</span>
            </div>
            
            <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
              {topMovies.map(m => (
                <div key={m.id} onClick={() => {setHeroMovie(m); window.scrollTo({top: 0, behavior: 'smooth'});}} className="group cursor-pointer">
                  <div className={`aspect-[2/3] rounded-[2rem] overflow-hidden border transition-all duration-700 mb-6 ${heroMovie?.id === m.id ? 'border-[#00D4FF] shadow-[0_0_40px_rgba(0,212,255,0.3)]' : 'border-white/5 group-hover:border-white/20 group-hover:translate-y-[-8px]'}`}>
                    {m.poster_url ? (
                      <img src={m.poster_url} className={`w-full h-full object-cover transition-all duration-700 ${heroMovie?.id === m.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-white/5 text-4xl opacity-10">🎬</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-black text-sm truncate transition-colors ${heroMovie?.id === m.id ? 'text-[#00D4FF]' : 'text-gray-400 group-hover:text-white'}`}>{m.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">★ {m.imdb_rating}</p>
                      <p className="text-[9px] text-white/10 font-black uppercase">{m.year}</p>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
      
      <footer className="mt-40 p-32 text-center border-t border-white/5 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-xl mx-auto space-y-8">
           <div className="text-2xl font-black tracking-tighter opacity-20">REEL<span className="text-[#00D4FF]">ORACLE</span></div>
           <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/10 leading-loose">
             Global Movie Intelligence Network • Powered by Gemini Ultra • Distributed by ReelOracleHQ
           </p>
           <div className="pt-8 opacity-10 text-[9px] font-black">© 2026 • ALL INTEL SECURED</div>
        </div>
      </footer>
    </div>
  );
}
