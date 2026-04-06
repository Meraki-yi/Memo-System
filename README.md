# Memo System

一个功能完整的个人信息管理系统，集成待完成、记事和记账功能。

## ✨ 功能特性

### 核心功能
- 🔐 **密码保护** - Session 会话认证，安全可靠
- 💭 **记事** - 记录和管理工作记事，支持收藏常用内容
- 📌 **待完成管理** - 支持完成状态标记和常用内容收藏
- 💰 **记账功能** - 完整的收支记录、类目管理、统计分析
  - 支持收入/支出分类管理（一级、二级类目）
  - 记账模板功能
  - 多维度统计分析（按日期、按类目、按年度）
  - CSV/SQL 数据导出

### 技术特性
- 🎨 清新可爱的 UI 设计
- 📱 响应式设计，适配桌面和移动设备
- ✨ 流畅的动画和交互效果
- 🧩 模块化架构，易于维护和扩展
- 🚀 FastAPI 高性能后端框架

## 🛠️ 技术栈

### 后端
- **Python 3.8+**
- **FastAPI** - 现代化的 Web 框架
- **SQLAlchemy** - ORM 数据库操作
- **PyMySQL** - MySQL 数据库驱动
- **Pydantic** - 数据验证和序列化

### 前端
- **原生 HTML/CSS/JavaScript**
- **无框架依赖**，代码简洁易维护
- **Jinja2** 模板引擎

### 数据库
- **MySQL 5.7+**

## 📁 项目结构

```
memo-system/
├── app/                          # 应用核心模块
│   ├── __init__.py              # 应用包初始化
│   ├── core/                    # 核心配置模块
│   │   ├── __init__.py         # 模块导出
│   │   ├── config.py           # 应用配置和常量
│   │   ├── database.py         # 数据库连接和会话管理
│   │   └── security.py         # 认证和安全功能
│   │
│   ├── models/                  # 数据模型模块（ORM）
│   │   ├── __init__.py         # 模型导出
│   │   ├── reflection.py       # 记事数据模型
│   │   ├── memo.py             # 待完成数据模型
│   │   └── accounting.py       # 记账功能数据模型
│   │
│   ├── schemas/                 # Pydantic 数据模式模块
│   │   ├── __init__.py         # 模式导出
│   │   ├── auth.py             # 认证相关模式
│   │   ├── reflection.py       # 记事模式
│   │   ├── memo.py             # 待完成模式
│   │   └── accounting.py       # 记账功能模式
│   │
│   ├── routers/                 # 路由处理模块
│   │   ├── __init__.py         # 路由导出
│   │   ├── auth.py             # 认证路由
│   │   ├── reflections.py      # 记事路由
│   │   ├── memos.py            # 待完成路由
│   │   ├── accounting.py       # 记账功能路由
│   │   └── pages.py            # 页面路由
│   │
│   └── utils/                   # 工具模块
│       ├── __init__.py         # 工具函数导出
│       └── helpers.py          # 通用辅助函数
│
├── frontend/                    # 前端资源
│   ├── static/                 # 静态文件（CSS、JS、图片）
│   └── templates/              # Jinja2 模板文件
│
├── database/                    # 数据库相关
│   └── init/                   # 数据库初始化脚本
│
├── config.py                    # 应用配置类（环境变量管理）
├── main.py                      # 应用入口文件
├── requirements.txt             # Python 依赖
├── .env.example                # 环境变量示例
├── .gitignore                  # Git 忽略文件
├── Dockerfile                  # Docker 镜像构建
├── docker-compose.yml          # Docker Compose 配置
└── README.md                   # 项目说明文档
```

## 🏗️ 模块职责说明

### `app/core/` - 核心配置模块
- **config.py**: 应用配置、时区设置、常量定义
- **database.py**: 数据库引擎、会话管理、表初始化
- **security.py**: 用户认证中间件、权限检查

### `app/models/` - 数据模型模块
包含所有 SQLAlchemy ORM 模型定义：
- **reflection.py**: 记事表模型
- **memo.py**: 待完成表模型
- **accounting.py**: 记账相关表模型（类目、记录、模板）

### `app/schemas/` - 数据模式模块
包含所有 Pydantic 模型，用于请求验证和响应序列化：
- **auth.py**: 登录请求模式
- **reflection.py**: 记事的创建/更新模式
- **memo.py**: 待完成的创建/更新模式
- **accounting.py**: 记账功能的各类数据模式

### `app/routers/` - 路由处理模块
按功能划分的 API 路由：
- **auth.py**: 处理登录、登出操作
- **reflections.py**: 记事的 CRUD 和导出功能
- **memos.py**: 待完成的 CRUD 和导出功能
- **accounting.py**: 记账功能的完整 API
- **pages.py**: HTML 页面路由

### `app/utils/` - 工具模块
通用的辅助函数：
- **helpers.py**: 金额格式化、SQL 转义、INSERT 语句生成等

### `main.py` - 应用入口
重构后的主文件仅包含：
- FastAPI 应用初始化
- 中间件配置（Session、CORS）
- 静态文件挂载
- 路由注册
- 启动事件处理

## 🚀 快速开始

### 1. 环境准备

确保已安装：
- Python 3.8+
- MySQL 5.7+
- pip

### 2. 克隆项目

```bash
git clone <repository-url>
cd memo-system
```

### 3. 数据库设置

创建数据库：

```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE memo_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

或使用 Docker：

```bash
docker-compose up -d db
```

### 4. 后端配置

```bash
# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接和访问密码
```

编辑 `.env` 文件：

```env
# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=memo_system
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password

# 访问密码
ACCESS_PASSWORD=your_secret_password

# Session密钥
SESSION_SECRET=your_random_secret_key

