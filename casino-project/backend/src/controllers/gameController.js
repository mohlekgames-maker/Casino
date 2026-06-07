// src/controllers/gameController.js
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../config/db');
const { 
  generateServerSeed, calculateCrashPoint, 
  getSlotResults, getRouletteResult, getMinePositions,
  getProvablyFairRandom
} = require('../utils/provablyFair');

const MIN_BET = parseFloat(process.env.MIN_BET) || 1;
const MAX_BET = parseFloat(process.env.MAX_BET) || 10000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function deductBet(userId, amount) {
  const [result] = await db.execute(
    'UPDATE users SET balance = balance - ?, total_wagered = total_wagered + ? WHERE id = ? AND balance >= ?',
    [amount, amount, userId, amount]
  );
  return result.affectedRows > 0;
}

async function addWinnings(userId, amount) {
  await db.execute(
    'UPDATE users SET balance = balance + ?, total_won = total_won + ?, games_played = games_played + 1 WHERE id = ?',
    [amount, amount, userId]
  );
}

async function recordLoss(userId) {
  await db.execute(
    'UPDATE users SET total_lost = total_lost + 1, games_played = games_played + 1 WHERE id = ?',
    [userId]
  );
}

async function saveGameHistory(userId, gameName, betAmount, winAmount, multiplier, gameData, result) {
  const profit = winAmount - betAmount;
  await db.execute(
    'INSERT INTO game_history (id, user_id, game_name, bet_amount, win_amount, profit, multiplier, game_data, result) VALUES (?,?,?,?,?,?,?,?,?)',
    [uuidv4(), userId, gameName, betAmount, winAmount, profit, multiplier, JSON.stringify(gameData), result]
  );
  
  // Update leaderboard
  await db.execute(`
    INSERT INTO leaderboard (user_id, username, total_wagered, total_won, biggest_win, games_played)
    SELECT id, username, total_wagered, total_won, 
           GREATEST(IFNULL((SELECT biggest_win FROM leaderboard WHERE user_id = ?), 0), ?),
           games_played
    FROM users WHERE id = ?
    ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      total_wagered = VALUES(total_wagered),
      total_won = VALUES(total_won),
      biggest_win = GREATEST(biggest_win, ?),
      games_played = VALUES(games_played),
      win_rate = (SELECT (SELECT COUNT(*) FROM game_history WHERE user_id = ? AND result = 'win') / NULLIF(games_played, 0) * 100 FROM users WHERE id = ?)
  `, [userId, winAmount, userId, winAmount, userId, userId]);
}

async function getUserBalance(userId) {
  const [rows] = await db.execute('SELECT balance FROM users WHERE id = ?', [userId]);
  return rows[0]?.balance || 0;
}

function validateBet(amount) {
  if (isNaN(amount) || amount < MIN_BET) return `الحد الأدنى للرهان هو ${MIN_BET}`;
  if (amount > MAX_BET) return `الحد الأقصى للرهان هو ${MAX_BET}`;
  return null;
}

// ─── SLOTS ────────────────────────────────────────────────────────────────────

const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🔔', '⭐', '💎', '7️⃣', '🎰'];
const SLOT_PAYOUTS = {
  '🍒🍒🍒': 2,
  '🍋🍋🍋': 3,
  '🍊🍊🍊': 4,
  '🔔🔔🔔': 5,
  '⭐⭐⭐': 8,
  '💎💎💎': 15,
  '7️⃣7️⃣7️⃣': 25,
  '🎰🎰🎰': 50,
  '🍒🍒_': 1.5, // partial match
};

function calculateSlotWin(reels, betAmount) {
  const key = reels.join('');
  const partialKey = reels[0] === reels[1] ? reels[0] + reels[1] + '_' : null;
  
  const multiplier = SLOT_PAYOUTS[key] || (partialKey && SLOT_PAYOUTS[partialKey]) || 0;
  return { multiplier, winAmount: betAmount * multiplier };
}

