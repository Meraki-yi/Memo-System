# Web备忘录系统

一个清新可爱的前后端分离备忘录系统，支持复盘反思和备忘录管理功能。

## 功能特性

- 🔐 密码验证访问保护
- 💭 复盘反思模块（记录和编辑反思内容）
- 📌 备忘录模块（支持标记完成状态）
- 🎨 清新可爱的UI设计，黄绿渐变主题
- 📱 响应式设计，适配桌面和移动设备
- ✨ 流畅的动画和交互效果

## 技术栈

### 后端
- Python 3.8+
- FastAPI
- SQLAlchemy
- PyMySQL
- JWT认证

### 前端
- 原生 HTML/CSS/JavaScript
- 无框架依赖，代码简洁易维护

### 数据库
- MySQL 5.7+

## 项目结构

```
memo-system/
├── main.py                 # FastAPI主应用
├── config.py              # 配置文件
├── requirements.txt       # Python依赖
├── .env.example          # 环境变量示例
├── .gitignore            # Git忽略文件
├── frontend/              # 前端代码
│   ├── templates/         # HTML模板
│   │   ├── login.html     # 登录页面
│   │   └── index.html     # 主应用页面
│   └── static/            # 静态资源
│       ├── css/
│       │   └── style.css  # 样式文件
│       └── js/
│           ├── login.js   # 登录逻辑
│           └── app.js     # 主应用逻辑
├── database/              # 数据库相关
│   └── init.sql          # 数据库初始化脚本
└── README.md             # 项目说明
```

## 快速开始

### 1. 环境准备

确保已安装：
- Python 3.8+
- MySQL 5.7+
- pip

### 2. 数据库设置

创建数据库并执行初始化脚本：

```sql
-- 登录MySQL
mysql -u root -p

-- 执行初始化脚本
source /path/to/memo-system/database/init.sql
```

### 3. 后端配置

```bash
# 进入项目目录
cd memo-system

# 创建虚拟环境（可选）
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
DATABASE_URL=mysql+pymysql://your_username:your_password@localhost:3306/memo_system

# 访问密码
ACCESS_PASSWORD=your_secret_password

# JWT密钥（请生成一个随机字符串）
SECRET_KEY=your_very_secret_key_here

# 应用配置
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 4. 启动后端服务

```bash
# 开发模式启动
python main.py

# 或使用uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. 访问应用

打开浏览器访问：`http://localhost:8000`

使用在 `.env` 文件中设置的 `ACCESS_PASSWORD` 登录系统。

## API接口

### 认证
- `POST /api/login` - 登录获取token

### 复盘反思
- `GET /api/reflections` - 获取所有反思
- `POST /api/reflections` - 创建新反思
- `PUT /api/reflections/{id}` - 更新反思
- `DELETE /api/reflections/{id}` - 删除反思

### 备忘录
- `GET /api/memos` - 获取所有备忘录
- `POST /api/memos` - 创建新备忘录
- `PUT /api/memos/{id}` - 更新备忘录
- `DELETE /api/memos/{id}` - 删除备忘录

## 部署说明

### 生产环境配置

1. 设置环境变量：
```env
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

2. 使用 Gunicorn 部署：
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

3. 使用 Nginx 反向代理（可选）

### 安全注意事项

- 务必修改默认的 `ACCESS_PASSWORD` 和 `SECRET_KEY`
- 确保数据库连接信息的安全性
- 在生产环境中使用 HTTPS

## 自定义主题

可以通过修改 `frontend/static/css/style.css` 中的 CSS 变量来自定义主题：

```css
:root {
    --primary-gradient: linear-gradient(135deg, #FFD700, #9ACD32);
    --primary-light: #FFE066;
    --primary-dark: #7CB342;
    /* ... 其他颜色变量 */
}
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 服务是否运行
   - 验证 `.env` 中的数据库连接信息
   - 确保数据库和表已创建

2. **登录失败**
   - 检查 `ACCESS_PASSWORD` 是否正确设置
   - 验证前端是否正确发送密码

3. **API请求失败**
   - 检查 JWT token 是否有效
   - 查看浏览器控制台的错误信息

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 许可证

MIT License