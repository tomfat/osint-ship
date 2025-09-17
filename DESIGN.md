# OSINT Carrier Tracker 技术方案

## 1. 概述
OSINT Carrier Tracker 旨在以公开情报（OSINT）为基础，提供“美国海军航母最后已知/推测位置”的可视化门户。设计目标是在确保信息可信度与法律合规的前提下，通过结构化数据与地图交互界面向军事观察者、记者及研究者提供情报摘要。本方案遵循 README.md 的产品定位，详细阐述系统架构、数据流程、技术栈与运营策略。

## 2. 功能与产品范围
- **地图展示**：基于交互式世界地图展示航母当前位置标记，标注时间戳、可信度、事件摘要。
- **事件时间线与列表**：以列表/时间轴形式列出历史事件，支持按航母、时间范围、可信度筛选。
- **来源透明度**：每条记录提供来源链接、证据类型、AI 审核摘要以及免责声明。
- **可更新性提示**：显示距离最后一次验证的时间，并对超期未更新的舰艇标注“位置未知/部署中”。
- **方法论与免责声明页面**：说明数据来源、审核流程、限制与风险。

## 3. 系统架构
整体采用前后端一体化的 Next.js 应用，辅以数据采集与审核的批处理任务。部署优先考虑 Serverless/托管服务，以降低运维成本。

```
┌────────────────────────────────────────────────────────┐
│                    客户端 (浏览器)                     │
│  Next.js 前端 (地图、时间线、表格)                     │
└──────────────▲────────────────────────────────────────┘
               │ ISR / API 请求
┌──────────────┴────────────────────────────────────────┐
│                Next.js (App Router)                    │
│  - 静态页面 & ISR                                   │
│  - API Routes / Edge Functions (只读数据接口)        │
│  - 数据验证 (构建期)                                 │
└──────────────▲────────────────────────────────────────┘
               │ Supabase/PostgreSQL / Git 数据文件
┌──────────────┴────────────────────────────────────────┐
│            数据管理与采集子系统                        │
│  - 数据存储：Supabase (Postgres + Row Level Security) │
│  - 采集脚本：Node.js + RSS/网页抓取                    │
│  - 队列：Supabase Functions / Vercel Cron 或 GitHub CI │
│  - AI 审核：调用托管模型 (OpenAI/自建 LLM)             │
│  - 审核面板：内部用 Admin 面板 (Supabase Studio)       │
└──────────────▲────────────────────────────────────────┘
               │ 审核通过后的结构化事件
┌──────────────┴────────────────────────────────────────┐
│                历史数据归档与备份                      │
│  - 对象存储 (Supabase Storage / S3) 保存原始证据截图   │
│  - Git 版本化导出 (YAML/JSON)                        │
└────────────────────────────────────────────────────────┘
```

## 4. 前端技术方案
1. **框架**：Next.js 14 App Router，使用 TypeScript、React Server Components、ISR 生成航母页面。
2. **UI 组件**：Tailwind CSS + Radix UI；地图采用 Mapbox GL JS（通过 `react-map-gl`）或开源的 React Leaflet，视授权成本决定。提供暗色/亮色主题切换。
3. **数据获取**：
   - SSG/ISR：构建时从数据源 API 拉取最新事件生成静态页面。
   - 客户端 SWR：地图加载后按需调用 `/api/events`、`/api/vessels` 等只读接口，实现筛选与时间轴交互。
4. **地图交互**：
   - 地图 Marker 展示航母位置，颜色/形状区分可信度等级。
   - 点击 Marker 展示侧边栏，包含事件详情、来源链接、免责声明。
   - 时间轴滑块（结合 `visx` 或 `recharts`）呈现历史事件播放。
5. **辅助页面**：
   - `/methodology`：介绍采集流程、AI 审核、数据局限。
   - `/about`：团队介绍、法律声明。
   - `/data`：表格视图，支持 CSV/GeoJSON 导出。

## 5. 后端与数据接口
1. **API 设计**：
   - `GET /api/vessels`: 舰艇基本信息（名称、编号、舰级、缩略图）。
   - `GET /api/events`: 支持 `vessel`, `start_date`, `end_date`, `confidence` 等查询参数；返回分页列表。
   - `GET /api/events/{id}`: 单条事件详情，包含审核日志、来源链接。
   - `GET /api/stats`: 部署趋势、近期更新情况，用于前端仪表盘。
   - Edge Function 或 ISR 对象缓存 5-15 分钟，防止频繁刷新。
2. **认证与权限**：前台只读，无需登录；若提供内部审核界面，可使用 Supabase Auth + RLS 限制。
3. **缓存**：使用 Vercel Edge Cache + Supabase 内置缓存。对热点数据使用 Redis（可选，如 Upstash）。
4. **数据验证**：Next.js 构建阶段运行 TypeScript Zod schema 检查数据完整性，CI 中包含 lint、测试、链接检查。

