-- 为 memos 表添加 is_frequent 字段
-- 执行此 SQL 脚本来更新现有数据库结构

ALTER TABLE memos ADD COLUMN is_frequent BOOLEAN DEFAULT FALSE COMMENT '是否标记为常用';
