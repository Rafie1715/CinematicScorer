// src/utils/classifier.js

export const TROPES = {
  MELANCHOLY: {
    genre: "Heartbreaking Drama",
    description: "Penuh kesedihan dan refleksi. Cocok untuk adegan kehilangan atau merenung di bawah hujan.",
    color: "from-slate-700 to-blue-900",
    poster: "https://images.unsplash.com/photo-1516589174184-c685ca6d1487?q=80&w=500",
    stats: [{ subject: 'Energy', A: 20 }, { subject: 'Tension', A: 30 }, { subject: 'Atmosphere', A: 90 }, { subject: 'Emotion', A: 100 }, { subject: 'Futurism', A: 5 }]
  },
  ACTION: {
    genre: "High-Octane Action",
    description: "Intens dan bertenaga. Cocok untuk pengejaran mobil atau pertarungan final.",
    color: "from-red-700 to-orange-600",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500",
    stats: [{ subject: 'Energy', A: 100 }, { subject: 'Tension', A: 90 }, { subject: 'Atmosphere', A: 40 }, { subject: 'Emotion', A: 30 }, { subject: 'Futurism', A: 40 }]
  },
  HORROR: {
    genre: "Psychological Horror",
    description: "Mencekam dan tidak nyaman. Cocok untuk adegan eksplorasi rumah tua yang gelap.",
    color: "from-purple-900 to-black",
    poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500",
    stats: [{ subject: 'Energy', A: 40 }, { subject: 'Tension', A: 100 }, { subject: 'Atmosphere', A: 95 }, { subject: 'Emotion', A: 20 }, { subject: 'Futurism', A: 10 }]
  },
  ROMCOM: {
    genre: "Modern Rom-Com",
    description: "Manis, ceria, dan penuh warna. Cocok untuk momen jatuh cinta atau kencan pertama.",
    color: "from-pink-400 to-rose-600",
    poster: "https://images.unsplash.com/photo-1518133835104-39f24232f0eb?q=80&w=500",
    stats: [{ subject: 'Energy', A: 70 }, { subject: 'Tension', A: 10 }, { subject: 'Atmosphere', A: 50 }, { subject: 'Emotion', A: 90 }, { subject: 'Futurism', A: 10 }]
  },
  EPIC: {
    genre: "Historical Epic / Fantasy",
    description: "Megah dan kolosal. Cocok untuk adegan perang kerajaan atau perjalanan pahlawan.",
    color: "from-amber-700 to-orange-900",
    poster: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=500",
    stats: [{ subject: 'Energy', A: 85 }, { subject: 'Tension', A: 80 }, { subject: 'Atmosphere', A: 100 }, { subject: 'Emotion', A: 70 }, { subject: 'Futurism', A: 0 }]
  },
  SUSPENSE: {
    genre: "Neo-Noir Detective",
    description: "Misterius dan berkelas. Seperti detektif yang memecahkan kasus di tengah kota malam hari.",
    color: "from-zinc-800 to-slate-950",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500",
    stats: [{ subject: 'Energy', A: 30 }, { subject: 'Tension', A: 70 }, { subject: 'Atmosphere', A: 90 }, { subject: 'Emotion', A: 50 }, { subject: 'Futurism', A: 10 }]
  },
  TEEN_ANGST: {
    genre: "Coming-of-Age Rebellion",
    description: "Penuh energi remaja dan pemberontakan. Cocok untuk adegan kabur dari rumah.",
    color: "from-emerald-600 to-teal-900",
    poster: "https://images.unsplash.com/photo-1493238792040-d7141f15de41?q=80&w=500",
    stats: [{ subject: 'Energy', A: 85 }, { subject: 'Tension', A: 50 }, { subject: 'Atmosphere', A: 60 }, { subject: 'Emotion', A: 80 }, { subject: 'Futurism', A: 10 }]
  },
  CYBERPUNK: {
    genre: "Futuristic Dystopia",
    description: "Vibe teknologi masa depan yang gelap dan penuh neon.",
    color: "from-cyan-500 to-blue-800",
    poster: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=500",
    stats: [{ subject: 'Energy', A: 80 }, { subject: 'Tension', A: 60 }, { subject: 'Atmosphere', A: 70 }, { subject: 'Emotion', A: 30 }, { subject: 'Futurism', A: 100 }]
  },
  COMEDY: {
    genre: "Feel-Good Comedy",
    description: "Ringan, lucu, dan uplifting. Cocok untuk montase kocak atau momen awkward yang menghibur.",
    color: "from-yellow-400 to-orange-500",
    poster: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=500",
    stats: [{ subject: 'Energy', A: 75 }, { subject: 'Tension', A: 20 }, { subject: 'Atmosphere', A: 60 }, { subject: 'Emotion', A: 70 }, { subject: 'Futurism', A: 5 }]
  },
  ADVENTURE: {
    genre: "Adventure Quest",
    description: "Nuansa perjalanan dan eksplorasi. Cocok untuk road trip, penemuan, dan misi penuh harapan.",
    color: "from-lime-500 to-emerald-700",
    poster: "https://images.unsplash.com/photo-1464822759844-d150ad6ba46f?q=80&w=500",
    stats: [{ subject: 'Energy', A: 82 }, { subject: 'Tension', A: 58 }, { subject: 'Atmosphere', A: 88 }, { subject: 'Emotion', A: 68 }, { subject: 'Futurism', A: 15 }]
  },
  DOCUMENTARY: {
    genre: "Documentary / Human Story",
    description: "Natural, observasional, dan membumi. Cocok untuk footage perjalanan, alam, atau kisah manusia.",
    color: "from-stone-600 to-amber-800",
    poster: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=500",
    stats: [{ subject: 'Energy', A: 45 }, { subject: 'Tension', A: 25 }, { subject: 'Atmosphere', A: 82 }, { subject: 'Emotion', A: 75 }, { subject: 'Futurism', A: 8 }]
  }
};

