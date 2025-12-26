-- 添加心情标签功能和变更记录
-- 执行前请确保备份数据库

USE memo_system;

-- 1. 为reflections表添加心情标签字段
ALTER TABLE reflections
ADD COLUMN mood VARCHAR(20) DEFAULT 'normal' COMMENT '心情标签: happy(开心), angry(愤怒), confused(迷茫), normal(正常)';

-- 2. 创建心情标签变更记录表
CREATE TABLE IF NOT EXISTS mood_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reflection_id INT NOT NULL,
    old_mood VARCHAR(20),
    new_mood VARCHAR(20) NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reflection_id (reflection_id),
    INDEX idx_changed_at (changed_at DESC),
    FOREIGN KEY (reflection_id) REFERENCES reflections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='心情标签变更历史记录';
