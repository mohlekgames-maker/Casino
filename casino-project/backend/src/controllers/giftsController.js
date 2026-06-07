// src/controllers/giftsController.js
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

async function getGifts(req, res) {
  try {
    const [gifts] = await db.execute(`
      SELECT g.*, 
        CASE WHEN g.quantity_available = -1 THEN NULL 
             ELSE g.quantity_available - g.quantity_claimed 
        END as remaining
      FROM gifts g
      WHERE g.is_active = TRUE 
        AND (g.expires_at IS NULL OR g.expires_at > NOW())
      ORDER BY g.sort_order ASC, g.points_cost ASC
    `);

    // User's redemptions
    const [userRedemptions] = await db.execute(
      'SELECT gift_id, COUNT(*) as count FROM gift_redemptions WHERE user_id = ? GROUP BY gift_id',
      [req.user.id]
    );

    const redemptionMap = {};
    userRedemptions.forEach(r => redemptionMap[r.gift_id] = r.count);

    res.json({
      success: true,
      data: gifts.map(g => ({
        ...g,
        user_claimed_count: redemptionMap[g.id] || 0,
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function redeemGift(req, res) {
  try {
    const { giftId, discordUsername } = req.body;

    const [gifts] = await db.execute(
      `SELECT * FROM gifts WHERE id = ? AND is_active = TRUE 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [giftId]
    );

    if (gifts.length === 0) {
      return res.status(404).json({ success: false, message: 'الهدية غير متاحة' });
    }

    const gift = gifts[0];

    // Check if Discord required
    if (gift.requires_discord && !discordUsername) {
      return res.status(400).json({ success: false, message: 'يجب ربط حساب Discord الخاص بك' });
    }

    // Check quantity
    if (gift.quantity_available !== -1) {
      const remaining = gift.quantity_available - gift.quantity_claimed;
      if (remaining <= 0) {
        return res.status(400).json({ success: false, message: 'نفدت الكمية' });
      }
    }

    // Check user balance
    const [user] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);
    if (user[0].balance < gift.points_cost) {
      return res.status(400).json({ 
        success: false, 
        message: `نقاطك غير كافية. تحتاج ${gift.points_cost} نقطة` 
      });
    }

    // Deduct points
    await db.execute(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [gift.points_cost, req.user.id]
    );

    // Add gift points if applicable
    if (gift.gift_type === 'points' && gift.points_value > 0) {
      await db.execute(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [gift.points_value, req.user.id]
      );
    }

    // Create redemption
    const redemptionId = uuidv4();
    await db.execute(
      `INSERT INTO gift_redemptions (id, user_id, gift_id, points_spent, discord_username)
       VALUES (?,?,?,?,?)`,
      [redemptionId, req.user.id, giftId, gift.points_cost, discordUsername || null]
    );

    // Update gift count
    await db.execute(
      'UPDATE gifts SET quantity_claimed = quantity_claimed + 1 WHERE id = ?',
      [giftId]
    );

    // Log transaction
    await db.execute(
      'INSERT INTO points_transactions (id, user_id, amount, type, description, reference_id) VALUES (?,?,?,?,?,?)',
      [uuidv4(), req.user.id, -gift.points_cost, 'gift_redeem', `استبدل هدية: ${gift.title_ar}`, giftId]
    );

    if (gift.gift_type === 'points') {
      await db.execute(
        'INSERT INTO points_transactions (id, user_id, amount, type, description, reference_id) VALUES (?,?,?,?,?,?)',
        [uuidv4(), req.user.id, gift.points_value, 'admin_grant', `نقاط من الهدية: ${gift.title_ar}`, giftId]
      );
    }

    const [updated] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'تم استبدال الهدية بنجاح! ✨',
      data: {
        redemptionId,
        gift: { title: gift.title_ar, type: gift.gift_type, value: gift.points_value },
        balance: updated[0].balance,
        ...(gift.requires_discord && { message: 'سيتم إضافة رتبة Discord خلال 24 ساعة' })
      }
    });
  } catch (err) {
    console.error('Redeem gift error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function getMyRedemptions(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT gr.id, g.title_ar, g.gift_type, gr.points_spent, gr.status, gr.redeemed_at
      FROM gift_redemptions gr
      JOIN gifts g ON gr.gift_id = g.id
      WHERE gr.user_id = ?
      ORDER BY gr.redeemed_at DESC LIMIT 20
    `, [req.user.id]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

module.exports = { getGifts, redeemGift, getMyRedemptions };
