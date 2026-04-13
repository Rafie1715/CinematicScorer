import { classifyByGenre } from '../src/utils/classifier.js';
import { deriveLyricInsights } from '../src/services/lyrics.js';

const cases = [
  {
    name: 'Kehilangan Pop Ballad',
    genres: ['indonesian pop', 'ballad'],
    title: 'Goodbye My Love',
    lyrics: 'goodbye my love i am alone tears fall in the night',
  },
  {
    name: 'Romance Ceria',
    genres: ['dance pop', 'k-pop'],
    title: 'Summer Love',
    lyrics: 'we dance all night with smile and sunshine love',
  },
  {
    name: 'Action Anthem',
    genres: ['rock', 'rap rock'],
    title: 'Run Through Fire',
    lyrics: 'we fight we run we burn and rise',
  },
  {
    name: 'Horror Dark',
    genres: ['dark ambient', 'drone'],
    title: 'Shadow in the Hall',
    lyrics: 'shadow in the dark i fear the ghost tonight',
  },
  {
    name: 'Adventure Journey',
    genres: ['indie rock', 'world music'],
    title: 'Road to the Sky',
    lyrics: 'journey on the road under open sky explore',
  },
  {
    name: 'Cyberpunk',
    genres: ['electronic', 'industrial'],
    title: 'Neon System',
    lyrics: 'digital system machine neon city future',
  },
];

for (const sample of cases) {
  const lyricalInsights = deriveLyricInsights({
    status: 'found',
    lyrics: sample.lyrics,
    source: 'test',
  });

  const result = classifyByGenre(
    sample.genres,
    sample.title,
    'auto',
    {},
    lyricalInsights,
    'lyric'
  );

  console.log('---');
  console.log(sample.name);
  console.log(`=> ${result.genre} | confidence ${result.confidence}% | signal ${result.signalQuality}`);
  console.log(`themes: ${(result.inferredThemes || []).join(', ')}`);
  console.log(`keywords: ${(result.matchedKeywords || []).join(', ')}`);
}
