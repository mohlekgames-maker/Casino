// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم يجب أن يكون بين 3 و 20 حرف' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    // Check existing
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const startingBalance = parseFloat(process.env.STARTING_BALANCE) || 1000;

    await db.execute(
      'INSERT INTO users (id, username, email, password_hash, balance, last_login) VALUES (?,?,?,?,?,NOW())',
      [userId, username, email, passwordHash, startingBalance]
    );

    // Log starting balance as points transaction
    await db.execute(
      'INSERT INTO points_transactions (id, user_id, amount, type, description) VALUES (?,?,?,?,?)',
      [uuidv4(), userId, startingBalance, 'admin_grant', 'رصيد الترحيب']
    );

    const { accessToken, refreshToken } = generateTokens(userId);

    // Store refresh token
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.execute(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?,?,?,?)',
      [uuidv4(), userId, refreshToken, refreshExpiry]
    );

    const [user] = await db.execute(
      'SELECT id, username, email, balance, is_admin FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: { user: user[0], accessToken, refreshToken }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const user = rows[0];

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'تم حظر حسابك' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول عبر OAuth' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    // Update last login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.execute(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?,?,?,?)',
      [uuidv4(), user.id, refreshToken, refreshExpiry]
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id, username: user.username, email: user.email,
          balance: user.balance, is_admin: user.is_admin,
          avatar_url: user.avatar_url
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'رمز التجديد مطلوب' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [stored] = await db.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (stored.length === 0) {
      return res.status(401).json({ success: false, message: 'رمز غير صالح أو منتهي' });
    }

    // Delete old & generate new
    await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

    const tokens = generateTokens(decoded.userId);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.execute(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?,?,?,?)',
      [uuidv4(), decoded.userId, tokens.refreshToken, refreshExpiry]
    );

    res.json({ success: true, data: tokens });
  } catch (err) {
    res.status(401).json({ success: false, message: 'رمز غير صالح' });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }
    res.json({ success: true, message: 'تم تسجيل الخروج' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function getMe(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT id, username, email, balance, total_wagered, total_won, total_lost,
       games_played, is_admin, avatar_url, daily_streak, last_daily_claim,
       videos_watched_today, tasks_completed, discord_id, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'مستخدم غير موجود' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

module.exports = { register, login, refreshToken, logout, getMe };
