// 版本历史记录
const versionHistory = {
    currentVersion: "1.2.0",
    releases: [
        {
            version: "1.2.0",
            date: "2025-08-25",
            title: "个人成长画像功能上线",
            description: "新增个人成长画像功能，帮助学生可视化展示技能发展轨迹",
            updates: [
                "新增个人成长画像页面",
                "实现技能雷达图和学习时间趋势图",
                "展示技术技能和软技能掌握程度",
                "记录和展示学习活动时间线"
            ]
        },
        {
            version: "1.1.0",
            date: "2025-08-15",
            title: "Supabase集成",
            description: "集成Supabase作为后端服务，提供数据存储和用户认证",
            updates: [
                "实现用户注册和登录功能",
                "OKR数据存储与同步",
                "聊天历史记录保存",
                "实时数据更新"
            ]
        },
        {
            version: "1.0.0",
            date: "2025-08-01",
            title: "启明星平台初始版本",
            description: "启明星AI学习助手平台正式上线",
            updates: [
                "基础用户界面设计",
                "AI学习助手对话功能",
                "OKR学习目标管理",
                "学习仪表盘数据可视化"
            ]
        }
    ],
    todoList: [
        {
            title: "学习路径推荐",
            description: "基于用户OKR和学习历史，推荐个性化学习路径",
            status: "计划中",
            priority: "高"
        },
        {
            title: "多模态AI交互",
            description: "支持语音和图像输入，增强AI助手交互体验",
            status: "计划中",
            priority: "中"
        },
        {
            title: "学习社区功能",
            description: "添加学习小组和社区讨论功能，促进协作学习",
            status: "计划中",
            priority: "中"
        },
        {
            title: "移动端适配",
            description: "优化移动端用户体验，开发PWA应用",
            status: "计划中",
            priority: "低"
        }
    ]
};

// 导出版本历史记录
window.versionHistory = versionHistory;