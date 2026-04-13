import axios from 'axios';

const LYRIC_THEME_RULES = [
  {
    id: 'romance',
    label: 'romansa',
    keywords: ['love', 'heart', 'kiss', 'darling', 'baby', 'rindu', 'cinta', 'sayang'],
    tropeBoosts: { ROMCOM: 0.35, MELANCHOLY: 0.2 },
  },
  {
    id: 'loss',
    label: 'kehilangan',
    keywords: ['goodbye', 'alone', 'tears', 'broken', 'hurt', 'pain', 'hilang', 'luka', 'pergi', 'putus'],
    tropeBoosts: { MELANCHOLY: 0.9, SUSPENSE: 0.15 },
    tropePenalties: { ROMCOM: 0.45, COMEDY: 0.25 },
  },
  {
    id: 'rebellion',
    label: 'pemberontakan',
    keywords: ['fight', 'riot', 'burn', 'rage', 'run', 'rebel', 'lawan', 'bebas'],
    tropeBoosts: { ACTION: 0.45, TEEN_ANGST: 0.4 },
  },
  {
    id: 'darkness',
    label: 'ketegangan gelap',
    keywords: ['night', 'shadow', 'fear', 'devil', 'dark', 'ghost', 'gelap', 'bayang'],
    tropeBoosts: { HORROR: 0.55, SUSPENSE: 0.3 },
  },
  {
    id: 'journey',
    label: 'perjalanan',
    keywords: ['road', 'journey', 'home', 'sky', 'mountain', 'travel', 'jalan', 'langit'],
    tropeBoosts: { ADVENTURE: 0.55, DOCUMENTARY: 0.25, EPIC: 0.15 },
  },
  {
    id: 'future',
    label: 'futuristik',
    keywords: ['future', 'system', 'digital', 'machine', 'neon', 'robot', 'cyber'],
    tropeBoosts: { CYBERPUNK: 0.65 },
  },
  {
    id: 'uplift',
    label: 'optimisme',
    keywords: ['smile', 'dance', 'happy', 'sunshine', 'party', 'fun', 'ceria', 'tawa'],
    tropeBoosts: { COMEDY: 0.45, ROMCOM: 0.2 },
  },
];

const clampBoost = (value) => Math.max(0, Math.min(1.2, value));

const sanitizeLyrics = (lyrics = '') => lyrics.toLowerCase().replace(/[^a-z0-9\s\n]/g, ' ');

const countKeywordHits = (text, keywords) => {
  let count = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) count += 1;
  }
  return count;
};

const summarizeExcerpt = (lyrics = '') => {
  const lines = lyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);

  return lines.join(' / ');
};

export const fetchLyrics = async (artistName, trackName) => {
  try {
    const response = await axios.get('/api/lyrics', {
      params: {
        artist: artistName,
        title: trackName,
      },
    });

    return {
      status: response.data.status || 'not_found',
      lyrics: response.data.lyrics || '',
      source: response.data.source || 'multi-provider',
    };
  } catch {
    return {
      status: 'error',
      lyrics: '',
      source: 'multi-provider',
    };
  }
};

export const deriveLyricInsights = ({ lyrics = '', status = 'not_found', source = 'lyrics.ovh' } = {}) => {
  if (status !== 'found' || !lyrics.trim()) {
    return {
      status,
      source,
      excerpt: '',
      dominantThemes: [],
      tropeBoosts: {},
      tropePenalties: {},
      meaningHint: '',
    };
  }

  const normalizedLyrics = sanitizeLyrics(lyrics);

  const scoredThemes = LYRIC_THEME_RULES.map((rule) => ({
    ...rule,
    hitCount: countKeywordHits(normalizedLyrics, rule.keywords),
  })).filter((item) => item.hitCount > 0);

  scoredThemes.sort((a, b) => b.hitCount - a.hitCount);

  const dominantThemes = scoredThemes.slice(0, 3).map((item) => item.label);
  const tropeBoosts = {};
  const tropePenalties = {};

  for (const theme of scoredThemes.slice(0, 4)) {
    const multiplier = Math.min(1, theme.hitCount / 4);
    for (const [trope, baseBoost] of Object.entries(theme.tropeBoosts)) {
      const current = tropeBoosts[trope] || 0;
      tropeBoosts[trope] = clampBoost(current + baseBoost * multiplier);
    }

    for (const [trope, basePenalty] of Object.entries(theme.tropePenalties || {})) {
      const current = tropePenalties[trope] || 0;
      tropePenalties[trope] = clampBoost(current + basePenalty * multiplier);
    }
  }

  let meaningHint = 'Lirik memberi nuansa emosional yang memperkuat pembacaan konteks sinematik.';
  if (dominantThemes.length > 0) {
    meaningHint = `Lirik menonjolkan tema ${dominantThemes.join(', ')} sehingga emosi lagu terasa lebih terarah.`;
  }

  return {
    status: 'found',
    source,
    excerpt: summarizeExcerpt(lyrics),
    dominantThemes,
    tropeBoosts,
    tropePenalties,
    meaningHint,
  };
};
