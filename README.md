📚 # 罗氏精益学习管理系统 (Roche Lean LMS)

## 🎯 项目概述

这是一个专为罗氏精益学习设计的完整学习管理系统，包含学员管理、学习进度分析、考试评分、成绩汇总等核心功能。系统按照精益学习的组织结构设计，支持多层次的课程体系和灵活的评估机制。

## ✨ 核心功能

### 📖 学员管理
- ✅ 学员信息创建和维护
- ✅ 按部门查询和统计
- ✅ 个人学习统计汇总
- ✅ 部门成绩对比分析

### 📊 学习进度分析
- ✅ 实时学习进度追踪
- ✅ 完成度统计分析
- ✅ **不活跃学员预警**（N天内未学习）
- ✅ 学习路径推荐
- ✅ 课程效果评估
- ✅ 按类别统计学习进度

### 🎓 考试管理
- ✅ 灵活的考题设计（单选、多选、判断、简答）
- ✅ **自动评分功能**（自动批改选择题）
- ✅ 考卷提交和成绩保存
- ✅ 成绩汇总统计
- ✅ 班级成绩对比
- ✅ 考试通过率分析

### 📚 课程管理
支持以下课程类别：
- **理论课程** - 精益入门理论
- **工具课程** - 精益工具集市（基础、分析、进阶）
- **高级课程** - 精益六西格玛
- **实践课程** - 实践案例（5S实践、案例分析）

## 🏗️ 系统架构

```
罗氏精益学习管理系统
├── 学员管理模块
│   ├── 学员信息CRUD
│   ├── 学员统计分析
│   └── 部门对比统计
├── 学习进度模块
│   ├── 进度跟踪
│   ├── 不活跃预警
│   ├── 效率分析
│   └── 路径推荐
├── 考试评分模块
│   ├── 题目管理
│   ├── 自动评分
│   ├── 成绩保存
│   └── 统计分析
└── 课程管理模块
    ├── 课程分类
    ├── 内容管理
    └── 学习统计
```

## 📊 数据库设计

### 核心数据表
- **students** - 学员信息表
- **courses** - 课程表（含分类）
- **learning_progress** - 学习进度表
- **exams** - 考试表
- **questions** - 题目库
- **options** - 选择题选项
- **exam_scores** - 考评成绩表
- **student_answers** - 详细答题记录
- **score_summary** - 成绩统计表

## 🚀 快速开始

### 1. 环境准备
```bash
# 克隆仓库
git clone https://github.com/wangy171/roche-lean-lms.git
cd roche-lean-lms

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库配置
```

### 2. 数据库初始化
```bash
# 创建数据库
mysql -u root -p < database/schemas/init_schema.sql

# 或使用 npm 命令
npm run db:init
```

### 3. 启动服务
```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 4. 测试 API
服务器将运行在 `http://localhost:3000`

## 📡 API 接口文档

### 学员管理 API

#### 创建学员
```
POST /api/students
Body: { "name": "张三", "email": "zhangsan@example.com", "department": "销售部", "position": "销售经理" }
Response: { "code": 201, "message": "学员添加成功", "data": { "studentId": 1 } }
```

#### 查询学员列表
```
GET /api/students?department=销售部
Response: { "code": 200, "message": "成功", "data": [...] }
```

#### 获取学员统计
```
GET /api/students/:id/stats
Response: { "code": 200, "data": { "total_courses_enrolled": 5, "completed_courses": 2, ... } }
```

### 学习进度 API

#### 获取学员进度
```
GET /api/progress/:studentId
Response: { "code": 200, "data": [...] }
```

#### 更新学习进度
```
PUT /api/progress/:studentId/:courseId
Body: { "percentage": 50, "completed": false }
Response: { "code": 200, "message": "学习进度已更新" }
```

#### 不活跃预警
```
GET /api/progress/inactive/warning?days=7
Response: { "code": 200, "data": [{ "id": 1, "name": "李四", "inactive_days": 10 }] }
```

#### 进度报告汇总
```
GET /api/progress/report/summary
Response: { "code": 200, "data": [...] }
```

### 考试管理 API

#### 创建考试
```
POST /api/exams
Body: { "name": "精益基础考试", "courseId": 1, "totalQuestions": 50, "passingScore": 60 }
Response: { "code": 201, "data": { "examId": 1 } }
```