const RULES = [
  {
    trope: 'MELANCHOLY',
    keywords: ['acoustic', 'piano', 'folk', 'ambient', 'sad', 'merenung', 'chill', 'lo-fi', 'sleep', 'quiet', 'indie folk', 'ballad', 'dream pop'],
    antiKeywords: ['party', 'hardcore', 'rage'],
    includeTitle: true,
    weight: 1.3,
  },
  {
    trope: 'HORROR',
    keywords: ['horror', 'dark', 'creepy', 'drone', 'experimental', 'noise', 'black metal', 'doom', 'haunt'],
    antiKeywords: ['happy', 'sunshine'],
    weight: 1.2,
  },
  {
    trope: 'EPIC',
    keywords: ['classical', 'orchestra', 'symphony', 'soundtrack', 'epic', 'cinematic', 'trailer music', 'film score'],
    weight: 1.15,
  },
  {
    trope: 'TEEN_ANGST',
    keywords: ['punk', 'emo', 'grunge', 'alternative rock', 'shoegaze', 'pop punk', 'garage rock'],
    antiKeywords: ['lullaby', 'calm'],
    weight: 1,
  },
  {
    trope: 'CYBERPUNK',
    keywords: ['synth', 'techno', 'glitch', 'industrial', 'hyperpop', 'electronic', 'drum and bass', 'edm'],
    weight: 1.1,
  },
  {
    trope: 'ACTION',
    keywords: ['rock', 'metal', 'hardcore', 'stadium', 'power', 'rap rock', 'aggressive'],
    antiKeywords: ['acoustic', 'ambient'],
    weight: 1,
  },
  {
    trope: 'ROMCOM',
    keywords: ['dance pop', 'bubblegum', 'k-pop', 'sweet', 'city pop', 'disco', 'funk pop', 'love song'],
    antiKeywords: ['noise', 'death', 'sad', 'broken', 'goodbye', 'hilang', 'luka'],
    includeTitle: true,
    weight: 0.9,
  },
  {
    trope: 'SUSPENSE',
    keywords: ['jazz', 'soul', 'blues', 'noir', 'funk', 'r&b', 'trip hop', 'downtempo'],
    antiKeywords: ['bubblegum', 'party'],
    weight: 1.05,
  },
  {
    trope: 'COMEDY',
    keywords: ['comedy', 'novelty', 'swing', 'ska', 'ukulele', 'happy', 'funky', 'quirky'],
    antiKeywords: ['doom', 'dark'],
    includeTitle: true,
    weight: 0.95,
  },
  {
    trope: 'ADVENTURE',
    keywords: ['adventure', 'anthem', 'indie rock', 'world music', 'celtic', 'travel', 'road trip'],
    antiKeywords: ['sleep', 'slowcore'],
    includeTitle: true,
    weight: 1.05,
  },
  {
    trope: 'DOCUMENTARY',
    keywords: ['acoustic folk', 'world', 'new age', 'nature', 'instrumental', 'post-rock', 'minimal'],
    antiKeywords: ['hardcore', 'industrial'],
    includeTitle: true,
    weight: 0.92,
  },
];