async function playSlots(req, res) {
  try {
    const { betAmount, clientSeed, slotType = 'fruits' } = req.body;
    const bet = parseFloat(betAmount);
    const betError = validateBet(bet);
    if (betError) return res.status(400).json({ success: false, message: betError });

    const success = await deductBet(req.user.id, bet);
    if (!success) return res.status(400).json({ success: false, message: 'رصيد غير كافٍ' });

    const { seed: serverSeed, hash: serverSeedHash } = generateServerSeed();
    const nonce = Math.floor(Math.random() * 1000000);
    const client = clientSeed || crypto.randomBytes(8).toString('hex');

    const reelIndices = getSlotResults(serverSeed, client, nonce, 3, SLOT_SYMBOLS.length);
    const reels = reelIndices.map(i => SLOT_SYMBOLS[i]);
    const { multiplier, winAmount } = calculateSlotWin(reels, bet);

    if (winAmount > 0) await addWinnings(req.user.id, winAmount);
    else await recordLoss(req.user.id);

    await saveGameHistory(req.user.id, `slots_${slotType}`, bet, winAmount, multiplier, 
      { reels, serverSeedHash, clientSeed: client, nonce }, 
      winAmount > 0 ? 'win' : 'lose');

    const balance = await getUserBalance(req.user.id);

    res.json({
      success: true,
      data: {
        reels,
        multiplier,
        winAmount,
        profit: winAmount - bet,
        balance,
        serverSeedHash,
        clientSeed: client,
        nonce,
        serverSeed // Reveal after game for provable fairness
      }
    });
  } catch (err) {
    console.error('Slots error:', err);
    res.status(500).json({ success: false, message: 'خطأ في اللعبة' });
  }
}

// ─── CRASH ────────────────────────────────────────────────────────────────────

const activeCrashGames = new Map();

async function startCrash(req, res) {
  try {
    const { betAmount, clientSeed, autoCashout } = req.body;
    const bet = parseFloat(betAmount);
    const betError = validateBet(bet);
    if (betError) return res.status(400).json({ success: false, message: betError });

    // Check no active game
    if (activeCrashGames.has(req.user.id)) {
      return res.status(400).json({ success: false, message: 'لديك لعبة جارية بالفعل' });
    }

    const success = await deductBet(req.user.id, bet);
    if (!success) return res.status(400).json({ success: false, message: 'رصيد غير كافٍ' });

    const { seed: serverSeed, hash: serverSeedHash } = generateServerSeed();
    const nonce = Math.floor(Math.random() * 1000000);
    const client = clientSeed || crypto.randomBytes(8).toString('hex');

    const crashPoint = calculateCrashPoint(serverSeed, client, nonce);

    const gameId = uuidv4();
    activeCrashGames.set(req.user.id, {
      gameId, betAmount: bet, crashPoint, serverSeed,
      serverSeedHash, clientSeed: client, nonce, autoCashout: autoCashout || null,
      startedAt: Date.now()
    });

    res.json({
      success: true,
      data: { gameId, serverSeedHash, clientSeed: client, nonce, message: 'اللعبة بدأت' }
    });
  } catch (err) {
    console.error('Crash start error:', err);
    res.status(500).json({ success: false, message: 'خطأ في اللعبة' });
  }
}

async function cashoutCrash(req, res) {
  try {
    const { multiplier } = req.body;
    const game = activeCrashGames.get(req.user.id);
    
    if (!game) return res.status(400).json({ success: false, message: 'لا توجد لعبة جارية' });

    const cashoutMultiplier = parseFloat(multiplier);

    if (cashoutMultiplier > game.crashPoint) {
      // Crashed before cashout
      activeCrashGames.delete(req.user.id);
      await recordLoss(req.user.id);
      await saveGameHistory(req.user.id, 'crash', game.betAmount, 0, 0,
        { crashPoint: game.crashPoint, cashedOutAt: cashoutMultiplier, serverSeed: game.serverSeed },
        'lose');

      const balance = await getUserBalance(req.user.id);
      return res.json({
        success: true,
        data: { crashed: true, crashPoint: game.crashPoint, winAmount: 0, balance, serverSeed: game.serverSeed }
      });
    }

    const winAmount = game.betAmount * cashoutMultiplier;
    await addWinnings(req.user.id, winAmount);
    activeCrashGames.delete(req.user.id);

    await saveGameHistory(req.user.id, 'crash', game.betAmount, winAmount, cashoutMultiplier,
      { crashPoint: game.crashPoint, cashedOutAt: cashoutMultiplier, serverSeed: game.serverSeed },
      'win');

    const balance = await getUserBalance(req.user.id);
    res.json({
      success: true,
      data: {
        crashed: false, cashoutMultiplier, crashPoint: game.crashPoint,
        winAmount, profit: winAmount - game.betAmount, balance, serverSeed: game.serverSeed
      }
    });
  } catch (err) {
    console.error('Crash cashout error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الصرف' });
  }
}

