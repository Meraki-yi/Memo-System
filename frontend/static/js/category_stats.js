// 分类支出统计页面 JavaScript
const API_BASE = '/api/accounting';

// 全局状态
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1; // 1-12
let categoryStatsData = null;

// 类目颜色池 - 精美渐变色
// 支出类：居住、学习、交通、餐饮、购物、其他
const CATEGORY_GRADIENTS = [
    'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',      // 居住 - 紫蓝渐变
    'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',      // 学习 - 粉红渐变
    'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',      // 交通 - 天蓝渐变
    'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',      // 餐饮 - 青绿渐变
    'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',      // 购物 - 橙粉渐变
    'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)',      // 其他 - 青粉渐变
    'linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)',      // 备用1 - 粉色渐变
    'linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)',      // 备用2 - 橙色渐变
];

// 根据索引获取渐变色
function getCategoryGradient(index) {
    return CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
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
    const categoryCountEl = document.getElementById('categoryCount');
    const totalCountEl = document.getElementById('totalCount');

    // 显示总支出
    totalAmountEl.textContent = `¥${data.total_expense.toFixed(2)}`;

    // 计算总分类数和总笔数
    const categoryCount = data.categories ? data.categories.length : 0;
    const totalRecords = data.categories ?
        data.categories.reduce((sum, cat) => sum + cat.record_count, 0) : 0;

    categoryCountEl.textContent = categoryCount;
    totalCountEl.textContent = totalRecords;

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
        const gradient = getCategoryGradient(index);

        return `
            <div class="category-card" onclick="goToCategoryDetail(${category.id})" style="--progress: ${percent}%">
                <div class="category-card-inner">
                    <div class="category-header">
                        <div class="category-left">
                            <span class="category-icon">${category.icon}</span>
                            <div class="category-info">
                                <span class="category-name">${category.name}</span>
                                <div class="category-meta">
                                    <span class="category-percent">${percent}%</span>
                                    <span class="category-count">${category.record_count} 笔</span>
                                </div>
                            </div>
                        </div>
                        <div class="category-right">
                            <span class="category-amount">¥${category.amount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="progress-section">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="background: ${gradient}"></div>
                        </div>
                    </div>
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
    const categoryCountEl = document.getElementById('categoryCount');
    const totalCountEl = document.getElementById('totalCount');

    totalAmountEl.textContent = '¥0.00';
    categoryCountEl.textContent = '0';
    totalCountEl.textContent = '0';
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

    periodDisplayEl.textContent = `${currentYear}年${currentMonth}月`;
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
