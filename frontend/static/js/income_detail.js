// 分类收入详情页面 JavaScript
const API_BASE = '/api/accounting';

// 全局状态
let categoryId = null;
let startDate = null;
let endDate = null;
let categoryData = null;

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    categoryId = parseInt(urlParams.get('id'));
    startDate = urlParams.get('start');
    endDate = urlParams.get('end');

    if (!categoryId) {
        showToast('缺少分类ID参数', 'error');
        goBack();
        return;
    }

    await loadCategoryDetail();
});

// 获取认证请求选项
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
    loading.style.display = show ? 'flex' : 'none';
}

// 返回上一页
function goBack() {
    window.history.back();
}

// 加载分类详情数据
async function loadCategoryDetail() {
    toggleLoading(true);
    try {
        // 获取分类详情统计数据（收入类型）
        const statsUrl = `${API_BASE}/category-detail/${categoryId}?start_date=${startDate}&end_date=${endDate}&type=income`;
        const response = await fetch(statsUrl, getAuthOptions());

        if (response.status === 401) {
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('加载详情失败');
        }

        const data = await response.json();
        categoryData = data;

        renderCategoryDetail(data);

    } catch (error) {
        console.error('加载分类详情失败:', error);
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 渲染分类详情
function renderCategoryDetail(data) {
    // 更新页面标题
    document.getElementById('pageTitle').textContent = data.category_name;

    // 更新分类概览
    document.getElementById('categoryIcon').textContent = data.category_icon;
    document.getElementById('categoryName').textContent = data.category_name;
    document.getElementById('totalAmount').textContent = `¥${data.total_amount.toFixed(2)}`;
    document.getElementById('recordCount').textContent = data.record_count;
    document.getElementById('avgAmount').textContent = `¥${data.avg_amount.toFixed(2)}`;

    // 渲染记录列表
    const recordsListEl = document.getElementById('recordsList');
    const emptyStateEl = document.getElementById('emptyState');

    if (!data.records || data.records.length === 0) {
        recordsListEl.style.display = 'none';
        emptyStateEl.style.display = 'block';
        return;
    }

    emptyStateEl.style.display = 'none';
    recordsListEl.style.display = 'block';

    // 按日期分组展示，记录框内不显示日期
    const groupedRecords = groupRecordsByDate(data.records);

    recordsListEl.innerHTML = Object.entries(groupedRecords).map(([date, records]) => {
        const dateObj = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateDisplay = formatDate(dateObj);
        if (date === today.toISOString().split('T')[0]) {
            dateDisplay = '今天';
        } else if (date === yesterday.toISOString().split('T')[0]) {
            dateDisplay = '昨天';
        }

        const dayTotal = records.reduce((sum, r) => sum + r.amount, 0);

        return `
            <div class="date-group">
                <div class="date-group-header">
                    <span>${dateDisplay}</span>
                    <span class="date-group-total">¥${dayTotal.toFixed(2)}</span>
                </div>
                <div class="date-group-records">
                    ${records.map(record => `
                        <div class="record-card">
                            <div class="record-first-line">
                                <span class="record-subcategory-name">${record.subcategory_name}</span>
                                <span class="record-amount">¥${record.amount.toFixed(2)}</span>
                            </div>
                            <div class="record-second-line">${record.note || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 按日期分组记录
function groupRecordsByDate(records) {
    const grouped = {};
    records.forEach(record => {
        const date = record.record_date;
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(record);
    });
    return grouped;
}

// 格式化日期
function formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
}
