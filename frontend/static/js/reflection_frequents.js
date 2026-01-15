// ==================== 全局变量 ====================
let currentEditId = null;
let currentPage = 1;
let pageSize = 5;
let totalPages = 1;
let totalItems = 0;

// ==================== 页面加载 ====================
document.addEventListener('DOMContentLoaded', function() {
    loadReflectionFrequents();

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDeleteModal();
        }
    });

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'itemModal') {
                    closeModal();
                } else if (this.id === 'deleteModal') {
                    closeDeleteModal();
                }
            }
        });
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('moreMenu');
        const button = document.querySelector('.more-btn');
        if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
            menu.classList.remove('active');
        }
    });
});

// ==================== API 基础配置 ====================
const API_BASE = '/api';

function getAuthOptions(options = {}) {
    return {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
            'Content-Type': 'application/json'
        }
    };
}

// ==================== 加载收藏反思 ====================
async function loadReflectionFrequents() {
    try {
        const response = await fetch(`${API_BASE}/reflections/frequents?page=${currentPage}&page_size=${pageSize}`, getAuthOptions());

        if (response.status === 401) {
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('获取收藏反思失败');
        }
        const data = await response.json();

        // 更新分页信息
        totalPages = data.pagination.total_pages;
        totalItems = data.pagination.total;

        // 渲染反思列表
        const list = document.getElementById('reflection-frequents-list');
        if (data.items.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="icon">⭐</span>
                    <p>暂无收藏反思</p>
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 8px;">
                        在复盘反思中点击星号标记为收藏
                    </p>
                </div>
            `;
        } else {
            list.innerHTML = data.items.map(item => renderReflectionCard(item)).join('');
        }

        // 更新分页控件
        updatePagination();
    } catch (error) {
        console.error('加载收藏反思失败:', error);
        showToast('加载失败，请刷新页面重试', 'error');
    }
}

// ==================== 渲染反思卡片 ====================
function renderReflectionCard(item) {
    const createdDate = new Date(item.created_at);
    const updatedDate = new Date(item.updated_at);
    const createdFull = formatFullDateTime(createdDate);
    const updatedFull = formatFullDateTime(updatedDate);

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
        <div class="item-card reflection-card frequent" data-id="${item.id}">
            <div class="item-content">
                <h3 class="item-title">${escapeHtml(title) || '无标题'}</h3>
                <p class="item-text">${escapeHtml(content) || '无内容'}</p>
            </div>
            <div class="reflection-card-footer">
                <div class="reflection-times">
                    <span class="time">创建: ${createdFull}</span>
                    <span class="time">更新: ${updatedFull}</span>
                </div>
                <div class="item-actions" onclick="event.stopPropagation()">
                    <button class="btn-icon btn-frequent active" onclick="toggleReflectionFrequent(${item.id})" title="取消收藏">
                        <span>⭐</span>
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
}

// ==================== 格式化日期时间 ====================
function formatFullDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 分页功能 ====================
function changeReflectionFrequentsPage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadReflectionFrequents();
    }
}

function updatePagination() {
    document.getElementById('reflection-frequents-current-page').textContent = currentPage;
    document.getElementById('reflection-frequents-total-pages').textContent = totalPages;
    document.getElementById('reflection-frequents-total-items').textContent = totalItems;

    const prevBtn = document.getElementById('reflection-frequents-prev-btn');
    const nextBtn = document.getElementById('reflection-frequents-next-btn');

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // 如果没有数据，隐藏分页
    const paginationContainer = document.getElementById('reflection-frequents-pagination');
    if (totalItems === 0) {
        paginationContainer.style.display = 'none';
    } else {
        paginationContainer.style.display = 'block';
    }
}

// ==================== 模态框操作 ====================
function showAddModal(type) {
    currentEditId = null;

    document.getElementById('modalTitle').textContent = '添加复盘反思';
    document.getElementById('reflectionEditFields').style.display = 'block';
    document.getElementById('itemTitle').value = '';
    document.getElementById('itemContent').value = '';
    document.getElementById('isFrequent').checked = true; // 默认标记为收藏

    document.getElementById('itemModal').classList.add('show');
}

async function editItem(id) {
    currentEditId = id;

    try {
        const response = await fetch(`${API_BASE}/reflections/${id}`, getAuthOptions());

        if (!response.ok) throw new Error('获取数据失败');

        const data = await response.json();

        document.getElementById('modalTitle').textContent = '编辑复盘反思';
        document.getElementById('reflectionEditFields').style.display = 'block';

        // 将内容按第一个换行符分割为标题和内容
        const firstNewlineIndex = data.content.indexOf('\n');
        if (firstNewlineIndex === -1) {
            document.getElementById('itemTitle').value = data.content;
            document.getElementById('itemContent').value = '';
        } else {
            document.getElementById('itemTitle').value = data.content.substring(0, firstNewlineIndex);
            document.getElementById('itemContent').value = data.content.substring(firstNewlineIndex + 1);
        }
        document.getElementById('isFrequent').checked = data.is_frequent || false;

        document.getElementById('itemModal').classList.add('show');
    } catch (error) {
        console.error('获取数据失败:', error);
        showToast('获取数据失败', 'error');
    }
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('show');
    currentEditId = null;
}

// ==================== 保存操作 ====================
async function saveItem() {
    const title = document.getElementById('itemTitle').value.trim();
    const contentText = document.getElementById('itemContent').value.trim();

    if (!title && !contentText) {
        showToast('请输入标题或内容', 'error');
        return;
    }

    // 标题和内容用换行符连接
    const content = title + (contentText ? '\n' + contentText : '');

    const isFrequent = document.getElementById('isFrequent').checked;

    const data = {
        content: content,
        is_frequent: isFrequent
    };

    try {
        const url = currentEditId ? `${API_BASE}/reflections/${currentEditId}` : `${API_BASE}/reflections`;
        const method = currentEditId ? 'PUT' : 'POST';

        const response = await fetch(url, getAuthOptions({
            method: method,
            body: JSON.stringify(data)
        }));

        if (!response.ok) throw new Error('保存失败');

        showToast(currentEditId ? '更新成功' : '添加成功');
        closeModal();
        loadReflectionFrequents();
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败，请重试', 'error');
    }
}

// ==================== 切换收藏状态 ====================
async function toggleReflectionFrequent(id) {
    try {
        // 直接获取该反思的详情
        const response = await fetch(`${API_BASE}/reflections/${id}`, getAuthOptions());

        if (!response.ok) throw new Error('获取数据失败');

        const reflection = await response.json();

        // 取消收藏（收藏页面中只能取消收藏）
        const updateResponse = await fetch(`${API_BASE}/reflections/${id}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify({
                is_frequent: false
            })
        }));

        if (!updateResponse.ok) throw new Error('更新失败');

        showToast('已取消收藏', 'success');
        loadReflectionFrequents();
    } catch (error) {
        console.error('切换收藏状态失败:', error);
        showToast(error.message, 'error');
    }
}

// ==================== 删除操作 ====================
let deleteItemId = null;

function showDeleteModal(id) {
    deleteItemId = id;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteItemId = null;
}

async function confirmDelete() {
    if (!deleteItemId) return;

    try {
        const response = await fetch(`${API_BASE}/reflections/${deleteItemId}`, getAuthOptions({
            method: 'DELETE'
        }));

        if (!response.ok) throw new Error('删除失败');

        showToast('删除成功');
        closeDeleteModal();
        loadReflectionFrequents();
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败，请重试', 'error');
    }
}

// ==================== 返回功能 ====================
function goBack() {
    window.location.href = '/app?tab=reflections';
}

// ==================== Toast提示 ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== 更多菜单 ====================
function toggleMoreMenu() {
    const menu = document.getElementById('moreMenu');
    menu.classList.toggle('active');
}

// ==================== 退出登录 ====================
async function logout() {
    try {
        await fetch(`${API_BASE}/logout`, getAuthOptions({
            method: 'POST'
        }));
    } catch (error) {
        console.error('退出失败:', error);
    }
    window.location.href = '/';
}
