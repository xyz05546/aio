// 个人成长画像管理类
class GrowthProfileManager {
    constructor() {
        this.currentUser = null;
        this.skillsData = null;
        this.learningActivities = null;
        this.init();
    }

    // 初始化
    async init() {
        // 检查用户是否已登录
        const user = await supabaseManager.getCurrentUser();
        if (!user) {
            console.error('用户未登录');
            return;
        }
        
        this.currentUser = user;
        
        // 加载技能数据和学习活动
        await this.loadSkillsData();
        await this.loadLearningActivities();
        
        // 初始化图表
        this.initCharts();
    }

    // 加载技能数据
    async loadSkillsData() {
        try {
            // 这里应该从Supabase获取数据，但目前我们使用模拟数据
            this.skillsData = {
                technicalSkills: [
                    { name: '数据结构', level: 75, lastUpdated: '2025-08-20' },
                    { name: '算法', level: 68, lastUpdated: '2025-08-18' },
                    { name: '前端开发', level: 82, lastUpdated: '2025-08-22' },
                    { name: '后端开发', level: 60, lastUpdated: '2025-08-15' },
                    { name: '数据库', level: 65, lastUpdated: '2025-08-10' },
                    { name: '计算机网络', level: 55, lastUpdated: '2025-08-05' }
                ],
                softSkills: [
                    { name: '团队协作', level: 85, lastUpdated: '2025-08-21' },
                    { name: '问题解决', level: 78, lastUpdated: '2025-08-19' },
                    { name: '时间管理', level: 70, lastUpdated: '2025-08-17' },
                    { name: '沟通能力', level: 80, lastUpdated: '2025-08-16' }
                ]
            };
            
            // 更新技能展示
            this.updateSkillsDisplay();
        } catch (error) {
            console.error('加载技能数据失败:', error);
        }
    }

    // 加载学习活动
    async loadLearningActivities() {
        try {
            // 这里应该从Supabase获取数据，但目前我们使用模拟数据
            this.learningActivities = [
                { date: '2025-08-24', hours: 3.5, type: '编程实践', description: '完成了数据结构作业' },
                { date: '2025-08-23', hours: 2.0, type: '视频学习', description: '观看了算法课程' },
                { date: '2025-08-22', hours: 4.0, type: '项目开发', description: '参与团队项目开发' },
                { date: '2025-08-21', hours: 1.5, type: '阅读', description: '阅读技术文档' },
                { date: '2025-08-20', hours: 3.0, type: '编程实践', description: '练习前端开发' },
                { date: '2025-08-19', hours: 2.5, type: '视频学习', description: '学习数据库知识' },
                { date: '2025-08-18', hours: 3.0, type: '项目开发', description: '开发个人项目' }
            ];
            
            // 更新学习活动展示
            this.updateLearningActivitiesDisplay();
        } catch (error) {
            console.error('加载学习活动失败:', error);
        }
    }

    // 更新技能展示
    updateSkillsDisplay() {
        const technicalSkillsContainer = document.getElementById('technicalSkills');
        const softSkillsContainer = document.getElementById('softSkills');
        
        if (!technicalSkillsContainer || !softSkillsContainer) return;
        
        // 清空容器
        technicalSkillsContainer.innerHTML = '';
        softSkillsContainer.innerHTML = '';
        
        // 添加技术技能
        this.skillsData.technicalSkills.forEach(skill => {
            const skillElement = this.createSkillElement(skill);
            technicalSkillsContainer.appendChild(skillElement);
        });
        
        // 添加软技能
        this.skillsData.softSkills.forEach(skill => {
            const skillElement = this.createSkillElement(skill);
            softSkillsContainer.appendChild(skillElement);
        });
    }

    // 创建技能元素
    createSkillElement(skill) {
        const div = document.createElement('div');
        div.className = 'mb-3';
        
        const header = document.createElement('div');
        header.className = 'flex justify-between mb-1';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-sm font-medium text-gray-700';
        nameSpan.textContent = skill.name;
        
        const levelSpan = document.createElement('span');
        levelSpan.className = 'text-sm font-medium text-gray-700';
        levelSpan.textContent = `${skill.level}%`;
        
        header.appendChild(nameSpan);
        header.appendChild(levelSpan);
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'w-full bg-gray-200 rounded-full h-2';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'bg-indigo-600 h-2 rounded-full';
        progressBar.style.width = `${skill.level}%`;
        
        progressContainer.appendChild(progressBar);
        
        div.appendChild(header);
        div.appendChild(progressContainer);
        
        return div;
    }

    // 更新学习活动展示
    updateLearningActivitiesDisplay() {
        const activitiesContainer = document.getElementById('learningActivities');
        if (!activitiesContainer) return;
        
        // 清空容器
        activitiesContainer.innerHTML = '';
        
        // 添加学习活动
        this.learningActivities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            activitiesContainer.appendChild(activityElement);
        });
    }

    // 创建学习活动元素
    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'border-l-2 border-indigo-500 pl-3 pb-3';
        
        const date = new Date(activity.date);
        const formattedDate = date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
        
        div.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">${formattedDate}</span>
                <span class="text-xs text-gray-500">${activity.hours}小时</span>
            </div>
            <div class="mt-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                    ${activity.type}
                </span>
            </div>
            <p class="mt-1 text-sm text-gray-600">${activity.description}</p>
        `;
        
        return div;
    }

    // 初始化图表
    initCharts() {
        this.initSkillsRadarChart();
        this.initLearningTimeChart();
    }

    // 初始化技能雷达图
    initSkillsRadarChart() {
        const ctx = document.getElementById('skillsRadarChart');
        if (!ctx) return;
        
        const labels = this.skillsData.technicalSkills.map(skill => skill.name);
        const data = this.skillsData.technicalSkills.map(skill => skill.level);
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '技能掌握度',
                    data: data,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgb(99, 102, 241)',
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(99, 102, 241)'
                }]
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 2
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    }

    // 初始化学习时间图表
    initLearningTimeChart() {
        const ctx = document.getElementById('learningTimeChart');
        if (!ctx) return;
        
        // 按日期排序
        const sortedActivities = [...this.learningActivities].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        const labels = sortedActivities.map(activity => {
            const date = new Date(activity.date);
            return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        });
        
        const data = sortedActivities.map(activity => activity.hours);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '学习时长（小时）',
                    data: data,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '小时'
                        }
                    }
                }
            }
        });
    }
}

// 页面加载完成后初始化成长画像管理器
document.addEventListener('DOMContentLoaded', () => {
    window.growthProfileManager = new GrowthProfileManager();
});