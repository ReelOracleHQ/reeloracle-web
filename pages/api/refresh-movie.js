import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { movieId, title } = req.body;

  try {
    console.log(`Searching TMDB for: ${title}`);

    // 1. Fetch from TMDB with a 'clean' title
    const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: title.trim(),
        region: 'IN'
      }
    });

    const tmdb = tmdbRes.data.results[0];

    // 2. SAFETY CHECK: If no movie found, don't crash!
    if (!tmdb || !tmdb.poster_path) {
      return res.status(404).json({ 
        error: `TMDB could not find a match for "${title}". Check the spelling in Supabase.` 
      });
    }

    // 3. Update Supabase
    const { error } = await supabase
      .from('movies')
      .update({
        poster_url: `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`,
        imdb_rating: parseFloat(tmdb.vote_average.toFixed(1))
      })
      .eq('id', movieId);

    if (error) throw error;

    return res.status(200).json({ message: "Successfully synced with TMDB!" });

  } catch (err) {
    console.error('API Crash:', err.message);
    return res.status(500).json({ error: "Oracle Server Error: " + err.message });
  }
}
