import { TROPES } from './classifier.js';

export const CALIBRATION_LOG_STORAGE_KEY = 'cinematic-scorer-calibration-log-v1';
const MAX_CALIBRATION_EVENTS = 500;

const clamp = (value, min = -1.2, max = 1.2) => Math.max(min, Math.min(max, Number(value || 0)));

const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const safeParseArray = (rawValue) => {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const createEmptyProfile = () => Object.keys(TROPES).reduce((acc, trope) => {
  acc[trope] = 0;
  return acc;
}, {});

export const normalizeProfile = (rawProfile = {}) => {
  const base = createEmptyProfile();
  Object.keys(base).forEach((trope) => {
    base[trope] = clamp(rawProfile[trope]);
  });
  return base;
};

export const loadCalibrationHistory = (storageKey = CALIBRATION_LOG_STORAGE_KEY) => {
  if (!hasStorage()) return [];
  return safeParseArray(window.localStorage.getItem(storageKey)).filter((item) => {
    return item && typeof item === 'object' && typeof item.predictedTrope === 'string' && typeof item.targetTrope === 'string';
  });
};

export const saveCalibrationHistory = (history, storageKey = CALIBRATION_LOG_STORAGE_KEY) => {
  if (!hasStorage()) return;
  const trimmed = Array.isArray(history) ? history.slice(-MAX_CALIBRATION_EVENTS) : [];
  window.localStorage.setItem(storageKey, JSON.stringify(trimmed));
};

const computeAdaptiveDelta = (history, predictedTrope, targetTrope) => {
  const recent = history.slice(-120);
  const predictedWrong = recent.filter((item) => item.predictedTrope === predictedTrope && item.targetTrope !== predictedTrope).length;
  const predictedCorrect = recent.filter((item) => item.predictedTrope === predictedTrope && item.targetTrope === predictedTrope).length;
  const pairMismatch = recent.filter((item) => item.predictedTrope === predictedTrope && item.targetTrope === targetTrope).length;
  const targetDemand = recent.filter((item) => item.targetTrope === targetTrope && item.predictedTrope !== targetTrope).length;

  if (targetTrope === predictedTrope) {
    const confidenceFactor = predictedCorrect / Math.max(1, predictedCorrect + predictedWrong);
    const reward = 0.035 + confidenceFactor * 0.02;
    return {
      [predictedTrope]: reward,
      learningRate: Number(reward.toFixed(3)),
      mode: 'confirm',
    };
  }

  const pairFactor = 1 + Math.min(0.8, pairMismatch * 0.1);
  const demandFactor = 1 + Math.min(0.55, targetDemand * 0.06);
  const predictedPenalty = 0.065 * pairFactor;
  const targetReward = 0.11 * pairFactor * demandFactor;

  return {
    [predictedTrope]: -predictedPenalty,
    [targetTrope]: targetReward,
    learningRate: Number(Math.max(predictedPenalty, targetReward).toFixed(3)),
    mode: 'correct',
  };
};

export const applyCalibrationUpdate = ({
  profile,
  history,
  predictedTrope,
  targetTrope,
  sceneContext = 'auto',
  analysisMode = 'metadata',
  trackName = '',
  artistName = '',
  timestamp = Date.now(),
}) => {
  const cleanProfile = normalizeProfile(profile);
  const cleanHistory = Array.isArray(history) ? history : [];

  const event = {
    predictedTrope,
    targetTrope,
    sceneContext,
    analysisMode,
    trackName,
    artistName,
    timestamp,
  };

  const deltas = computeAdaptiveDelta(cleanHistory, predictedTrope, targetTrope);
  const nextProfile = { ...cleanProfile };

  Object.entries(deltas).forEach(([trope, delta]) => {
    if (!TROPES[trope]) return;
    if (typeof delta !== 'number') return;
    nextProfile[trope] = clamp((nextProfile[trope] || 0) + delta);
  });

  const nextHistory = [...cleanHistory, event].slice(-MAX_CALIBRATION_EVENTS);
  const feedbackLabel = targetTrope === predictedTrope
    ? `Feedback tersimpan. Model menguatkan trope ini (lr ${deltas.learningRate}).`
    : `Feedback tersimpan. Model menyesuaikan dari ${predictedTrope} ke ${targetTrope} (lr ${deltas.learningRate}).`;

  return {
    nextProfile,
    nextHistory,
    event,
    deltas,
    feedbackLabel,
  };
};

export const replayFeedbackToProfile = (history = [], seedProfile = createEmptyProfile()) => {
  let workingProfile = normalizeProfile(seedProfile);
  let workingHistory = [];

  for (const item of history) {
    if (!item?.predictedTrope || !item?.targetTrope) continue;
    const step = applyCalibrationUpdate({
      profile: workingProfile,
      history: workingHistory,
      predictedTrope: item.predictedTrope,
      targetTrope: item.targetTrope,
      sceneContext: item.sceneContext || 'auto',
      analysisMode: item.analysisMode || 'metadata',
      trackName: item.trackName || '',
      artistName: item.artistName || '',
      timestamp: item.timestamp || Date.now(),
    });
    workingProfile = step.nextProfile;
    workingHistory = step.nextHistory;
  }

  return workingProfile;
};