// 分类支出统计页面 JavaScript
const API_BASE = '/api/accounting';

// 全局状态
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1; // 1-12
let categoryStatsData = null;

// 类目颜色池 - 低饱和度，偏账本工具感
// 支出类：居住、学习、交通、餐饮、购物、其他
const CATEGORY_COLORS = [
    '#2d5a3d',  // 居住 - 深绿（稳定）
    '#3d7a5a',  // 学习 - 蓝绿（理性投入）
    '#4a7a8a',  // 交通 - 蓝色（流动性）
    '#8a6a3a',  // 餐饮 - 橙黄（日常）
    '#8a5a5a',  // 购物 - 粉橙
    '#6a6a7a',  // 其他 - 灰蓝
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

        // 获取分类统计数据
        const response = await fetch(
            `${API_BASE}/category-stats?start_date=${startDateStr}&end_date=${endDateStr}&type=expense`,
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

    // 显示总支出
    totalAmountEl.textContent = `¥${data.total_expense.toFixed(2)}`;

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
                        <span class="category-percent">${percent}%</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%; background: ${color}"></div>
                </div>
                <div class="category-detail-row">
                    <span class="category-record-count">共 ${category.record_count} 笔</span>
                    <span class="category-amount">¥${amount}</span>
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
        <div class="period-text">${currentMonth}.${startDay} ~ ${currentMonth}.${endDay}</div>
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

    // 跳转到分类详情页面，传递分类ID和时间范围
    window.location.href = `/category-detail?id=${categoryId}&start=${startDateStr}&end=${endDateStr}&type=expense`;
}
