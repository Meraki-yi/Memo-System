// 详情页面脚本

// 全局变量
let reflectionId = null;
let reflectionData = null;

// API请求配置
const API_BASE = '/api';

// 获取带认证的请求选项
function getAuthOptions(options = {}) {
    return {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
}

// 显示Toast提示
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 显示/隐藏Loading
function toggleLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.style.display = 'flex';
    } else {
        loading.style.display = 'none';
    }
}

// 格式化日期时间
function formatFullDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化历史记录时间
function formatHistoryTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}天前更改`;
    } else if (hours > 0) {
        return `${hours}小时前更改`;
    } else if (minutes > 0) {
        return `${minutes}分钟前更改`;
    } else {
        return '刚刚更改';
    }
}

// 返回上一页
function goBack() {
    // 保存当前标签页信息到 sessionStorage，确保返回到复盘记事标签页
    sessionStorage.setItem('memoSystem_return_tab', 'reflections');
    // 直接导航到主页
    window.location.href = '/app';
}

// 加载记事详情
async function loadReflectionDetail() {
    // 从URL获取reflection_id
    const urlParams = new URLSearchParams(window.location.search);
    reflectionId = urlParams.get('id');

    if (!reflectionId) {
        showToast('缺少记事ID', 'error');
        goBack();
        return;
    }

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/reflections/${reflectionId}`, getAuthOptions());

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/';
                return;
            }
            throw new Error('获取详情失败');
        }

        reflectionData = await response.json();

        renderDetail();
    } catch (error) {
        showToast(error.message, 'error');
        console.error('Error loading reflection:', error);
    } finally {
        toggleLoading(false);
    }
}

// 渲染详情
function renderDetail() {
    // 渲染内容
    document.getElementById('contentText').textContent = reflectionData.content;
    document.getElementById('createdAt').innerHTML =
        `<span class="icon">📅</span>创建: ${formatFullDateTime(reflectionData.created_at)}`;
    document.getElementById('updatedAt').innerHTML =
        `<span class="icon">🔄</span>更新: ${formatFullDateTime(reflectionData.updated_at)}`;
}

// 编辑内容
function editContent() {
    document.getElementById('editContent').value = reflectionData.content;
    document.getElementById('editModal').classList.add('show');
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

// 保存内容
async function saveContent() {
    const content = document.getElementById('editContent').value.trim();

    if (!content) {
        showToast('请输入内容', 'error');
        return;
    }

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/reflections/${reflectionId}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify({ content })
        }));

        if (!response.ok) {
            throw new Error('保存失败');
        }

        const updatedData = await response.json();
        reflectionData.content = updatedData.content;
        reflectionData.updated_at = updatedData.updated_at;

        // 更新显示
        document.getElementById('contentText').textContent = updatedData.content;
        document.getElementById('updatedAt').innerHTML =
            `<span class="icon">🔄</span>更新: ${formatFullDateTime(updatedData.updated_at)}`;

        closeEditModal();
        showToast('保存成功');

        // 通知主页面刷新数据
        notifyMainPageRefresh();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 通知主页面刷新数据
function notifyMainPageRefresh() {
    // 使用 localStorage 通知主页面
    localStorage.setItem('memoSystem_refresh', Date.now().toString());
    // 同时设置 sessionStorage，用于页面返回时检测
    sessionStorage.setItem('memoSystem_refresh', Date.now().toString());
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadReflectionDetail();

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });
});
