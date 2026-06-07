// src/config/migrate.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create DB
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.execute(`USE \`${process.env.DB_NAME}\``);

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        discord_id VARCHAR(50) UNIQUE,
        google_id VARCHAR(255) UNIQUE,
        avatar_url VARCHAR(500),
        balance DECIMAL(15,2) DEFAULT 1000.00,
        total_wagered DECIMAL(15,2) DEFAULT 0.00,
        total_won DECIMAL(15,2) DEFAULT 0.00,
        total_lost DECIMAL(15,2) DEFAULT 0.00,
        games_played INT DEFAULT 0,
        is_banned BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        last_daily_claim DATETIME,
        daily_streak INT DEFAULT 0,
        videos_watched_today INT DEFAULT 0,
        last_video_watch DATETIME,
        tasks_completed INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Refresh tokens
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token(255)),
        INDEX idx_user_id (user_id)
      )
    `);

    // Game history
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS game_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        game_name VARCHAR(50) NOT NULL,
        bet_amount DECIMAL(15,2) NOT NULL,
        win_amount DECIMAL(15,2) DEFAULT 0.00,
        profit DECIMAL(15,2) NOT NULL,
        multiplier DECIMAL(10,4) DEFAULT 1.0,
        game_data JSON,
        client_seed VARCHAR(255),
        server_seed_hash VARCHAR(255),
        nonce INT DEFAULT 0,
        result ENUM('win','lose','push') NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_game_name (game_name),
        INDEX idx_created_at (created_at)
      )
    `);

    // Points transactions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS points_transactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('daily_login','video_watch','task_complete','game_win','game_loss','admin_grant','gift_redeem') NOT NULL,
        description VARCHAR(255),
        reference_id VARCHAR(36),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_type (type)
      )
    `);

    // Tasks
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_ar VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        description_ar VARCHAR(500),
        points_reward INT NOT NULL,
        task_type ENUM('discord_join','social_share','profile_complete','play_game','other') NOT NULL,
        action_url VARCHAR(500),
        icon VARCHAR(50) DEFAULT 'star',
        is_active BOOLEAN DEFAULT TRUE,
        is_repeatable BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User task completions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_tasks (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        task_id VARCHAR(36) NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_task (user_id, task_id),
        INDEX idx_user_id (user_id)
      )
    `);

    // Gifts (Discord rewards)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gifts (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_ar VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        description_ar VARCHAR(500),
        gift_type ENUM('points','item','discord_role','custom') NOT NULL,
        points_cost INT NOT NULL,
        points_value INT DEFAULT 0,
        image_url VARCHAR(500),
        discord_role_id VARCHAR(50),
        quantity_available INT DEFAULT -1,
        quantity_claimed INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        requires_discord BOOLEAN DEFAULT FALSE,
        expires_at DATETIME,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gift redemptions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gift_redemptions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        gift_id VARCHAR(36) NOT NULL,
        points_spent INT NOT NULL,
        status ENUM('pending','completed','cancelled') DEFAULT 'pending',
        discord_username VARCHAR(100),
        notes VARCHAR(500),
        redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);

    // Videos (reward videos)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reward_videos (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_ar VARCHAR(255) NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        duration_seconds INT NOT NULL,
        points_reward INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        total_views INT DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Video watches
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS video_watches (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        video_id VARCHAR(36) NOT NULL,
        watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        points_earned INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES reward_videos(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_watched_at (watched_at)
      )
    `);

    // Leaderboard cache
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        total_wagered DECIMAL(15,2) DEFAULT 0.00,
        total_won DECIMAL(15,2) DEFAULT 0.00,
        biggest_win DECIMAL(15,2) DEFAULT 0.00,
        games_played INT DEFAULT 0,
        win_rate DECIMAL(5,2) DEFAULT 0.00,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