export const SCENE_CONTEXT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'romance', label: 'Romance' },
  { value: 'action', label: 'Action' },
  { value: 'horror', label: 'Horror' },
  { value: 'epic', label: 'Epic' },
  { value: 'chill', label: 'Chill' },
  { value: 'comedy', label: 'Comedy' },
];

const CONTEXT_BOOSTS = {
  auto: {},
  romance: { ROMCOM: 0.9, MELANCHOLY: 0.45, COMEDY: 0.2 },
  action: { ACTION: 0.95, ADVENTURE: 0.7, EPIC: 0.45 },
  horror: { HORROR: 1, SUSPENSE: 0.75 },
  epic: { EPIC: 1, ADVENTURE: 0.72, ACTION: 0.38 },
  chill: { MELANCHOLY: 0.85, DOCUMENTARY: 0.7, SUSPENSE: 0.35 },
  comedy: { COMEDY: 1, ROMCOM: 0.5, TEEN_ANGST: 0.3 },
};

const getMatches = (text, keywords) => keywords.filter((word) => text.includes(word));

const TITLE_HINTS = {
  MELANCHOLY: ['sad', 'alone', 'rain', 'blue', 'tears', 'night', 'hujan', 'sendiri', 'sunyi'],
  ACTION: ['run', 'riot', 'fire', 'battle', 'thunder', 'fight', 'chase', 'war'],
  HORROR: ['dark', 'ghost', 'nightmare', 'blood', 'devil', 'shadow', 'scream'],
  ROMCOM: ['love', 'kiss', 'heart', 'summer', 'honey', 'sweet', 'romance'],
  EPIC: ['king', 'empire', 'hero', 'legend', 'glory', 'destiny', 'dragon'],
  SUSPENSE: ['mystery', 'detective', 'crime', 'secret', 'city', 'midnight', 'case'],
  TEEN_ANGST: ['youth', 'school', 'party', 'rebel', 'broken', 'teen', 'wild'],
  CYBERPUNK: ['neon', 'digital', 'future', 'robot', 'system', 'machine', 'cyber'],
  COMEDY: ['fun', 'haha', 'laugh', 'joke', 'happy', 'smile', 'ceria'],
  ADVENTURE: ['journey', 'road', 'quest', 'sky', 'travel', 'ocean', 'explore'],
  DOCUMENTARY: ['earth', 'home', 'human', 'story', 'nature', 'life', 'documentary'],
};

const DEFAULT_PRIOR = {
  MELANCHOLY: 0.9,
  ACTION: 0.65,
  HORROR: 0.6,
  ROMCOM: 0.62,
  EPIC: 0.7,
  SUSPENSE: 0.64,
  TEEN_ANGST: 0.63,
  CYBERPUNK: 0.61,
  COMEDY: 0.6,
  ADVENTURE: 0.66,
  DOCUMENTARY: 0.58,
};