# 应用配置
APP_NAME=Memo System
VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 5. 启动应用

```bash
# 开发模式启动
python main.py

# 或使用 uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. 访问应用

打开浏览器访问：`http://localhost:8000`

使用在 `.env` 文件中设置的 `ACCESS_PASSWORD` 登录系统。

## 📚 API 接口

### 认证
- `GET /` - 登录页面
- `POST /api/login` - 登录验证
- `POST /api/logout` - 登出

### 记事
- `GET /api/reflections` - 获取记事列表（分页）
- `POST /api/reflections` - 创建新记事
- `GET /api/reflections/frequents` - 获取收藏的记事
- `GET /api/reflections/{id}` - 获取单个记事
- `PUT /api/reflections/{id}` - 更新记事
- `DELETE /api/reflections/{id}` - 删除记事
- `GET /api/reflections/export/csv` - 导出为 CSV
- `GET /api/reflections/export/sql` - 导出为 SQL

### 待完成
- `GET /api/memos` - 获取待完成列表（分页）
- `POST /api/memos` - 创建新待完成
- `GET /api/memos/frequents` - 获取收藏的待完成
- `GET /api/memos/{id}` - 获取单个待完成
- `PUT /api/memos/{id}` - 更新待完成
- `DELETE /api/memos/{id}` - 删除待完成
- `GET /api/memos/export/csv` - 导出为 CSV
- `GET /api/memos/export/sql` - 导出为 SQL

### 记账功能
- `GET /api/accounting/categories` - 获取所有类目
- `POST /api/accounting/categories` - 创建一级类目
- `PUT /api/accounting/categories/{id}` - 更新一级类目
- `DELETE /api/accounting/categories/{id}` - 删除一级类目
- `POST /api/accounting/subcategories` - 创建二级类目
- `PUT /api/accounting/subcategories/{id}` - 更新二级类目
- `DELETE /api/accounting/subcategories/{id}` - 删除二级类目
- `GET /api/accounting/records` - 获取记账记录（支持分页）
- `POST /api/accounting/records` - 创建记账记录
- `GET /api/accounting/records/{id}` - 获取单条记录
- `PUT /api/accounting/records/{id}` - 更新记账记录
- `DELETE /api/accounting/records/{id}` - 删除记账记录
- `GET /api/accounting/templates` - 获取模板列表
- `POST /api/accounting/templates` - 创建模板
- `DELETE /api/accounting/templates/{id}` - 删除模板
- `GET /api/accounting/summary` - 获取统计汇总
- `GET /api/accounting/daily-summary` - 获取每日汇总
- `GET /api/accounting/category-stats` - 获取分类统计
- `GET /api/accounting/category-detail/{id}` - 获取分类详情
- `GET /api/accounting/export/csv` - 导出为 CSV
- `GET /api/accounting/export/sql` - 导出为 SQL

### 页面路由
- `GET /app` - 主应用页面
- `GET /frequents` - 常用待完成页面
- `GET /reflection-frequents` - 常用记事页面
- `GET /accounting` - 记账页面
- `GET /category-stats` - 分类支出统计页面
- `GET /category-detail` - 分类支出详情页面
- `GET /income-stats` - 分类收入统计页面
- `GET /income-detail` - 分类收入详情页面
- `GET /yearly-overview` - 年度概览页面

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独构建镜像

```bash
# 构建镜像
docker build -t memo-system .

# 运行容器
docker run -d -p 8000:8000 --name memo-app memo-system
```

## 🔧 生产环境配置

### 环境变量

```env
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

### 使用 Gunicorn 部署

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 安全注意事项

- ✅ 务必修改默认的 `ACCESS_PASSWORD`
- ✅ 务必修改默认的 `SESSION_SECRET`
- ✅ 使用强密码作为数据库密码
- ✅ 在生产环境中使用 HTTPS
- ✅ 定期备份数据库
- ✅ 限制数据库访问权限
- ✅ 使用环境变量管理敏感信息

## 🎨 自定义主题

可以通过修改前端 CSS 文件来自定义主题：

```css
:root {
    --primary-gradient: linear-gradient(135deg, #FFD700, #9ACD32);
    --primary-light: #FFE066;
    --primary-dark: #7CB342;
    /* ... 其他颜色变量 */
}
```

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 服务是否运行
   - 验证 `.env` 中的数据库连接信息
   - 确保数据库已创建

2. **登录失败**
   - 检查 `ACCESS_PASSWORD` 是否正确设置
   - 清除浏览器缓存和 Cookie

3. **API 请求失败**
   - 检查会话是否已过期
   - 查看浏览器控制台的错误信息
   - 检查后端日志

4. **导入错误**
   - 确保所有依赖已安装：`pip install -r requirements.txt`
   - 检查 Python 版本是否为 3.8+

## 📝 开发指南

### 添加新功能

1. 在 `app/models/` 中创建数据模型
2. 在 `app/schemas/` 中创建 Pydantic 模式
3. 在 `app/routers/` 中创建路由处理
4. 在 `main.py` 中注册新路由
5. 在 `frontend/` 中添加前端页面和逻辑

### 代码规范

- 遵循 PEP 8 代码风格
- 使用有意义的变量和函数命名
- 为所有函数添加文档字符串
- 使用类型注解提高代码可读性

## 📊 项目统计

- **总代码量**: 约 1600+ 行
- **Python 文件**: 20+ 个
- **API 端点**: 50+ 个
- **数据表**: 6 个
- **功能模块**: 3 个主要模块

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

### 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 作者

欢迎贡献代码和提出建议！


**注意**: 本项目仅供学习和个人使用，请勿用于生产环境而不进行适当的安全加固。
