import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function PremiumVotePage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState(null);
  const [votes, setVotes] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) fetchSession();
  }, [id]);

  async function fetchSession() {
    const { data } = await supabase.from('vote_sessions').select('*').eq('session_id', id).single();
    if (data) {
      setSession(data);
      setVotes(data.votes ? JSON.parse(data.votes) : {});
      // Check if local user is the one who created it (stored in localStorage for simplicity)
      if (localStorage.getItem('reeloracle_user_id') === data.created_by) setIsOwner(true);
    }
  }

  async function castVote(movieName) {
    if (hasVoted || session?.status === 'closed') return;

    const newVotes = { ...votes, [movieName]: (votes[movieName] || 0) + 1 };
    
    // 1. Update the Vote Session
    await supabase.from('vote_sessions').update({ votes: JSON.stringify(newVotes) }).eq('session_id', id);

    // 2. LOG AUDIENCE INTEREST (Data for "what people like to watch")
    await supabase.from('search_events').insert([{
      search_query: movieName,
      outcome: 'web_vote',
      movie_found: true
    }]);

    setVotes(newVotes);
    setHasVoted(true);
  }

  async function closeVoting() {
    await supabase.from('vote_sessions').update({ status: 'closed' }).eq('session_id', id);
    setSession({ ...session, status: 'closed' });
  }

  if (!session) return <div className="min-h-screen bg-[#060914] flex items-center justify-center text-cyan-400">Loading Oracle Intelligence...</div>;

  const movies = JSON.parse(session.movies);
  const winner = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b, movies[0]);

  return (
    <div className="min-h-screen bg-[#060914] text-white font-sans selection:bg-cyan-500/30">
      {/* Background Gradient Animation */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/10 pointer-events-none" />

      <main className="relative max-w-2xl mx-auto px-6 py-16">
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-sm font-bold tracking-[0.3em] text-cyan-500 mb-4">REELORACLE VOTE</h1>
          <h2 className="text-5xl font-black tracking-tight mb-2">Tonight's Verdict</h2>
          <p className="text-slate-500 italic">"Settling the debate since 2026"</p>
        </header>

        <div className="space-y-4">
          {movies.map((movie, i) => {
            const count = votes[movie] || 0;
            const isWinner = movie === winner && count > 0;
            return (
              <div key={movie} className="group relative">
                <button
                  disabled={hasVoted || session.status === 'closed'}
                  onClick={() => castVote(movie)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-500 flex justify-between items-center
                    ${hasVoted ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10'}
                    ${isWinner && session.status === 'closed' ? 'ring-2 ring-emerald-500/50 border-emerald-500/50' : ''}`}
                >
                  <span className="text-xl font-bold flex items-center gap-3">
                    {movie} {isWinner && session.status === 'closed' && '👑'}
                  </span>
                  {hasVoted && <span className="text-cyan-400 font-mono">{count} votes</span>}
                </button>
                {/* Visual Progress Bar for results */}
                {hasVoted && (
                  <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white/5 overflow-hidden rounded-full">
                    <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${(count / Math.max(...Object.values(votes), 1)) * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* OWNER CONTROLS */}
        {isOwner && session.status !== 'closed' && (
          <div className="mt-12 pt-8 border-t border-white/5 text-center animate-in fade-in duration-1000 delay-500">
            <button 
              onClick={closeVoting}
              className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all font-bold text-sm tracking-widest"
            >
              CLOSE VOTING & CROWN WINNER
            </button>
          </div>
        )}

        {session.status === 'closed' && (
          <div className="mt-12 p-8 glassmorphism rounded-3xl text-center border-emerald-500/20 bg-emerald-500/5">
            <p className="text-emerald-400 font-bold tracking-widest text-xs mb-2">VOTING CLOSED</p>
            <h3 className="text-3xl font-black">Enjoy {winner}! 🍿</h3>
          </div>
        )}
      </main>
    </div>
  );
}
