document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.querySelector('.login-btn');

    // 密码输入框聚焦效果
    passwordInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    passwordInput.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });

    // 表单提交
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const password = passwordInput.value.trim();
        if (!password) return;

        // 显示加载状态
        loginBtn.classList.add('loading');
        loginBtn.querySelector('.btn-text').textContent = '验证中...';
        loginBtn.querySelector('.btn-icon').style.display = 'none';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // 重要：包含cookies以支持session
                body: JSON.stringify({ password: password })
            });

            const data = await response.json();

            if (response.ok) {
                // 直接跳转到主页面（不需要保存token）
                window.location.href = '/app';
            } else {
                throw new Error(data.detail || '登录失败');
            }
        } catch (error) {
            // 显示错误信息
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || '密码错误，请重试';
            passwordInput.value = '';
            passwordInput.focus();

            // 添加抖动效果
            loginForm.classList.add('shake');
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);
        } finally {
            // 恢复按钮状态
            loginBtn.classList.remove('loading');
            loginBtn.querySelector('.btn-text').textContent = '进入系统';
            loginBtn.querySelector('.btn-icon').style.display = 'inline';
        }
    });
});