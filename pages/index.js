import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Remove the || 'YOUR_KEY' part entirely!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial data on load
  useEffect(() => {
    async function loadHomepage() {
      // 1. Get Top 25 Movies for the Netflix-style row
      const { data: topData } = await supabase
        .from('movies')
        .select('*')
        .order('imdb_rating', { ascending: false })
        .limit(25);

      if (topData) {
        setTopMovies(topData);
        // 2. Pick a random highly-rated movie for the Hero section
        const randomHero = topData[Math.floor(Math.random() * Math.min(topData.length, 10))];
        setHeroMovie(randomHero);
      }
    }
    loadHomepage();
  }, []);

  // Live Search Function
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
      setSearchResults([]);
    }
  };

  // Helper to format platform buttons
  const renderPlatforms = (platformsString) => {
    if (!platformsString) return <span className="text-gray-500 italic text-sm">Verifying...</span>;
    const plats = platformsString.split(',').map(p => p.trim());
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {plats.map((plat, i) => (
          <div key={i} className="px-3 py-1.5 bg-[#16152B] border border-[#33305C] rounded-md text-xs font-bold text-white shadow-sm">
            ▶️ {plat}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-sans selection:bg-[#00D4FF] selection:text-black">
      
      {/* ── NAVBAR & SEARCH ── */}
      <nav className="w-full p-6 border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-xl sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-3xl font-black tracking-tighter">
          Reel<span className="text-[#00D4FF]">Oracle</span>
        </div>
        
        {/* The Live Search Bar */}
        <div className="w-full max-w-xl relative">
          <input 
            type="text" 
            placeholder="Search any movie (e.g., Pushpa 2, RRR)..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all"
          />
          {searchQuery && (
            <button onClick={() => {setSearchQuery(''); setIsSearching(false);}} className="absolute right-6 top-4 text-gray-400 hover:text-white">
              ✕
            </button>
          )}
        </div>

        <a href="https://t.me/ReelOracleHQBot" target="_blank" className="bg-gradient-to-r from-[#00D4FF] to-blue-500 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,212,255,0.3)] whitespace-nowrap hidden lg:block">
          Open in Telegram
        </a>
      </nav>

      <main className="pb-24">
        
        {/* ── CONDITIONAL VIEW: SEARCH RESULTS OR HOMEPAGE ── */}
        {isSearching ? (
          <section className="px-6 lg:px-24 pt-12 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-[#00D4FF]">Search Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <p className="text-gray-400 text-lg">No movies found. Try another search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((movie) => (
                  <div key={movie.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                    <h3 className="text-xl font-bold">{movie.title} <span className="text-gray-400 text-sm font-normal">({movie.year})</span></h3>
                    <p className="text-sm text-[#00D4FF] mt-1">⭐ {movie.imdb_rating} | 🌐 {movie.language}</p>
                    {renderPlatforms(movie.platforms)}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* ── HOMEPAGE HERO (Movie of the Day) ── */}
            {heroMovie && (
              <section className="px-6 lg:px-24 py-16 lg:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 border-b border-white/5">
                <div className="flex-1 space-y-6">
                  <h1 className="text-xs font-bold tracking-[0.2em] text-[#00D4FF] uppercase">Movie of the Day</h1>
                  <h2 className="text-5xl lg:text-7xl font-black leading-tight">{heroMovie.title}</h2>
                  <div className="flex gap-4 text-sm font-semibold opacity-80">
                    <span className="bg-white/10 px-3 py-1 rounded">⭐ {heroMovie.imdb_rating}</span>
                    <span className="bg-white/10 px-3 py-1 rounded">{heroMovie.year}</span>
                    <span className="bg-white/10 px-3 py-1 rounded">{heroMovie.language}</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Stream it instantly on:</p>
                    {renderPlatforms(heroMovie.platforms)}
                  </div>
                </div>
                <div className="flex-1 w-full max-w-sm">
                  <div className="relative aspect-[2/3] w-full rounded-2xl border border-white/20 bg-gradient-to-tr from-purple-900/40 to-blue-900/40 shadow-[0_0_50px_rgba(0,212,255,0.1)] flex items-center justify-center overflow-hidden">
                    {heroMovie.poster_url ? (
                      <img src={heroMovie.poster_url} alt={heroMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6"><span className="text-5xl">🎬</span><p className="mt-4 text-gray-400">Poster coming soon</p></div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── NETFLIX-STYLE ROW: TOP RATED ── */}
            <section className="px-6 lg:px-24 pt-16 max-w-[1600px] mx-auto overflow-hidden">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold">Top Rated Masterpieces</h2>
              </div>
              
              {/* Horizontal Scroll Container */}
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {topMovies.map((movie) => (
                  <div key={movie.id} className="min-w-[280px] max-w-[280px] snap-start bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group">
                    <h3 className="text-lg font-bold truncate group-hover:text-[#00D4FF] transition-colors">{movie.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">⭐ {movie.imdb_rating} | {movie.year}</p>
                    <div className="mt-4">
                      {renderPlatforms(movie.platforms)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CALL TO ACTION ── */}
            <section className="px-6 lg:px-24 pt-12 max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-[#00D4FF]/30 p-8 rounded-3xl">
                <h2 className="text-2xl font-bold mb-4">Watching with friends tonight?</h2>
                <p className="text-gray-300 mb-6">Don't argue over what to watch. Add ReelOracle to your Telegram group and type <span className="text-[#00D4FF] font-mono">/movienight</span> to start a live vote.</p>
                <a href="https://t.me/ReelOracleHQBot" target="_blank" className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                  Try the Group Bot
                </a>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
