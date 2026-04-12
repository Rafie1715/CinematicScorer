// src/services/spotify.js
import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const getAccessToken = async () => {
  const authHeader = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data.access_token;
};

export const searchTrackAndArtist = async (query, token) => {
  // Ambil data track sekaligus data artis untuk dapet GENRE-nya
  const res = await axios.get(`https://api.spotify.com/v1/search`, {
    params: { q: query, type: 'track', limit: 1 },
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const track = res.data.tracks.items[0];
  if (!track) return null;

  // Panggil data artis untuk dapet genre (karena di objek track gak ada genre)
  const artistRes = await axios.get(`https://api.spotify.com/v1/artists/${track.artists[0].id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return {
    ...track,
    genres: artistRes.data.genres // Ini "kunci" pengganti audio features
  };
};