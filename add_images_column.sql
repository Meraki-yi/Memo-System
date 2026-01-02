-- 为 memos 表添加 images 字段
-- 执行此 SQL 脚本来更新现有数据库结构

ALTER TABLE memos ADD COLUMN images JSON NULL COMMENT '存储图片base64数组';
