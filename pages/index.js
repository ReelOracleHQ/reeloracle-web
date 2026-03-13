import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── OTT CONFIG ───────────────────────────────────────────
const OTT_CONFIG = {
  netflix:       { label: 'Netflix',     bg: '#E50914', text: '#fff', url: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}` },
  'prime video': { label: 'Prime Video', bg: '#00A8E1', text: '#fff', url: (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}&ie=UTF8` },
  prime:         { label: 'Prime Video', bg: '#00A8E1', text: '#fff', url: (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}&ie=UTF8` },
  'amazon prime':{ label: 'Prime Video', bg: '#00A8E1', text: '#fff', url: (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}&ie=UTF8` },
  jiohotstar:    { label: 'JioHotstar',  bg: '#1A1A2E', text: '#FF6B00', url: (t) => `https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(t)}` },
  hotstar:       { label: 'JioHotstar',  bg: '#1A1A2E', text: '#FF6B00', url: (t) => `https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(t)}` },
  disney:        { label: 'JioHotstar',  bg: '#1A1A2E', text: '#FF6B00', url: (t) => `https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(t)}` },
  zee5:          { label: 'ZEE5',        bg: '#6B3FA0', text: '#fff', url: (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}` },
  sonyliv:       { label: 'SonyLIV',     bg: '#1565C0', text: '#fff', url: (t) => `https://www.sonyliv.com/search?query=${encodeURIComponent(t)}` },
  'apple tv':    { label: 'Apple TV+',   bg: '#1C1C1E', text: '#fff', url: (t) => `https://tv.apple.com/in/search?term=${encodeURIComponent(t)}` },
  aha:           { label: 'Aha',         bg: '#FF3D00', text: '#fff', url: (t) => `https://www.aha.video/search?q=${encodeURIComponent(t)}` },
  mxplayer:      { label: 'MX Player',   bg: '#004CFF', text: '#fff', url: (t) => `https://www.mxplayer.in/search?q=${encodeURIComponent(t)}` },
  jiocinema:     { label: 'JioCinema',   bg: '#7B2FBE', text: '#fff', url: (t) => `https://www.jiocinema.com/search/${encodeURIComponent(t)}` },
};

function getOTT(platformStr) {
  const key = platformStr.toLowerCase().trim();
  for (const [name, cfg] of Object.entries(OTT_CONFIG)) {
    if (key.includes(name)) return cfg;
  }
  return {
    label: platformStr.trim(),
    bg: '#333',
    text: '#fff',
    url: (t) => `https://www.google.com/search?q=watch+${encodeURIComponent(t)}+on+${encodeURIComponent(platformStr)}`,
  };
}

