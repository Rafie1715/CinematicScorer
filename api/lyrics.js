const tryLyricsOvh = async (artist, title) => {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const response = await fetch(url);

  if (!response.ok) {
    return { ok: false, source: 'lyrics.ovh', lyrics: '' };
  }

  const data = await response.json();
  const lyrics = typeof data.lyrics === 'string' ? data.lyrics : '';
  return { ok: Boolean(lyrics.trim()), source: 'lyrics.ovh', lyrics };
};

const tryLrcLib = async (artist, title) => {
  const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
  const response = await fetch(url);

  if (!response.ok) {
    return { ok: false, source: 'lrclib', lyrics: '' };
  }

  const data = await response.json();
  const lyrics = typeof data.plainLyrics === 'string' ? data.plainLyrics : '';
  return { ok: Boolean(lyrics.trim()), source: 'lrclib', lyrics };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const artist = String(req.query.artist || '').trim();
  const title = String(req.query.title || '').trim();

  if (!artist || !title) {
    res.status(400).json({ error: 'artist and title query are required' });
    return;
  }

  try {
    const ovhResult = await tryLyricsOvh(artist, title);
    if (ovhResult.ok) {
      res.status(200).json({ status: 'found', lyrics: ovhResult.lyrics, source: ovhResult.source });
      return;
    }

    const lrcResult = await tryLrcLib(artist, title);
    if (lrcResult.ok) {
      res.status(200).json({ status: 'found', lyrics: lrcResult.lyrics, source: lrcResult.source });
      return;
    }

    res.status(404).json({ status: 'not_found', lyrics: '', source: 'multi-provider' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error), lyrics: '', source: 'multi-provider' });
  }
}