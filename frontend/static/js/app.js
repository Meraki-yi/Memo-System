// 全局变量
let currentTab = 'accounting';  // 默认显示记账标签
let currentEditItem = null;
let deleteItemId = null;
let deleteItemType = null;
let currentAlignment = 'center';  // 当前选择的对齐方式

// 分页状态管理 - 每个标签页独立的分页状态
const paginationState = {
    accounting: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 20,
        useWeekPagination: true  // 记账使用周分页
    },
    reflections: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 5
    },
    memos: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 10,
        // 新增：待完成的日期状态
        createdDate: null,  // 当前查看的创建日期 (YYYY-MM-DD)
        latestDate: null,  // 最近一次有记录的日期
        availableDates: [],  // 所有有记录的日期列表
        completedItems: 0  // 已完成数量
    }
};

// 周数据缓存
let weekDataCache = {
    income: 0,
    expense: 0,
    net: 0
};

// 日期分组折叠状态管理
const dateGroupCollapseState = {
    // 格式: { 'YYYY-MM-DD': boolean }
    // true = 折叠, false = 展开
};

// API请求基础配置
const API_BASE = '/api';
const ACCOUNTING_API_BASE = '/api/accounting';


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

// 切换周报区域的更多菜单
function toggleWeekMoreMenu() {
    const menu = document.getElementById('weekMoreMenu');
    menu.classList.toggle('show');

    // 点击外部关闭菜单
    if (menu.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeWeekMoreMenuOutside);
        }, 0);
    }
}

// 切换记事页面的更多菜单
function toggleReflectionsMoreMenu() {
    const menu = document.getElementById('reflectionsMoreMenu');
    menu.classList.toggle('show');

    // 点击外部关闭菜单
    if (menu.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeReflectionsMoreMenuOutside);
        }, 0);
    }
}

// 切换待完成页面的更多菜单
function toggleMemosMoreMenu() {
    const menu = document.getElementById('memosMoreMenu');
    menu.classList.toggle('show');

    // 点击外部关闭菜单
    if (menu.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeMemosMoreMenuOutside);
        }, 0);
    }
}

// 点击外部关闭周报区域更多菜单
function closeWeekMoreMenuOutside(event) {
    const menu = document.getElementById('weekMoreMenu');
    const button = document.querySelector('.week-more-btn');
    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeWeekMoreMenuOutside);
    }
}

// 点击外部关闭记事页面更多菜单
function closeReflectionsMoreMenuOutside(event) {
    const menu = document.getElementById('reflectionsMoreMenu');
    const button = document.querySelector('.reflections-more-btn');
    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeReflectionsMoreMenuOutside);
    }
}

// 点击外部关闭待完成页面更多菜单
function closeMemosMoreMenuOutside(event) {
    const menu = document.getElementById('memosMoreMenu');
    const button = document.querySelector('.memos-more-btn');
    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeMemosMoreMenuOutside);
    }
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

