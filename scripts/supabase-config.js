// Supabase配置文件
const SUPABASE_URL = 'https://ktvdtecaiyrftderqvmo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dmR0ZWNhaXlyZnRkZXJxdm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDM5NDQsImV4cCI6MjA3MTY3OTk0NH0.NZP4x-fdLO7GOBNbOkgv9jAyD53FrkWJeO_FRey_IlA';

// 初始化Supabase客户端
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 数据库操作类
class SupabaseManager {
    constructor() {
        this.client = supabaseClient;
    }

    // 用户注册
    async signUp(email, password, name) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登录
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登出
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取当前用户
    async getCurrentUser() {
        try {
            const { data: { user } } = await this.client.auth.getUser();
            return user;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }

    // 保存OKR
    async saveOKR(objective, keyResults) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('用户未登录');

            const { data, error } = await this.client
                .from('okrs')
                .upsert({
                    user_id: user.id,
                    objective: objective,
                    key_results: keyResults,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('保存OKR失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取用户OKR
    async getUserOKR() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('用户未登录');

            const { data, error } = await this.client
                .from('okrs')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            return { success: true, data: data[0] || null };
        } catch (error) {
            console.error('获取OKR失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 创建聊天会话
    async createChatSession(title = '新对话') {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('用户未登录');

            const { data, error } = await this.client
                .from('chat_sessions')
                .insert({
                    user_id: user.id,
                    title: title
                })
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('创建聊天会话失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 保存聊天消息
    async saveChatMessage(sessionId, role, content) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('用户未登录');

            const { data, error } = await this.client
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    session_id: sessionId,
                    role: role,
                    content: content
                })
                .select();

            if (error) throw error;

            // 更新会话的最后消息时间
            await this.client
                .from('chat_sessions')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', sessionId);

            return { success: true, data: data[0] };
        } catch (error) {
            console.error('保存聊天消息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取聊天历史
    async getChatHistory(sessionId, limit = 50) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('用户未登录');

            const { data, error } = await this.client
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取聊天历史失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取用户的聊天会话列表
    async getChatSessions(limit = 10) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('用户未登录');

            const { data, error } = await this.client
                .from('chat_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('last_message_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('获取聊天会话失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 监听认证状态变化
    onAuthStateChange(callback) {
        return this.client.auth.onAuthStateChange(callback);
    }
}

// 全局Supabase管理器实例
const supabaseManager = new SupabaseManager();