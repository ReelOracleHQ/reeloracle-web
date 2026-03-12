import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PLATFORM_LINKS = {
  'netflix': (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  'prime video': (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`,
  'amazon prime': (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`,
  'jiohotstar': (t) => `https://www.jiohotstar.com/search?q=${encodeURIComponent(t)}`,
  'hotstar': (t) => `https://www.jiohotstar.com/search?q=${encodeURIComponent(t)}`,
  'zee5': (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}`,
  'sonyliv': (t) => `https://www.sonyliv.com/search?query=${encodeURIComponent(t)}`,
  'jiocinema': (t) => `https://www.jiocinema.com/search/${encodeURIComponent(t)}`,
};

export default function Home() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadHomepage() {
      const { data: topData, error } = await supabase
        .from('movies')
        .select('*')
        .order('imdb_rating', { ascending: false })
        .limit(25);

      if (topData && !error) {
        setTopMovies(topData);
        const randomHero = topData[Math.floor(Math.random() * Math.min(topData.length, 5))];
        setHeroMovie(randomHero);
      }
    }
    loadHomepage();
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 2) {
      setIsSearching(true);
      const { data } = await supabase
        .from('movies')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('imdb_rating', { ascending: false })
        .limit(12);
      setSearchResults(data || []);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const getPlatformURL = (platform, title) => {
    const key = platform.toLowerCase().trim();
    for (const [name, fn] of Object.entries(PLATFORM_LINKS)) {
      if (key.includes(name)) return fn(title);
    }
    return `https://www.google.com/search?q=${encodeURIComponent(title + ' watch on ' + platform)}`;
  };

  const renderPlatforms = (platformsString, title) => {
    if (!platformsString) return <span className="text-gray-500 italic text-xs">Platforms pending...</span>;
    const plats = platformsString.split(',').map(p => p.trim());
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {plats.map((plat, i) => (
          <a 
            key={i} 
            href={getPlatformURL(plat, title)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#16152B] border border-[#33305C] rounded-md text-[10px] font-black text-white hover:bg-[#00D4FF] hover:text-black hover:border-[#00D4FF] transition-all shadow-sm flex items-center gap-1 uppercase tracking-tighter"
          >
            ▶️ {plat}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#060914] text-white font-sans selection:bg-[#00D4FF] selection:text-black">
      
      {/* ── NAVBAR ── */}
      <nav className="w-full p-6 border-b border-white/5 bg-[#060914]/90 backdrop-blur-2xl sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-3xl font-black tracking-tighter cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          REEL<span className="text-[#00D4FF]">ORACLE</span>
        </div>
        
        <div className="w-full max-w-xl relative">
          <input 
            type="text" 
            placeholder="Search 10,000+ movies across all OTTs..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-4 focus:ring-[#00D4FF]/10 transition-all"
          />
        </div>

        <a href="https://t.me/ReelOracleHQBot" target="_blank" className="hidden lg:flex items-center gap-2 bg-[#00D4FF] text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,212,255,0.2)]">
          TRY ON TELEGRAM
        </a>
      </nav>

      <main className="pb-24">
        
        {isSearching ? (
          <section className="px-6 lg:px-24 pt-12 max-w-7xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-xl font-black mb-8 text-gray-400 uppercase tracking-widest">Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <div className="py-20 text-center opacity-50"><span className="text-6xl">🔍</span><p className="mt-4">Oracle found no matches. Check spelling?</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((movie) => (
                  <div key={movie.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                    <h3 className="text-2xl font-black group-hover:text-[#00D4FF] transition-colors">{movie.title}</h3>
                    <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-tighter">⭐ {movie.imdb_rating} | {movie.language} | {movie.year}</p>
                    {renderPlatforms(movie.platforms, movie.title)}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* ── HERO ── */}
            {heroMovie && (
              <section className="px-6 lg:px-24 py-16 lg:py-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 border-b border-white/5">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="inline-block px-4 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] text-[10px] font-black tracking-[0.3em] uppercase">Movie of the Day</div>
                  <h2 className="text-6xl lg:text-9xl font-black leading-none tracking-tighter">{heroMovie.title}</h2>
                  <div className="flex justify-center lg:justify-start gap-4 text-xs font-black uppercase tracking-widest opacity-60">
                    <span>⭐ {heroMovie.imdb_rating} IMDb</span>
                    <span>•</span>
                    <span>{heroMovie.year}</span>
                    <span>•</span>
                    <span>{heroMovie.language}</span>
                  </div>
                  <div className="pt-6">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Available to stream on:</p>
                    <div className="flex justify-center lg:justify-start">
                        {renderPlatforms(heroMovie.platforms, heroMovie.title)}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 w-full max-w-md group">
                  <div className="relative aspect-[2/3] w-full rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#16152B] to-[#060914] shadow-2xl overflow-hidden transform group-hover:rotate-2 transition-transform duration-700">
                    {heroMovie.poster_url ? (
                      <img src={heroMovie.poster_url} alt={heroMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20"><span className="text-8xl">🎬</span><p className="mt-4 font-black">IMAGE PENDING</p></div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── MASTERPIECE ROW ── */}
            <section className="px-6 lg:px-24 pt-20 max-w-[1600px] mx-auto">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Top Rated Masterpieces</h2>
              <div className="flex gap-6 overflow-x-auto pb-12 snap-x no-scrollbar">
                {topMovies.map((movie) => (
                  <div key={movie.id} className="min-w-[320px] snap-start bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all cursor-pointer group hover:-translate-y-2">
                    <h3 className="text-2xl font-black truncate group-hover:text-[#00D4FF] transition-colors tracking-tight">{movie.title}</h3>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase">⭐ {movie.imdb_rating} / 10 • {movie.year}</p>
                    <div className="mt-6">
                      {renderPlatforms(movie.platforms, movie.title)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FOOTER CTA ── */}
            <section className="px-6 lg:px-24 py-24 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-[#16152B] to-[#060914] border border-white/5 p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 blur-[100px]" />
                <h2 className="text-4xl font-black mb-4 tracking-tighter">Settle the Debate.</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto font-medium">Add ReelOracle to your WhatsApp or Telegram group. Start live voting sessions and stop the "what should we watch" argument forever.</p>
                <a href="https://t.me/ReelOracleHQBot" target="_blank" className="inline-block bg-white text-black px-12 py-4 rounded-2xl font-black text-sm hover:bg-[#00D4FF] transition-all shadow-xl">
                  CONNECT BOT
                </a>
              </div>
            </section>
          </>
        )}
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
