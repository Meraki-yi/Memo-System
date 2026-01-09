// 记账页面 JavaScript
const API_BASE = '/api/accounting';

// 全局状态
let currentRecordType = 'expense';  // 'income' 或 'expense'
let selectedCategoryId = null;
let selectedSubcategoryId = null;
let selectedDate = new Date();
let categoriesData = { income: [], expense: [] };
let selectedIcon = '📁';
let editingRecordId = null;  // 正在编辑的记录ID，null表示新增模式

// 类目图标选项
const CATEGORY_ICONS = [
    { icon: '🍚', label: '吃饭' },
    { icon: '🛍️', label: '购物' },
    { icon: '🚗', label: '出行' },
    { icon: '🏠', label: '居住' },
    { icon: '🎬', label: '娱乐' },
    { icon: '📚', label: '教育' },
    { icon: '💊', label: '医疗' },
    { icon: '🧾', label: '账单' },
    { icon: '💰', label: '收入' },
    { icon: '📈', label: '理财' }
];

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    initDateDisplay();

    // 检查URL参数，是否有edit参数
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    console.log('URL参数 editId:', editId);

    // 先加载分类数据，再检查是否需要加载编辑记录
    await loadCategories();

    if (editId) {
        editingRecordId = parseInt(editId);
        console.log('开始加载编辑记录, ID:', editingRecordId);
        await loadRecordForEdit(editingRecordId);
    }

    // 金额输入框只允许数字和小数点
    const amountInput = document.getElementById('amountInput');
    amountInput.addEventListener('input', function(e) {
        let value = e.target.value;
        // 只保留数字和最多一个小数点
        value = value.replace(/[^\d.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        // 限制小数点后两位
        if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        e.target.value = value;
    });

    // 模态框点击外部关闭
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
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        }
    });
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

