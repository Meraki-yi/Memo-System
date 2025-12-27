// 分类收入统计页面 JavaScript
const API_BASE = '/api/accounting';

// 全局状态
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1; // 1-12
let categoryStatsData = null;

// 类目颜色池 - 鲜艳的红色系、橙色系、黄色系等
const CATEGORY_COLORS = [
    '#D32F2F',  // 深红
    '#F44336',  // 鲜红
    '#FF5722',  // 橙红
    '#FF9800',  // 橙色
    '#FFC107',  // 琥珀
    '#FFEB3B',  // 黄色
    '#CDDC39',  // 黄绿
    '#8BC34A',  // 浅绿
    '#4CAF50',  // 绿色
    '#009688',  // 青色
    '#00BCD4',  // 青蓝
    '#03A9F4',  // 天蓝
    '#2196F3',  // 蓝色
    '#3F51B5',  // 靛蓝
    '#673AB7'   // 紫色
];

// 根据索引获取颜色
function getCategoryColor(index) {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    await loadCategoryStats();
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

// 加载分类统计数据
async function loadCategoryStats() {
    toggleLoading(true);
    try {
        // 计算当前月份的开始和结束日期
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0); // 月末最后一天

        const startDateStr = formatDateToString(startDate);
        const endDateStr = formatDateToString(endDate);

        // 获取分类统计数据（收入类型）
        const response = await fetch(
            `${API_BASE}/category-stats?start_date=${startDateStr}&end_date=${endDateStr}&type=income`,
            getAuthOptions()
        );

        if (response.status === 401) {
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('加载统计数据失败');
        }

        const data = await response.json();
        categoryStatsData = data;

        renderCategoryStats(data);
        updatePeriodDisplay();

    } catch (error) {
        console.error('加载分类统计数据失败:', error);
        showToast(error.message, 'error');
        renderEmptyState();
    } finally {
        toggleLoading(false);
    }
}

// 格式化日期为 YYYY-MM-DD
function formatDateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 渲染分类统计数据
function renderCategoryStats(data) {
    const totalAmountEl = document.getElementById('totalAmount');
    const categoryListEl = document.getElementById('categoryList');
    const emptyStateEl = document.getElementById('emptyState');

    // 显示总收入
    totalAmountEl.textContent = `¥${data.total_income.toFixed(2)}`;

    // 如果没有数据，显示空状态
    if (!data.categories || data.categories.length === 0) {
        renderEmptyState();
        return;
    }

    emptyStateEl.style.display = 'none';
    categoryListEl.style.display = 'block';

    // 渲染分类列表
    categoryListEl.innerHTML = data.categories.map((category, index) => {
        const percent = category.percent.toFixed(2);
        const amount = category.amount.toFixed(2);
        const color = getCategoryColor(index);

        return `
            <div class="category-item" onclick="goToCategoryDetail(${category.id})">
                <div class="category-header">
                    <div class="category-name-section">
                        <span class="category-icon">${category.icon}</span>
                        <span class="category-name">${category.name}</span>
                        <span class="category-percent" style="color: ${color}">${percent}%</span>
                    </div>
                    <span class="category-amount" style="color: ${color}">¥${amount}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%; background: ${color}"></div>
                </div>
                <div class="category-detail-row">
                    <div class="category-detail-info">
                        <span style="font-size: 0.85rem; color: var(--text-muted);">
                            共 ${category.record_count} 笔
                        </span>
                    </div>
                    <span class="arrow-icon">›</span>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染空状态
function renderEmptyState() {
    const totalAmountEl = document.getElementById('totalAmount');
    const categoryListEl = document.getElementById('categoryList');
    const emptyStateEl = document.getElementById('emptyState');

    totalAmountEl.textContent = '¥0.00';
    categoryListEl.style.display = 'none';
    emptyStateEl.style.display = 'block';
}

// 更新时间范围显示
function updatePeriodDisplay() {
    const periodDisplayEl = document.getElementById('periodDisplay');
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
                       '7月', '8月', '9月', '10月', '11月', '12月'];

    periodDisplayEl.innerHTML = `
        <div class="period-text">本月 ${currentMonth}.${startDay} ~ ${currentMonth}.${endDay}</div>
        <div class="period-subtext">${monthNames[currentMonth - 1]}</div>
    `;
}

// 切换时间周期
function changePeriod(delta) {
    currentMonth += delta;

    // 处理跨年
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }

    // 重新加载数据
    loadCategoryStats();
}

// 跳转到分类详情页面
function goToCategoryDetail(categoryId) {
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const startDateStr = formatDateToString(startDate);
    const endDateStr = formatDateToString(endDate);

    // 跳转到分类详情页面，传递分类ID和时间范围（收入类型）
    window.location.href = `/income-detail?id=${categoryId}&start=${startDateStr}&end=${endDateStr}`;
}
