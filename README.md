我需要分析当前项目的架构，包括前端 Vue.js 应用和后端 FastAPI 应用。首先查看项目结构，然后分析各个组件和文件的作用。我会先查看前端 equipment-monitoring-system 目录结构，然后查看后端 fastapi-backend 目录结构。

toolName: view_folder

status: success

c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system

现在查看后端 fastapi-backend 目录结构，了解后端架构。

toolName: view_folder

status: success

c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend

现在查看前端主要组件文件，了解每个组件的具体作用。先查看 App.vue、package.json 等核心文件，然后查看各个组件和 composables 文件。

toolName: view_files

status: success

filePath: c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\package.json
c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\App.vue
c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\main.ts

现在查看前端主要组件文件，了解各个组件的作用。先查看视图组件和业务组件。

toolName: view_files

status: success

filePath: c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\views\MonitoringView.vue
c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\components\DeviceMonitoring.vue
c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\components\ShiftAnalysis.vue

现在查看其他重要组件和 composables 文件，了解业务逻辑和数据流。

toolName: view_files

status: success

filePath: c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\composables\useDeviceMonitoring.ts
c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\composables\useShiftAnalysis.ts
c:\Users\53074\Desktop\Github\AI_Production_System-main\equipment-monitoring-system\src\types\index.ts

现在查看后端主要文件，了解后端架构和 API 结构。

toolName: view_files

status: success

filePath: c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend\app\main.py
c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend\main.py
c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend\app\api\fault.py

现在查看后端模型和配置文件，了解数据结构和系统配置。

toolName: view_files

status: success

filePath: c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend\app\models\models.py
c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend\app\schemas\fault_info.py
c:\Users\53074\Desktop\Github\AI_Production_System-main\fastapi-backend\app\settings.py

# 智能设备监控与维修辅助系统 - 项目架构分析

## 项目整体架构

该项目是一个基于前后端分离架构的智能设备监控与维修辅助系统，包含以下主要部分：

### 1. 前端架构 (Vue.js + TypeScript)

#### 1.1 项目结构

```
equipment-monitoring-system/
├── src/
│   ├── App.vue                 # 根组件，应用主框架
│   ├── main.ts                 # 应用入口文件
│   ├── components/             # 业务组件
│   ├── composables/            # 组合式函数
│   ├── views/                  # 页面视图
│   ├── router/                 # 路由配置
│   ├── stores/                 # 状态管理
│   ├── services/               # API服务
│   ├── types/                  # TypeScript类型定义
│   └── utils/                  # 工具函数
└── package.json               # 项目依赖配置
```

#### 1.2 核心文件作用

**主要配置文件：**

- `package.json` - 项目依赖管理，包含 Vue 3、Element Plus、ECharts 等核心依赖
- `tsconfig.json` - TypeScript 配置文件
- `vite.config.ts` - Vite 构建工具配置

**入口文件：**

- `main.ts` - 应用入口，初始化 Vue 实例、注册 Element Plus 组件库和图标、配置路由和状态管理
- `App.vue` - 根组件，定义应用整体布局结构，包含头部导航、主内容区域和移动端适配

#### 1.3 组件架构

**页面组件 (views/)：**

- `MonitoringView.vue` - 设备监控主页面，集成设备监控、故障看板、本班分析三个功能模块
- `MaintenanceView.vue` - 辅助维修页面
- `KnowledgeView.vue` - 智能问答页面

**业务组件 (components/)：**

- `DeviceMonitoring.vue` - 设备监控组件，负责设备绑定、状态显示、故障模拟和 AI 分析
- `FaultDashboard.vue` - 故障看板组件，展示故障历史记录和统计图表
- `ShiftAnalysis.vue` - 本班分析组件，提供班次数据分析和 AI 智能分析功能
- `FaultDetailDialog.vue` - 故障详情弹窗组件
- `LoginButton.vue` - 登录按钮组件
- `LoginPrompt.vue` - 登录提示组件

#### 1.4 业务逻辑架构

**组合式函数 (composables/)：**

- `useDeviceMonitoring.ts` - 设备监控业务逻辑，包含设备状态管理、绑定解绑、AI 分析等功能
- `useFaultDashboard.ts` - 故障看板业务逻辑，处理故障记录查询、分页、筛选等功能
- `useShiftAnalysis.ts` - 本班分析业务逻辑，提供数据分析、AI 分析结果生成等功能
- `useAuth.ts` - 用户认证逻辑，处理登录、权限验证等功能

**状态管理 (stores/)：**

- `auth.ts` - 认证状态管理
- `counter.ts` - 计数器状态管理

**API 服务 (services/)：**

- `dify.ts` - Dify AI 服务接口
- `fault.ts` - 故障相关 API 接口

**类型定义 (types/)：**

- `index.ts` - 全局 TypeScript 类型定义，包含设备状态、告警记录、图表配置等接口

#### 1.5 技术栈

- **框架**: Vue 3 + Composition API
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **图表库**: ECharts
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **HTTP 客户端**: Axios
- **Markdown 渲染**: markdown-it

### 2. 后端架构 (FastAPI + Python)

