-- =====================================================
-- 删除外键约束 - 备忘录系统
-- 执行前请确保已连接到 memo_system 数据库
-- USE memo_system;
-- =====================================================

-- 1. 删除 record_templates 表的外键约束
ALTER TABLE record_templates DROP FOREIGN KEY IF EXISTS record_templates_ibfk_1;
ALTER TABLE record_templates DROP FOREIGN KEY IF EXISTS record_templates_ibfk_2;

-- 2. 删除 daily_records 表的外键约束
ALTER TABLE daily_records DROP FOREIGN KEY IF EXISTS daily_records_ibfk_1;
ALTER TABLE daily_records DROP FOREIGN KEY IF EXISTS daily_records_ibfk_2;

-- 3. 删除 subcategories 表的外键约束
ALTER TABLE subcategories DROP FOREIGN KEY IF EXISTS subcategories_ibfk_1;

-- =====================================================
-- 验证外键是否已删除（可选）
-- =====================================================
-- SELECT
--     CONSTRAINT_NAME,
--     TABLE_NAME,
--     COLUMN_NAME,
--     REFERENCED_TABLE_NAME,
--     REFERENCED_COLUMN_NAME
-- FROM
--     INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE
--     TABLE_SCHEMA = 'memo_system'
--     AND REFERENCED_TABLE_NAME IS NOT NULL;
-- =====================================================
