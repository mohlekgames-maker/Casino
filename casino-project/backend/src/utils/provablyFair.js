// src/utils/provablyFair.js
const crypto = require('crypto');

/**
 * Generate a random server seed hash (shown to users before game)
 */
function generateServerSeed() {
  const seed = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return { seed, hash };
}

/**
 * Generate a provably fair random number between 0 and 1
 */
function getProvablyFairRandom(serverSeed, clientSeed, nonce) {
  const hmac = crypto.createHmac('sha256', serverSeed);
  hmac.update(`${clientSeed}:${nonce}`);
  const hash = hmac.digest('hex');
  
  // Take first 8 chars and convert to a number 0-1
  const value = parseInt(hash.substring(0, 8), 16);
  return value / 0xFFFFFFFF;
}

/**
 * Get multiple fair random numbers from one seed set
 */
function getMultipleFairRandoms(serverSeed, clientSeed, nonce, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(getProvablyFairRandom(serverSeed, clientSeed, nonce + i));
  }
  return results;
}

/**
 * Crash game - calculate crash point
 */
function calculateCrashPoint(serverSeed, clientSeed, nonce) {
  const rand = getProvablyFairRandom(serverSeed, clientSeed, nonce);
  // House edge: 4%
  if (rand < 0.04) return 1.00;
  // Crash formula
  const crashPoint = Math.floor((1 / (1 - rand)) * 100) / 100;
  return Math.max(1.00, Math.min(crashPoint, 1000));
}

/**
 * Slots - get reel positions
 */
function getSlotResults(serverSeed, clientSeed, nonce, reelCount = 3, symbolCount = 8) {
  const results = [];
  for (let i = 0; i < reelCount; i++) {
    const rand = getProvablyFairRandom(serverSeed, clientSeed, nonce + i);
    results.push(Math.floor(rand * symbolCount));
  }
  return results;
}

/**
 * Roulette - get winning number (0-36)
 */
function getRouletteResult(serverSeed, clientSeed, nonce) {
  const rand = getProvablyFairRandom(serverSeed, clientSeed, nonce);
  return Math.floor(rand * 37); // 0-36
}

/**
 * Mines - place mines on grid
 */
function getMinePositions(serverSeed, clientSeed, nonce, gridSize, mineCount) {
  const positions = new Set();
  let attempt = 0;
  while (positions.size < mineCount) {
    const rand = getProvablyFairRandom(serverSeed, clientSeed, nonce + attempt);
    positions.add(Math.floor(rand * gridSize));
    attempt++;
  }
  return Array.from(positions);
}

module.exports = {
  generateServerSeed,
  getProvablyFairRandom,
  getMultipleFairRandoms,
  calculateCrashPoint,
  getSlotResults,
  getRouletteResult,
  getMinePositions,
};
