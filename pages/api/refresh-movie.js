import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { movieId, title, slug } = req.body;

  try {
    // 1. Fetch Fresh Data from TMDB
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}&region=IN`);
    const tmdb = tmdbRes.data.results[0];

    if (!tmdb) return res.status(404).json({ message: 'Movie not found on TMDB' });

    // 2. Fetch Watch Providers (OTT Platforms)
    const providerRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdb.id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`);
    const platforms = providerRes.data.results?.IN?.flatrate?.map(p => p.provider_name).join(', ') || 'Checking...';

    // 3. Update Supabase (Using our Smart Merge logic)
    const { data: existing } = await supabase.from('movies').select('platforms').eq('id', movieId).single();
    
    const mergedPlatforms = Array.from(new Set([
      ...(existing?.platforms?.split(',').map(p => p.trim()) || []),
      ...(platforms.split(',').map(p => p.trim()))
    ])).join(', ');

    const { error } = await supabase.from('movies').update({
      platforms: mergedPlatforms,
      poster_url: `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`,
      imdb_rating: tmdb.vote_average,
      last_platform_check: new Date().toISOString()
    }).eq('id', movieId);

    if (error) throw error;

    return res.status(200).json({ message: 'Data refreshed successfully!', platforms: mergedPlatforms });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
