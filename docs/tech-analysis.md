# 山西古建地图项目技术选型分析

## 1. 总体架构
- **前端**：基于 React + TypeScript 构建单页应用，利用 Vite 作为构建工具，提升开发与构建效率。
- **后端（计划）**：初期可采用静态数据或轻量 Serverless API；长期目标是 Node.js (NestJS) 或 Python (FastAPI) 提供 REST/GraphQL 服务，连接数据库。
- **地图服务**：选用 Mapbox GL JS 或 MapLibre GL JS 实现矢量地图，结合 GeoJSON 数据展示古建分布。
- **数据存储**：原型阶段使用 JSON/静态文件；生产阶段采用 PostgreSQL + PostGIS 支持地理查询，或 MongoDB + GeoJSON。
- **部署**：前端托管在静态资源平台（Vercel、Netlify）或云服务器 Nginx；后端与数据库部署在云服务（阿里云、腾讯云）。

## 2. 前端技术细节
- **状态管理**：
  - 原型阶段以 Zustand 管理筛选、收藏等轻量全局状态，静态数据直接在前端维护；
  - 若后续引入实时 API，再扩展使用 React Query 或 SWR 处理异步数据。
- **UI 框架**：Tailwind CSS + Headless UI 实现响应式设计；或使用 Ant Design for React 以加速后台界面开发。
- **地图组件**：使用 `react-map-gl`（Mapbox/MapLibre 封装）或 `react-leaflet`；考虑移动端性能优先采用 MapLibre（开源，无需商业授权）。
- **数据可视化**：ECharts/AntV L7 用于展示统计图、热力图。
- **多语言与国际化**：i18next 实现中英文切换（可选）。
- **测试**：Jest + React Testing Library 进行单元测试；Playwright 进行端到端测试。

## 3. 后端与数据层（后续规划）
- **API 设计**：RESTful API，资源包括 `heritages`、`favorites`、`users`。支持分页、筛选、排序。
- **鉴权**：JWT + OAuth（如微信登录）后续支持；初期可不启用。
- **数据管理**：
  - 数据导入脚本使用 Node.js + CSV Parser；
  - 引入 ElasticSearch/MeiliSearch 实现全文搜索（后续）。

## 4. 地图服务对比
| 方案 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| Mapbox GL JS | 生态成熟、文档丰富、样式可定制 | 商业授权成本、需外网访问 | 设计要求高、预算充足 |
| MapLibre GL JS | 开源免费、兼容 Mapbox 样式、可自建底图服务 | 需自建或选择第三方瓦片服务 | 预算有限、需完全可控 |
| Leaflet | 学习成本低、插件丰富、轻量 | 基于瓦片地图，3D/矢量效果有限 | 基础功能、数据量不大 |

推荐选择 **MapLibre GL JS + react-map-gl**，同时自建或使用开源瓦片（如天地图、OSM）。

## 5. DevOps 与协作
- **代码规范**：ESLint + Prettier + Stylelint，采用 Husky + lint-staged 强制提交前检查。
- **持续集成**：GitHub Actions 配置构建、测试、部署流程。
- **监控分析**：Sentry 捕获前端错误；Google Analytics / Matomo 采集访问数据。

## 6. MVP 范围建议
- 完成基础地图加载、古建点位展示、列表与详情页。
- 支持基本筛选（朝代、类型）与搜索。
- 静态收藏列表（本地存储）。
- 数据暂存于前端 JSON，后续迭代至 API。

## 7. 风险与对策
- **地图授权风险**：优先选用开源底图，避免商业费用。
- **数据准确性**：建立数据核验流程，标记信息来源与更新时间。
- **性能瓶颈**：对大量点位使用聚合/虚拟化列表；启用懒加载与代码分割。
- **开发资源**：梳理优先级，确保 MVP 可在限定时间内交付。
