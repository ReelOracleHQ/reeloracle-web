import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { movieId, title } = req.body;
  if (!movieId || !title) {
    return res.status(400).json({ error: 'movieId and title are required' });
  }

  try {
    let tmdbRes = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: { api_key: process.env.TMDB_API_KEY, query: title },
      timeout: 8000,
    });

    let tmdb = tmdbRes.data.results?.[0];

    if (!tmdb && title.includes(':')) {
      const shortTitle = title.split(':')[0].trim();
      tmdbRes = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: { api_key: process.env.TMDB_API_KEY, query: shortTitle },
        timeout: 8000,
      });
      tmdb = tmdbRes.data.results?.[0];
    }

    if (!tmdb) {
      return res.status(404).json({ message: `Could not find "${title}" on TMDB.` });
    }

    // Only update poster — never rating (TMDB and IMDb scales differ)
    if (!tmdb.poster_path) {
      return res.status(200).json({ message: 'No poster found on TMDB.' });
    }

    const { error } = await supabase
      .from('movies')
      .update({ poster_url: `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` })
      .eq('id', movieId);

    if (error) throw error;

    return res.status(200).json({ message: 'Poster updated.' });

  } catch (err) {
    console.error('refresh-movie error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