// 加载记录数据用于编辑
async function loadRecordForEdit(recordId) {
    toggleLoading(true);
    try {
        console.log('正在获取记录, ID:', recordId, 'URL:', `${API_BASE}/records/${recordId}`);
        // 使用新的单条记录API
        const response = await fetch(`${API_BASE}/records/${recordId}`, getAuthOptions());
        console.log('响应状态:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/';
                return;
            }
            if (response.status === 404) {
                showToast('记录不存在', 'error');
                window.location.href = '/app';
                return;
            }
            throw new Error('加载记录失败');
        }

        const record = await response.json();
        console.log('获取到的记录数据:', record);

        if (!record) {
            showToast('记录不存在', 'error');
            // 返回记账标签页
            window.location.href = '/app';
            return;
        }

        // 先保存类目ID（在切换类型之前保存，避免被重置）
        selectedCategoryId = record.category_id;
        selectedSubcategoryId = record.subcategory_id;
        console.log('设置类目 ID:', { category_id: selectedCategoryId, subcategory_id: selectedSubcategoryId });

        // 设置记录类型（传入编辑模式标记，防止分类被重置）
        setRecordTypeForEdit(record.record_type);
        console.log('设置记录类型:', record.record_type);

        // 填充数据 - 金额保留两位小数，确保显示格式与输入时一致
        document.getElementById('amountInput').value = parseFloat(record.amount).toFixed(2);
        document.getElementById('noteInput').value = record.note || '';
        console.log('填充金额和备注');

        // 设置日期 - 使用本地时区避免日期偏移
        const [year, month, day] = record.record_date.split('-');
        selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        updateDateDisplay();
        console.log('设置日期:', record.record_date);

        // 更新分类显示（分类数据已在初始化时加载完成）
        updateCategoryDisplay();
        console.log('更新分类显示完成');

        // 显示删除按钮（编辑模式）
        document.getElementById('deleteBtn').style.display = 'inline-flex';
        // 隐藏"再记一笔"按钮（编辑模式）
        document.getElementById('recordAnotherBtn').style.display = 'none';
        console.log('按钮状态已更新');

    } catch (error) {
        console.error('加载记录出错:', error);
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 更新分类显示
function updateCategoryDisplay() {
    if (!selectedCategoryId || !selectedSubcategoryId) return;

    const categoryDisplay = document.getElementById('categoryDisplay');
    if (!categoryDisplay) return;

    const category = categoriesData[currentRecordType]?.find(c => c.id === selectedCategoryId);
    const subcategory = category?.subcategories?.find(s => s.id === selectedSubcategoryId);

    if (category && subcategory) {
        categoryDisplay.textContent = `${category.icon} ${category.name} > ${subcategory.name}`;
        categoryDisplay.classList.add('selected');
    } else {
        // 如果找不到分类，显示错误信息（调试用）
        console.error('未找到分类:', {
            selectedCategoryId,
            selectedSubcategoryId,
            currentRecordType,
            categories: categoriesData[currentRecordType]
        });
        categoryDisplay.textContent = '分类信息不完整';
    }
}

// 初始化日期显示
function initDateDisplay() {
    updateDateDisplay();
}

// 更新日期显示
function updateDateDisplay() {
    const dateDisplay = document.getElementById('dateDisplay');
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (isToday) {
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        dateDisplay.textContent = `今天 ${month}月${day}日`;
    } else {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        dateDisplay.textContent = `${year}年${month}月${day}日`;
    }
}

// 切换记录类型（收入/支出）
function switchRecordType(type) {
    // 如果类型没有变化，不做任何操作
    if (currentRecordType === type) {
        return;
    }

    currentRecordType = type;

    // 更新标签按钮状态
    document.querySelectorAll('.record-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });

    // 如果不是编辑模式，才重置分类选择
    // 在编辑模式下，用户手动切换类型时需要重置分类（因为不同类型的分类体系不同）
    if (!editingRecordId) {
        selectedCategoryId = null;
        selectedSubcategoryId = null;
        document.getElementById('categoryDisplay').textContent = '请选择分类';
        document.getElementById('categoryDisplay').classList.remove('selected');
    } else {
        // 编辑模式下手动切换类型，也需要重置分类
        // 因为收入和支出的分类是完全独立的
        selectedCategoryId = null;
        selectedSubcategoryId = null;
        document.getElementById('categoryDisplay').textContent = '请选择分类';
        document.getElementById('categoryDisplay').classList.remove('selected');
    }
}

// 为编辑模式设置记录类型（加载记录时调用，不清空分类）
function setRecordTypeForEdit(type) {
    currentRecordType = type;

    // 更新标签按钮状态
    document.querySelectorAll('.record-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    // 注意：此函数不重置分类选择，保留编辑记录的分类ID
}

// 加载类目数据
async function loadCategories() {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/categories`, getAuthOptions());
        if (!response.ok) throw new Error('加载类目失败');

        categoriesData = await response.json();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 显示分类选择器
function showCategorySelector() {
    const level1 = document.getElementById('categoryLevel1');
    const level2 = document.getElementById('categoryLevel2');

    // 显示一级类目
    const categories = categoriesData[currentRecordType];
    level1.innerHTML = `
        <div class="category-grid">
            ${categories.map(cat => `
                <div class="category-item ${selectedCategoryId === cat.id ? 'selected' : ''}"
                     onclick="selectCategory(${cat.id})">
                    <span class="category-icon">${cat.icon}</span>
                    <span class="category-name">${cat.name}</span>
                </div>
            `).join('')}
        </div>
    `;

    level2.style.display = 'none';
    level1.style.display = 'block';

    document.getElementById('categoryModal').classList.add('show');
}

// 选择一级类目
function selectCategory(categoryId) {
    selectedCategoryId = categoryId;
    selectedSubcategoryId = null;

    const level1 = document.getElementById('categoryLevel1');
    const level2 = document.getElementById('categoryLevel2');

    // 更新一级类目选中状态
    level1.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.dataset?.id) === categoryId) {
            item.classList.add('selected');
        }
    });

    // 显示二级类目
    const category = categoriesData[currentRecordType].find(c => c.id === categoryId);
    if (category && category.subcategories.length > 0) {
        level2.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <button onclick="backToLevel1()" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">←</button>
                <span style="margin-left: 10px; font-weight: 600;">${category.name}</span>
            </div>
            <div class="subcategory-list">
                ${category.subcategories.map(sub => `
                    <div class="subcategory-item" onclick="selectSubcategory(${sub.id}, '${sub.name}')">
                        ${sub.name}
                    </div>
                `).join('')}
            </div>
        `;
        level1.style.display = 'none';
        level2.style.display = 'block';
    } else {
        // 没有二级类目，直接完成选择
        const catName = category ? category.name : '';
        document.getElementById('categoryDisplay').textContent = catName;
        document.getElementById('categoryDisplay').classList.add('selected');
        document.getElementById('categoryModal').classList.remove('show');
    }
}

// 选择二级类目
function selectSubcategory(subcategoryId, subName) {
    selectedSubcategoryId = subcategoryId;

    const category = categoriesData[currentRecordType].find(c => c.id === selectedCategoryId);
    const catName = category ? category.name : '';

    document.getElementById('categoryDisplay').textContent = `${catName} > ${subName}`;
    document.getElementById('categoryDisplay').classList.add('selected');
    document.getElementById('categoryModal').classList.remove('show');
}

// 返回一级类目
function backToLevel1() {
    document.getElementById('categoryLevel1').style.display = 'block';
    document.getElementById('categoryLevel2').style.display = 'none';
}

// 关闭分类选择模态框
function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('show');
}

// 显示日期选择器
function showDatePicker() {
    const dateInput = document.getElementById('dateInput');
    // 使用本地时区格式化日期
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
    document.getElementById('datePickerModal').classList.add('show');
}

// 选择日期
function selectDate() {
    const dateInput = document.getElementById('dateInput');
    if (dateInput.value) {
        selectedDate = new Date(dateInput.value);
        updateDateDisplay();
    }
    closeDatePicker();
}

// 关闭日期选择器
function closeDatePicker() {
    document.getElementById('datePickerModal').classList.remove('show');
}

// 重置日期
function resetDate() {
    selectedDate = new Date();
    updateDateDisplay();
}

// 保存记录
async function saveRecord() {
    const amount = parseFloat(document.getElementById('amountInput').value);

    if (!amount || amount <= 0) {
        showToast('请输入有效金额', 'error');
        return;
    }

    if (!selectedCategoryId || !selectedSubcategoryId) {
        showToast('请选择分类', 'error');
        return;
    }

    const note = document.getElementById('noteInput').value.trim();
    // 使用本地时区格式化日期，避免时区转换导致日期偏移
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const recordDate = `${year}-${month}-${day}`;

    toggleLoading(true);
    try {
        // 判断是新增还是编辑
        const isEdit = editingRecordId !== null;
        const url = isEdit ? `${API_BASE}/records/${editingRecordId}` : `${API_BASE}/records`;
        const method = isEdit ? 'PUT' : 'POST';

        console.log('保存记录:', { isEdit, url, method, editingRecordId });

        const response = await fetch(url, getAuthOptions({
            method: method,
            body: JSON.stringify({
                record_type: currentRecordType,
                category_id: selectedCategoryId,
                subcategory_id: selectedSubcategoryId,
                amount: amount,
                record_date: recordDate,
                note: note
            })
        }));

        console.log('响应状态:', response.status, response.statusText);

        if (response.status === 401) {
            showToast('登录已过期，请重新登录', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: isEdit ? '更新失败' : '保存失败' }));
            console.error('保存失败:', errorData);
            throw new Error(errorData.detail || errorData.message || (isEdit ? '更新失败' : '保存失败'));
        }

        const result = await response.json();
        console.log('保存成功:', result);

        showToast(isEdit ? '更新成功' : '保存成功');

        // 设置刷新标记，通知 app 页面刷新数据并重置分页到第1页
        sessionStorage.setItem('memoSystem_refresh', Date.now().toString());
        sessionStorage.setItem('memoSystem_reset_pagination', 'true');
        localStorage.setItem('memoSystem_refresh', Date.now().toString());
        localStorage.setItem('memoSystem_reset_pagination', 'true');

        // 跳转到 app 页面
        setTimeout(() => {
            window.location.href = '/app';
        }, 500);
    } catch (error) {
        console.error('保存异常:', error);
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 保存为模板
async function saveAsTemplate() {
    const amount = parseFloat(document.getElementById('amountInput').value);

    if (!amount || amount <= 0) {
        showToast('请输入有效金额', 'error');
        return;
    }

    if (!selectedCategoryId || !selectedSubcategoryId) {
        showToast('请选择分类', 'error');
        return;
    }

    const templateName = prompt('请输入模板名称:');
    if (!templateName) return;

    const note = document.getElementById('noteInput').value.trim();

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/templates`, getAuthOptions({
            method: 'POST',
            body: JSON.stringify({
                name: templateName,
                record_type: currentRecordType,
                category_id: selectedCategoryId,
                subcategory_id: selectedSubcategoryId,
                amount: amount,
                note: note
            })
        }));

        if (!response.ok) throw new Error('保存模板失败');

        showToast('模板保存成功');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 再记一笔
function recordAnother() {
    clearForm();
    // 退出编辑模式
    editingRecordId = null;
    // 保留日期
}

// 清空表单
function clearForm() {
    document.getElementById('amountInput').value = '';
    selectedCategoryId = null;
    selectedSubcategoryId = null;
    document.getElementById('categoryDisplay').textContent = '请选择分类';
    document.getElementById('categoryDisplay').classList.remove('selected');
    document.getElementById('noteInput').value = '';
    // 隐藏删除按钮（新增模式）
    document.getElementById('deleteBtn').style.display = 'none';
    // 显示"再记一笔"按钮（新增模式）
    document.getElementById('recordAnotherBtn').style.display = 'inline-flex';
}

// 显示模板模态框
async function showTemplatesModal() {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/templates`, getAuthOptions());
        if (!response.ok) throw new Error('加载模板失败');

        const templates = await response.json();
        const templatesList = document.getElementById('templatesList');

        if (templates.length === 0) {
            templatesList.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📋</span>
                    <p>暂无模板</p>
                </div>
            `;
        } else {
            templatesList.innerHTML = templates.map(template => `
                <div class="template-item">
                    <div class="template-content" onclick="applyTemplate(${template.id})">
                        <div class="template-name">${template.name}</div>
                        <div class="template-details">
                            <span>${template.category_name} > ${template.subcategory_name}</span>
                            <span class="template-amount ${template.record_type}">¥${parseFloat(template.amount).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="template-delete-btn" onclick="event.stopPropagation(); deleteTemplate(${template.id})">
                        删除
                    </button>
                </div>
            `).join('');
        }

        document.getElementById('templatesModal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 删除模板
async function deleteTemplate(templateId) {
    if (!confirm('确定要删除这个模板吗？')) return;

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/templates/${templateId}`, getAuthOptions({
            method: 'DELETE'
        }));

        if (!response.ok) {
            const data = await response.json().catch(() => ({ detail: '删除失败' }));
            throw new Error(data.detail || data.message || '删除失败');
        }

        showToast('模板删除成功');
        // 重新加载模板列表
        await showTemplatesModal();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 应用模板
async function applyTemplate(templateId) {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/templates`, getAuthOptions());
        if (!response.ok) throw new Error('加载模板失败');

        const templates = await response.json();
        const template = templates.find(t => t.id === templateId);

        if (template) {
            // 切换到对应的类型
            switchRecordType(template.record_type);

            // 设置分类
            selectedCategoryId = template.category_id;
            selectedSubcategoryId = template.subcategory_id;
            document.getElementById('categoryDisplay').textContent =
                `${template.category_name} > ${template.subcategory_name}`;
            document.getElementById('categoryDisplay').classList.add('selected');

            // 设置金额 - 确保保留两位小数
            document.getElementById('amountInput').value = parseFloat(template.amount).toFixed(2);

            // 设置备注
            document.getElementById('noteInput').value = template.note || '';

            showToast('模板已应用');
        }

        document.getElementById('templatesModal').classList.remove('show');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 关闭模板模态框
function closeTemplatesModal() {
    document.getElementById('templatesModal').classList.remove('show');
}

// 显示类目设置
async function showCategoriesSettings() {
    await loadCategories();
    renderCategoryManagement('expense');
    document.getElementById('categoriesSettingsModal').classList.add('show');
}

// 渲染类目管理
function renderCategoryManagement(type) {
    const management = document.getElementById('categoryManagement');
    const categories = categoriesData[type];

    management.innerHTML = categories.map(cat => `
        <div class="manage-category-item">
            <div class="manage-category-info">
                <span>${cat.icon}</span>
                <strong>${cat.name}</strong>
            </div>
            <div class="manage-category-actions">
                <button class="manage-btn" onclick="showRenameCategoryModal(${cat.id}, '${cat.name}')">
                    重命名
                </button>
                <button class="manage-btn" onclick="showAddSubcategoryModal(${cat.id})">
                    + 子类目
                </button>
                <button class="manage-btn delete" onclick="deleteCategory(${cat.id})">
                    删除
                </button>
            </div>
            ${cat.subcategories.length > 0 ? `
                <div class="subcategory-list">
                    ${cat.subcategories.map(sub => `
                        <div class="subcategory-item">
                            <span>${sub.name}</span>
                            <div class="subcategory-actions">
                                <button class="manage-btn" onclick="showRenameSubcategoryModal(${sub.id}, '${sub.name}')">重命名</button>
                                <button class="manage-btn delete" onclick="deleteSubcategory(${sub.id})">删除</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 切换设置标签
function switchSettingsTab(type) {
    document.querySelectorAll('.cat-settings-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.type === type) {
            tab.classList.add('active');
        }
    });
    renderCategoryManagement(type);
}

// 关闭类目设置
function closeCategoriesSettings() {
    document.getElementById('categoriesSettingsModal').classList.remove('show');
    // 重新加载类目
    loadCategories();
}

// 显示添加类目模态框
function showAddCategoryModal() {
    document.getElementById('newCategoryName').value = '';
    selectedIcon = '📁';
    renderIconSelector();
    document.getElementById('addCategoryModal').classList.add('show');
}

// 渲染图标选择器
function renderIconSelector() {
    const selector = document.getElementById('iconSelector');
    selector.innerHTML = CATEGORY_ICONS.map(item => `
        <div class="icon-option ${selectedIcon === item.icon ? 'selected' : ''}"
             onclick="selectIcon('${item.icon}')">
            <span class="icon-icon">${item.icon}</span>
            <span class="icon-label">${item.label}</span>
        </div>
    `).join('');
}

// 选择图标
function selectIcon(icon) {
    selectedIcon = icon;
    renderIconSelector();
}

// 添加新类目
async function addNewCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    if (!name) {
        showToast('请输入类目名称', 'error');
        return;
    }

    const activeTab = document.querySelector('.cat-settings-tab.active');
    const type = activeTab ? activeTab.dataset.type : 'expense';

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/categories`, getAuthOptions({
            method: 'POST',
            body: JSON.stringify({
                name: name,
                record_type: type,
                icon: selectedIcon
            })
        }));

        if (!response.ok) throw new Error('添加类目失败');

        showToast('类目添加成功');
        closeAddCategoryModal();
        await loadCategories();
        renderCategoryManagement(type);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 关闭添加类目模态框
function closeAddCategoryModal() {
    document.getElementById('addCategoryModal').classList.remove('show');
}

// 添加二级类目
async function showAddSubcategoryModal(categoryId) {
    const name = prompt('请输入二级类目名称:');
    if (!name) return;

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/subcategories`, getAuthOptions({
            method: 'POST',
            body: JSON.stringify({
                category_id: categoryId,
                name: name
            })
        }));

        if (!response.ok) throw new Error('添加二级类目失败');

        showToast('二级类目添加成功');
        await loadCategories();

        const activeTab = document.querySelector('.cat-settings-tab.active');
        const type = activeTab ? activeTab.dataset.type : 'expense';
        renderCategoryManagement(type);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 删除二级类目
async function deleteSubcategory(subcategoryId) {
    if (!confirm('确定要删除这个二级类目吗？')) return;

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/subcategories/${subcategoryId}`, getAuthOptions({
            method: 'DELETE'
        }));

        const data = await response.json().catch(() => ({ detail: '删除失败' }));

        if (!response.ok) {
            throw new Error(data.detail || data.message || '删除失败');
        }

        showToast(data.message || '删除成功');
        await loadCategories();

        const activeTab = document.querySelector('.cat-settings-tab.active');
        const type = activeTab ? activeTab.dataset.type : 'expense';
        renderCategoryManagement(type);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 删除一级类目
async function deleteCategory(categoryId) {
    if (!confirm('确定要删除这个一级类目及其所有二级类目吗？\n注意：如果该类目下有记账记录，将无法删除。')) return;

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/categories/${categoryId}`, getAuthOptions({
            method: 'DELETE'
        }));

        const data = await response.json().catch(() => ({ detail: '删除失败' }));

        if (!response.ok) {
            throw new Error(data.detail || data.message || '删除失败');
        }

        showToast(data.message || '一级类目删除成功');
        await loadCategories();

        const activeTab = document.querySelector('.cat-settings-tab.active');
        const type = activeTab ? activeTab.dataset.type : 'expense';
        renderCategoryManagement(type);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// ==================== 删除记录功能 ====================

// 显示删除确认对话框
function showDeleteConfirm() {
    document.getElementById('deleteConfirmModal').classList.add('show');
}

// 关闭删除确认对话框
function closeDeleteConfirm() {
    document.getElementById('deleteConfirmModal').classList.remove('show');
}

// 确认删除记录
async function confirmDelete() {
    if (!editingRecordId) {
        showToast('无法删除：未找到记录ID', 'error');
        closeDeleteConfirm();
        return;
    }

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/records/${editingRecordId}`, getAuthOptions({
            method: 'DELETE'
        }));

        if (response.status === 401) {
            showToast('登录已过期，请重新登录', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            closeDeleteConfirm();
            return;
        }

        const data = await response.json().catch(() => ({ detail: '删除失败' }));

        if (!response.ok) {
            throw new Error(data.detail || data.message || '删除失败');
        }

        showToast('记录删除成功');
        closeDeleteConfirm();

        // 设置刷新标记，通知 app 页面刷新数据
        sessionStorage.setItem('memoSystem_refresh', Date.now().toString());
        localStorage.setItem('memoSystem_refresh', Date.now().toString());

        // 跳转到 app 页面
        setTimeout(() => {
            window.location.href = '/app';
        }, 500);

    } catch (error) {
        console.error('删除异常:', error);
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// ==================== 重命名功能 ====================

// 显示重命名一级类目模态框
function showRenameCategoryModal(categoryId, currentName) {
    document.getElementById('renameCategoryId').value = categoryId;
    document.getElementById('renameCategoryName').value = currentName;
    document.getElementById('renameCategoryModal').classList.add('show');
}

// 关闭重命名一级类目模态框
function closeRenameCategoryModal() {
    document.getElementById('renameCategoryModal').classList.remove('show');
}

// 重命名一级类目
async function renameCategory() {
    const categoryId = parseInt(document.getElementById('renameCategoryId').value);
    const newName = document.getElementById('renameCategoryName').value.trim();

    if (!newName) {
        showToast('请输入类目名称', 'error');
        return;
    }

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/categories/${categoryId}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify({
                name: newName
            })
        }));

        if (!response.ok) {
            const data = await response.json().catch(() => ({ detail: '重命名失败' }));
            throw new Error(data.detail || data.message || '重命名失败');
        }

        showToast('一级类目重命名成功');
        closeRenameCategoryModal();
        await loadCategories();

        const activeTab = document.querySelector('.cat-settings-tab.active');
        const type = activeTab ? activeTab.dataset.type : 'expense';
        renderCategoryManagement(type);

        // 如果当前选择的分类是被重命名的分类，更新显示
        if (selectedCategoryId === categoryId) {
            updateCategoryDisplay();
        }

        // 通知主页面刷新数据
        sessionStorage.setItem('memoSystem_refresh', Date.now().toString());
        localStorage.setItem('memoSystem_refresh', Date.now().toString());
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}

// 显示重命名二级类目模态框
function showRenameSubcategoryModal(subcategoryId, currentName) {
    document.getElementById('renameSubcategoryId').value = subcategoryId;
    document.getElementById('renameSubcategoryName').value = currentName;
    document.getElementById('renameSubcategoryModal').classList.add('show');
}

// 关闭重命名二级类目模态框
function closeRenameSubcategoryModal() {
    document.getElementById('renameSubcategoryModal').classList.remove('show');
}

// 重命名二级类目
async function renameSubcategory() {
    const subcategoryId = parseInt(document.getElementById('renameSubcategoryId').value);
    const newName = document.getElementById('renameSubcategoryName').value.trim();

    if (!newName) {
        showToast('请输入类目名称', 'error');
        return;
    }

    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE}/subcategories/${subcategoryId}`, getAuthOptions({
            method: 'PUT',
            body: JSON.stringify({
                name: newName
            })
        }));

        if (!response.ok) {
            const data = await response.json().catch(() => ({ detail: '重命名失败' }));
            throw new Error(data.detail || data.message || '重命名失败');
        }

        showToast('二级类目重命名成功');
        closeRenameSubcategoryModal();
        await loadCategories();

        const activeTab = document.querySelector('.cat-settings-tab.active');
        const type = activeTab ? activeTab.dataset.type : 'expense';
        renderCategoryManagement(type);

        // 如果当前选择的分类是被重命名的分类，更新显示
        if (selectedSubcategoryId === subcategoryId) {
            updateCategoryDisplay();
        }

        // 通知主页面刷新数据
        sessionStorage.setItem('memoSystem_refresh', Date.now().toString());
        localStorage.setItem('memoSystem_refresh', Date.now().toString());
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoading(false);
    }
}