async function getCrashResult(req, res) {
  try {
    const { clientSeed, nonce } = req.query;
    const { seed: serverSeed } = generateServerSeed();
    const crashPoint = calculateCrashPoint(serverSeed, clientSeed, parseInt(nonce));
    res.json({ success: true, data: { crashPoint, serverSeed } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ' });
  }
}

// ─── ROULETTE ─────────────────────────────────────────────────────────────────

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

function getRouletteColor(num) {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
}

function calculateRoulettePayout(bets, winningNumber) {
  let totalWin = 0;
  const color = getRouletteColor(winningNumber);

  for (const bet of bets) {
    const { type, numbers, amount } = bet;
    let multiplier = 0;

    if (type === 'straight' && numbers.includes(winningNumber)) multiplier = 36;
    else if (type === 'red' && color === 'red') multiplier = 2;
    else if (type === 'black' && color === 'black') multiplier = 2;
    else if (type === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) multiplier = 2;
    else if (type === 'odd' && winningNumber % 2 !== 0) multiplier = 2;
    else if (type === '1-18' && winningNumber >= 1 && winningNumber <= 18) multiplier = 2;
    else if (type === '19-36' && winningNumber >= 19 && winningNumber <= 36) multiplier = 2;
    else if (type === '1st12' && winningNumber >= 1 && winningNumber <= 12) multiplier = 3;
    else if (type === '2nd12' && winningNumber >= 13 && winningNumber <= 24) multiplier = 3;
    else if (type === '3rd12' && winningNumber >= 25 && winningNumber <= 36) multiplier = 3;
    else if (type === 'split' && numbers.includes(winningNumber)) multiplier = 18;
    else if (type === 'street' && numbers.includes(winningNumber)) multiplier = 12;
    else if (type === 'corner' && numbers.includes(winningNumber)) multiplier = 9;

    totalWin += amount * multiplier;
  }

  return totalWin;
}

async function playRoulette(req, res) {
  try {
    const { bets, clientSeed } = req.body;

    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({ success: false, message: 'يرجى وضع رهان' });
    }

    const totalBet = bets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const betError = validateBet(totalBet);
    if (betError) return res.status(400).json({ success: false, message: betError });

    const success = await deductBet(req.user.id, totalBet);
    if (!success) return res.status(400).json({ success: false, message: 'رصيد غير كافٍ' });

    const { seed: serverSeed, hash: serverSeedHash } = generateServerSeed();
    const nonce = Math.floor(Math.random() * 1000000);
    const client = clientSeed || crypto.randomBytes(8).toString('hex');

    const winningNumber = getRouletteResult(serverSeed, client, nonce);
    const winAmount = calculateRoulettePayout(bets, winningNumber);

    if (winAmount > 0) await addWinnings(req.user.id, winAmount);
    else await recordLoss(req.user.id);

    const maxMultiplier = winAmount > 0 ? winAmount / totalBet : 0;
    await saveGameHistory(req.user.id, 'roulette', totalBet, winAmount, maxMultiplier,
      { bets, winningNumber, color: getRouletteColor(winningNumber), serverSeed },
      winAmount > 0 ? 'win' : 'lose');

    const balance = await getUserBalance(req.user.id);

    res.json({
      success: true,
      data: {
        winningNumber,
        color: getRouletteColor(winningNumber),
        winAmount,
        profit: winAmount - totalBet,
        balance,
        serverSeed,
        serverSeedHash,
        clientSeed: client,
        nonce
      }
    });
  } catch (err) {
    console.error('Roulette error:', err);
    res.status(500).json({ success: false, message: 'خطأ في اللعبة' });
  }
}

// ─── MINES (server-side validation) ──────────────────────────────────────────

const activeMineGames = new Map();

async function startMines(req, res) {
  try {
    const { betAmount, mineCount, clientSeed } = req.body;
    const bet = parseFloat(betAmount);
    const mines = parseInt(mineCount) || 5;

    const betError = validateBet(bet);
    if (betError) return res.status(400).json({ success: false, message: betError });

    if (mines < 1 || mines > 24) {
      return res.status(400).json({ success: false, message: 'عدد الألغام يجب أن يكون بين 1 و 24' });
    }

    if (activeMineGames.has(req.user.id)) {
      return res.status(400).json({ success: false, message: 'لديك لعبة جارية' });
    }

    const success = await deductBet(req.user.id, bet);
    if (!success) return res.status(400).json({ success: false, message: 'رصيد غير كافٍ' });

    const { seed: serverSeed, hash: serverSeedHash } = generateServerSeed();
    const nonce = Math.floor(Math.random() * 1000000);
    const client = clientSeed || crypto.randomBytes(8).toString('hex');

    const minePositions = getMinePositions(serverSeed, client, nonce, 25, mines);

    activeMineGames.set(req.user.id, {
      betAmount: bet, mineCount: mines, minePositions,
      serverSeed, serverSeedHash, clientSeed: client, nonce,
      revealedSafe: [], multiplier: 1, startedAt: Date.now()
    });

    const balance = await getUserBalance(req.user.id);

    res.json({
      success: true,
      data: { serverSeedHash, clientSeed: client, nonce, balance, message: 'اللعبة بدأت' }
    });
  } catch (err) {
    console.error('Mines start error:', err);
    res.status(500).json({ success: false, message: 'خطأ في اللعبة' });
  }
}

async function revealMineCell(req, res) {
  try {
    const { cellIndex } = req.body;
    const game = activeMineGames.get(req.user.id);
    if (!game) return res.status(400).json({ success: false, message: 'لا توجد لعبة جارية' });

    const index = parseInt(cellIndex);
    if (index < 0 || index > 24 || game.revealedSafe.includes(index)) {
      return res.status(400).json({ success: false, message: 'خلية غير صالحة' });
    }

    const isMine = game.minePositions.includes(index);

    if (isMine) {
      // Game over
      activeMineGames.delete(req.user.id);
      await recordLoss(req.user.id);
      await saveGameHistory(req.user.id, 'mines', game.betAmount, 0, 0,
        { minePositions: game.minePositions, revealedSafe: game.revealedSafe, hitIndex: index, serverSeed: game.serverSeed },
        'lose');

      const balance = await getUserBalance(req.user.id);
      return res.json({
        success: true,
        data: {
          isMine: true, minePositions: game.minePositions,
          winAmount: 0, balance, serverSeed: game.serverSeed
        }
      });
    }

    game.revealedSafe.push(index);
    const safeSquares = 25 - game.mineCount;
    const revealed = game.revealedSafe.length;
    const newMultiplier = parseFloat((1 + (revealed * (game.mineCount / safeSquares)) * 2).toFixed(2));
    game.multiplier = newMultiplier;

    const balance = await getUserBalance(req.user.id);
    res.json({
      success: true,
      data: {
        isMine: false,
        multiplier: newMultiplier,
        potentialWin: parseFloat((game.betAmount * newMultiplier).toFixed(2)),
        revealedCount: revealed,
        balance
      }
    });
  } catch (err) {
    console.error('Mines reveal error:', err);
    res.status(500).json({ success: false, message: 'خطأ في اللعبة' });
  }
}

async function cashoutMines(req, res) {
  try {
    const game = activeMineGames.get(req.user.id);
    if (!game) return res.status(400).json({ success: false, message: 'لا توجد لعبة جارية' });

    if (game.revealedSafe.length === 0) {
      return res.status(400).json({ success: false, message: 'يجب كشف خلية واحدة على الأقل' });
    }

    const winAmount = parseFloat((game.betAmount * game.multiplier).toFixed(2));
    await addWinnings(req.user.id, winAmount);
    activeMineGames.delete(req.user.id);

    await saveGameHistory(req.user.id, 'mines', game.betAmount, winAmount, game.multiplier,
      { minePositions: game.minePositions, revealedSafe: game.revealedSafe, serverSeed: game.serverSeed },
      'win');

    const balance = await getUserBalance(req.user.id);
    res.json({
      success: true,
      data: {
        winAmount, profit: winAmount - game.betAmount,
        multiplier: game.multiplier, balance,
        minePositions: game.minePositions, serverSeed: game.serverSeed
      }
    });
  } catch (err) {
    console.error('Mines cashout error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الصرف' });
  }
}

// ─── Game History ─────────────────────────────────────────────────────────────

async function getGameHistory(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const [rows] = await db.execute(
      `SELECT id, game_name, bet_amount, win_amount, profit, multiplier, result, created_at
       FROM game_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const [count] = await db.execute(
      'SELECT COUNT(*) as total FROM game_history WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ success: true, data: { games: rows, total: count[0].total, page, limit } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function getLeaderboard(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT l.username, l.total_wagered, l.total_won, l.biggest_win, l.games_played, l.win_rate
       FROM leaderboard l ORDER BY l.total_won DESC LIMIT 50`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

module.exports = {
  playSlots, startCrash, cashoutCrash, getCrashResult,
  playRoulette, startMines, revealMineCell, cashoutMines,
  getGameHistory, getLeaderboard
};
