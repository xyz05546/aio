// 控制台页面功能
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentOKR = null;
        this.chatHistory = [];
        this.init();
    }

    // 初始化
    init() {
        this.checkAuth();
        this.loadOKR();
        this.loadChatHistory();
        this.hideOKRForm();
    }

    // 检查认证状态
    checkAuth() {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            window.location.href = 'index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    // 显示OKR表单
    showOKRForm() {
        document.getElementById('okrForm').classList.remove('hidden');
        document.getElementById('okrDisplay').classList.add('hidden');
        document.getElementById('okrButtonText').textContent = '取消';
        document.querySelector('[onclick="showOKRForm()"]').setAttribute('onclick', 'hideOKRForm()');
    }

    // 隐藏OKR表单
    hideOKRForm() {
        document.getElementById('okrForm').classList.add('hidden');
        if (this.currentOKR) {
            document.getElementById('okrDisplay').classList.remove('hidden');
            document.getElementById('okrButtonText').textContent = '编辑目标';
        } else {
            document.getElementById('okrButtonText').textContent = '+ 创建目标';
        }
        document.querySelector('[onclick="hideOKRForm()"]').setAttribute('onclick', 'showOKRForm()');
    }

    // 保存OKR
    saveOKR() {
        const objective = document.getElementById('objective').value.trim();
        const keyResultInputs = document.querySelectorAll('.key-result-input');
        const keyResults = Array.from(keyResultInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');

        if (!objective) {
            alert('请输入学习目标');
            return;
        }

        if (keyResults.length === 0) {
            alert('请至少输入一个关键结果');
            return;
        }

        // 保存OKR
        this.currentOKR = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            objective: objective,
            keyResults: keyResults,
            createdAt: new Date().toISOString()
        };

        // 保存到本地存储
        const okrKey = `okr_${this.currentUser.id}`;
        localStorage.setItem(okrKey, JSON.stringify(this.currentOKR));

        // 显示OKR
        this.displayOKR();
        this.hideOKRForm();

        alert('目标保存成功！');
    }

    // 加载OKR
    loadOKR() {
        const okrKey = `okr_${this.currentUser.id}`;
        const okrData = localStorage.getItem(okrKey);
        if (okrData) {
            this.currentOKR = JSON.parse(okrData);
            this.displayOKR();
        }
    }

    // 显示OKR
    displayOKR() {
        if (!this.currentOKR) return;

        document.getElementById('objectiveText').textContent = this.currentOKR.objective;
        
        const keyResultsList = document.getElementById('keyResultsList');
        keyResultsList.innerHTML = '';
        
        this.currentOKR.keyResults.forEach((kr, index) => {
            const li = document.createElement('li');
            li.className = 'text-gray-700 bg-green-50 p-2 rounded';
            li.innerHTML = `<span class="font-medium">${index + 1}.</span> ${kr}`;
            keyResultsList.appendChild(li);
        });

        document.getElementById('okrDisplay').classList.remove('hidden');
    }

    // 发送消息
    async sendMessage(message) {
        if (!message.trim()) return;

        // 添加用户消息到聊天
        this.addMessageToChat('user', message);

        // 显示AI思考状态
        const thinkingId = this.addMessageToChat('assistant', '正在思考...', true);

        // 模拟AI响应
        setTimeout(() => {
            this.removeMessage(thinkingId);
            const response = this.generateAIResponse(message);
            this.addMessageToChat('assistant', response);
        }, 1000 + Math.random() * 2000);
    }

    // 生成AI响应
    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // 检查是否询问今日任务
        if (lowerMessage.includes('今天') && (lowerMessage.includes('做什么') || lowerMessage.includes('任务'))) {
            if (!this.currentOKR) {
                return '您还没有设置学习目标。请先在左侧创建您的OKR，这样我就能为您推荐相应的学习任务了。';
            }
            return this.generateDailyTasks();
        }

        // 检查是否询问B+树
        if (lowerMessage.includes('b+树') || lowerMessage.includes('b+tree')) {
            return `B+树是一种多路搜索树，是B树的变种，主要特点包括：

1. **结构特点**：
   - 所有叶子节点都在同一层
   - 非叶子节点只存储键值，不存储数据
   - 所有数据都存储在叶子节点中
   - 叶子节点之间通过指针连接，形成有序链表

2. **主要优势**：
   - 范围查询效率高（通过叶子节点链表）
   - 磁盘I/O次数少（树高度较低）
   - 适合数据库索引结构

3. **与B树的区别**：
   - B+树的非叶子节点不存储数据，只存储索引
   - B+树的叶子节点包含所有数据信息
   - B+树支持顺序访问

这是数据库系统中常用的索引结构，希望这个解释对您有帮助！`;
        }

        // 其他常见问题的响应
        const responses = [
            '这是一个很好的问题！基于我的知识库，我建议您可以从基础概念开始学习，然后逐步深入到具体应用。',
            '根据您的学习目标，我推荐您先掌握理论基础，再通过实践来加深理解。',
            '这个概念确实比较复杂，建议您可以通过画图或者实际编程来帮助理解。',
            '很好的学习态度！持续的练习和思考是掌握知识的关键。',
            '建议您可以查阅相关资料，或者尝试用自己的话来解释这个概念。'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 生成每日任务
    generateDailyTasks() {
        if (!this.currentOKR) return '';

        const tasks = [
            `复习 "${this.currentOKR.objective}" 相关的基础概念`,
            `完成与 "${this.currentOKR.keyResults[0] || '第一个关键结果'}" 相关的练习`,
            `阅读相关资料，深入理解核心知识点`,
            `整理学习笔记，总结今天的学习收获`
        ];

        return `基于您的学习目标："${this.currentOKR.objective}"，我为您推荐今日学习任务：

📋 **今日学习任务**：
${tasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

建议您按顺序完成这些任务，每完成一项就休息一下。加油！💪`;
    }

    // 添加消息到聊天
    addMessageToChat(role, content, isTemporary = false) {
        const messageId = Date.now().toString() + Math.random();
        const chatMessages = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = 'flex items-start space-x-3';
        
        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">我</div>
                <div class="bg-gray-100 rounded-lg p-3 max-w-md">
                    <p class="text-gray-800">${content}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">AI</div>
                <div class="bg-blue-50 rounded-lg p-3 max-w-md">
                    <p class="text-gray-800 whitespace-pre-line">${content}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 保存到聊天历史（非临时消息）
        if (!isTemporary) {
            this.chatHistory.push({
                id: messageId,
                role: role,
                content: content,
                timestamp: new Date().toISOString()
            });
            this.saveChatHistory();
            this.updateChatHistoryDisplay();
        }

        return messageId;
    }

    // 移除消息
    removeMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.remove();
        }
    }

    // 保存聊天历史
    saveChatHistory() {
        const historyKey = `chat_history_${this.currentUser.id}`;
        localStorage.setItem(historyKey, JSON.stringify(this.chatHistory));
    }

    // 加载聊天历史
    loadChatHistory() {
        const historyKey = `chat_history_${this.currentUser.id}`;
        const historyData = localStorage.getItem(historyKey);
        if (historyData) {
            this.chatHistory = JSON.parse(historyData);
            this.displayChatHistory();
            this.updateChatHistoryDisplay();
        }
    }

    // 显示聊天历史
    displayChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        // 清除欢迎消息
        chatMessages.innerHTML = '';
        
        this.chatHistory.forEach(message => {
            this.addMessageToChatDisplay(message.role, message.content);
        });
    }

    // 添加消息到聊天显示（不保存）
    addMessageToChatDisplay(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3';
        
        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">我</div>
                <div class="bg-gray-100 rounded-lg p-3 max-w-md">
                    <p class="text-gray-800">${content}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">AI</div>
                <div class="bg-blue-50 rounded-lg p-3 max-w-md">
                    <p class="text-gray-800 whitespace-pre-line">${content}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 更新聊天历史显示
    updateChatHistoryDisplay() {
        const chatHistoryDiv = document.getElementById('chatHistory');
        if (this.chatHistory.length === 0) {
            chatHistoryDiv.innerHTML = '<p class="text-gray-500 text-sm">暂无聊天记录</p>';
            return;
        }

        const recentChats = this.chatHistory.slice(-5).reverse(); // 显示最近5条
        chatHistoryDiv.innerHTML = recentChats.map(chat => {
            const time = new Date(chat.timestamp).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const preview = chat.content.length > 20 ? chat.content.substring(0, 20) + '...' : chat.content;
            return `
                <div class="text-sm p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div class="font-medium text-gray-700">${chat.role === 'user' ? '我' : 'AI'}</div>
                    <div class="text-gray-600">${preview}</div>
                    <div class="text-xs text-gray-400">${time}</div>
                </div>
            `;
        }).join('');
    }
}

// 全局控制台管理器实例
const dashboardManager = new DashboardManager();

// 全局函数
function showOKRForm() {
    dashboardManager.showOKRForm();
}

function hideOKRForm() {
    dashboardManager.hideOKRForm();
}

function saveOKR() {
    dashboardManager.saveOKR();
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message) {
        dashboardManager.sendMessage(message);
        messageInput.value = '';
    }
}

function quickQuestion(question) {
    document.getElementById('messageInput').value = question;
    sendMessage();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}