// 格式化日期为 YYYY-MM-DD
function formatDateString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期显示（用于日期导航）
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const todayStr = formatDateString(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateString(yesterday);

    if (dateStr === todayStr) {
        return '今天';
    } else if (dateStr === yesterdayStr) {
        return '昨天';
    } else if (dateStr > todayStr) {
        // 未来日期显示"X天后"
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays}天后`;
    } else {
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[date.getDay()];
        return weekDay;
    }
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
            // 切换标签页时重置到第一页
            paginationState[currentTab].currentPage = 1;
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

        if (currentTab === 'memos') {
            await loadMemosData();
            return;
        }

        // 记事标签页
        const state = paginationState[currentTab];
        const endpoint = '/reflections';
        const response = await fetch(
            `${API_BASE}${endpoint}?page=${state.currentPage}&page_size=${state.pageSize}`,
            getAuthOptions()
        );

        if (!response.ok) {
            if (response.status === 401) {
                // 未认证，重定向到登录页
                window.location.href = '/';
                return;
            }
            throw new Error('加载数据失败');
        }

        const data = await response.json();
        // 更新分页状态
        state.totalPages = data.pagination.total_pages;
        state.totalItems = data.pagination.total;
        state.currentPage = data.pagination.page;

        renderItems(data.items);
        updatePaginationUI(currentTab);
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

// 加载待完成数据（基于创建日期）
async function loadMemosData() {
    try {
        const state = paginationState.memos;
        const todayStr = formatDateString(new Date());

        // 加载所有有数据的日期列表
        await loadAvailableDates();

        // 如果没有设置创建日期，优先使用今天，否则使用最新有数据的日期
        if (!state.createdDate) {
            // 如果有历史数据，默认使用今天
            state.createdDate = todayStr;
        }

        // 构建请求 URL
        let url = `${API_BASE}/memos?created_date=${state.createdDate}&page=${state.currentPage}&page_size=${state.pageSize}`;

        const response = await fetch(url, getAuthOptions());

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/';
                return;
            }
            throw new Error('加载待完成失败');
        }

        const data = await response.json();

        // 更新状态
        state.totalPages = data.pagination.total_pages;
        state.totalItems = data.pagination.total;
        state.currentPage = data.pagination.page;
        state.latestDate = data.latest_date;

        // 获取所有数据以计算正确的完成进度（不分页，获取当前日期的所有数据）
        await loadMemosCompletionStats();

        // 渲染数据
        renderMemosList(data.items);
        updateMemosDateNav();
        updatePaginationUI('memos');
    } catch (error) {
        showToast(error.message, 'error');
        if (error.message.includes('401') || error.message.includes('fetch')) {
            window.location.href = '/';
        }
    }
}

// 加载所有有数据的日期列表
async function loadAvailableDates() {
    try {
        const state = paginationState.memos;
        const response = await fetch(`${API_BASE}/memos/dates`, getAuthOptions());

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        state.availableDates = data.dates || [];
    } catch (error) {
        console.error('加载日期列表失败:', error);
    }
}

// 加载待完成统计信息（计算完成进度）
async function loadMemosCompletionStats() {
    try {
        const state = paginationState.memos;

        // 请求所有数据（不分页）以计算完成进度
        const url = `${API_BASE}/memos?created_date=${state.createdDate}&page=1&page_size=1000`;
        const response = await fetch(url, getAuthOptions());

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        // 计算已完成数量（基于所有数据，不只是当前页）
        state.completedItems = data.items.filter(item => item.is_completed).length;
    } catch (error) {
        console.error('加载完成统计失败:', error);
    }
}

// 渲染待完成列表
function renderMemosList(items) {
    const list = document.getElementById('memos-list');

    if (items.length === 0) {
        const state = paginationState.memos;
        const todayStr = formatDateString(new Date());
        const dateDisplay = formatDateDisplay(state.createdDate);

        let dateHint;
        if (state.createdDate === todayStr) {
            dateHint = '今天还没有待完成事项';
        } else if (state.createdDate > todayStr) {
            // 未来日期
            dateHint = `${dateDisplay}还没有待完成事项，点击下方"添加待完成"可提前记录`;
        } else {
            // 历史日期
            dateHint = `${dateDisplay}没有记录`;
        }

        list.innerHTML = `
            <div class="empty-state">
                <span class="icon">📝</span>
                <p>${dateHint}</p>
            </div>
        `;
        return;
    }

    // 直接渲染所有事项，不再分组
    list.innerHTML = items.map(item => renderMemoItem(item)).join('');
}

// 渲染单个待完成事项
function renderMemoItem(item) {
    const createdFull = formatFullDateTime(item.created_at);

    return `
        <div class="item-card memo-card ${item.is_completed ? 'completed' : ''}" data-id="${item.id}">
            <div class="item-content">
                <label class="checkbox-wrapper">
                    <input type="checkbox" ${item.is_completed ? 'checked' : ''}
                           onchange="toggleMemoComplete(${item.id})">
                    <span class="checkmark"></span>
                </label>
                <div style="flex: 1;">
                    <p class="item-text">${item.content.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
            <div class="memo-card-footer">
                <div class="memo-times">
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
        </div>
    `;
}

// 更新待完成日期导航
function updateMemosDateNav() {
    const state = paginationState.memos;
    const todayStr = formatDateString(new Date());
    const isToday = state.createdDate === todayStr;

    // 计算未来7天的最大日期
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = formatDateString(maxDate);

    // 更新日期显示
    const dateDisplay = document.getElementById('memos-current-date');
    const dateHint = document.getElementById('memos-date-hint');

    if (dateDisplay) {
        dateDisplay.textContent = formatDateDisplay(state.createdDate);
    }

    if (dateHint) {
        if (isToday) {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const day = new Date().getDate();
            dateHint.textContent = `${year}年${month}月${day}日`;
        } else {
            const date = new Date(state.createdDate + 'T00:00:00');
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            dateHint.textContent = `${year}年${month}月${day}日`;
        }
    }

    // 根据是否是今天，切换底部导航栏的显示
    const dateNav = document.getElementById('memos-date-nav');
    if (dateNav) dateNav.style.display = 'flex';

    // 更新底部日期导航按钮状态
    const prevBtn = document.getElementById('memos-prev-day-btn');
    const nextBtn = document.getElementById('memos-next-day-btn');

    // "上一天"（更早的日期）：
    // - 如果是今天且有比今天更早的可用数据，可以切换到最新有数据的日期
    // - 如果是今天但没有更早的数据，禁用
    // - 如果是其他日期，根据是否有更早的日期决定
    let shouldDisablePrev;
    if (isToday) {
        // 今天：检查是否有任何早于今天的日期
        const hasEarlierDates = state.availableDates.some(date => date < todayStr);
        shouldDisablePrev = !hasEarlierDates;
    } else {
        const currentIndex = state.availableDates.indexOf(state.createdDate);
        // 如果当前是有数据的日期，检查是否有更早的日期
        // 如果当前是未来日期，允许切换到今天或更早的有数据日期
        if (currentIndex !== -1) {
            shouldDisablePrev = currentIndex >= state.availableDates.length - 1;
        } else {
            // 未来日期：允许切换到今天或更早
            shouldDisablePrev = false;
        }
    }

    if (prevBtn) prevBtn.disabled = shouldDisablePrev;

    // "下一天"（更新的日期）：
    // - 如果已经是最大未来日期（7天后），禁用
    // - 否则允许切换到更晚的日期
    let shouldDisableNext;
    if (state.createdDate >= maxDateStr) {
        // 已经是未来7天的最大日期
        shouldDisableNext = true;
    } else if (isToday) {
        // 今天：可以切换到未来日期
        shouldDisableNext = false;
    } else {
        // 其他日期：
        // 如果最新有数据的日期早于今天，可以切换到今天
        // 或者当前有更新的有数据日期
        // 或者可以切换到未来日期
        const canGoToToday = state.availableDates.length > 0 && state.availableDates[0] < todayStr;
        const currentIndex = state.availableDates.indexOf(state.createdDate);
        const canGoToNextDate = currentIndex > 0;
        shouldDisableNext = !canGoToToday && !canGoToNextDate && state.createdDate < todayStr;
    }

    if (nextBtn) nextBtn.disabled = shouldDisableNext;
}

// 更改待完成日期（可以切换到今天，其他日期只切换到有数据的，未来日期支持连续切换）
function changeMemosDate(delta) {
    const state = paginationState.memos;
    const todayStr = formatDateString(new Date());
    const currentIndex = state.availableDates.indexOf(state.createdDate);

    // 计算未来7天的最大日期
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = formatDateString(maxDate);

    if (delta === 1) {
        // 下一天（更新的日期）
        if (state.createdDate === todayStr) {
            // 如果是今天，切换到明天（未来日期）
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = formatDateString(tomorrow);
            if (tomorrowStr <= maxDateStr) {
                state.createdDate = tomorrowStr;
                state.currentPage = 1;
                loadMemosData();
            }
        } else if (currentIndex > 0) {
            // 切换到下一个有数据的日期（更新的日期）
            const nextDate = state.availableDates[currentIndex - 1];
            state.createdDate = nextDate;
            state.currentPage = 1;
            loadMemosData();
        } else if (state.createdDate < todayStr) {
            // 如果当前日期早于今天，且最新有数据的日期早于今天，则切换到今天
            state.createdDate = todayStr;
            state.currentPage = 1;
            loadMemosData();
        } else if (state.createdDate > todayStr && state.createdDate < maxDateStr) {
            // 如果当前是未来日期，切换到下一天
            const currentDateObj = new Date(state.createdDate + 'T00:00:00');
            currentDateObj.setDate(currentDateObj.getDate() + 1);
            const nextDateStr = formatDateString(currentDateObj);
            if (nextDateStr <= maxDateStr) {
                state.createdDate = nextDateStr;
                state.currentPage = 1;
                loadMemosData();
            }
        }
    } else if (delta === -1) {
        // 上一天（更早的日期）
        if (state.createdDate === todayStr) {
            // 如果今天是当前日期，切换到最新有数据的日期（但不是今天）
            // 找到第一个早于今天的日期
            const targetDate = state.availableDates.find(date => date < todayStr);
            if (targetDate) {
                state.createdDate = targetDate;
                state.currentPage = 1;
                loadMemosData();
            }
        } else if (currentIndex >= 0 && currentIndex < state.availableDates.length - 1) {
            // 切换到上一个有数据的日期（更早的日期）
            state.createdDate = state.availableDates[currentIndex + 1];
            state.currentPage = 1;
            loadMemosData();
        } else if (state.createdDate > todayStr) {
            // 如果当前是未来日期，切换到上一天
            const currentDateObj = new Date(state.createdDate + 'T00:00:00');
            currentDateObj.setDate(currentDateObj.getDate() - 1);
            const prevDateStr = formatDateString(currentDateObj);

            // 检查前一天是否是有数据的日期
            if (state.availableDates.includes(prevDateStr)) {
                // 如果是有数据的日期，直接切换
                state.createdDate = prevDateStr;
            } else if (prevDateStr >= todayStr) {
                // 如果是未来日期或今天，允许切换
                state.createdDate = prevDateStr;
            } else {
                // 如果是历史日期，找到最近的有数据日期
                const targetDate = state.availableDates.find(date => date < todayStr);
                if (targetDate) {
                    state.createdDate = targetDate;
                }
            }
            state.currentPage = 1;
            loadMemosData();
        }
    }
}

// 显示日期选择器
function showDatePicker() {
    const state = paginationState.memos;
    const datePicker = document.getElementById('memoDatePicker');
    if (datePicker) {
        datePicker.value = state.createdDate;

        // 设置日期选择器的最小和最大值
        if (state.availableDates.length > 0) {
            const dates = state.availableDates;
            const todayStr = formatDateString(new Date());

            // 最小值为最早的有数据日期
            datePicker.min = dates[dates.length - 1];

            // 最大值为未来7天（允许提前记录未来任务）
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 7);
            datePicker.max = formatDateString(maxDate);
        } else {
            // 如果没有任何历史数据，仍然允许选择今天和未来7天
            const today = new Date();
            const minDate = new Date(today);
            minDate.setDate(minDate.getDate() - 7); // 最小可以是7天前
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 7); // 最大可以是7天后

            datePicker.min = formatDateString(minDate);
            datePicker.max = formatDateString(maxDate);
        }
    }
    document.getElementById('datePickerModal').classList.add('show');
}

// 关闭日期选择器
function closeDatePicker() {
    document.getElementById('datePickerModal').classList.remove('show');
}

// 确认日期选择
function confirmDatePick() {
    const datePicker = document.getElementById('memoDatePicker');
    if (datePicker && datePicker.value) {
        const state = paginationState.memos;
        const selectedDate = datePicker.value;
        const todayStr = formatDateString(new Date());

        // 计算未来7天的最大日期
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7);
        const maxDateStr = formatDateString(maxDate);

        // 允许选择：
        // 1. 今天（即使今天没有数据）
        // 2. 有数据的日期
        // 3. 未来7天内的任意日期（提前记录）
        if (selectedDate === todayStr || state.availableDates.includes(selectedDate) || (selectedDate > todayStr && selectedDate <= maxDateStr)) {
            state.createdDate = selectedDate;
            state.currentPage = 1;
            loadMemosData();
            closeDatePicker();
        } else {
            showToast('所选日期无效，请选择今天、有记录的日期或未来7天内的日期', 'error');
        }
    } else {
        closeDatePicker();
    }
}

// 格式化日期为本地时区的 YYYY-MM-DD 字符串
function formatDateToLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 加载记账数据
async function loadAccountingData() {
    try {
        const state = paginationState.accounting;

        // 根据分页模式构建请求 URL
        // 注意：周分页时不限制日期范围，允许跨年查看所有历史数据
        let recordsUrl;
        if (state.useWeekPagination) {
            // 周分页：不设置日期限制，获取所有历史数据
            recordsUrl = `${ACCOUNTING_API_BASE}/records?week_page=${state.currentPage}`;
        } else {
            // 普通分页：限制在本月
            const today = new Date();
            const todayStr = formatDateToLocal(today);
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthStartStr = formatDateToLocal(monthStart);
            recordsUrl = `${ACCOUNTING_API_BASE}/records?start_date=${monthStartStr}&end_date=${todayStr}&page=${state.currentPage}&page_size=${state.pageSize}`;
        }

        // 先获取记录数据（包含周信息）
        const recordsResponse = await fetch(recordsUrl, getAuthOptions());

        // 检查认证状态
        if (recordsResponse.status === 401) {
            window.location.href = '/';
            return;
        }

        if (!recordsResponse.ok) {
            throw new Error('加载记账数据失败');
        }

        const recordsData = await recordsResponse.json();

        // 检查是否返回了空数据且页码超出范围（周分页时的边界情况）
        if (recordsData.items.length === 0 && recordsData.week_info === null && state.currentPage > 1) {
            // 页码超出范围，重置到第1页并重新加载
            console.log('页码超出范围，重置到第1页');
            state.currentPage = 1;
            await loadAccountingData();
            return;
        }

        // 更新分页状态
        state.totalPages = recordsData.pagination.total_pages;
        state.totalItems = recordsData.pagination.total;
        state.currentPage = recordsData.pagination.page;

        // 根据周日所在月份计算月收入/支出
        let summary;
        if (recordsData.week_info && recordsData.week_info.end_date) {
            // 获取周日的日期，计算该月的汇总
            const sundayDate = new Date(recordsData.week_info.end_date + 'T00:00:00');
            const monthStart = new Date(sundayDate.getFullYear(), sundayDate.getMonth(), 1);
            const monthEnd = new Date(sundayDate.getFullYear(), sundayDate.getMonth() + 1, 0);
            const monthStartStr = formatDateToLocal(monthStart);
            const monthEndStr = formatDateToLocal(monthEnd);

            // 请求该月的汇总数据
            const summaryResponse = await fetch(`${ACCOUNTING_API_BASE}/summary?start_date=${monthStartStr}&end_date=${monthEndStr}`, getAuthOptions());
            if (summaryResponse.ok) {
                summary = await summaryResponse.json();
            } else {
                // 如果请求失败，使用默认值
                summary = { total_income: 0, total_expense: 0, net_amount: 0 };
            }
        } else {
            // 如果没有周信息，使用当前月份
            const today = new Date();
            const todayStr = formatDateToLocal(today);
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthStartStr = formatDateToLocal(monthStart);
            const summaryResponse = await fetch(`${ACCOUNTING_API_BASE}/summary?start_date=${monthStartStr}&end_date=${todayStr}`, getAuthOptions());
            if (summaryResponse.ok) {
                summary = await summaryResponse.json();
            } else {
                summary = { total_income: 0, total_expense: 0, net_amount: 0 };
            }
        }

        // 渲染统计数据（周报 + 月入口）
        renderStatsArea(summary, recordsData.items, recordsData.week_info);
        renderRecentRecords(recordsData.items);

        // 如果有周信息，显示周范围
        if (recordsData.week_info) {
            updateWeekRangeDisplay(recordsData.week_info);
        } else {
            hideWeekRangeDisplay();
        }

        updateBottomBarButtons();
    } catch (error) {
        console.error('加载记账数据失败:', error);
        showToast(error.message, 'error');
    }
}

// 渲染统计区（周报 + 月入口）
function renderStatsArea(summary, records, weekInfo) {
    // 计算本周数据（从当前记录中计算）
    const weekIncome = records.filter(r => r.record_type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const weekExpense = records.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const weekNet = weekIncome - weekExpense;

    // 更新周报显示
    const weekIncomeEl = document.getElementById('weekIncome');
    const weekExpenseEl = document.getElementById('weekExpense');
    const weekNetEl = document.getElementById('weekNet');
    if (weekIncomeEl) weekIncomeEl.textContent = `+¥${weekIncome.toFixed(2)}`;
    if (weekExpenseEl) weekExpenseEl.textContent = `-¥${weekExpense.toFixed(2)}`;
    if (weekNetEl) weekNetEl.textContent = `¥${weekNet.toFixed(2)}`;

    // 更新月入口显示
    const monthIncomeEl = document.getElementById('monthIncome');
    const monthExpenseEl = document.getElementById('monthExpense');
    if (monthIncomeEl) monthIncomeEl.textContent = `¥${summary.total_income.toFixed(2)}`;
    if (monthExpenseEl) monthExpenseEl.textContent = `¥${summary.total_expense.toFixed(2)}`;

    // 更新年份显示：根据本周周日日期的年份
    const weekYearEl = document.getElementById('weekYear');
    if (weekYearEl) {
        if (weekInfo && weekInfo.end_date) {
            // 根据周日日期的年份显示
            const sundayDate = new Date(weekInfo.end_date);
            weekYearEl.textContent = sundayDate.getFullYear().toString();
        } else {
            // 如果没有周信息，显示当前年份
            const currentYear = new Date().getFullYear();
            weekYearEl.textContent = currentYear.toString();
        }
    }

    // 保存当前周周日所在月份的日期范围，用于跳转时传递
    if (weekInfo && weekInfo.end_date) {
        const sundayDate = new Date(weekInfo.end_date + 'T00:00:00');
        const monthStart = new Date(sundayDate.getFullYear(), sundayDate.getMonth(), 1);
        const monthEnd = new Date(sundayDate.getFullYear(), sundayDate.getMonth() + 1, 0);
        const monthStartStr = formatDateToLocal(monthStart);
        const monthEndStr = formatDateToLocal(monthEnd);

        // 保存到全局变量，供跳转函数使用
        window.currentMonthStart = monthStartStr;
        window.currentMonthEnd = monthEndStr;

        // 保存当前周分页状态，用于返回时恢复
        const state = paginationState.accounting;
        sessionStorage.setItem('memoSystem_weekPage', state.currentPage.toString());
    }

    // 更新分页信息显示
    const state = paginationState.accounting;
    const currentPageEl = document.getElementById('accounting-current-page');
    const totalPagesEl = document.getElementById('accounting-total-pages');
    const totalItemsEl = document.getElementById('accounting-total-items');
    if (currentPageEl) currentPageEl.textContent = state.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = state.totalPages;
    if (totalItemsEl) totalItemsEl.textContent = state.totalItems;
}

// 跳转到分类收入统计页面
function goToIncomeStats() {
    const startDate = window.currentMonthStart || formatDateToLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const endDate = window.currentMonthEnd || formatDateToLocal(new Date());
    window.location.href = `/income-stats?start=${startDate}&end=${endDate}`;
}

// 跳转到分类支出统计页面
function goToExpenseStats() {
    const startDate = window.currentMonthStart || formatDateToLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const endDate = window.currentMonthEnd || formatDateToLocal(new Date());
    window.location.href = `/category-stats?start=${startDate}&end=${endDate}`;
}

// 跳转到年度概览页面
function goToYearlyOverview() {
    const currentYear = new Date().getFullYear();
    window.location.href = `/yearly-overview?year=${currentYear}`;
}

// 跳转到常用待完成页面（已移除，保留函数避免报错）
function goToFrequents() {
    showToast('常用功能已移除', 'error');
}

// 跳转到收藏记事页面
function goToReflectionFrequents() {
    // 保存当前标签页，以便返回时恢复
    sessionStorage.setItem('memoSystem_return_tab', 'reflections');
    window.location.href = '/reflection-frequents';
}

// 跳转到常用收藏页面
function goToCommonFrequents() {
    // 保存当前标签页，以便返回时恢复
    sessionStorage.setItem('memoSystem_return_tab', 'reflections');
    window.location.href = '/common-frequents';
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

    // 获取今天和昨天的日期 - 使用本地时区避免时区转换问题
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayStr = formatDateToLocal(today);
    const yesterdayStr = formatDateToLocal(yesterday);

    // 周几映射
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    list.innerHTML = Object.entries(grouped).map(([date, items]) => {
        const dateObj = new Date(date + 'T00:00:00'); // 确保按本地时区解析

        // 判断是否是今天或昨天
        const isToday = date === todayStr;
        const isYesterday = date === yesterdayStr;

        // 生成日期显示
        let dateDisplay = '';
        if (isToday) {
            dateDisplay = '今天';
        } else if (isYesterday) {
            dateDisplay = '昨天';
        } else {
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            const weekDay = weekDays[dateObj.getDay()];
            dateDisplay = `${month}.${day} ${weekDay}`;
        }

        // 计算当日收支
        const dayIncome = items.filter(r => r.record_type === 'income').reduce((sum, r) => sum + r.amount, 0);
        const dayExpense = items.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + r.amount, 0);

        // 确定折叠状态
        // 今天不允许折叠，其他日期默认展开
        const isCollapsed = isToday ? false : (dateGroupCollapseState[date] || false);
        const canCollapse = !isToday;

        // 生成唯一的组ID
        const groupId = `day-group-${date.replace(/-/g, '')}`;

        return `
            <div class="day-group" data-date="${date}">
                <div class="day-header ${isCollapsed ? 'collapsed' : ''} ${!canCollapse ? 'disabled' : ''}"
                     onclick="${canCollapse ? `toggleDateGroup('${date}')` : ''}"
                     data-date="${date}">
                    <div class="day-header-left">
                        <strong>${dateDisplay}</strong>
                        ${canCollapse ? `<span class="collapse-icon">▼</span>` : ''}
                    </div>
                    <div class="day-header-right">
                        <span style="color: #FF5252;">收 ${dayIncome.toFixed(2)}</span>
                        <span style="color: #4CAF50;">支 ${dayExpense.toFixed(2)}</span>
                    </div>
                </div>
                <div class="day-details ${isCollapsed ? 'collapsed' : ''}" id="${groupId}">
                    ${items.map(item => `
                        <div class="item-card accounting-record-card" onclick="editAccountingRecord(${item.id})">
                            <div class="accounting-record-main">
                                <span class="accounting-record-icon">${item.category_icon}</span>
                                <div class="accounting-record-info">
                                    <div class="accounting-record-header">
                                        <span class="accounting-record-category">${item.category_name} · ${item.subcategory_name}</span>
                                        <span class="accounting-record-amount ${item.record_type}">
                                            ${item.record_type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div class="accounting-record-note">${item.note || ''}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 切换日期分组的折叠/展开状态
function toggleDateGroup(date) {
    // 获取今天日期 - 使用本地时区避免时区转换问题
    const today = formatDateToLocal(new Date());

    // 今天不允许折叠
    if (date === today) {
        return;
    }

    // 切换折叠状态
    const currentState = dateGroupCollapseState[date] || false;
    dateGroupCollapseState[date] = !currentState;

    // 更新DOM
    const dayHeader = document.querySelector(`.day-header[data-date="${date}"]`);
    const dayDetails = document.querySelector(`.day-details[id="day-group-${date.replace(/-/g, '')}"]`);

    if (dayHeader && dayDetails) {
        const newState = !currentState;
        if (newState) {
            dayHeader.classList.add('collapsed');
            dayDetails.classList.add('collapsed');
        } else {
            dayHeader.classList.remove('collapsed');
            dayDetails.classList.remove('collapsed');
        }
    }
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
                <p>暂无${currentTab === 'reflections' ? '记事' : '待完成'}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => {
        const createdFull = formatFullDateTime(item.created_at);
        const updatedFull = formatFullDateTime(item.updated_at);

        if (currentTab === 'reflections') {
            // 将内容按第一个换行符分割为标题和内容
            const firstNewlineIndex = item.content.indexOf('\n');
            let title, content;
            if (firstNewlineIndex === -1) {
                title = item.content;
                content = '';
            } else {
                title = item.content.substring(0, firstNewlineIndex);
                content = item.content.substring(firstNewlineIndex + 1);
            }

            return `
                <div class="item-card reflection-card ${item.is_frequent || item.is_common_frequent ? 'frequent' : ''}" data-id="${item.id}" data-align="${item.content_align || 'center'}">
                    <div class="item-content">
                        <h3 class="item-title">${title || '无标题'}</h3>
                        <p class="item-text">${content || '无内容'}</p>
                    </div>
                    <div class="reflection-card-footer">
                        <div class="reflection-times">
                            <span class="time">创建: ${createdFull}</span>
                            <span class="time">更新: ${updatedFull}</span>
                        </div>
                        <div class="item-actions" onclick="event.stopPropagation()">
                            <button class="btn-icon btn-frequent ${item.is_frequent ? 'active' : ''}" onclick="toggleReflectionFrequent(${item.id}, 'reflection')" title="${item.is_frequent ? '取消反思收藏' : '添加到反思收藏'}">
                                <span class="icon-star">${item.is_frequent ? '⭐' : '☆'}</span>
                            </button>
                            <button class="btn-icon btn-frequent ${item.is_common_frequent ? 'active' : ''}" onclick="toggleReflectionFrequent(${item.id}, 'common')" title="${item.is_common_frequent ? '取消常用收藏' : '添加到常用收藏'}">
                                <span class="icon-heart">${item.is_common_frequent ? '💝' : '♡'}</span>
                            </button>
                            <button class="btn-icon btn-edit" onclick="editItem(${item.id})" title="编辑">
                                <span>✏️</span>
                            </button>
                            <button class="btn-icon btn-delete" onclick="showDeleteModal(${item.id})" title="删除">
                                <span>🗑️</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 待完成卡片（这个分支现在不会执行，因为待完成使用专门的渲染函数）
            return '';
        }
    }).join('');
}