export default function Home() {
  const [heroMovie,     setHeroMovie]     = useState(null);
  const [allMovies,     setAllMovies]     = useState([]);
  const [teluguMovies,  setTeluguMovies]  = useState([]);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching,   setIsSearching]   = useState(false);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: top } = await supabase
        .from('movies')
        .select('*')
        .not('platforms', 'is', null)
        .order('imdb_rating', { ascending: false })
        .limit(25);

      const { data: telugu } = await supabase
        .from('movies')
        .select('*')
        .ilike('language', '%Telugu%')
        .not('platforms', 'is', null)
        .order('imdb_rating', { ascending: false })
        .limit(25);

      if (top && top.length > 0) setAllMovies(top);
      if (telugu && telugu.length > 0) {
        setTeluguMovies(telugu);
        setHeroMovie(telugu[0]);
      } else if (top && top.length > 0) {
        setHeroMovie(top[0]);
      }
    } catch (e) {
      console.error('loadData error:', e);
    } finally {
      setLoading(false);
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

  // Check Supabase ott_links first, then fall back to smart search URL
  const openOTT = (movie, platformStr) => {
    let finalLink = movie.ott_links?.[platformStr.trim()];
    if (!finalLink || finalLink === '#') {
      const cfg = getOTT(platformStr);
      finalLink = cfg.url(movie.title);
    }
    window.open(finalLink, '_blank', 'noopener,noreferrer');
  };

  const selectMovie = (m) => {
    setHeroMovie(m);
    setIsSearching(false);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-[#00D4FF] selection:text-black">

      {/* NAVBAR */}
      <nav className="px-6 md:px-8 py-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-[#02040a]/90 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
          <div className="w-8 h-8 bg-[#00D4FF] rounded-lg flex items-center justify-center text-black font-black text-sm">R</div>
          <div className="text-xl font-black tracking-tighter">REEL<span className="text-[#00D4FF]">ORACLE</span></div>
        </div>

        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-[#00D4FF] outline-none transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setIsSearching(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xl leading-none"
            >×</button>
          )}
        </div>

        <a
          href="https://t.me/ReelOracleHQBot"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#00D4FF] text-black px-6 py-2.5 rounded-xl font-black text-xs whitespace-nowrap hover:bg-white transition-all"
        >
          OPEN BOT
        </a>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 md:px-8 py-10">

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/30 text-xs font-black uppercase tracking-widest">Consulting the Oracle...</p>
            </div>
          </div>
        )}

        {/* SEARCH RESULTS */}
        {!loading && isSearching && (
          <section>
            <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-6">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
            {searchResults.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <div className="text-5xl opacity-20">🎬</div>
                <p className="font-black text-white/30">No movies found</p>
                <p className="text-sm text-white/20">Try the bot — it searches 1000+ titles</p>
                <a href="https://t.me/ReelOracleHQBot" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 bg-[#00D4FF] text-black px-6 py-2 rounded-xl font-black text-xs">
                  Open Bot
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.map(m => (
                  <div key={m.id} onClick={() => selectMovie(m)} className="cursor-pointer group">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-3 group-hover:border-[#00D4FF] transition-all">
                      {m.poster_url
                        ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
                        : <div className="h-full flex items-center justify-center bg-white/5 text-3xl opacity-20">🎬</div>}
                    </div>
                    <h3 className="text-xs font-black truncate group-hover:text-[#00D4FF] transition-colors">{m.title}</h3>
                    <p className="text-[10px] text-white/30 mt-0.5">{m.year} · {m.language}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MAIN CONTENT */}
        {!loading && !isSearching && (
          <>
            {/* HERO */}
            {heroMovie ? (
              <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-10 mb-20">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                    <span className="bg-[#00D4FF]/10 text-[#00D4FF] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00D4FF]/20">
                      {heroMovie.is_verified ? '✓ Verified' : '⚡ Live Data'}
                    </span>
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                      ★ {heroMovie.imdb_rating || 'N/A'} · {heroMovie.year} · {heroMovie.language}
                    </span>
                  </div>

                  <h1 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-tighter">
                    {heroMovie.title}
                  </h1>

                  {heroMovie.platforms ? (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Watch on</p>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        {heroMovie.platforms.split(',').map((p, i) => {
                          const cfg = getOTT(p);
                          return (
                            <button
                              key={i}
                              onClick={() => openOTT(heroMovie, p)}
                              style={{ backgroundColor: cfg.bg, color: cfg.text }}
                              className="px-6 py-3 rounded-xl font-black text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                            >
                              ▶ {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/20 text-sm">Platform data not verified yet.</p>
                  )}

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🎬 Watch ${heroMovie.title}!\n\nFind any movie: https://t.me/ReelOracleHQBot`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-white/20 hover:text-[#25D366] transition-colors font-black uppercase tracking-widest"
                  >
                    Share on WhatsApp →
                  </a>
                </div>

                <div className="w-full max-w-xs lg:max-w-sm flex-shrink-0">
                  <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">
                    {heroMovie.poster_url
                      ? <img src={heroMovie.poster_url} alt={heroMovie.title} className="w-full h-full object-cover" />
                      : <div className="h-full flex items-center justify-center bg-white/5 text-8xl opacity-10">🎬</div>}
                  </div>
                </div>
              </section>
            ) : (
              <div className="text-center py-24 text-white/20">
                <div className="text-5xl mb-4 opacity-20">🎬</div>
                <p className="font-black">No movies yet — add some via the bot</p>
              </div>
            )}

            {/* TOP 25 TELUGU — always visible */}
            {teluguMovies.length > 0 && (
              <>
                <div className="flex items-center gap-6 mb-8 mt-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.6em] text-[#00D4FF] whitespace-nowrap">
                    Top 25 Trending Telugu
                  </h2>
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] text-white/20 font-black">{teluguMovies.length} films</span>
                </div>
                <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-20">
                  {teluguMovies.map(m => (
                    <div key={m.id} onClick={() => selectMovie(m)} className="group cursor-pointer">
                      <div className={`aspect-[2/3] rounded-2xl overflow-hidden border transition-all duration-500 mb-3 ${
                        heroMovie?.id === m.id
                          ? 'border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                          : 'border-white/5 group-hover:border-[#00D4FF]/50'
                      }`}>
                        {m.poster_url
                          ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="h-full flex items-center justify-center bg-white/5 text-3xl opacity-10">🎬</div>}
                      </div>
                      <h3 className="font-black text-xs truncate group-hover:text-[#00D4FF] transition-colors">{m.title}</h3>
                      <p className="text-[10px] text-white/30 mt-0.5">★ {m.imdb_rating || 'N/A'}</p>
                      {m.platforms && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {m.platforms.split(',').slice(0, 2).map((p, i) => {
                            const cfg = getOTT(p);
                            return (
                              <span
                                key={i}
                                style={{ backgroundColor: cfg.bg + '33', color: cfg.text, border: `1px solid ${cfg.bg}55` }}
                                className="text-[8px] px-1.5 py-0.5 rounded font-black"
                              >
                                {cfg.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              </>
            )}

            {/* TOP 25 MASTERPIECE COLLECTION — all languages */}
            {allMovies.length > 0 && (
              <>
                <div className="flex items-center gap-6 mb-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.6em] text-white/30 whitespace-nowrap">
                    Top 25 Masterpiece Collection
                  </h2>
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] text-white/20 font-black">{allMovies.length} films</span>
                </div>
                <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {allMovies.map(m => (
                    <div key={m.id} onClick={() => selectMovie(m)} className="group cursor-pointer">
                      <div className={`aspect-[2/3] rounded-2xl overflow-hidden border transition-all duration-500 mb-3 ${
                        heroMovie?.id === m.id
                          ? 'border-[#00D4FF]'
                          : 'border-white/5 group-hover:border-white/20'
                      }`}>
                        {m.poster_url
                          ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500" />
                          : <div className="h-full flex items-center justify-center bg-white/5 text-3xl opacity-10">🎬</div>}
                      </div>
                      <h3 className="font-black text-xs text-white/50 truncate group-hover:text-white transition-colors">{m.title}</h3>
                      <p className="text-[10px] text-white/20 mt-0.5">★ {m.imdb_rating || 'N/A'} · {m.language}</p>
                    </div>
                  ))}
                </section>
              </>
            )}

            {/* FOOTER */}
            <div className="text-center mt-24 py-16 border-t border-white/5">
              <p className="text-white/20 text-xs font-black uppercase tracking-widest mb-6">Search 1000+ movies on the bot</p>
              <a
                href="https://t.me/ReelOracleHQBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#00D4FF] text-black px-10 py-4 rounded-2xl font-black hover:bg-white transition-all"
              >
                Open ReelOracle Bot →
              </a>
              <p className="text-white/10 text-xs mt-6">reeloracle.in · Stop Scrolling. Start Watching.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