const TROPE_EXPLANATION = {
  MELANCHOLY: {
    themes: ['kehilangan', 'refleksi diri', 'kesepian'],
    meaning: 'Lagu ini terbaca sebagai ruang emosi yang intim, menekankan rasa hampa atau kontemplasi.',
    cinematicReason: 'Cocok untuk adegan drama personal, momen pasca-konflik, atau transisi emosional.',
  },
  ACTION: {
    themes: ['adrenalin', 'konflik', 'dorongan maju'],
    meaning: 'Lagu ini memberi impresi energi tinggi dan momentum yang terus menanjak.',
    cinematicReason: 'Cocok untuk chase scene, montase latihan, atau klimaks penuh intensitas.',
  },
  HORROR: {
    themes: ['ketidakpastian', 'ketegangan', 'rasa terancam'],
    meaning: 'Lagu ini mengarah ke atmosfer gelap dan rasa tidak nyaman yang sengaja dibangun.',
    cinematicReason: 'Cocok untuk build-up suspense, adegan eksplorasi gelap, atau momen reveal yang mencekam.',
  },
  ROMCOM: {
    themes: ['romansa', 'keceriaan', 'kehangatan'],
    meaning: 'Lagu ini terasa ringan, hangat, dan memberi nuansa chemistry antar karakter.',
    cinematicReason: 'Cocok untuk meet-cute, montase hubungan, atau momen komedi romantis.',
  },
  EPIC: {
    themes: ['heroisme', 'petualangan besar', 'ambisi'],
    meaning: 'Lagu ini memberi kesan megah dan skala cerita yang luas.',
    cinematicReason: 'Cocok untuk trailer, adegan perang, atau klimaks perjalanan karakter.',
  },
  SUSPENSE: {
    themes: ['misteri', 'investigasi', 'tekanan psikologis'],
    meaning: 'Lagu ini membangun rasa curiga dan fokus ke detail yang menegangkan.',
    cinematicReason: 'Cocok untuk noir scene, penyelidikan kasus, atau dialog dengan tensi tinggi.',
  },
  TEEN_ANGST: {
    themes: ['pemberontakan', 'pencarian jati diri', 'gejolak remaja'],
    meaning: 'Lagu ini menonjolkan emosi mentah dan dorongan untuk melawan keadaan.',
    cinematicReason: 'Cocok untuk coming-of-age, konflik keluarga, atau momen rebel.',
  },
  CYBERPUNK: {
    themes: ['teknologi', 'distopia', 'identitas'],
    meaning: 'Lagu ini terasa modern, digital, dan dingin dengan atmosfer urban-futuristik.',
    cinematicReason: 'Cocok untuk city-at-night, hacker montage, atau konflik dunia masa depan.',
  },
  COMEDY: {
    themes: ['humor', 'keanehan', 'kesenangan ringan'],
    meaning: 'Lagu ini menangkap vibe playful dan tidak terlalu serius.',
    cinematicReason: 'Cocok untuk adegan lucu, awkward interaction, atau montase feel-good.',
  },
  ADVENTURE: {
    themes: ['eksplorasi', 'rasa ingin tahu', 'perjalanan'],
    meaning: 'Lagu ini memberi rasa bergerak ke depan dan semangat menjelajah.',
    cinematicReason: 'Cocok untuk road trip, setting alam, atau sequence petualangan tim.',
  },
  DOCUMENTARY: {
    themes: ['kemanusiaan', 'alam', 'observasi'],
    meaning: 'Lagu ini terdengar organik dan membumi, dengan fokus pada suasana nyata.',
    cinematicReason: 'Cocok untuk narasi dokumenter, travel footage, atau human-interest story.',
  },
};

const LOSS_CUES = ['sad', 'broken', 'tears', 'alone', 'goodbye', 'hurt', 'pain', 'lost', 'kehilangan', 'hilang', 'luka', 'sendiri', 'berpisah', 'putus'];
const JOY_CUES = ['happy', 'sunshine', 'dance', 'party', 'smile', 'fun', 'joy', 'ceria', 'tawa'];

const countCueHits = (text, cues) => cues.reduce((sum, cue) => sum + (text.includes(cue) ? 1 : 0), 0);
const clampSigned = (value, min = -1.2, max = 1.2) => Math.max(min, Math.min(max, value));

