import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyByGenre, TROPES } from '../src/utils/classifier.js';
import { deriveLyricInsights } from '../src/services/lyrics.js';
import { createEmptyProfile, replayFeedbackToProfile } from '../src/utils/calibrationLearning.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DATASET_PATH = path.join(__dirname, 'data', 'real-world-test-dataset.json');
const DEFAULT_FEEDBACK_PATH = path.join(__dirname, 'data', 'calibration-feedback.sample.json');

const tropeKeys = Object.keys(TROPES);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const config = {
    dataset: DEFAULT_DATASET_PATH,
    feedback: DEFAULT_FEEDBACK_PATH,
  };

  for (const arg of args) {
    if (arg.startsWith('--dataset=')) {
      config.dataset = path.resolve(process.cwd(), arg.replace('--dataset=', ''));
    }
    if (arg.startsWith('--feedback=')) {
      config.feedback = path.resolve(process.cwd(), arg.replace('--feedback=', ''));
    }
  }

  return config;
};

const safeReadJson = async (targetPath, fallbackValue) => {
  try {
    const content = await fs.readFile(targetPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return fallbackValue;
  }
};

const runEvaluation = (dataset, personalBoosts = createEmptyProfile()) => {
  const predictions = [];

  for (const sample of dataset) {
    const analysisMode = sample.analysisMode === 'lyric' ? 'lyric' : 'metadata';
    const lyricalInsights = analysisMode === 'lyric' && sample.lyricsSnippet
      ? deriveLyricInsights({ status: 'found', source: 'dataset', lyrics: sample.lyricsSnippet })
      : null;

    const result = classifyByGenre(
      sample.genres || [],
      sample.title || '',
      sample.sceneContext || 'auto',
      personalBoosts,
      lyricalInsights,
      analysisMode,
    );

    const predictedTrope = result.tropeKey;
    const expectedTrope = sample.expectedTrope;
    const correct = predictedTrope === expectedTrope;

    predictions.push({
      id: sample.id,
      title: sample.title,
      artist: sample.artist,
      expectedTrope,
      predictedTrope,
      confidence: result.confidence,
      signalQuality: result.signalQuality,
      correct,
    });
  }

  const accuracy = predictions.length > 0
    ? (predictions.filter((item) => item.correct).length / predictions.length) * 100
    : 0;

  return {
    predictions,
    accuracy,
  };
};

const computePerTropeMetrics = (predictions) => {
  return tropeKeys.map((trope) => {
    const tp = predictions.filter((row) => row.expectedTrope === trope && row.predictedTrope === trope).length;
    const fp = predictions.filter((row) => row.expectedTrope !== trope && row.predictedTrope === trope).length;
    const fn = predictions.filter((row) => row.expectedTrope === trope && row.predictedTrope !== trope).length;

    const precision = tp / Math.max(1, tp + fp);
    const recall = tp / Math.max(1, tp + fn);
    const f1 = (2 * precision * recall) / Math.max(0.00001, precision + recall);

    return {
      trope,
      precision: Number((precision * 100).toFixed(1)),
      recall: Number((recall * 100).toFixed(1)),
      f1: Number((f1 * 100).toFixed(1)),
      support: predictions.filter((row) => row.expectedTrope === trope).length,
    };
  }).filter((row) => row.support > 0 || row.precision > 0);
};

const buildConfusionMatrix = (predictions) => {
  const matrix = {};

  for (const expected of tropeKeys) {
    matrix[expected] = {};
    for (const predicted of tropeKeys) {
      matrix[expected][predicted] = 0;
    }
  }

  for (const row of predictions) {
    if (!matrix[row.expectedTrope] || typeof matrix[row.expectedTrope][row.predictedTrope] === 'undefined') {
      if (matrix[row.expectedTrope]) {
        matrix[row.expectedTrope][row.predictedTrope] = 0;
      }
    }
    if (matrix[row.expectedTrope] && row.predictedTrope in matrix[row.expectedTrope]) {
      matrix[row.expectedTrope][row.predictedTrope] += 1;
    }
  }

  return matrix;
};

const printTopErrors = (predictions, limit = 8) => {
  const errors = predictions
    .filter((row) => !row.correct)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);

  if (errors.length === 0) {
    console.log('Top errors: none');
    return;
  }

  console.log('Top errors (high-confidence misses):');
  for (const item of errors) {
    console.log(
      `- ${item.title} - ${item.artist}: expected ${item.expectedTrope}, predicted ${item.predictedTrope} (${item.confidence}%)`
    );
  }
};

