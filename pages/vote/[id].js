import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── COOKIE HELPERS ───────────────────────────────────────
// Persists across page refresh. One vote per browser per session.
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function VotePage() {
  const router  = useRouter();
  const { id }  = router.query;

  const [session,    setSession]    = useState(null);
  const [votes,      setVotes]      = useState({});
  const [hasVoted,   setHasVoted]   = useState(false);
  const [myVote,     setMyVote]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [voting,     setVoting]     = useState(false);

  useEffect(() => {
    if (id) fetchSession();
  }, [id]);

  async function fetchSession() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vote_sessions')
        .select('*')
        .eq('session_id', id)
        .maybeSingle();

      if (!data || error) { setNotFound(true); return; }

      setSession(data);
      setVotes(data.votes ? JSON.parse(data.votes) : {});

      // Check cookie — persists across refresh
      const cookieKey = `voted_${id}`;
      const cookieVote = getCookie(cookieKey);
      if (cookieVote) {
        setHasVoted(true);
        setMyVote(cookieVote);
      }
    } catch (e) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function castVote(movieName) {
    if (hasVoted || session?.status === 'closed' || voting) return;
    setVoting(true);

    try {
      // Re-fetch latest votes to avoid overwriting concurrent votes
      const { data: fresh } = await supabase
        .from('vote_sessions')
        .select('votes')
        .eq('session_id', id)
        .maybeSingle();

      const currentVotes = fresh?.votes ? JSON.parse(fresh.votes) : {};
      const newVotes = { ...currentVotes, [movieName]: (currentVotes[movieName] || 0) + 1 };

      await supabase
        .from('vote_sessions')
        .update({ votes: JSON.stringify(newVotes) })
        .eq('session_id', id);

      // Log audience interest
      await supabase.from('search_events').insert([{
        search_query: movieName,
        outcome:      'web_vote',
        movie_found:  true,
      }]).catch(() => {});

      // Set cookie — survives page refresh
      setCookie(`voted_${id}`, movieName, 7);

      setVotes(newVotes);
      setHasVoted(true);
      setMyVote(movieName);
    } catch (e) {
      console.error('Vote error:', e);
    } finally {
      setVoting(false);
    }
  }

  // ─── LOADING ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060914] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-cyan-400 text-sm font-black tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── NOT FOUND ──────────────────────────────────────────
  if (notFound || !session) {
    return (
      <div className="min-h-screen bg-[#060914] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎬</div>
          <h1 className="text-2xl font-black">Vote not found</h1>
          <p className="text-white/40 text-sm">This vote may have expired or the link is incorrect.</p>
          <a href="https://t.me/ReelOracleHQBot" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-4 bg-cyan-400 text-black px-6 py-2 rounded-xl font-black text-sm">
            Start a new vote on the bot
          </a>
        </div>
      </div>
    );
  }

  const movies   = JSON.parse(session.movies);
  const isClosed = session.status === 'closed';
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const maxVotes   = Math.max(...Object.values(votes), 1);
  const winner     = isClosed
    ? Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || movies[0]
    : null;

  return (
    <div className="min-h-screen bg-[#060914] text-white font-sans">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />

      <main className="relative max-w-xl mx-auto px-6 py-14">

        {/* HEADER */}
        <header className="text-center mb-12">
          <a href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-cyan-400 rounded-lg flex items-center justify-center text-black font-black text-xs">R</div>
            <span className="text-sm font-black tracking-tight">REEL<span className="text-cyan-400">ORACLE</span></span>
          </a>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            {isClosed ? 'The Verdict is In' : "Tonight's Vote"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isClosed
              ? `${totalVotes} vote${totalVotes !== 1 ? 's' : ''} cast`
              : hasVoted
                ? `You voted · ${totalVotes} vote${totalVotes !== 1 ? 's' : ''} so far`
                : 'Pick your movie for tonight'}
          </p>
        </header>

        {/* WINNER BANNER */}
        {isClosed && winner && (
          <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
            <p className="text-emerald-400 font-black text-xs tracking-widest uppercase mb-1">Tonight you watch</p>
            <h2 className="text-3xl font-black">{winner} 🍿</h2>
          </div>
        )}

        {/* VOTE OPTIONS */}
        <div className="space-y-3 mb-10">
          {movies.map((movie) => {
            const count      = votes[movie] || 0;
            const pct        = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMyVote   = myVote === movie;
            const isWinner   = isClosed && movie === winner;
            const showResult = hasVoted || isClosed;

            return (
              <button
                key={movie}
                disabled={hasVoted || isClosed || voting}
                onClick={() => castVote(movie)}
                className={`w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden relative
                  ${isWinner ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                  ${isMyVote && !isWinner ? 'border-cyan-500/50 bg-cyan-500/5' : ''}
                  ${!isMyVote && !isWinner ? 'border-white/10 bg-white/5' : ''}
                  ${!hasVoted && !isClosed ? 'hover:border-cyan-500/40 hover:bg-white/8 cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Progress bar fill */}
                {showResult && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                      isWinner ? 'bg-emerald-500/10' : isMyVote ? 'bg-cyan-500/10' : 'bg-white/3'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between p-5">
                  <span className="font-black text-lg flex items-center gap-3">
                    {isWinner && '👑 '}
                    {isMyVote && !isWinner && '✓ '}
                    {movie}
                  </span>

                  {showResult && (
                    <div className="text-right">
                      <div className={`font-mono font-black text-sm ${isWinner ? 'text-emerald-400' : isMyVote ? 'text-cyan-400' : 'text-white/40'}`}>
                        {pct}%
                      </div>
                      <div className="text-[10px] text-white/30">{count} vote{count !== 1 ? 's' : ''}</div>
                    </div>
                  )}

                  {!showResult && (
                    <span className="text-white/20 text-sm font-black">TAP TO VOTE →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* VOTED MESSAGE */}
        {hasVoted && !isClosed && (
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-white/50">
              You voted for <span className="text-cyan-400 font-black">{myVote}</span>.
              Results update live as friends vote.
            </p>
          </div>
        )}

        {/* SHARE */}
        <div className="mt-10 text-center space-y-4">
          <p className="text-white/20 text-xs font-black uppercase tracking-widest">Share this vote</p>
          <div className="flex justify-center gap-3">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🎬 Vote for tonight's movie!\n\nhttps://reeloracle.in/vote/${id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-[#25D366] text-black rounded-xl font-black text-xs hover:opacity-90 transition-all"
            >
              Share on WhatsApp
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(`https://reeloracle.in/vote/${id}`); }}
              className="px-6 py-2.5 bg-white/10 text-white rounded-xl font-black text-xs hover:bg-white/20 transition-all border border-white/10"
            >
              Copy Link
            </button>
          </div>
          <a
            href="https://t.me/ReelOracleHQBot"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-white/20 hover:text-cyan-400 transition-colors mt-4"
          >
            Start a new vote → @ReelOracleHQBot
          </a>
        </div>

      </main>
    </div>
  );
}
