// 基于Supabase的认证管理器
class SupabaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // 监听认证状态变化
        supabaseManager.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.handleSignIn();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.handleSignOut();
            }
        });

        // 检查当前认证状态
        const user = await supabaseManager.getCurrentUser();
        if (user) {
            this.currentUser = user;
            this.handleSignIn();
        }
    }

    // 处理登录成功
    handleSignIn() {
        console.log('用户已登录:', this.currentUser);
        // 如果在登录页面，跳转到主应用
        const authPage = document.getElementById('auth-page');
        const mainApp = document.getElementById('main-app');
        
        if (authPage && mainApp) {
            authPage.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            // 更新用户名显示
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) {
                userNameEl.textContent = this.currentUser.user_metadata?.name || this.currentUser.email;
            }
            
            // 加载用户数据
            this.loadUserData();
        }
    }

    // 处理登出
    handleSignOut() {
        console.log('用户已登出');
        const authPage = document.getElementById('auth-page');
        const mainApp = document.getElementById('main-app');
        
        if (authPage && mainApp) {
            authPage.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }
    }

    // 注册
    async register(name, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            this.showError('密码确认不匹配');
            return false;
        }

        if (password.length < 6) {
            this.showError('密码长度至少6位');
            return false;
        }

        this.showLoading(true);
        
        const result = await supabaseManager.signUp(email, password, name);
        
        this.showLoading(false);
        
        if (result.success) {
            this.showSuccess('注册成功！请检查邮箱验证链接');
            this.showLoginForm();
            return true;
        } else {
            this.showError(result.error);
            return false;
        }
    }

    // 登录
    async login(email, password) {
        if (!email || !password) {
            this.showError('请输入邮箱和密码');
            return false;
        }

        this.showLoading(true);
        
        const result = await supabaseManager.signIn(email, password);
        
        this.showLoading(false);
        
        if (result.success) {
            // 认证状态变化会自动触发handleSignIn
            return true;
        } else {
            this.showError(result.error);
            return false;
        }
    }

    // 登出
    async logout() {
        if (confirm('确定要退出登录吗？')) {
            this.showLoading(true);
            
            const result = await supabaseManager.signOut();
            
            this.showLoading(false);
            
            if (result.success) {
                // 认证状态变化会自动触发handleSignOut
                return true;
            } else {
                this.showError(result.error);
                return false;
            }
        }
        return false;
    }

    // 显示登录表单
    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
    }

    // 显示注册表单
    showRegisterForm() {
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');
        
        if (registerForm) registerForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    }

    // 加载用户数据
    async loadUserData() {
        // 加载OKR数据
        const okrResult = await supabaseManager.getUserOKR();
        if (okrResult.success && okrResult.data) {
            window.currentOKR = okrResult.data;
            this.displayOKR(okrResult.data);
        }

        // 加载聊天会话
        const sessionsResult = await supabaseManager.getChatSessions();
        if (sessionsResult.success) {
            this.updateChatSessions(sessionsResult.data);
        }
    }

    // 显示OKR
    displayOKR(okr) {
        const display = document.getElementById('okr-display');
        if (!display) return;

        display.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">学习目标</h4>
                    <p class="text-gray-700 bg-blue-50 p-3 rounded-lg">${okr.objective}</p>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">关键结果</h4>
                    <ul class="space-y-2">
                        ${okr.key_results.map((kr, index) => `
                            <li class="flex items-center text-gray-700">
                                <span class="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">${index + 1}</span>
                                ${kr}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
        display.classList.remove('hidden');
    }

    // 更新聊天会话显示
    updateChatSessions(sessions) {
        const sessionsContainer = document.getElementById('chat-sessions');
        if (!sessionsContainer) return;

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-comments text-2xl mb-2"></i>
                    <p class="text-sm">还没有聊天记录</p>
                </div>
            `;
            return;
        }

        sessionsContainer.innerHTML = sessions.map(session => `
            <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="loadChatSession('${session.id}')">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-900">${session.title}</span>
                    <span class="text-xs text-gray-500">${new Date(session.last_message_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    // 显示错误信息
    showError(message) {
        alert('错误: ' + message);
    }

    // 显示成功信息
    showSuccess(message) {
        alert(message);
    }

    // 显示/隐藏加载状态
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            if (show) {
                loading.classList.remove('hidden');
            } else {
                loading.classList.add('hidden');
            }
        }
    }
}

// 全局认证管理器实例
const supabaseAuthManager = new SupabaseAuthManager();

// 全局函数
window.showLoginForm = () => supabaseAuthManager.showLoginForm();
window.showRegisterForm = () => supabaseAuthManager.showRegisterForm();
window.logout = () => supabaseAuthManager.logout();