const printSummary = (label, result) => {
  const total = result.predictions.length;
  const correct = result.predictions.filter((item) => item.correct).length;
  const accuracy = result.accuracy.toFixed(2);
  const highSignalCount = result.predictions.filter((item) => item.signalQuality === 'high').length;

  console.log(`\n=== ${label} ===`);
  console.log(`Total samples: ${total}`);
  console.log(`Correct: ${correct}`);
  console.log(`Accuracy: ${accuracy}%`);
  console.log(`High-signal samples: ${highSignalCount}`);

  const metrics = computePerTropeMetrics(result.predictions);
  console.log('\nPer-trope metrics (precision / recall / f1 / support):');
  for (const row of metrics) {
    console.log(`- ${row.trope}: ${row.precision}% / ${row.recall}% / ${row.f1}% / ${row.support}`);
  }

  printTopErrors(result.predictions);
};

const printConfusionCompact = (label, result) => {
  const matrix = buildConfusionMatrix(result.predictions);
  console.log(`\nConfusion matrix (${label}) [expected -> predicted count]:`);

  for (const expected of tropeKeys) {
    const rowEntries = Object.entries(matrix[expected]).filter(([, value]) => value > 0);
    if (rowEntries.length === 0) continue;
    const compactRow = rowEntries.map(([predicted, count]) => `${predicted}:${count}`).join(', ');
    console.log(`- ${expected}: ${compactRow}`);
  }
};

const printTopBoosts = (profile) => {
  const rows = Object.entries(profile)
    .filter(([, value]) => Math.abs(value) > 0.001)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);

  if (rows.length === 0) {
    console.log('\nAdaptive profile: all zero (no feedback loaded).');
    return;
  }

  console.log('\nTop adaptive boosts:');
  for (const [trope, value] of rows) {
    const sign = value > 0 ? '+' : '';
    console.log(`- ${trope}: ${sign}${value.toFixed(3)}`);
  }
};

const main = async () => {
  const args = parseArgs();
  const dataset = await safeReadJson(args.dataset, []);

  if (!Array.isArray(dataset) || dataset.length === 0) {
    console.error(`Dataset not found or empty: ${args.dataset}`);
    process.exit(1);
  }

  const invalid = dataset.filter((item) => !tropeKeys.includes(item.expectedTrope));
  if (invalid.length > 0) {
    console.error('Dataset contains invalid expectedTrope values:');
    for (const row of invalid.slice(0, 6)) {
      console.error(`- ${row.id || '(no-id)'} => ${row.expectedTrope}`);
    }
    process.exit(1);
  }

  const baselineProfile = createEmptyProfile();
  const baseline = runEvaluation(dataset, baselineProfile);

  const feedbackHistory = await safeReadJson(args.feedback, []);
  const tunedProfile = Array.isArray(feedbackHistory)
    ? replayFeedbackToProfile(feedbackHistory, baselineProfile)
    : baselineProfile;
  const tuned = runEvaluation(dataset, tunedProfile);

  console.log('Cinematic Scorer Accuracy Dashboard');
  console.log(`Dataset: ${args.dataset}`);
  console.log(`Feedback log: ${args.feedback}`);
  console.log(`Feedback records loaded: ${Array.isArray(feedbackHistory) ? feedbackHistory.length : 0}`);

  printSummary('Baseline (no personal boosts)', baseline);
  printConfusionCompact('baseline', baseline);

  printSummary('Tuned (replayed calibration feedback)', tuned);
  printConfusionCompact('tuned', tuned);

  const delta = tuned.accuracy - baseline.accuracy;
  const deltaSign = delta >= 0 ? '+' : '';
  console.log(`\nAccuracy delta after tuning: ${deltaSign}${delta.toFixed(2)} percentage points`);
  printTopBoosts(tunedProfile);
};

main().catch((error) => {
  console.error('Failed to run accuracy dashboard.');
  console.error(error);
  process.exit(1);
});
