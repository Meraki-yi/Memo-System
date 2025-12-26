// 全局变量
let currentTab = 'accounting';  // 默认显示记账标签
let currentEditItem = null;
let deleteItemId = null;
let deleteItemType = null;
let selectedMood = 'normal';  // 当前选中的心情

// API请求基础配置
const API_BASE = '/api';
const ACCOUNTING_API_BASE = '/api/accounting';

// 心情配置
const MOOD_CONFIG = {
    happy: { icon: '😄', text: '开心', class: 'mood-happy' },
    angry: { icon: '😠', text: '愤怒', class: 'mood-angry' },
    confused: { icon: '😕', text: '迷茫', class: 'mood-confused' },
    normal: { icon: '🤔', text: '反省', class: 'mood-normal' }
};

// 获取请求头
function getHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

// 获取带认证的请求选项
function getAuthOptions(options = {}) {
    return {
        ...options,
        credentials: 'include',  // 重要：包含cookies以支持session
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
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}天前`;
    } else if (hours > 0) {
        return `${hours}小时前`;
    } else if (minutes > 0) {
        return `${minutes}分钟前`;
    } else {
        return '刚刚';
    }
}

// 格式化完整日期时间
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

// 标签页切换
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // 设置当前活动状态
            this.classList.add('active');
            const tabName = this.dataset.tab;
            document.getElementById(`${tabName}-tab`).classList.add('active');

            currentTab = tabName;
            loadItems();
        });
    });
}

// 加载数据
async function loadItems() {
    toggleLoading(true);
    try {
        if (currentTab === 'accounting') {
            await loadAccountingData();
            return;
        }

        const endpoint = currentTab === 'reflections' ? '/reflections' : '/memos';
        const response = await fetch(`${API_BASE}${endpoint}`, getAuthOptions());

        if (!response.ok) {
            if (response.status === 401) {
                // 未认证，重定向到登录页
                window.location.href = '/';
                return;
            }
            throw new Error('加载数据失败');
        }

        const items = await response.json();
        renderItems(items);
    } catch (error) {
        showToast(error.message, 'error');
        // 如果是网络错误或401，也重定向到登录页
        if (error.message.includes('401') || error.message.includes('fetch')) {
            window.location.href = '/';
        }
    } finally {
        toggleLoading(false);
    }
}

// 加载记账数据
async function loadAccountingData() {
    try {
        // 获取今日汇总
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        // 并行请求汇总和最近记录
        const [summaryResponse, recordsResponse] = await Promise.all([
            fetch(`${ACCOUNTING_API_BASE}/summary?start_date=${monthStartStr}&end_date=${todayStr}`, getAuthOptions()),
            fetch(`${ACCOUNTING_API_BASE}/records?start_date=${monthStartStr}&end_date=${todayStr}`, getAuthOptions())
        ]);

        // 检查认证状态
        if (summaryResponse.status === 401 || recordsResponse.status === 401) {
            window.location.href = '/';
            return;
        }

        if (!summaryResponse.ok || !recordsResponse.ok) {
            throw new Error('加载记账数据失败');
        }

        const summary = await summaryResponse.json();
        const records = await recordsResponse.json();

        renderAccountingSummary(summary);
        renderRecentRecords(records);
    } catch (error) {
        console.error('加载记账数据失败:', error);
        showToast(error.message, 'error');
    }
}

// 渲染记账汇总
function renderAccountingSummary(summary) {
    const summaryEl = document.getElementById('accountingSummary');
    summaryEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #81C784, #4CAF50); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 8px;">本月收入</div>
                <div style="font-size: 1.5rem; font-weight: 700;">¥${summary.total_income}</div>
            </div>
            <div style="background: linear-gradient(135deg, #FF8A80, #FF5252); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 8px;">本月支出</div>
                <div style="font-size: 1.5rem; font-weight: 700;">¥${summary.total_expense}</div>
            </div>
            <div style="background: ${summary.net_amount >= 0 ? 'linear-gradient(135deg, #64B5F6, #2196F3)' : 'linear-gradient(135deg, #FF8A80, #FF5252)'}; padding: 20px; border-radius: 12px; text-align: center; color: white;">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 8px;">净额</div>
                <div style="font-size: 1.5rem; font-weight: 700;">¥${summary.net_amount}</div>
            </div>
        </div>
    `;
}