// 设置内容对齐方式
function setContentAlignment(align) {
    currentAlignment = align;

    // 更新按钮状态
    document.querySelectorAll('.alignment-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.align === align) {
            btn.classList.add('active');
        }
    });
}

// 显示添加模态框
function showAddModal(type) {
    currentEditItem = null;
    currentAlignment = 'center';  // 重置为居中对齐
    document.getElementById('modalTitle').textContent =
        type === 'reflection' ? '添加记事' : '添加待完成';

    const isCompleted = document.getElementById('isCompleted');
    const isFrequent = document.getElementById('isFrequent');
    const reflectionEditFields = document.getElementById('reflectionEditFields');
    const memoEditFields = document.getElementById('memoEditFields');
    const alignmentButtons = document.getElementById('alignmentButtons');

    if (type === 'memo') {
        if (isCompleted) isCompleted.checked = false;
        reflectionEditFields.style.display = 'none';
        memoEditFields.style.display = 'block';
        document.getElementById('itemMemoContent').value = '';
        // 待完成不显示对齐按钮
        if (alignmentButtons) alignmentButtons.style.display = 'none';
    } else {
        reflectionEditFields.style.display = 'block';
        memoEditFields.style.display = 'none';
        document.getElementById('itemTitle').value = '';
        document.getElementById('itemContent').value = '';
        // 记事显示对齐按钮
        if (alignmentButtons) alignmentButtons.style.display = 'flex';
        // 重置对齐按钮状态
        setContentAlignment('center');
    }

    // 保存当前操作类型，用于saveItem判断
    window.currentModalType = type;

    document.getElementById('itemModal').classList.add('show');
}

