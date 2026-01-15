-- 数据库迁移脚本：待完成表按创建日期严格隔离
-- 执行此脚本来更新现有数据库结构，实现严格按创建日期隔离
-- 执行前请先备份数据库！
-- 此脚本支持从任何中间状态继续执行

-- 步骤 1: 确保 created_date 字段存在
-- 如果不存在则添加，如果存在则跳过
DELIMITER //
CREATE PROCEDURE EnsureCreatedDateColumn()
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'memos'
    AND COLUMN_NAME = 'created_date';

    IF column_exists = 0 THEN
        ALTER TABLE memos ADD COLUMN created_date DATE NOT NULL DEFAULT (CURRENT_DATE);
    END IF;
END //
DELIMITER ;

CALL EnsureCreatedDateColumn();
DROP PROCEDURE EnsureCreatedDateColumn;

-- 步骤 2: 确保 created_date 有正确的值
-- 只在 target_date 或 original_created_date 存在时才复制数据
DELIMITER //
CREATE PROCEDURE MigrateCreatedDate()
BEGIN
    DECLARE target_date_exists INT DEFAULT 0;
    DECLARE original_created_date_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO target_date_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'memos'
    AND COLUMN_NAME = 'target_date';

    SELECT COUNT(*) INTO original_created_date_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'memos'
    AND COLUMN_NAME = 'original_created_date';

    -- 如果 target_date 存在，从它复制数据
    IF target_date_exists > 0 THEN
        UPDATE memos
        SET created_date = target_date
        WHERE created_date IS NULL OR created_date = CURRENT_DATE;
    -- 否则如果 original_created_date 存在，从它复制数据
    ELSEIF original_created_date_exists > 0 THEN
        UPDATE memos
        SET created_date = original_created_date
        WHERE created_date IS NULL OR created_date = CURRENT_DATE;
    END IF;
END //
DELIMITER ;

CALL MigrateCreatedDate();
DROP PROCEDURE MigrateCreatedDate;

-- 步骤 3: 删除旧索引（如果存在）
-- 使用存储过程安全地删除索引
DELIMITER //
CREATE PROCEDURE DropIndexIfExists(index_name VARCHAR(255))
BEGIN
    DECLARE index_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO index_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'memos'
    AND INDEX_NAME = index_name;

    IF index_exists > 0 THEN
        SET @sql = CONCAT('ALTER TABLE memos DROP INDEX ', index_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- 使用错误处理，即使索引不存在也继续执行
CALL DropIndexIfExists('idx_target_date');
CALL DropIndexIfExists('idx_target_date_completed');
CALL DropIndexIfExists('idx_target_date_created');
CALL DropIndexIfExists('idx_original_created_date');

DROP PROCEDURE IF EXISTS DropIndexIfExists;

-- 步骤 4: 删除旧字段（如果存在）
DELIMITER //
CREATE PROCEDURE DropColumnIfExists(column_name VARCHAR(255))
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'memos'
    AND COLUMN_NAME = column_name;

    IF column_exists > 0 THEN
        SET @sql = CONCAT('ALTER TABLE memos DROP COLUMN ', column_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL DropColumnIfExists('is_carried_over');
CALL DropColumnIfExists('original_created_date');
CALL DropColumnIfExists('target_date');

DROP PROCEDURE DropColumnIfExists;

-- 步骤 5: 确保新索引存在
DELIMITER //
CREATE PROCEDURE EnsureCreatedDateIndex()
BEGIN
    DECLARE index_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO index_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'memos'
    AND INDEX_NAME = 'idx_created_date';

    IF index_exists = 0 THEN
        ALTER TABLE memos ADD INDEX idx_created_date (created_date);
    END IF;
END //
DELIMITER ;

CALL EnsureCreatedDateIndex();
DROP PROCEDURE EnsureCreatedDateIndex;

-- 步骤 6: 验证数据完整性
-- 检查是否有任何记录的 created_date 为 NULL
SELECT COUNT(*) as records_with_null_created_date FROM memos WHERE created_date IS NULL;

-- 查看迁移后的数据分布
SELECT created_date, COUNT(*) as count FROM memos GROUP BY created_date ORDER BY created_date DESC;

-- 迁移完成