#### 2.1 项目结构

```
fastapi-backend/
├── app/
│   ├── main.py                 # FastAPI应用主文件
│   ├── api/                    # API路由
│   │   ├── user.py            # 用户相关API
│   │   └── fault.py           # 故障相关API
│   ├── models/                 # 数据库模型
│   │   └── models.py          # 数据模型定义
│   ├── schemas/                # 数据模式
│   │   ├── user.py            # 用户数据模式
│   │   └── fault_info.py      # 故障数据模式
│   └── settings.py             # 应用配置
├── main.py                     # 项目入口文件
└── pyproject.toml             # 项目配置
```

#### 2.2 核心文件作用

**主应用文件：**

- `app/main.py` - FastAPI 应用主文件，配置 CORS 中间件、注册 ORM 模型、注册 API 路由
- `main.py` - 项目入口文件，简单的启动脚本

**API 路由 (api/)：**

- `user.py` - 用户相关 API 路由，处理用户注册、登录、认证等功能
- `fault.py` - 故障相关 API 路由，提供故障记录查询、筛选、分页等功能

**数据模型 (models/)：**

- `models.py` - 数据库模型定义，包含 User 和 FaultInfo 两个主要模型
  - `User` - 用户模型：id、username、password、nickname、create_time
  - `FaultInfo` - 故障信息模型：mch_name、fault_time、stop_time、fault_name、mch_params、ai_analysis、class_group、class_shift

**数据模式 (schemas/)：**

- `fault_info.py` - 故障数据模式定义，包含请求和响应模型
  - `FaultHistoryInfo` - 故障历史信息响应模型
  - `FaultQueryModel` - 故障查询请求模型
  - `Shift`、`Group` - 枚举类型定义

**配置文件：**

- `settings.py` - 应用配置，包含数据库连接配置、ORM 配置、时区设置等

#### 2.3 技术栈

- **框架**: FastAPI
- **ORM**: Tortoise ORM
- **数据库**: MySQL
- **异步服务器**: Uvicorn
- **数据验证**: Pydantic
- **CORS**: FastAPI CORS 中间件

### 3. 系统功能模块

#### 3.1 设备监控模块

- **功能**: 实时设备状态监控、设备绑定/解绑、故障模拟、AI 故障分析
- **组件**: DeviceMonitoring.vue + useDeviceMonitoring.ts
- **数据流**: 设备状态数据 → 图表展示 → 故障分析 → 结果展示

#### 3.2 故障看板模块

- **功能**: 故障历史记录查询、故障统计分析、图表可视化
- **组件**: FaultDashboard.vue + useFaultDashboard.ts
- **数据流**: 故障记录数据 → 筛选分页 → 统计分析 → 图表展示

#### 3.3 本班分析模块

- **功能**: 班次数据分析、AI 智能分析、分析报告生成
- **组件**: ShiftAnalysis.vue + useShiftAnalysis.ts
- **数据流**: 班次数据 → AI 分析 → 结果展示 → 报告生成

#### 3.4 用户认证模块

- **功能**: 用户登录、权限验证、会话管理
- **组件**: LoginButton.vue + LoginPrompt.vue + useAuth.ts
- **数据流**: 用户凭证 → 身份验证 → 权限检查 → 访问控制

### 4. 数据流架构

#### 4.1 前端数据流

```
用户操作 → 组件事件 → 组合式函数 → API服务 → 后端API → 数据库
    ↓
状态更新 → 组件重新渲染 → 用户界面更新
```

#### 4.2 后端数据流

```
API请求 → 路由处理 → 数据验证 → 业务逻辑 → 数据库操作
    ↓
数据处理 → 响应格式化 → JSON响应 → 前端接收
```

### 5. 特色功能

#### 5.1 AI 智能分析

- 集成 AI 服务进行故障诊断和分析
- 提供智能化的维修建议和预防措施
- 支持多种分析报告格式

#### 5.2 实时监控

- 设备状态实时更新
- 图表数据动态刷新
- 故障信息即时推送

#### 5.3 移动端适配

- 响应式设计，支持移动设备
- 汉堡菜单导航
- 触摸友好的交互设计

#### 5.4 数据可视化

- 多种图表类型（饼图、柱状图、折线图）
- 实时数据更新
- 交互式图表操作

### 6. 部署架构

#### 6.1 前端部署

- 构建工具：Vite
- 部署方式：静态文件部署
- 访问地址：http://localhost:5173

#### 6.2 后端部署

- 服务器：Uvicorn
- 数据库：MySQL
- API 地址：http://localhost:8000
- API 文档：http://localhost:8000/docs

### 7. 开发规范

#### 7.1 代码规范

- TypeScript 严格类型检查
- ESLint 代码质量检查
- Prettier 代码格式化
- 组件化开发模式

#### 7.2 文件组织

- 按功能模块组织代码
- 统一的命名规范
- 清晰的目录结构
- 模块化的设计理念

这个项目采用了现代化的前后端分离架构，具有良好的可扩展性、可维护性和用户体验。通过组合式函数、状态管理、API 服务等设计模式，实现了清晰的代码组织和高效的开发流程。
