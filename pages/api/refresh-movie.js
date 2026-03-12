import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase with Service Role for Write Access
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // 1. Log the request so we see it in Vercel Logs
  console.log("Oracle received refresh request for:", req.body.title);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { movieId, title } = req.body;

  if (!movieId || !title) {
    return res.status(400).json({ message: 'Missing Movie ID or Title' });
  }

  try {
    // 2. Fetch from TMDB
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}&region=IN`);
    const tmdb = tmdbRes.data.results[0];

    if (!tmdb) {
      return res.status(404).json({ message: 'Movie not found on TMDB' });
    }

    // 3. Update Supabase
    const { error } = await supabase
      .from('movies')
      .update({
        poster_url: `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`,
        imdb_rating: parseFloat(tmdb.vote_average.toFixed(1)),
        last_platform_check: new Date().toISOString()
      })
      .eq('id', movieId);

    if (error) throw error;

    return res.status(200).json({ message: 'Database Updated Successfully!' });

  } catch (err) {
    console.error('API Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
