import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { movieId, title } = req.body;

  try {
    // 1. Try searching with the full title
    let tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: { api_key: process.env.TMDB_API_KEY, query: title }
    });

    let tmdb = tmdbRes.data.results[0];

    // 2. SMART FALLBACK: If "Pushpa 2: The Rule" fails, try just "Pushpa 2"
    if (!tmdb && title.includes(':')) {
      const shortTitle = title.split(':')[0];
      tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: { api_key: process.env.TMDB_API_KEY, query: shortTitle }
      });
      tmdb = tmdbRes.data.results[0];
    }

    if (!tmdb) {
      return res.status(404).json({ message: `Oracle could not find "${title}" on TMDB.` });
    }

    // 3. Update Supabase
    const { error } = await supabase
      .from('movies')
      .update({
        poster_url: `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`,
        imdb_rating: tmdb.vote_average
      })
      .eq('id', movieId);

    if (error) throw error;

    return res.status(200).json({ message: "Database Synced!" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
