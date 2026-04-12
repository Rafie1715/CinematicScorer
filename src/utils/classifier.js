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
  }
};

export const classifyByGenre = (genres, trackName = "") => {
  const g = genres.join(' ').toLowerCase();
  const title = trackName.toLowerCase();

  // 1. PRIORITAS UTAMA: Mood & Karakteristik Lagu (Cek Judul & Genre Mood)
  if (['acoustic', 'piano', 'folk', 'ambient', 'sad', 'merenung', 'chill', 'lo-fi', 'sleep', 'quiet'].some(word => title.includes(word) || g.includes(word))) {
    return TROPES.MELANCHOLY;
  }

  // 2. HORROR / EXPERIMENTAL
  if (['horror', 'dark', 'creepy', 'drone', 'experimental', 'noise'].some(word => g.includes(word))) {
    return TROPES.HORROR;
  }

  // 3. EPIC / ORCHESTRAL
  if (['classical', 'orchestra', 'symphony', 'soundtrack', 'epic', 'cinematic'].some(word => g.includes(word))) {
    return TROPES.EPIC;
  }

  // 4. TEEN ANGST (Punk & Alt Rock)
  if (['punk', 'emo', 'grunge', 'alternative rock', 'shoegaze'].some(word => g.includes(word))) {
    return TROPES.TEEN_ANGST;
  }

  // 5. CYBERPUNK / ELECTRONIC
  if (['synth', 'techno', 'glitch', 'industrial', 'hyperpop', 'electronic'].some(word => g.includes(word))) {
    return TROPES.CYBERPUNK;
  }

  // 6. ACTION (Energi Tinggi)
  if (['rock', 'metal', 'hardcore', 'stadium', 'power'].some(word => g.includes(word))) {
    return TROPES.ACTION;
  }

  // 7. ROMCOM (Pop Ceria)
  if (['pop', 'dance', 'bubblegum', 'k-pop', 'sweet'].some(word => g.includes(word))) {
    return TROPES.ROMCOM;
  }

  // 8. SUSPENSE (Jazz / Noir)
  if (['jazz', 'soul', 'blues', 'noir', 'funk', 'r&b'].some(word => g.includes(word))) {
    return TROPES.SUSPENSE;
  }

  // DEFAULT
  return TROPES.MELANCHOLY;
};