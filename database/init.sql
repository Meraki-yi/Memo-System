-- 创建数据库
CREATE DATABASE IF NOT EXISTS memo_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE memo_system;

-- 记事表
CREATE TABLE IF NOT EXISTS reflections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 待完成表
CREATE TABLE IF NOT EXISTS memos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_frequent BOOLEAN DEFAULT FALSE,
    target_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    original_created_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    is_carried_over BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC),
    INDEX idx_is_completed (is_completed),
    INDEX idx_target_date (target_date DESC),
    INDEX idx_target_date_completed (target_date, is_completed),
    INDEX idx_target_date_created (target_date, created_at),
    INDEX idx_original_created_date (original_created_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;