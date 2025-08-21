// 认证相关功能
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.checkAuthStatus();
    }

    // 检查认证状态
    checkAuthStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            // 如果在首页且已登录，跳转到控制台
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                window.location.href = 'dashboard.html';
            }
        }
    }

    // 注册
    async register(email, password, confirmPassword) {
        if (password !== confirmPassword) {
            alert('密码确认不匹配');
            return false;
        }

        if (password.length < 6) {
            alert('密码长度至少6位');
            return false;
        }

        // 模拟注册API调用
        try {
            // 检查邮箱是否已存在
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (existingUsers.find(user => user.email === email)) {
                alert('该邮箱已被注册');
                return false;
            }

            // 创建新用户
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // 实际项目中应该加密
                createdAt: new Date().toISOString()
            };

            // 保存到本地存储（模拟数据库）
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            alert('注册成功！请登录');
            this.hideRegister();
            this.showLogin();
            return true;
        } catch (error) {
            console.error('注册失败:', error);
            alert('注册失败，请重试');
            return false;
        }
    }

    // 登录
    async login(email, password) {
        try {
            // 模拟登录API调用
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = existingUsers.find(u => u.email === email && u.password === password);

            if (!user) {
                alert('邮箱或密码错误');
                return false;
            }

            // 保存当前用户信息
            this.currentUser = { id: user.id, email: user.email };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // 跳转到控制台
            window.location.href = 'dashboard.html';
            return true;
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请重试');
            return false;
        }
    }

    // 登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // 显示登录模态框
    showLogin() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('loginModal').classList.add('flex');
    }

    // 隐藏登录模态框
    hideLogin() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('flex');
    }

    // 显示注册模态框
    showRegister() {
        document.getElementById('registerModal').classList.remove('hidden');
        document.getElementById('registerModal').classList.add('flex');
    }

    // 隐藏注册模态框
    hideRegister() {
        document.getElementById('registerModal').classList.add('hidden');
        document.getElementById('registerModal').classList.remove('flex');
    }
}

// 全局认证管理器实例
const authManager = new AuthManager();

// 全局函数
function showLogin() {
    authManager.showLogin();
}

function hideLogin() {
    authManager.hideLogin();
}

function showRegister() {
    authManager.showRegister();
}

function hideRegister() {
    authManager.hideRegister();
}

function logout() {
    authManager.logout();
}

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    // 登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await authManager.login(email, password);
        });
    }

    // 注册表单
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            await authManager.register(email, password, confirmPassword);
        });
    }
});