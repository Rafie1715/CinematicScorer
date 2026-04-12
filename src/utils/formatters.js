// Memformat durasi dari milidetik ke format 00:00
export const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
};

// Merapikan teks (Contoh: "HINDIA" -> "Hindia")
export const capitalizeText = (text) => {
  return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};