## 6. 数据管理与工作流
1. **数据模式**：
   ```sql
   TABLE vessels (
     id uuid PRIMARY KEY,
     name text NOT NULL,
     hull_number text,
     vessel_class text,
     homeport text,
     created_at timestamptz DEFAULT now()
   );

   TABLE events (
     id uuid PRIMARY KEY,
     vessel_id uuid REFERENCES vessels(id),
     event_date daterange NOT NULL,
     latitude numeric(9,4),
     longitude numeric(9,4),
     location_name text,
     confidence text CHECK (confidence IN ('High','Medium','Low')),
     evidence_type text,
     summary text,
     source_url text,
     source_excerpt text,
     last_verified_at timestamptz,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   TABLE review_logs (
     id uuid PRIMARY KEY,
     event_id uuid REFERENCES events(id),
     reviewer text,
     review_notes text,
     confidence_adjustment text,
     created_at timestamptz DEFAULT now()
   );
   ```
2. **采集流程**：
   - **线索抓取**：Node.js 脚本使用 `rss-parser`、`playwright`、`twitter-api` 等组件定期抓取候选文本，存储于 `ingestion_queue`。
   - **AI 初审**：使用 OpenAI GPT-4o Mini 或本地模型分析文本，提取时间、地点、舰艇，给出可信度初判，并附带结构化 JSON。
   - **人工复核**：Supabase 提供的 Admin 面板或自建轻量 Dashboard 供编辑查看候选事件，确认后写入正式 `events` 表。
   - **多媒体存档**：对关键证据截图、PDF 存入 Supabase Storage/S3，链接写入 `source_artifacts` 表。
3. **更新与标记**：每日 cron 任务扫描超过设定阈值（如 14 天）未更新的舰艇，自动创建“位置未知”事件或提醒编辑补录。
4. **版本管理**：定期将 `events` 表导出为 JSON/YAML，并存入 Git 仓库，便于历史追踪与离线备份。

## 7. AI 审核策略
- **模型选择**：使用具备长文本理解的模型（如 GPT-4o、Claude）抽取实体，并用规则检查地理坐标。
- **可信度评估**：根据来源类型、是否有多方佐证、时间延迟等指标打分。提供 `high/medium/low`。
- **安全防护**：对模型输出进行校验（如正则限制 URL、置信度枚举），避免注入或生成伪造内容。
- **人工介入**：任何低置信度或模型不确定的条目需人工确认。保留审核日志以供责任追踪。

## 8. 部署与基础设施
- **前端/后端**：部署至 Vercel，使用环境变量连接 Supabase。设置 ISR Revalidate 周期（如 10 分钟）。
- **数据层**：Supabase（PostgreSQL + Storage + Auth）。启用地理扩展 `postgis` 支持范围查询。
- **任务调度**：Vercel Cron 或 Supabase Edge Functions 运行采集与清理脚本；对高复杂度任务使用 GitHub Actions 定期运行。
- **监控**：
  - 前端性能监控（Vercel Analytics、Sentry）。
   - 后端日志与审计（Supabase Logs、Datadog 可选）。
  - 数据健康仪表盘，展示每日新增事件、待审核条目数量。
- **备份**：Supabase 提供自动备份；额外每周导出 JSON 备份存入 S3/Backblaze B2。

## 9. 安全、隐私与法律合规
- **数据来源合规**：仅使用公开渠道，遵守各网站的使用条款，避免抓取限制内容。
- **免责声明**：在网站显著位置声明“信息非实时、可能存在误差，不构成官方立场”。
- **敏感度控制**：对精确坐标做模糊化处理（0.1°-1°），必要时延迟发布或标注“未知”。
- **访问限制**：禁止用户提交未经验证的坐标；若开放投稿，需设置审核流程与服务条款。

## 10. 开发计划
| 阶段 | 周期 | 目标 | 产出 |
| --- | --- | --- | --- |
| 需求与设计 | 1-2 周 | 明确航母列表、字段、界面原型、法律文本 | 线框图、字段字典、法律审查结果 |
| 数据基线 | 2-3 周 | 收集近 6-12 个月的部署事件，建立首批数据 | 初始 `vessels` & `events` 数据集 |
| 前端开发 | 2-3 周 | 完成地图、筛选、时间线、列表页面 | 可交互前端、组件库 |
| 后端/数据接口 | 1-2 周 | 实现 API、缓存、数据校验 | `/api/*` 接口、ISR 配置、Zod schema |
| 测试与上线 | 1 周 | 可用性测试、性能优化、部署 | 上线站点、监控报警 |
| 运营与维护 | 持续 | 数据采集自动化、AI 审核 SOP、备份 | Cron 任务、审核流程文档 |

## 11. 未来路线图
- **数据贡献者体系**：构建投稿入口，结合自动化审核与人工评审，扩大覆盖。
- **可视化增强**：增加舰队编组、部署趋势热力图、区域统计图表。
- **API 扩展**：开放开发者 API，提供认证与速率限制。
- **合作机会**：与 OSINT 社群或媒体合作共享数据，提升更新频率与可信度。

## 12. 风险与应对
| 风险 | 影响 | 缓解措施 |
| --- | --- | --- |
| 数据源间断 | 更新频率降低，用户流失 | 明确定位为“最后已知位置”，在 UI 提示数据缺口，主动寻找新来源 |
| AI 判读误差 | 误导用户 | 设置多级可信度、人工复核、保留原文链接 |
| 法律争议 | 项目被迫下线 | 严格使用公开资料，保留免责声明，与法律顾问沟通 |
| 运维负担 | 团队精力耗尽 | 采用托管服务、自动化脚本、社区贡献 |

---

本技术方案从产品定位、系统架构到运维风险为项目提供了完整蓝图，可指导后续迭代与实现。