const buildSemanticSummary = ({
  trope,
  matchedKeywords = [],
  sceneContext = 'auto',
  signalQuality = 'medium',
  lyricalInsights = null,
  analysisMode = 'metadata',
}) => {
  const info = TROPE_EXPLANATION[trope] || TROPE_EXPLANATION.MELANCHOLY;
  const keywordThemes = matchedKeywords.slice(0, 2).map((item) => `nuansa ${item}`);
  const lyricThemes = lyricalInsights?.dominantThemes || [];
  const themes = [...info.themes, ...lyricThemes, ...keywordThemes].slice(0, 4);

  const contextLine = sceneContext !== 'auto'
    ? `Scene Lens '${sceneContext}' ikut mengarahkan interpretasi ke arah adegan yang kamu pilih.`
    : 'Mode Auto dipakai, jadi interpretasi murni dari metadata lagu.';

  const confidenceLine = signalQuality === 'low'
    ? 'Sinyal metadata terbatas, jadi makna ini bersifat estimasi awal.'
    : 'Sinyal metadata cukup kuat untuk menjelaskan arah naratif lagu.';

  const lyricLine = analysisMode === 'lyric' && lyricalInsights?.status === 'found'
    ? `Lirik memperkuat interpretasi ini: ${lyricalInsights.meaningHint}`
    : analysisMode === 'lyric'
      ? 'Mode Lyric aktif, namun lirik tidak ditemukan sehingga fallback ke metadata.'
      : '';

  const explanationBasis = analysisMode === 'lyric' && lyricalInsights?.status === 'found'
    ? `Estimasi berbasis metadata + sinyal lirik parsial dari ${lyricalInsights.source || 'lyrics API'}.`
    : 'Estimasi berbasis metadata (judul + genre artis), bukan analisis lirik penuh.';

  return {
    inferredThemes: themes,
    songMeaning: `${info.meaning} ${confidenceLine} ${lyricLine}`.trim(),
    cinematicReason: `${info.cinematicReason} ${contextLine}`,
    explanationBasis,
    lyricExcerpt: lyricalInsights?.excerpt || '',
    lyricStatus: lyricalInsights?.status || (analysisMode === 'lyric' ? 'not_found' : 'metadata_only'),
  };
};

const mapToScoreRows = (rows) => {
  const maxScore = Math.max(...rows.map((item) => item.score), 0.01);
  return rows.map((item) => ({
    trope: item.trope,
    genre: TROPES[item.trope].genre,
    score: Number(item.score.toFixed(2)),
    normalizedScore: Math.max(1, Math.round((item.score / maxScore) * 100)),
    matches: item.matches.slice(0, 3),
  }));
};

