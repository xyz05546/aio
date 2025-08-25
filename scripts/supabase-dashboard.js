// 基于Supabase的控制台管理器
class SupabaseDashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentOKR = null;
        this.currentSessionId = null;
        this.chatHistory = [];
        this.isProcessing = false;
        this.init();
    }

    async init() {
        // 检查认证状态
        this.currentUser = await supabaseManager.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        this.bindEvents();
        await this.loadUserData();
    }

    bindEvents() {
        // OKR 管理按钮
        const createOkrBtn = document.getElementById('create-okr-btn');
        const editOkrBtn = document.getElementById('edit-okr-btn');
        const saveOkrBtn = document.getElementById('save-okr-btn');
        const cancelOkrBtn = document.getElementById('cancel-okr-btn');
        
        if (createOkrBtn) {
            createOkrBtn.addEventListener('click', () => this.showOKRForm());
        }
        if (editOkrBtn) {
            editOkrBtn.addEventListener('click', () => this.showOKRForm());
        }
        if (saveOkrBtn) {
            saveOkrBtn.addEventListener('click', () => this.saveOKR());
        }
        if (cancelOkrBtn) {
            cancelOkrBtn.addEventListener('click', () => this.hideOKRForm());
        }
        
        // 聊天功能
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // 快捷问题按钮
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                if (question && chatInput) {
                    chatInput.value = question;
                    this.sendMessage();
                }
            });
        });

        // 登出按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async loadUserData() {
        // 显示用户名
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = this.currentUser.user_metadata?.name || this.currentUser.email;
        }

        // 加载OKR
        await this.loadOKR();
        
        // 加载聊天会话
        await this.loadChatSessions();
        
        // 创建默认聊天会话
        if (!this.currentSessionId) {
            await this.createNewChatSession();
        }
    }

    async loadOKR() {
        const result = await supabaseManager.getUserOKR();
        if (result.success && result.data) {
            this.currentOKR = result.data;
            this.displayOKR(result.data);
        }
    }

    showOKRForm() {
        const okrDisplay = document.getElementById('okr-display');
        const okrForm = document.getElementById('okr-form');
        
        if (okrDisplay) okrDisplay.classList.add('hidden');
        if (okrForm) okrForm.classList.remove('hidden');

        // 如果有现有OKR，填充表单
        if (this.currentOKR) {
            const objectiveInput = document.getElementById('objective-input');
            const kr1Input = document.getElementById('kr1-input');
            const kr2Input = document.getElementById('kr2-input');
            const kr3Input = document.getElementById('kr3-input');
            
            if (objectiveInput) objectiveInput.value = this.currentOKR.objective || '';
            if (kr1Input) kr1Input.value = this.currentOKR.key_results[0] || '';
            if (kr2Input) kr2Input.value = this.currentOKR.key_results[1] || '';
            if (kr3Input) kr3Input.value = this.currentOKR.key_results[2] || '';
        }
    }

    hideOKRForm() {
        const okrForm = document.getElementById('okr-form');
        const okrDisplay = document.getElementById('okr-display');
        
        if (okrForm) okrForm.classList.add('hidden');
        if (okrDisplay) okrDisplay.classList.remove('hidden');
    }

    async saveOKR() {
        const objective = document.getElementById('objective-input')?.value?.trim();
        const kr1 = document.getElementById('kr1-input')?.value?.trim();
        const kr2 = document.getElementById('kr2-input')?.value?.trim();
        const kr3 = document.getElementById('kr3-input')?.value?.trim();

        if (!objective) {
            alert('请输入学习目标');
            return;
        }

        const keyResults = [kr1, kr2, kr3].filter(kr => kr);
        if (keyResults.length === 0) {
            alert('请至少输入一个关键结果');
            return;
        }

        const result = await supabaseManager.saveOKR(objective, keyResults);
        
        if (result.success) {
            this.currentOKR = result.data[0];
            this.displayOKR(this.currentOKR);
            this.hideOKRForm();
            alert('学习目标保存成功！');
        } else {
            alert('保存失败: ' + result.error);
        }
    }

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

    async createNewChatSession() {
        const result = await supabaseManager.createChatSession('新对话');
        if (result.success) {
            this.currentSessionId = result.data.id;
            await this.loadChatSessions();
        }
    }

    async loadChatSessions() {
        const result = await supabaseManager.getChatSessions();
        if (result.success) {
            this.updateChatSessionsDisplay(result.data);
            
            // 如果没有当前会话，使用第一个会话
            if (!this.currentSessionId && result.data.length > 0) {
                this.currentSessionId = result.data[0].id;
                await this.loadChatHistory();
            }
        }
    }

    updateChatSessionsDisplay(sessions) {
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
            <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer ${session.id === this.currentSessionId ? 'ring-2 ring-indigo-500' : ''}" 
                 onclick="loadChatSession('${session.id}')">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-900">${session.title}</span>
                    <span class="text-xs text-gray-500">${new Date(session.last_message_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    async loadChatSession(sessionId) {
        this.currentSessionId = sessionId;
        await this.loadChatHistory();
        await this.loadChatSessions(); // 刷新会话列表以更新选中状态
    }

    async loadChatHistory() {
        if (!this.currentSessionId) return;

        const result = await supabaseManager.getChatHistory(this.currentSessionId);
        if (result.success) {
            this.chatHistory = result.data;
            this.displayChatHistory();
        }
    }

    displayChatHistory() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        // 清除现有消息（保留欢迎消息）
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        messagesContainer.innerHTML = '';
        
        if (welcomeMessage) {
            messagesContainer.appendChild(welcomeMessage);
        }

        // 显示历史消息
        this.chatHistory.forEach(message => {
            this.addMessageToChatDisplay(message.role, message.content);
        });
    }

    async sendMessage() {
        if (this.isProcessing) return;
        
        const input = document.getElementById('chat-input');
        const message = input?.value?.trim();
        if (!message) return;

        this.isProcessing = true;
        input.value = '';
        
        // 添加用户消息到界面
        this.addMessageToChatDisplay('user', message);
        
        // 保存用户消息到数据库
        await supabaseManager.saveChatMessage(this.currentSessionId, 'user', message);
        
        // 显示AI思考状态
        const thinkingDiv = this.addMessageToChatDisplay('assistant', '正在思考...', true);
        
        // 模拟AI响应
        setTimeout(async () => {
            // 移除思考状态
            if (thinkingDiv) {
                thinkingDiv.remove();
            }
            
            const response = this.getAIResponse(message);
            this.addMessageToChatDisplay('assistant', response);
            
            // 保存AI响应到数据库
            await supabaseManager.saveChatMessage(this.currentSessionId, 'assistant', response);
            
            this.isProcessing = false;
            
            // 刷新聊天会话列表
            await this.loadChatSessions();
        }, 1000 + Math.random() * 2000);
    }

    addMessageToChatDisplay(role, content, isTemporary = false) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return null;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3 chat-message';

        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-white text-sm"></i>
                </div>
                <div class="bg-indigo-100 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                    <p class="text-sm text-gray-800">${content}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="bg-gray-100 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                    <p class="text-sm text-gray-800 whitespace-pre-line">${content}</p>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return isTemporary ? messageDiv : null;
    }

    getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('今天') && (lowerMessage.includes('做什么') || lowerMessage.includes('学什么'))) {
            if (this.currentOKR) {
                return `基于你的学习目标"${this.currentOKR.objective}"，我建议你今天：

📋 **今日学习任务**：
1. 复习相关的基础概念（30分钟）
2. 完成一个小练习项目（45分钟）
3. 阅读相关文档或教程（30分钟）
4. 整理学习笔记（15分钟）

专注于你的关键结果：${this.currentOKR.key_results[0] || '继续努力！'}

加油！💪`;
            } else {
                return '建议你先设置一个学习目标，这样我就能为你提供更个性化的学习建议了！点击左侧的"立即创建"来设置你的OKR目标。';
            }
        }
        
        if (lowerMessage.includes('数据结构')) {
            return `数据结构是计算机科学中组织和存储数据的方式。常见的数据结构包括：

🔹 **线性结构**：
• 数组：连续存储，随机访问
• 链表：动态存储，顺序访问
• 栈：后进先出(LIFO)
• 队列：先进先出(FIFO)

🔹 **非线性结构**：
• 树：层次化结构
• 图：网络结构
• 哈希表：键值对存储

你想了解哪种数据结构的详细信息？`;
        }
        
        if (lowerMessage.includes('学习计划')) {
            return `制定学习计划的建议：

📝 **制定步骤**：
1. 设定明确的学习目标
2. 分解为可执行的小任务
3. 安排合理的时间表
4. 定期复习和总结
5. 保持学习的连续性

💡 **实用技巧**：
• 使用番茄工作法提高专注度
• 设置学习里程碑和奖励机制
• 找到适合自己的学习时间段
• 定期回顾和调整计划

你可以先在左侧设置你的OKR目标，我会帮你制定更具体的计划！`;
        }
        
        // 默认响应
        const responses = [
            '这是一个很好的问题！让我来帮你分析一下...',
            '根据我的知识库，我建议你可以从以下几个方面来思考这个问题...',
            '这个问题涉及到多个方面，让我为你详细解释...',
            '很高兴你问这个问题！这说明你在认真思考学习内容。'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async logout() {
        if (confirm('确定要退出登录吗？')) {
            const result = await supabaseManager.signOut();
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                alert('登出失败: ' + result.error);
            }
        }
    }
}

// 全局函数
window.loadChatSession = (sessionId) => {
    if (window.supabaseDashboardManager) {
        window.supabaseDashboardManager.loadChatSession(sessionId);
    }
};

// 初始化控制台管理器
document.addEventListener('DOMContentLoaded', () => {
    window.supabaseDashboardManager = new SupabaseDashboardManager();
});