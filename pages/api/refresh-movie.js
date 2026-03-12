import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Admin access to update the database
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { movieId, title } = req.body;

  try {
    // 1. Fetch fresh metadata from TMDB
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}&region=IN`);
    const tmdb = tmdbRes.data.results[0];

    if (!tmdb) {
      return res.status(404).json({ message: 'Movie not found on TMDB' });
    }

    // 2. Update the Supabase record
    const { error } = await supabase
      .from('movies')
      .update({
        poster_url: `https://image.tmdb.org/p/w500${tmdb.poster_path}`,
        imdb_rating: parseFloat(tmdb.vote_average.toFixed(1)),
        last_platform_check: new Date().toISOString()
      })
      .eq('id', movieId);

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Oracle updated the database!',
      new_poster: `https://image.tmdb.org/p/w500${tmdb.poster_path}`
    });
    
  } catch (err) {
    console.error('Refresh Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
