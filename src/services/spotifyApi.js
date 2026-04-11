// src/services/spotifyApi.js
import axios from 'axios';

const spotifyApi = axios.create({
  baseURL: 'https://api.spotify.com/v1', 
});

// Menyisipkan token ke setiap request
export const setAccessToken = (token) => {
  spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Mengambil lagu yang paling sering didengar (medium term = ~6 bulan terakhir)
export const getTopTracks = async () => {
  const response = await spotifyApi.get('/me/top/tracks?limit=10&time_range=medium_term');
  return response.data.items;
};

// Mengambil audio features berdasarkan ID lagu
export const getAudioFeatures = async (trackIds) => {
  const response = await spotifyApi.get(`/audio-features?ids=${trackIds}`);
  return response.data.audio_features;
};