export const classifyByGenre = (
  genres,
  trackName = "",
  sceneContext = 'auto',
  personalBoosts = {},
  lyricalInsights = null,
  analysisMode = 'metadata',
) => {
  const safeGenres = Array.isArray(genres) ? genres : [];
  const g = safeGenres.join(' ').toLowerCase();
  const title = String(trackName || '').toLowerCase();
  const activeBoost = CONTEXT_BOOSTS[sceneContext] || CONTEXT_BOOSTS.auto;
  const lyricContextText = `${lyricalInsights?.excerpt || ''} ${(lyricalInsights?.dominantThemes || []).join(' ')}`.toLowerCase();
  const emotionalContext = `${title} ${g} ${lyricContextText}`;
  const lossHits = countCueHits(emotionalContext, LOSS_CUES) + ((lyricalInsights?.dominantThemes || []).includes('kehilangan') ? 2 : 0);
  const joyHits = countCueHits(emotionalContext, JOY_CUES) + ((lyricalInsights?.dominantThemes || []).includes('optimisme') ? 1 : 0);

  const scored = RULES.map((rule) => {
    const sourceText = rule.includeTitle ? `${title} ${g}` : g;
    const matches = getMatches(sourceText, rule.keywords);
    const antiMatches = getMatches(sourceText, rule.antiKeywords || []);
    const antiPenalty = antiMatches.length * 0.35;
    const baseScore = Math.max(0, matches.length * (rule.weight ?? 1) - antiPenalty);
    const contextBonus = activeBoost[rule.trope] || 0;
    const personalBonus = Math.max(-1.2, Math.min(1.2, Number(personalBoosts[rule.trope] || 0)));
    const lyricBoost = analysisMode === 'lyric' ? Number(lyricalInsights?.tropeBoosts?.[rule.trope] || 0) : 0;
    const lyricPenalty = analysisMode === 'lyric' ? Number(lyricalInsights?.tropePenalties?.[rule.trope] || 0) : 0;
    const lyricDelta = clampSigned(lyricBoost - lyricPenalty);

    let emotionalAdjustment = 0;
    if (rule.trope === 'MELANCHOLY') emotionalAdjustment += lossHits * 0.55;
    if (rule.trope === 'SUSPENSE') emotionalAdjustment += lossHits * 0.12;
    if (rule.trope === 'ROMCOM') emotionalAdjustment += joyHits * 0.22 - lossHits * 0.7;
    if (rule.trope === 'COMEDY') emotionalAdjustment += joyHits * 0.3 - lossHits * 0.45;

    const score = Math.max(0, baseScore + contextBonus + personalBonus + lyricDelta + emotionalAdjustment);

    return {
      trope: rule.trope,
      score,
      matches,
      antiMatches,
      personalBonus,
      lyricDelta,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  const runnerUp = scored[1];

  if (!top || top.score <= 0) {
    const hintRows = Object.keys(TROPES).map((trope) => {
      const hintMatches = getMatches(title, TITLE_HINTS[trope] || []);
      const baseScore = hintMatches.length > 0 ? hintMatches.length * 0.85 : DEFAULT_PRIOR[trope];
      const contextBonus = activeBoost[trope] || 0;
      const lyricBoost = analysisMode === 'lyric' ? Number(lyricalInsights?.tropeBoosts?.[trope] || 0) : 0;
      const lyricPenalty = analysisMode === 'lyric' ? Number(lyricalInsights?.tropePenalties?.[trope] || 0) : 0;
      const lyricDelta = clampSigned(lyricBoost - lyricPenalty);

      let emotionalAdjustment = 0;
      if (trope === 'MELANCHOLY') emotionalAdjustment += lossHits * 0.5;
      if (trope === 'ROMCOM') emotionalAdjustment += joyHits * 0.2 - lossHits * 0.65;
      if (trope === 'COMEDY') emotionalAdjustment += joyHits * 0.25 - lossHits * 0.4;

      const score = Math.max(0, baseScore + contextBonus + lyricDelta + emotionalAdjustment);
      return {
        trope,
        score,
        matches: hintMatches,
      };
    }).sort((a, b) => b.score - a.score);

    const fallbackTop = hintRows[0];
    const fallbackScoreRows = mapToScoreRows(hintRows);

    return {
      ...TROPES[fallbackTop.trope],
      tropeKey: fallbackTop.trope,
      confidence: 42,
      matchedKeywords: fallbackTop.matches.slice(0, 4),
      signalQuality: 'low',
      signalReason: 'Keyword genre minim, hasil diturunkan dari judul lagu + baseline prior.',
      appliedContext: sceneContext,
      tropeScores: fallbackScoreRows,
      alternatives: fallbackScoreRows
        .filter((item) => item.trope !== fallbackTop.trope)
        .slice(0, 2)
        .map((item) => ({
          trope: item.trope,
          genre: item.genre,
          confidence: Math.max(28, Math.round(item.normalizedScore * 0.7)),
          matches: item.matches,
        })),
      ...buildSemanticSummary({
        trope: fallbackTop.trope,
        matchedKeywords: fallbackTop.matches,
        sceneContext,
        signalQuality: 'low',
        lyricalInsights,
        analysisMode,
      }),
      analysisMode,
    };
  }

  const scoreGap = Math.max(0, top.score - (runnerUp?.score ?? 0));
  const confidence = Math.min(96, Math.round(56 + top.score * 16 + scoreGap * 8));
  const tropeScores = mapToScoreRows(scored);
  const signalQuality = top.score >= 2 ? 'high' : top.score >= 1 ? 'medium' : 'low';

  const signalReason = signalQuality === 'high'
    ? 'Banyak keyword yang cocok dengan genre/track.'
    : signalQuality === 'medium'
      ? 'Keyword cocok terbatas, masih ada kemungkinan trope alternatif.'
      : 'Sinyal keyword lemah, hasil cenderung heuristik.';

  const maxScore = Math.max(...tropeScores.map((item) => item.score), 0.01);

  const alternatives = tropeScores
    .filter((item) => item.trope !== top.trope && item.score > 0)
    .slice(0, 2)
    .map((item) => ({
      trope: item.trope,
      genre: item.genre,
      confidence: Math.max(30, Math.round((item.score / maxScore) * confidence)),
      matches: item.matches,
    }));

  return {
    ...TROPES[top.trope],
    tropeKey: top.trope,
    confidence,
    matchedKeywords: top.matches.slice(0, 4),
    signalQuality,
    signalReason,
    appliedContext: sceneContext,
    tropeScores,
    alternatives,
    analysisMode,
    ...buildSemanticSummary({
      trope: top.trope,
      matchedKeywords: top.matches,
      sceneContext,
      signalQuality,
      lyricalInsights,
      analysisMode,
    }),
  };
};