// 编辑项目
async function editItem(id) {
    const endpoint = currentTab === 'reflections' ? '/reflections' : '/memos';
    try {
        // 直接通过ID获取单个记录，而不是从列表中查找
        const response = await fetch(`${API_BASE}${endpoint}/${id}`, getAuthOptions());

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('项目不存在');
            }
            throw new Error('获取数据失败');
        }

        const item = await response.json();

        currentEditItem = item;
        document.getElementById('modalTitle').textContent =
            currentTab === 'reflections' ? '编辑记事' : '编辑待完成';

        const isCompleted = document.getElementById('isCompleted');
        const isFrequent = document.getElementById('isFrequent');
        const reflectionEditFields = document.getElementById('reflectionEditFields');
        const memoEditFields = document.getElementById('memoEditFields');
        const alignmentButtons = document.getElementById('alignmentButtons');

        if (currentTab === 'memos') {
            if (isCompleted) {
                isCompleted.checked = item.is_completed;
            }
            reflectionEditFields.style.display = 'none';
            memoEditFields.style.display = 'block';
            // 待完成不显示对齐按钮
            if (alignmentButtons) alignmentButtons.style.display = 'none';
            // 使用 requestAnimationFrame 确保字段已经显示后再设置值
            requestAnimationFrame(() => {
                const textarea = document.getElementById('itemMemoContent');
                if (textarea) {
                    textarea.value = item.content;
                    // 触发 input 事件以确保值被正确设置
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        } else {
            // 记事模式
            if (isFrequent) {
                isFrequent.checked = item.is_frequent || false;
            }
            reflectionEditFields.style.display = 'block';
            memoEditFields.style.display = 'none';
            // 记事显示对齐按钮
            if (alignmentButtons) alignmentButtons.style.display = 'flex';
            // 设置对齐方式（从数据库读取，默认居中）
            const itemAlignment = item.content_align || 'center';
            currentAlignment = itemAlignment;
            setContentAlignment(itemAlignment);
            // 将内容按第一个换行符分割为标题和内容
            const firstNewlineIndex = item.content.indexOf('\n');
            if (firstNewlineIndex === -1) {
                document.getElementById('itemTitle').value = item.content;
                document.getElementById('itemContent').value = '';
            } else {
                document.getElementById('itemTitle').value = item.content.substring(0, firstNewlineIndex);
                document.getElementById('itemContent').value = item.content.substring(firstNewlineIndex + 1);
            }
        }

        document.getElementById('itemModal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 保存项目
async function saveItem() {
    // 判断当前是新建还是编辑，以及类型
    const isEditing = currentEditItem !== null;
    const itemType = isEditing ? currentTab : (window.currentModalType || currentTab);

    // 如果是编辑模式，itemType是 'reflections' 或 'memos'
    // 如果是新建模式，itemType是 'reflection' 或 'memo'
    const isReflection = itemType === 'reflections' || itemType === 'reflection';
    const endpoint = isReflection ? '/reflections' : '/memos';

    let content;
    if (isReflection) {
        // 记事：合并标题和内容
        const title = document.getElementById('itemTitle').value.trim();
        const contentText = document.getElementById('itemContent').value.trim();
        if (!title && !contentText) {
            showToast('请输入标题或内容', 'error');
            return;
        }
        // 标题和内容用换行符连接
        content = title + (contentText ? '\n' + contentText : '');
    } else {
        // 待完成：只有内容
        const memoTextarea = document.getElementById('itemMemoContent');
        content = memoTextarea.value.trim();
        if (!content) {
            showToast('请输入内容', 'error');
            return;
        }
    }

    // 获取完成状态（仅待完成）
    const isCompleted = document.getElementById('isCompleted').checked;

    try {
        let response;
        let requestData;

        if (isEditing) {
            // 更新
            const updateData = { content };
            if (!isReflection) {
                updateData.is_completed = isCompleted;
                // 注意：不允许修改 created_date
            } else {
                // 记事支持 is_frequent 和 is_common_frequent
                // 保持原有的收藏状态不变
                updateData.is_frequent = currentEditItem.is_frequent || false;
                updateData.is_common_frequent = currentEditItem.is_common_frequent || false;
                // 添加内容对齐方式
                updateData.content_align = currentAlignment;
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
                // 待完成新建时，使用当前查看的日期作为 created_date
                // 如果正在查看未来日期，则任务归属于该未来日期
                const state = paginationState.memos;
                createData.created_date = state.createdDate || formatDateString(new Date());
            } else {
                // 记事默认不收藏，用户可以通过收藏按钮添加
                createData.is_frequent = false;
                createData.is_common_frequent = false;
                // 添加内容对齐方式
                createData.content_align = currentAlignment;
            }

            response = await fetch(`${API_BASE}${endpoint}`, getAuthOptions({
                method: 'POST',
                body: JSON.stringify(createData)
            }));
        }

        if (!response.ok) throw new Error('保存失败');

        closeModal();
        // 新建项目后重置到第一页
        if (!isEditing) {
            paginationState[currentTab].currentPage = 1;
        }
        loadItems();
        showToast('保存成功');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 切换待完成完成状态
async function toggleMemoComplete(id) {
    try {
        // 直接通过ID获取单个记录
        const response = await fetch(`${API_BASE}/memos/${id}`, getAuthOptions());

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('待完成不存在');
            }
            throw new Error('获取数据失败');
        }

        const memo = await response.json();

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

// 切换记事收藏状态
async function toggleReflectionFrequent(id, favoriteType = null) {
    try {
        // 如果没有指定收藏类型，显示选择模态框
        if (!favoriteType) {
            showFavoriteTypeModal(id);
            return;
        }

        // 直接通过ID获取单个记录
        const response = await fetch(`${API_BASE}/reflections/${id}`, getAuthOptions());

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('记事不存在');
            }
            throw new Error('获取数据失败');
        }

        const reflection = await response.json();

        // 根据收藏类型设置要更新的字段
        // 同一条数据只能在一个收藏夹中
        const updateData = { is_frequent: false, is_common_frequent: false };
        if (favoriteType === 'reflection') {
            // 如果当前没有收藏到反思收藏，则收藏；否则取消收藏
            updateData.is_frequent = !reflection.is_frequent;
        } else if (favoriteType === 'common') {
            // 如果当前没有收藏到常用收藏，则收藏；否则取消收藏
            updateData.is_common_frequent = !reflection.is_common_frequent;
        }

        const updateResponse = await fetch(`${API_BASE}/reflections/${id}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify(updateData)
        }));

        if (!updateResponse.ok) throw new Error('更新失败');

        const isNowFrequent = favoriteType === 'reflection' ? updateData.is_frequent : updateData.is_common_frequent;
        const favoriteTypeName = favoriteType === 'reflection' ? '反思收藏' : '常用收藏';
        showToast(isNowFrequent ? `已添加到${favoriteTypeName}` : `已取消${favoriteTypeName}`, 'success');
        loadItems();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 显示收藏类型选择模态框
function showFavoriteTypeModal(id) {
    window.pendingFavoriteId = id;
    document.getElementById('favoriteTypeModal').classList.add('show');
}

// 关闭收藏类型选择模态框
function closeFavoriteTypeModal() {
    document.getElementById('favoriteTypeModal').classList.remove('show');
    window.pendingFavoriteId = null;
}

// 选择收藏类型
function selectFavoriteType(type) {
    const id = window.pendingFavoriteId;
    if (id) {
        closeFavoriteTypeModal();
        toggleReflectionFrequent(id, type);
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

// 导出记事数据
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
        showToast(`记事数据导出成功 (${formatName})`, 'success');
    } catch (error) {
        showToast(error.message || '导出失败', 'error');
    } finally {
        toggleLoading(false);
    }
}

// 导出待完成数据
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
        showToast(`待完成数据导出成功 (${formatName})`, 'success');
    } catch (error) {
        showToast(error.message || '导出失败', 'error');
    } finally {
        toggleLoading(false);
    }
}

// 切换到指定标签页
function switchToTab(tabName) {
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (tabBtn) {
        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // 设置当前活动状态
        tabBtn.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        currentTab = tabName;
        // 重置到第一页
        paginationState[currentTab].currentPage = 1;
        loadItems();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();

    // 检查是否有保存的周分页状态，如果有则恢复
    const weekPage = sessionStorage.getItem('memoSystem_weekPage');
    if (weekPage) {
        const page = parseInt(weekPage);
        paginationState.accounting.currentPage = page;
        // 清除标记，避免影响后续操作
        sessionStorage.removeItem('memoSystem_weekPage');
    }

    // 检查URL参数中是否有tab指定
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab');

    // 检查是否有返回标签页的请求
    const returnTab = sessionStorage.getItem('memoSystem_return_tab');
    const targetTab = urlTab || returnTab;

    if (targetTab) {
        // 清除标记
        sessionStorage.removeItem('memoSystem_return_tab');
        // 切换到指定标签页
        switchToTab(targetTab);
        // 清除URL参数，避免刷新时再次切换
        if (urlTab) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    } else {
        // 默认加载当前标签页的数据
        loadItems();
    }

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
                } else if (this.id === 'datePickerModal') {
                    closeDatePicker();
                } else if (this.id === 'favoriteTypeModal') {
                    closeFavoriteTypeModal();
                }
            }
        });
    });

    // ESC键关闭模态框和菜单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDeleteModal();
            closeExportModal();
            closeDatePicker();
            closeFavoriteTypeModal();
            // 关闭所有打开的更多菜单
            const weekMoreMenu = document.getElementById('weekMoreMenu');
            const reflectionsMoreMenu = document.getElementById('reflectionsMoreMenu');
            const memosMoreMenu = document.getElementById('memosMoreMenu');
            if (weekMoreMenu) weekMoreMenu.classList.remove('show');
            if (reflectionsMoreMenu) reflectionsMoreMenu.classList.remove('show');
            if (memosMoreMenu) memosMoreMenu.classList.remove('show');
        }
    });

    // 监听来自详情页的刷新请求
    window.addEventListener('storage', function(e) {
        if (e.key === 'memoSystem_refresh') {
            // 清除标记，避免重复刷新
            localStorage.removeItem('memoSystem_refresh');

            // 检查是否需要重置分页
            const shouldResetPagination = localStorage.getItem('memoSystem_reset_pagination') === 'true';
            if (shouldResetPagination) {
                localStorage.removeItem('memoSystem_reset_pagination');
                // 重置所有标签页的分页到第1页
                Object.keys(paginationState).forEach(tab => {
                    paginationState[tab].currentPage = 1;
                });
            }

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

            // 检查是否需要重置分页
            const shouldResetPagination = sessionStorage.getItem('memoSystem_reset_pagination') === 'true';
            if (shouldResetPagination) {
                sessionStorage.removeItem('memoSystem_reset_pagination');
                // 重置所有标签页的分页到第1页
                Object.keys(paginationState).forEach(tab => {
                    paginationState[tab].currentPage = 1;
                });
            }

            loadItems();
        }
        // 同时也检查 localStorage（兼容不同情况）
        const localFlag = localStorage.getItem('memoSystem_refresh');
        if (localFlag) {
            localStorage.removeItem('memoSystem_refresh');

            // 检查是否需要重置分页
            const shouldResetPagination = localStorage.getItem('memoSystem_reset_pagination') === 'true';
            if (shouldResetPagination) {
                localStorage.removeItem('memoSystem_reset_pagination');
                // 重置所有标签页的分页到第1页
                Object.keys(paginationState).forEach(tab => {
                    paginationState[tab].currentPage = 1;
                });
            }

            loadItems();
        }
    });

    // 页面获得焦点时也检查（例如从详情页返回）
    window.addEventListener('focus', function() {
        const refreshFlag = sessionStorage.getItem('memoSystem_refresh');
        if (refreshFlag) {
            sessionStorage.removeItem('memoSystem_refresh');

            // 检查是否需要重置分页
            const shouldResetPagination = sessionStorage.getItem('memoSystem_reset_pagination') === 'true';
            if (shouldResetPagination) {
                sessionStorage.removeItem('memoSystem_reset_pagination');
                // 重置所有标签页的分页到第1页
                Object.keys(paginationState).forEach(tab => {
                    paginationState[tab].currentPage = 1;
                });
            }

            loadItems();
        }
    });
});

// ==================== 分页功能 ====================

// 更新分页 UI
function updatePaginationUI(tab) {
    const state = paginationState[tab];
    const prefix = tab === 'accounting' ? 'accounting' : 'reflections';

    // 待完成页面使用特殊的分页信息格式
    if (tab === 'memos') {
        updateMemosPaginationUI();
        return;
    }

    // 更新页码信息
    document.getElementById(`${prefix}-current-page`).textContent = state.currentPage;
    document.getElementById(`${prefix}-total-pages`).textContent = state.totalPages;
    document.getElementById(`${prefix}-total-items`).textContent = state.totalItems;

    // 更新按钮状态
    const prevBtn = document.getElementById(`${prefix}-prev-btn`);
    const nextBtn = document.getElementById(`${prefix}-next-btn`);

    prevBtn.disabled = state.currentPage <= 1;
    nextBtn.disabled = state.currentPage >= state.totalPages;

    // 其他页面：显示/隐藏分页容器（如果没有数据，隐藏分页）
    const paginationContainer = document.getElementById(`${prefix}-pagination`);
    if (state.totalItems === 0) {
        paginationContainer.style.display = 'none';
    } else {
        paginationContainer.style.display = 'block';
    }
}

// 更新待完成页面的分页 UI
function updateMemosPaginationUI() {
    const state = paginationState.memos;
    const todayStr = formatDateString(new Date());
    const dateDisplay = formatDateDisplay(state.createdDate);
    const totalItems = state.totalItems || 0;
    const completedItems = state.completedItems || 0;
    const isToday = state.createdDate === todayStr;

    // 更新顶部导航栏中的完成进度信息
    const completionInfo = document.getElementById('memos-completion-info');
    if (completionInfo) {
        // 只显示完成进度，如 "0/1"
        // 已完成数量用红色高亮显示
        completionInfo.innerHTML = `<span class="completed-count">${completedItems}</span>/${totalItems}`;
    }

    // 始终显示底部导航栏
    const paginationContainer = document.getElementById('memos-pagination');
    if (paginationContainer) paginationContainer.style.display = 'block';

    // 更新底部日期导航按钮状态
    const prevBtn = document.getElementById('memos-prev-day-btn');
    const nextBtn = document.getElementById('memos-next-day-btn');

    // "上一天"（更早的日期）
    let shouldDisablePrev;
    if (isToday) {
        // 今天：检查是否有任何早于今天的日期
        const hasEarlierDates = state.availableDates.some(date => date < todayStr);
        shouldDisablePrev = !hasEarlierDates;
    } else {
        const currentIndex = state.availableDates.indexOf(state.createdDate);
        shouldDisablePrev = currentIndex === -1 || currentIndex >= state.availableDates.length - 1;
    }

    if (prevBtn) prevBtn.disabled = shouldDisablePrev;

    // "下一天"（更新的日期）
    let shouldDisableNext;
    if (isToday) {
        shouldDisableNext = true;
    } else {
        const canGoToToday = state.availableDates.length > 0 && state.availableDates[0] < todayStr;
        const currentIndex = state.availableDates.indexOf(state.createdDate);
        const canGoToNextDate = currentIndex > 0;
        shouldDisableNext = !canGoToToday && !canGoToNextDate;
    }

    if (nextBtn) nextBtn.disabled = shouldDisableNext;
}

// 记账分页切换
// 注意：周分页中，页码越大代表周越早（时间越久远）
// 第1页 = 最新周，第2页 = 上一周，第3页 = 上上周
function changeAccountingPage(delta) {
    const state = paginationState.accounting;
    const newPage = state.currentPage + delta;

    // 检查页码是否在有效范围内
    if (newPage >= 1 && newPage <= state.totalPages) {
        state.currentPage = newPage;
        loadAccountingData();
        // 滚动到顶部
        document.querySelector('.tab-content-scrollable').scrollTop = 0;
    }
}

// 记事分页切换
function changeReflectionsPage(delta) {
    const state = paginationState.reflections;
    const newPage = state.currentPage + delta;

    if (newPage >= 1 && newPage <= state.totalPages) {
        state.currentPage = newPage;
        loadItems();
        // 重置滚动位置到顶部
        const scrollable = document.querySelector('#reflections-tab .tab-content-scrollable');
        if (scrollable) {
            scrollable.scrollTop = 0;
        }
    }
}

// 待完成分页切换
function changeMemosPage(delta) {
    const state = paginationState.memos;
    const newPage = state.currentPage + delta;

    if (newPage >= 1 && newPage <= state.totalPages) {
        state.currentPage = newPage;
        loadMemosData();
        // 重置滚动位置到顶部
        const scrollable = document.querySelector('#memos-tab .tab-content-scrollable');
        if (scrollable) {
            scrollable.scrollTop = 0;
        }
    }
}


// ==================== 周分页相关功能 ====================

// 更新周范围显示
function updateWeekRangeDisplay(weekInfo) {
    // 更新头部周报区域的年份
    const weekYearEl = document.getElementById('weekYear');
    if (weekInfo && weekYearEl) {
        const sundayDate = new Date(weekInfo.end_date);
        weekYearEl.textContent = sundayDate.getFullYear().toString();
    }

    // 更新头部周报区域的日期范围（不包含年份）
    const headerDateRange = document.getElementById('weekDateRangeHeader');
    if (weekInfo && headerDateRange) {
        // 从 start_display 和 end_display 中提取月日部分
        // 格式：从 "12月22日 - 12月28日" 变为 "01月05日－01月11日"
        headerDateRange.textContent = `${weekInfo.start_display}－${weekInfo.end_display}`;
    }
}

// 隐藏周范围显示
function hideWeekRangeDisplay() {
    const headerDateRange = document.getElementById('weekDateRangeHeader');
    if (headerDateRange) {
        headerDateRange.textContent = '';
    }
}

// 更新底部栏按钮状态
function updateBottomBarButtons() {
    const state = paginationState.accounting;
    const prevBtn = document.getElementById('prevWeekBtn');
    const nextBtn = document.getElementById('nextWeekBtn');

    // 只有当没有数据时才禁用所有按钮
    const hasNoData = state.totalPages === 0 || state.totalItems === 0;

    // "上一周"（看更早的数据）：当已经是最早的一周时禁用
    // "下一周"（看更新的数据）：当已经是最新的一周（第1页）时禁用
    if (hasNoData) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        // 上一周：可以查看更早的周（页码增加）
        prevBtn.disabled = state.currentPage >= state.totalPages;
        // 下一周：可以查看更新的周（页码减少），但在第1页时禁用
        nextBtn.disabled = state.currentPage <= 1;
    }
}