// 渲染最近记录
function renderRecentRecords(records) {
    const list = document.getElementById('recent-records');

    if (records.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="icon">💰</span>
                <p>暂无记账记录</p>
            </div>
        `;
        return;
    }

    // 按日期分组
    const grouped = {};
    records.forEach(record => {
        const date = record.record_date;
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(record);
    });

    list.innerHTML = Object.entries(grouped).map(([date, items]) => {
        const dateObj = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateDisplay = date;
        if (date === today.toISOString().split('T')[0]) {
            dateDisplay = '今天';
        } else if (date === yesterday.toISOString().split('T')[0]) {
            dateDisplay = '昨天';
        } else {
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            dateDisplay = `${month}月${day}日`;
        }

        const dayIncome = items.filter(r => r.record_type === 'income').reduce((sum, r) => sum + r.amount, 0);
        const dayExpense = items.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + r.amount, 0);

        return `
            <div class="day-group">
                <div style="display: flex; justify-content: space-between; padding: 12px 15px; background: var(--bg-light); border-radius: 8px; margin-bottom: 10px;">
                    <strong>${dateDisplay}</strong>
                    <span>
                        <span style="color: #4CAF50;">收 ¥${dayIncome.toFixed(1)}</span>
                        <span style="color: #FF5252; margin-left: 10px;">支 ¥${dayExpense.toFixed(1)}</span>
                    </span>
                </div>
                ${items.map(item => `
                    <div class="item-card accounting-record-card" style="margin-bottom: 8px; cursor: pointer;" onclick="editAccountingRecord(${item.id})">
                        <div class="item-content">
                            <span style="font-size: 1.2rem; margin-right: 10px;">${item.category_icon}</span>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-weight: 500;">${item.category_name} > ${item.subcategory_name}</span>
                                    <span style="font-weight: 600; color: ${item.record_type === 'income' ? '#4CAF50' : '#FF5252'};">
                                        ${item.record_type === 'income' ? '+' : '-'}¥${item.amount}
                                    </span>
                                </div>
                                ${item.note ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${item.note}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// 编辑记账记录
function editAccountingRecord(recordId) {
    // 跳转到记账页面，带上记录ID作为查询参数
    window.location.href = `/accounting?edit=${recordId}`;
}

// 渲染数据列表
function renderItems(items) {
    const listId = currentTab === 'reflections' ? 'reflections-list' : 'memos-list';
    const list = document.getElementById(listId);

    if (items.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="icon">📭</span>
                <p>暂无${currentTab === 'reflections' ? '反思' : '备忘录'}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => {
        const createdFull = formatFullDateTime(item.created_at);
        const updatedFull = formatFullDateTime(item.updated_at);

        if (currentTab === 'reflections') {
            const moodConfig = MOOD_CONFIG[item.mood] || MOOD_CONFIG.normal;
            return `
                <div class="item-card reflection-card" data-id="${item.id}" onclick="viewReflectionDetail(${item.id})">
                    <div class="item-content">
                        <p class="item-text">${item.content}</p>
                    </div>
                    <div class="item-meta">
                        <span class="mood-badge ${moodConfig.class}">
                            <span class="mood-icon-small">${moodConfig.icon}</span>
                            ${moodConfig.text}
                        </span>
                        <span class="time">创建: ${createdFull}</span>
                    </div>
                    <div class="item-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon btn-edit" onclick="editItem(${item.id})" title="编辑">
                            <span>✏️</span>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${item.id})" title="删除">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="item-card memo-card ${item.is_completed ? 'completed' : ''}" data-id="${item.id}">
                    <div class="item-content">
                        <label class="checkbox-wrapper">
                            <input type="checkbox" ${item.is_completed ? 'checked' : ''}
                                   onchange="toggleMemoComplete(${item.id})">
                            <span class="checkmark"></span>
                        </label>
                        <p class="item-text">${item.content}</p>
                    </div>
                    <div class="item-meta">
                        <span class="time">创建: ${createdFull}</span>
                        <span class="time">更新: ${updatedFull}</span>
                    </div>
                    <div class="item-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon btn-edit" onclick="editItem(${item.id})" title="编辑">
                            <span>✏️</span>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${item.id})" title="删除">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// 查看复盘详情
function viewReflectionDetail(id) {
    window.location.href = `/reflection-detail?id=${id}`;
}

// 显示添加模态框
function showAddModal(type) {
    currentEditItem = null;
    selectedMood = 'normal';  // 重置心情为默认
    document.getElementById('modalTitle').textContent =
        type === 'reflection' ? '添加复盘反思' : '添加备忘录';
    document.getElementById('itemContent').value = '';

    const checkboxGroup = document.getElementById('memoCheckboxGroup');
    const moodSelectorGroup = document.getElementById('moodSelectorGroup');
    const isCompleted = document.getElementById('isCompleted');

    if (type === 'memo') {
        checkboxGroup.style.display = 'block';
        moodSelectorGroup.style.display = 'none';
        isCompleted.checked = false;
    } else {
        checkboxGroup.style.display = 'none';
        moodSelectorGroup.style.display = 'block';
    }

    // 重置心情选择按钮状态
    updateMoodButtons('normal');

    // 保存当前操作类型，用于saveItem判断
    window.currentModalType = type;

    document.getElementById('itemModal').classList.add('show');
}

// 选择心情
function selectMood(mood) {
    selectedMood = mood;
    updateMoodButtons(mood);
}

// 更新心情按钮状态
function updateMoodButtons(mood) {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mood === mood) {
            btn.classList.add('active');
        }
    });
}

