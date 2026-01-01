// 年度概览页面 JavaScript
const API_BASE = '/api/accounting';

// 全局状态
let currentYear = new Date().getFullYear();
let maxYear = new Date().getFullYear(); // 最大年份为当前年份
let yearlyData = null;

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 从URL参数获取年份
    const urlParams = new URLSearchParams(window.location.search);
    const yearParam = urlParams.get('year');
    if (yearParam) {
        currentYear = parseInt(yearParam);
        // 确保不超过当前年份
        if (currentYear > maxYear) {
            currentYear = maxYear;
        }
    }
    await loadYearlyData();
    updateYearNavButtons();
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

// 加载年度数据
async function loadYearlyData() {
    toggleLoading(true);
    try {
        // 计算年度的开始和结束日期
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        const startDateStr = formatDateToString(startDate);
        const endDateStr = formatDateToString(endDate);

        // 获取该年度所有月度的收入和支出数据
        const monthlyData = [];

        for (let month = 1; month <= 12; month++) {
            const monthStart = new Date(currentYear, month - 1, 1);
            const monthEnd = new Date(currentYear, month, 0);

            const monthStartStr = formatDateToString(monthStart);
            const monthEndStr = formatDateToString(monthEnd);

            // 并行获取该月的收入和支出数据
            const [incomeResponse, expenseResponse] = await Promise.all([
                fetch(
                    `${API_BASE}/category-stats?start_date=${monthStartStr}&end_date=${monthEndStr}&type=income`,
                    getAuthOptions()
                ),
                fetch(
                    `${API_BASE}/category-stats?start_date=${monthStartStr}&end_date=${monthEndStr}&type=expense`,
                    getAuthOptions()
                )
            ]);

            if (incomeResponse.status === 401 || expenseResponse.status === 401) {
                window.location.href = '/';
                return;
            }

            const incomeData = incomeResponse.ok ? await incomeResponse.json() : {};
            const expenseData = expenseResponse.ok ? await expenseResponse.json() : {};

            // 调试：打印API返回的数据
            console.log(`${currentYear}年${month}月收入数据:`, incomeData);
            console.log(`${currentYear}年${month}月支出数据:`, expenseData);

            // 获取收入总额（API对income类型返回total_income）
            const incomeTotal = incomeData.total_income || 0;

            // 获取支出总额（API对expense类型可能返回total_expense或其他字段）
            let expenseTotal = 0;
            if (expenseData.total_expense !== undefined) {
                expenseTotal = expenseData.total_expense;
            } else if (expenseData.total_income !== undefined) {
                expenseTotal = expenseData.total_income;
            }

            console.log(`${currentYear}年${month}月 - 收入: ${incomeTotal}, 支出: ${expenseTotal}`);

            monthlyData.push({
                month: month,
                startDate: monthStartStr,
                endDate: monthEndStr,
                income: incomeTotal,
                expense: expenseTotal,
                hasData: incomeTotal > 0 || expenseTotal > 0
            });
        }

        yearlyData = { monthly: monthlyData };

        renderYearlyData();
        updateYearDisplay();

    } catch (error) {
        console.error('加载年度数据失败:', error);
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

// 渲染年度数据
function renderYearlyData() {
    const monthlyListEl = document.getElementById('monthlyList');
    const emptyStateEl = document.getElementById('emptyState');

    if (!yearlyData || !yearlyData.monthly || yearlyData.monthly.length === 0) {
        renderEmptyState();
        return;
    }

    // 始终显示所有12个月，即使没有数据
    emptyStateEl.style.display = 'none';
    monthlyListEl.style.display = 'block';

    // 渲染月份列表
    monthlyListEl.innerHTML = yearlyData.monthly.map(data => {
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
                           '7月', '8月', '9月', '10月', '11月', '12月'];
        const monthName = monthNames[data.month - 1];

        return `
            <div class="month-card">
                <div class="month-card-inner">
                    <div class="month-header">
                        <div class="month-left">
                            <span class="month-icon">📅</span>
                            <span class="month-name">${monthName}</span>
                        </div>
                    </div>
                    <div class="month-stats">
                        <div class="month-stat-item" onclick="goToIncomeStats('${data.startDate}', '${data.endDate}')">
                            <div class="stat-left">
                                <span class="stat-label">收入</span>
                                <span class="stat-amount income">¥${data.income.toFixed(2)}</span>
                            </div>
                            <span class="stat-arrow">›</span>
                        </div>
                        <div class="month-stat-item" onclick="goToExpenseStats('${data.startDate}', '${data.endDate}')">
                            <div class="stat-left">
                                <span class="stat-label">支出</span>
                                <span class="stat-amount expense">¥${data.expense.toFixed(2)}</span>
                            </div>
                            <span class="stat-arrow">›</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染空状态
function renderEmptyState() {
    const monthlyListEl = document.getElementById('monthlyList');
    const emptyStateEl = document.getElementById('emptyState');

    monthlyListEl.style.display = 'none';
    emptyStateEl.style.display = 'block';
}

// 更新年份显示
function updateYearDisplay() {
    const yearDisplayEl = document.getElementById('yearDisplay');
    yearDisplayEl.textContent = `${currentYear}年`;
}

// 跳转到收入统计页面
function goToIncomeStats(startDate, endDate) {
    window.location.href = `/income-stats?start=${startDate}&end=${endDate}`;
}

// 跳转到支出统计页面
function goToExpenseStats(startDate, endDate) {
    window.location.href = `/category-stats?start=${startDate}&end=${endDate}`;
}

// 切换年份
function changeYear(delta) {
    const newYear = currentYear + delta;

    // 不能超过当前年份
    if (newYear > maxYear) {
        return;
    }

    // 不能早于某个最小年份（比如2020年，可以根据需要调整）
    const minYear = 2020;
    if (newYear < minYear) {
        return;
    }

    currentYear = newYear;
    loadYearlyData();
    updateYearNavButtons();
}

// 更新年份导航按钮状态
function updateYearNavButtons() {
    const prevBtn = document.getElementById('prevYearBtn');
    const nextBtn = document.getElementById('nextYearBtn');

    const minYear = 2020;

    // 更新"下一年"按钮状态
    if (currentYear >= maxYear) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.3';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }

    // 更新"上一年"按钮状态
    if (currentYear <= minYear) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.3';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
}
