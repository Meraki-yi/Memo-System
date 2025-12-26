// 详情页面脚本

// 全局变量
let reflectionId = null;
let reflectionData = null;
let currentMood = null;

// 心情配置
const MOOD_CONFIG = {
    happy: { icon: '😄', text: '开心', class: 'mood-happy' },
    angry: { icon: '😠', text: '愤怒', class: 'mood-angry' },
    confused: { icon: '😕', text: '迷茫', class: 'mood-confused' },
    normal: { icon: '🤔', text: '反省', class: 'mood-normal' }
};

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
    // 直接导航到主页，避免触发pageshow事件导致的刷新
    window.location.href = '/app';
}

// 加载反思详情
async function loadReflectionDetail() {
    // 从URL获取reflection_id
    const urlParams = new URLSearchParams(window.location.search);
    reflectionId = urlParams.get('id');

    if (!reflectionId) {
        showToast('缺少反思ID', 'error');
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
        currentMood = reflectionData.mood;

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

    // 渲染心情
    renderMoodDisplay();
}

// 渲染心情显示
function renderMoodDisplay() {
    const moodConfig = MOOD_CONFIG[currentMood];
    const moodDisplay = document.getElementById('currentMoodDisplay');
    const moodIcon = document.getElementById('moodIcon');
    const moodText = document.getElementById('moodText');

    // 更新显示
    moodIcon.textContent = moodConfig.icon;
    moodText.textContent = moodConfig.text;

    // 更新样式类
    moodDisplay.className = 'mood-display';
    moodDisplay.classList.add(moodConfig.class);
}

// 渲染心情历史记录（在模态框中）
function renderMoodHistory() {
    const historyContainer = document.getElementById('moodHistory');

    if (!reflectionData.mood_history || reflectionData.mood_history.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-history">
                <span class="icon">📭</span>
                <p>暂无心情变更记录</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = reflectionData.mood_history.map(item => {
        const oldMoodConfig = item.old_mood ? MOOD_CONFIG[item.old_mood] : null;
        const newMoodConfig = MOOD_CONFIG[item.new_mood];
        const moodClass = newMoodConfig.class;

        return `
            <div class="history-item ${moodClass}">
                <div class="history-mood-change">
                    ${oldMoodConfig ? `<span>${oldMoodConfig.icon}</span>` : '<span class="icon">✨</span>'}
                    <span class="history-arrow">→</span>
                    <span>${newMoodConfig.icon}</span>
                </div>
                <div class="history-info">
                    <span class="history-text">
                        ${oldMoodConfig ? `从「${oldMoodConfig.text}」` : '初始'} 变更为 「${newMoodConfig.text}」
                    </span>
                </div>
                <span class="history-time">
                    <span class="icon">🕐</span>
                    ${formatHistoryTime(item.changed_at)}
                </span>
            </div>
        `;
    }).join('');
}

// 显示历史记录模态框
function showHistoryModal() {
    renderMoodHistory();
    document.getElementById('historyModal').classList.add('show');
}

// 关闭历史记录模态框
function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('show');
}

// 显示心情选择模态框
function showMoodSelector() {
    document.getElementById('moodSelectorModal').classList.add('show');
}

// 关闭心情选择模态框
function closeMoodSelector() {
    document.getElementById('moodSelectorModal').classList.remove('show');
}

// 选择心情
async function selectMood(mood) {
    if (mood === currentMood) {
        closeMoodSelector();
        return;
    }

    toggleLoading(true);
    closeMoodSelector();

    try {
        const response = await fetch(`${API_BASE}/reflections/${reflectionId}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify({ mood })
        }));

        if (!response.ok) {
            throw new Error('更新心情失败');
        }

        // 更新本地数据
        currentMood = mood;

        // 添加到历史记录（前端临时显示）
        const oldMoodConfig = MOOD_CONFIG[reflectionData.mood];
        const newMoodConfig = MOOD_CONFIG[mood];

        if (!reflectionData.mood_history) {
            reflectionData.mood_history = [];
        }

        reflectionData.mood_history.unshift({
            id: Date.now(),
            old_mood: reflectionData.mood,
            new_mood: mood,
            changed_at: new Date().toISOString()
        });

        reflectionData.mood = mood;

        // 重新渲染心情显示
        renderMoodDisplay();

        showToast(`心情已更新为「${newMoodConfig.text}」`);

        // 通知主页面刷新数据
        notifyMainPageRefresh();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
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