// 编辑项目
async function editItem(id) {
    const endpoint = currentTab === 'reflections' ? '/reflections' : '/memos';
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, getAuthOptions());

        if (!response.ok) throw new Error('获取数据失败');

        const items = await response.json();
        const item = items.find(i => i.id === id);

        if (!item) throw new Error('项目不存在');

        currentEditItem = item;
        document.getElementById('modalTitle').textContent =
            currentTab === 'reflections' ? '编辑复盘反思' : '编辑备忘录';
        document.getElementById('itemContent').value = item.content;

        const checkboxGroup = document.getElementById('memoCheckboxGroup');
        const moodSelectorGroup = document.getElementById('moodSelectorGroup');
        const isCompleted = document.getElementById('isCompleted');

        if (currentTab === 'memos') {
            checkboxGroup.style.display = 'block';
            moodSelectorGroup.style.display = 'none';
            isCompleted.checked = item.is_completed;
        } else {
            checkboxGroup.style.display = 'none';
            moodSelectorGroup.style.display = 'block';
            // 设置当前心情
            selectedMood = item.mood || 'normal';
            updateMoodButtons(selectedMood);
        }

        document.getElementById('itemModal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 保存项目
async function saveItem() {
    const content = document.getElementById('itemContent').value.trim();
    if (!content) {
        showToast('请输入内容', 'error');
        return;
    }

    // 判断当前是新建还是编辑，以及类型
    const isEditing = currentEditItem !== null;
    const itemType = isEditing ? currentTab : (window.currentModalType || currentTab);

    // 如果是编辑模式，itemType是 'reflections' 或 'memos'
    // 如果是新建模式，itemType是 'reflection' 或 'memo'
    const isReflection = itemType === 'reflections' || itemType === 'reflection';
    const endpoint = isReflection ? '/reflections' : '/memos';
    const isCompleted = document.getElementById('isCompleted').checked;

    try {
        let response;

        if (isEditing) {
            // 更新
            const updateData = { content };
            if (!isReflection) {
                updateData.is_completed = isCompleted;
            } else {
                // 对于反思，包含心情
                updateData.mood = selectedMood;
            }

            response = await fetch(`${API_BASE}${endpoint}/${currentEditItem.id}`, getAuthOptions({
                method: 'PUT',
                body: JSON.stringify(updateData)
            }));
        } else {
            // 新建
            const createData = { content };
            if (!isReflection) {
                createData.is_completed = isCompleted;
            } else {
                // 对于反思，包含心情
                createData.mood = selectedMood;
            }

            response = await fetch(`${API_BASE}${endpoint}`, getAuthOptions({
                method: 'POST',
                body: JSON.stringify(createData)
            }));
        }

        if (!response.ok) throw new Error('保存失败');

        closeModal();
        loadItems();
        showToast('保存成功');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 切换备忘录完成状态
async function toggleMemoComplete(id) {
    try {
        const response = await fetch(`${API_BASE}/memos`, getAuthOptions());

        if (!response.ok) throw new Error('获取数据失败');

        const memos = await response.json();
        const memo = memos.find(m => m.id === id);

        if (!memo) throw new Error('备忘录不存在');

        const updateResponse = await fetch(`${API_BASE}/memos/${id}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify({
                is_completed: !memo.is_completed
            })
        }));

        if (!updateResponse.ok) throw new Error('更新失败');

        loadItems();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 显示删除确认模态框
function showDeleteModal(id) {
    deleteItemId = id;
    deleteItemType = currentTab;
    document.getElementById('deleteModal').classList.add('show');
}

// 关闭模态框
function closeModal() {
    document.getElementById('itemModal').classList.remove('show');
    currentEditItem = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteItemId = null;
    deleteItemType = null;
}

// 确认删除
async function confirmDelete() {
    try {
        const endpoint = deleteItemType === 'reflections' ? '/reflections' : '/memos';
        const response = await fetch(`${API_BASE}${endpoint}/${deleteItemId}`, getAuthOptions({
            method: 'DELETE'
        }));

        if (!response.ok) throw new Error('删除失败');

        closeDeleteModal();
        loadItems();
        showToast('删除成功');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 退出登录
async function logout() {
    try {
        await fetch(`${API_BASE}/logout`, getAuthOptions({
            method: 'POST'
        }));
    } catch (error) {
        console.error('登出请求失败:', error);
    }
    // 无论请求成功与否，都重定向到登录页
    window.location.href = '/';
}

// ==================== CSV导出功能 ====================

// 显示导出格式选择弹窗
function showExportModal() {
    document.getElementById('exportModal').classList.add('show');
}

// 关闭导出格式选择弹窗
function closeExportModal() {
    document.getElementById('exportModal').classList.remove('show');
}

// 导出当前标签页数据（显示格式选择弹窗）
async function exportCurrentTabData() {
    showExportModal();
}

// 根据选择的格式导出数据
async function exportData(format) {
    closeExportModal();
    switch (currentTab) {
        case 'accounting':
            await exportAccountingData(format);
            break;
        case 'reflections':
            await exportReflectionsData(format);
            break;
        case 'memos':
            await exportMemosData(format);
            break;
        default:
            showToast('未知的标签页类型', 'error');
    }
}

// 导出记账数据
async function exportAccountingData(format = 'csv') {
    toggleLoading(true);
    try {
        const response = await fetch(`${ACCOUNTING_API_BASE}/export/${format}`, {
            ...getAuthOptions(),
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('导出失败');
        }

        // 获取文件名
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `accounting_data.${format}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        const formatName = format === 'csv' ? 'CSV' : 'SQL';
        showToast(`记账数据导出成功 (${formatName})`, 'success');
    } catch (error) {
        showToast(error.message || '导出失败', 'error');
    } finally {
        toggleLoading(false);
    }
}

// 导出反思数据
async function exportReflectionsData(format = 'csv') {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/reflections/export/${format}`, {
            ...getAuthOptions(),
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('导出失败');
        }

        // 获取文件名
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `reflections_data.${format}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        const formatName = format === 'csv' ? 'CSV' : 'SQL';
        showToast(`反思数据导出成功 (${formatName})`, 'success');
    } catch (error) {
        showToast(error.message || '导出失败', 'error');
    } finally {
        toggleLoading(false);
    }
}

// 导出备忘录数据
async function exportMemosData(format = 'csv') {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/memos/export/${format}`, {
            ...getAuthOptions(),
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('导出失败');
        }

        // 获取文件名
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `memos_data.${format}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        const formatName = format === 'csv' ? 'CSV' : 'SQL';
        showToast(`备忘录数据导出成功 (${formatName})`, 'success');
    } catch (error) {
        showToast(error.message || '导出失败', 'error');
    } finally {
        toggleLoading(false);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    loadItems();

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'itemModal') {
                    closeModal();
                } else if (this.id === 'deleteModal') {
                    closeDeleteModal();
                } else if (this.id === 'exportModal') {
                    closeExportModal();
                }
            }
        });
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDeleteModal();
            closeExportModal();
        }
    });

    // 监听来自详情页的刷新请求
    window.addEventListener('storage', function(e) {
        if (e.key === 'memoSystem_refresh') {
            // 清除标记，避免重复刷新
            localStorage.removeItem('memoSystem_refresh');
            // 刷新当前标签页的数据
            loadItems();
        }
    });

    // 页面显示时检查是否需要刷新（从详情页返回时）
    window.addEventListener('pageshow', function(e) {
        // 检查 sessionStorage 中的刷新标记
        const refreshFlag = sessionStorage.getItem('memoSystem_refresh');
        if (refreshFlag) {
            sessionStorage.removeItem('memoSystem_refresh');
            loadItems();
        }
        // 同时也检查 localStorage（兼容不同情况）
        const localFlag = localStorage.getItem('memoSystem_refresh');
        if (localFlag) {
            localStorage.removeItem('memoSystem_refresh');
            loadItems();
        }
    });

    // 页面获得焦点时也检查（例如从详情页返回）
    window.addEventListener('focus', function() {
        const refreshFlag = sessionStorage.getItem('memoSystem_refresh');
        if (refreshFlag) {
            sessionStorage.removeItem('memoSystem_refresh');
            loadItems();
        }
    });
});