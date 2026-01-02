// ==================== 全局变量 ====================
let currentEditId = null;
let currentPage = 1;
let pageSize = 5;
let totalPages = 1;
let totalItems = 0;
let uploadedImages = []; // 存储上传的图片数据

// ==================== 页面加载 ====================
document.addEventListener('DOMContentLoaded', function() {
    loadFrequents();
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

// ==================== 加载常用备忘录 ====================
async function loadFrequents() {
    try {
        const response = await fetch(`/api/memos/frequents?page=${currentPage}&page_size=${pageSize}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('获取常用备忘录失败');
        }
        const data = await response.json();

        // 更新分页信息
        totalPages = data.pagination.total_pages;
        totalItems = data.pagination.total;

        // 渲染备忘录列表
        const list = document.getElementById('frequents-list');
        if (data.items.length === 0) {
            list.innerHTML = '<div class="empty-state">暂无常用备忘录</div>';
        } else {
            list.innerHTML = data.items.map(item => renderMemoCard(item)).join('');
        }

        // 更新分页控件
        updatePagination();
    } catch (error) {
        console.error('加载常用备忘录失败:', error);
        showToast('加载失败，请刷新页面重试', 'error');
    }
}

// ==================== 渲染备忘录卡片 ====================
function renderMemoCard(item) {
    const createdDate = new Date(item.created_at);
    const updatedDate = new Date(item.updated_at);
    const createdFull = formatFullDateTime(createdDate);
    const updatedFull = formatFullDateTime(updatedDate);

    // 生成图片HTML - 居中显示，美观布局
    let imagesHtml = '';
    if (item.images && item.images.length > 0) {
        imagesHtml = '<div class="memo-images">';
        item.images.forEach(img => {
            imagesHtml += `
                <div class="memo-image-item">
                    <img src="${img}" alt="备忘录图片" onclick="viewImage('${img}')">
                </div>`;
        });
        imagesHtml += '</div>';
    }

    return `
        <div class="item-card memo-card ${item.is_completed ? 'completed' : ''} ${item.is_frequent ? 'frequent' : ''}" data-id="${item.id}">
            <div class="item-content">
                <label class="checkbox-wrapper">
                    <input type="checkbox" ${item.is_completed ? 'checked' : ''}
                           onchange="toggleMemoComplete(${item.id})">
                    <span class="checkmark"></span>
                </label>
                <p class="item-text">${escapeHtml(item.content)}</p>
            </div>
            ${imagesHtml}
            <div class="memo-card-footer">
                <div class="memo-times">
                    <span class="time">创建: ${createdFull}</span>
                    <span class="time">更新: ${updatedFull}</span>
                </div>
                <div class="item-actions" onclick="event.stopPropagation()">
                    <button class="btn-icon btn-frequent ${item.is_frequent ? 'active' : ''}" onclick="toggleMemoFrequent(${item.id})" title="${item.is_frequent ? '取消常用' : '设为常用'}">
                        <span>${item.is_frequent ? '⭐' : '☆'}</span>
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
    return div.innerHTML.replace(/\n/g, '<br>');
}

// ==================== 分页功能 ====================
function changeFrequentsPage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadFrequents();
    }
}

function updatePagination() {
    document.getElementById('frequents-current-page').textContent = currentPage;
    document.getElementById('frequents-total-pages').textContent = totalPages;
    document.getElementById('frequents-total-items').textContent = totalItems;

    const prevBtn = document.getElementById('frequents-prev-btn');
    const nextBtn = document.getElementById('frequents-next-btn');

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// ==================== 模态框操作 ====================
function showAddModal(type) {
    currentEditId = null;

    document.getElementById('modalTitle').textContent = '添加备忘录';
    document.getElementById('memoEditFields').style.display = 'block';
    document.getElementById('itemMemoContent').value = '';
    document.getElementById('isCompleted').checked = false;
    clearImages();

    document.getElementById('itemModal').classList.add('show');
}

function editItem(id) {
    currentEditId = id;

    fetch(`/api/memos/${id}`, {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('modalTitle').textContent = '编辑备忘录';
            document.getElementById('memoEditFields').style.display = 'block';

            document.getElementById('itemMemoContent').value = data.content;
            document.getElementById('isCompleted').checked = data.is_completed;

            // 加载已有图片
            clearImages();
            if (data.images && data.images.length > 0) {
                data.images.forEach((imgData, index) => {
                    uploadedImages.push({
                        id: Date.now() + index,
                        data: imgData,
                        name: `image_${index}.jpg`
                    });
                });
                updateImagePreview();
            }

            document.getElementById('itemModal').classList.add('show');
        })
        .catch(error => {
            console.error('获取数据失败:', error);
            showToast('获取数据失败', 'error');
        });
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('show');
    currentEditId = null;
    clearImages();
}

// ==================== 保存操作 ====================
async function saveItem() {
    const content = document.getElementById('itemMemoContent').value.trim();
    if (!content) {
        showToast('请输入内容', 'error');
        return;
    }

    const isCompleted = document.getElementById('isCompleted').checked;
    const data = {
        content: content,
        is_completed: isCompleted,
        is_frequent: true, // 常用页面创建的备忘录默认标记为常用
        images: uploadedImages.length > 0 ? uploadedImages.map(img => img.data) : []
    };

    try {
        const url = currentEditId ? `/api/memos/${currentEditId}` : '/api/memos';
        const method = currentEditId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('保存失败');

        showToast(currentEditId ? '更新成功' : '添加成功');
        closeModal();
        loadFrequents();
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败，请重试', 'error');
    }
}

// ==================== 切换完成状态 ====================
async function toggleMemoComplete(id) {
    try {
        // 获取当前数据
        const response = await fetch('/api/memos', {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('获取数据失败');

        const data = await response.json();
        const memos = data.items || [];
        const memo = memos.find(m => m.id === id);

        if (!memo) throw new Error('备忘录不存在');

        const updateResponse = await fetch(`/api/memos/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                is_completed: !memo.is_completed
            })
        });

        if (!updateResponse.ok) throw new Error('更新失败');

        loadFrequents();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ==================== 切换常用状态 ====================
async function toggleMemoFrequent(id) {
    try {
        const response = await fetch('/api/memos', {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('获取数据失败');

        const data = await response.json();
        const memos = data.items || [];
        const memo = memos.find(m => m.id === id);

        if (!memo) throw new Error('备忘录不存在');

        const updateResponse = await fetch(`/api/memos/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                is_frequent: !memo.is_frequent
            })
        });

        if (!updateResponse.ok) throw new Error('更新失败');

        showToast(memo.is_frequent ? '已取消常用标记' : '已设为常用', 'success');
        loadFrequents();
    } catch (error) {
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
        const response = await fetch(`/api/memos/${deleteItemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('删除失败');

        showToast('删除成功');
        closeDeleteModal();
        loadFrequents();
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败，请重试', 'error');
    }
}

// ==================== 图片上传功能 ====================
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件', 'error');
            return;
        }

        // 检查文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            showToast('图片大小不能超过5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: Date.now() + Math.random(),
                data: e.target.result,
                name: file.name
            };
            uploadedImages.push(imageData);
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });

    // 清空input
    event.target.value = '';
}

function updateImagePreview() {
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;

    if (uploadedImages.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = uploadedImages.map(img => `
        <div class="image-preview-item">
            <img src="${img.data}" alt="${img.name}">
            <button class="image-preview-remove" onclick="removeImage(${img.id})" title="删除">×</button>
        </div>
    `).join('');
}

function removeImage(imageId) {
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    updateImagePreview();
}

function clearImages() {
    uploadedImages = [];
    updateImagePreview();
}

function viewImage(src) {
    const viewer = window.open('', '_blank');
    viewer.document.write(`<img src="${src}" style="max-width:100%;height:auto;">`);
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

// 点击其他地方关闭菜单
document.addEventListener('click', function(event) {
    const menu = document.getElementById('moreMenu');
    const button = document.querySelector('.more-btn');
    if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// ==================== 退出登录 ====================
function logout() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
        .then(() => {
            window.location.href = '/';
        })
        .catch(error => {
            console.error('退出失败:', error);
            window.location.href = '/';
        });
}
