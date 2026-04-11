// src/utils/auth.js

export const CLIENT_ID = "5343c452f9014d568ff239bfcfc801b1";
const REDIRECT_URI = "http://192.168.1.6:5173/";

// 1. Fungsi helper untuk generate random string (Code Verifier)
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

// 2. Fungsi untuk hashing (Code Challenge)
const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// 3. Fungsi Utama Login
export const redirectToSpotify = async () => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  // Simpan codeVerifier di localStorage untuk ditukarkan nanti
  window.localStorage.setItem('code_verifier', codeVerifier);

  const params = {
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-top-read user-read-recently-played',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  };

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect ke Spotify
};