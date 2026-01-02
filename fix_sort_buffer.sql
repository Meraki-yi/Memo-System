-- 临时解决方案：在当前会话增加排序缓冲区
SET SESSION sort_buffer_size = 16777216; -- 16MB

-- 永久解决方案：需要修改MySQL配置文件（my.ini或my.cnf）
-- 在 [mysqld] 部分添加或修改：
-- sort_buffer_size = 16M
-- 然后重启MySQL服务
