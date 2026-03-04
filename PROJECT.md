# Memo System

一个简洁的个人信息管理系统，集成待办、记事和记账功能。

## 功能概览

### 三大核心模块

| 模块 | 功能 |
|------|------|
| **待办** | 任务管理、完成标记、常用收藏 |
| **记事** | 工作记录、内容收藏 |
| **记账** | 收支记录、分类管理、统计分析、数据导出 |

### 主要特性

- **密码保护** - Session 会话认证
- **响应式设计** - 适配桌面和移动端
- **数据导出** - 支持 CSV / SQL 格式
- **清新 UI** - 简洁可爱的界面设计

## 技术栈

- **后端**: Python + FastAPI + SQLAlchemy
- **前端**: 原生 HTML/CSS/JavaScript (无框架)
- **数据库**: MySQL

## 项目背景

这是一个个人学习项目，用于日常信息管理。采用前后端分离的架构设计，后端使用 FastAPI 构建 RESTful API，前端使用原生 JavaScript 实现交互，整体代码简洁易维护。

## 快速启动

```bash
# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env

# 启动服务
python main.py
```

访问 `http://localhost:8000` 即可使用。