#### 添加考题
```
POST /api/exams/:examId/questions
Body: { 
  "questionText": "什么是精益管理？",
  "questionType": "single_choice",
  "score": 2,
  "options": [
    { "text": "选项A", "isCorrect": true },
    { "text": "选项B", "isCorrect": false }
  ]
}
Response: { "code": 201, "data": { "questionId": 1 } }
```

#### 提交考卷
```
POST /api/exams/:examId/submit
Body: {
  "studentId": 1,
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": ["A", "C"] }
  ]
}
Response: { 
  "code": 200, 
  "data": { 
    "totalScore": 45, 
    "passingScore": 60, 
    "passed": false,
    "correctCount": 15,
    "totalQuestions": 25
  }
}
```

#### 获取成绩汇总
```
GET /api/exams/summary/all
Response: { "code": 200, "data": [...] }
```

#### 学员成绩汇总
```
GET /api/exams/summary/:studentId
Response: { "code": 200, "data": [...] }
```

### 课程管理 API

#### 查询课程列表
```
GET /api/courses?category=工具
Response: { "code": 200, "data": [...] }
```

#### 课程分类统计
```
GET /api/courses/stats/category
Response: { "code": 200, "data": [{ "category": "理论", "count": 1 }, ...] }
```

## 📋 课程体系

按照精益学习的组织结构，系统包含以下课程：

| 类别 | 课程名称 | 时长 | 说明 |
|------|--------|------|------|
| 理论 | 精益入门理论 | 8h | 精益管理基础概念和理论 |
| 工具 | 精益基础工具 | 16h | 基本精益工具和方法 |
| 工具 | 精益分析工具 | 12h | 数据分析工具和方法 |
| 工具 | 精益进阶工具 | 20h | 高级精益工具应用 |
| 高级 | 精益六西格玛 | 24h | 六西格玛方法论 |
| 实践 | 如何进行一次5S实践 | 10h | 5S现场管理实践 |
| 实践 | 实践案例 | 15h | 精益转型案例分析 |

## 📈 关键指标

系统支持以下主要统计指标：

### 个人指标
- 学习进度（百分比）
- 课程完成数
- 平均分数
- 通过率
- 学习效率（完成课程/天数）

### 班级指标
- 班级人数
- 学习参与率
- 平均分数
- 通过率
- 课程完成率

### 课程指标
- 报名人数
- 完成人数
- 完成率
- 平均进度
- 活跃度

## 🛠️ 技术栈

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Language**: JavaScript (ES6+)
- **Dependencies**:
  - express: Web 框架
  - mysql: 数据库驱动
  - cors: 跨域支持
  - dotenv: 环境变量管理

## 📁 项目结构

```
roche-lean-lms/
├── src/
│   ├── app.js                 # Express 应用入口
│   ├── api/
│   │   ├── studentAPI.js      # 学员管理接口
│   │   ├── progressAPI.js     # 学习进度接口
│   │   ├── examAPI.js         # 考试管理接口
│   │   └── courseAPI.js       # 课程管理接口
│   └── services/
│       ├── StudentService.js           # 学员业务逻辑
│       ├── LearningProgressService.js  # 进度分析逻辑
│       └── ExamService.js              # 考试评分逻辑
├── database/
│   └── schemas/
│       └── init_schema.sql    # 数据库初始化脚本
├── .env.example               # 环境变量模板
├── package.json               # 项目依赖配置
├── README.md                  # 项目文档
└── .gitignore                 # Git 忽略文件
```

## 🔐 环境变量配置

在项目根目录创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=roche_lean_lms

# 服务器配置
PORT=3000
NODE_ENV=development
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- src/services/__tests__/StudentService.test.js
```

## 📝 使用示例

### 创建学员并添加课程
```javascript
// 1. 创建学员
POST /api/students
{ "name": "王五", "department": "市场部", "position": "市场主管" }

// 2. 获取学员详情
GET /api/students/1

// 3. 更新学习进度
PUT /api/progress/1/1
{ "percentage": 30, "completed": false }
```

### 创建考试并提交答卷
```javascript
// 1. 创建考试
POST /api/exams
{ "name": "精益基础考试", "courseId": 1, "totalQuestions": 50, "passingScore": 60 }

// 2. 添加考题
POST /api/exams/1/questions
{ "questionText": "...", "questionType": "single_choice", ... }

// 3. 提交考卷
POST /api/exams/1/submit
{ "studentId": 1, "answers": [...] }

// 4. 查询成绩
GET /api/exams/summary/1
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- GitHub: [@wangy171](https://github.com/wangy171)
- Email: wangy171@126.com

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**最后更新**: 2026-05-14
**版本**: 1.0.0
