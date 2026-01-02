-- 为 memos 表添加缺失的字段
-- 执行此 SQL 脚本来更新现有数据库结构
-- 注意：如果字段已存在，MySQL会报错，可以忽略

-- 添加 is_frequent 字段（如果不存在）
ALTER TABLE memos ADD COLUMN IF NOT EXISTS is_frequent BOOLEAN DEFAULT FALSE;

-- 添加 images 字段（如果不存在）
ALTER TABLE memos ADD COLUMN IF NOT EXISTS images JSON NULL;

-- 注意：is_completed 字段应该在初始数据库中已经存在
-- 如果不存在，使用以下命令：
-- ALTER TABLE memos ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
