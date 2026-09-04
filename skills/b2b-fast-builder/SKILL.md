---
name: b2b-fast-builder
description: >-
  极速规划、构建、部署或审计以 Google 自然流量和询盘为目标的静态外贸 B2B 网站。
  默认使用 Vite、React 与 TypeScript 在构建时为每个网址预生成完整 HTML，并配合
  Cloudflare Pages、Pages Functions、D1 与 Resend，
  支持图片随站部署或使用 R2 两种媒体模式。需要 CMS、草稿发布、前台编辑或复杂内容运营时改用 b2b-builder。
---

# B2B Fast Builder

把网站建成“数据驱动的信息架构 + 可直接抓取的静态 HTML + 可靠询盘闭环 + 可重复部署的项目”。本 Skill 面向需要快速上线、没有 CMS、日常由 Agent 修改代码并重新部署的制造商、供应商、OEM/ODM、工业服务商和外贸公司。

## 先判定是否适用

使用本 Skill：

- 新建或改造无 CMS 的外贸 B2B 静态站。
- 快速制作单站、国家站、小语种站或 SEO 专题站。
- 业务内容由文件、结构化数据或代码维护，更新后允许重新构建部署。
- 询盘通过 Pages Function 接收，D1 保存，Resend 通知。

改用 `$b2b-builder` skill：

- 运营人员需要 CMS 后台实时新增产品或文章。
- 需要草稿、发布、版本历史、角色权限、前台编辑或复杂媒体管理。
- 内容更新不能等待一次代码构建和部署。

不要把无 CMS 说成不支持更新；本方案由 Agent 修改内容真源、验证并重新部署。也不要把一个只生成 `index.html` 的客户端 SPA 说成 SEO 静态站。

## 按任务读取参考

- 新站访谈、行业对标、关键词驱动分类、页面清单与询盘路径：读 [B2B 规划与转化](references/b2b-planning-and-conversion.md)。
- 选择框架、静态预生成、多语言、metadata、sitemap、404 或检查构建产物：读 [静态 SEO 输出契约](references/static-seo-contract.md)。
- 新建/改版的视觉方向、参考拆解、设计记忆、图片策略、Tailwind v4 与组件选择：读 [前端设计系统](references/frontend-design-system.md)。
- 设置 typecheck、lint、test、build、静态 SEO 检查和部署拦截：读 [自动化质量闸门](references/automated-quality-gate.md)。
- 使用 Cloudflare Pages、D1、Resend、Turnstile、R2、Wrangler、域名或部署：读 [Cloudflare 运行与部署](references/cloudflare-runtime-and-deployment.md)，核对当前官方参数；可用时按需调用 `$cloudflare`。
- 首次接入 Cloudflare、迁移 DNS、注册 Resend、验证发信域名或创建 API Key：读 [账号与域名接入](references/account-and-domain-onboarding.md)。
- 用户需要即时聊天、Tidio 注册引导、安装脚本、隐私配置或聊天验收：读 [Tidio 即时聊天接入](references/tidio-live-chat.md)。
- 截图/批注修改、局部更新、视觉验收、PageSpeed、询盘测试、上线或交接：读 [测试与交接](references/testing-and-handoff.md)。

只读取当前阶段需要的参考；跨阶段实施时再组合读取。换图、改文案等小修改走测试与交接中的局部更新流程，不重启新站访谈或全站设计。

## 不可破坏的架构边界

1. **每个 SEO 路由必须直接返回完整 HTML。** 首页、分类页、产品页、应用页和文章页的主要标题、正文、参数、链接和结构化数据不依赖浏览器执行 JavaScript 才出现。
2. **静态托管不等于静态生成。** 构建目录只有一个空壳 `index.html`、所有路由回退到该文件的 React SPA 不通过验收。
3. **内容真源留在仓库。** 页面内容来自类型安全的本地数据、Markdown/MDX 或显式代码模块；不得在多个文件中复制维护同一事实。
4. **询盘先入库，再发邮件。** D1 是询盘真源；Resend 只是通知。邮件失败不得导致询盘消失。
5. **成功提交必须进入独立感谢页。** 只有 D1 保存成功后才能跳转 `/thank-you/`；数据库写入失败时留在表单并保留输入。感谢页用于广告转化追踪，但必须防止直接访问或刷新造成重复计数。
6. **媒体模式必须显式选择。** 默认 `local`；多站共享素材、大文件或用户明确要求时使用 `r2`。两种模式不能在同一批资源中无规则混用。
7. **不伪造证据。** 客户、认证、产能、交期、案例、效果数字和出口国家必须可核验；占位内容必须标记并保持 `noindex`。
8. **参考获客逻辑，不复制品牌表达。** 对标网站用于研究信息顺序、关键词覆盖、页面结构和转化路径，不逐像素复制 Logo、文案、摄影或专有设计。
9. **Secret 不进入前端和仓库。** Resend、Turnstile、Cloudflare Token 只进入安全环境或 Pages Secret。
10. **创建资源不等于获准上线。** 只读规划不创建云资源；部署、域名切换、生产写入必须属于用户明确要求的范围。
11. **客户拥有基础设施。** 域名注册商、Cloudflare、Resend 和生产仓库默认使用客户自己的账号；服务商不得把续费、DNS、发信能力或源代码锁在自己的账号里。
12. **把技术复杂度留给 Agent。** 面向非技术用户只询问域名、购买平台、收件邮箱等业务信息；能读取或自动配置的内容不让用户手抄。登录用浏览器授权，Secret 用加密输入框，不让用户在聊天中粘贴密码、Token 或 API Key。
13. **质量闸门失败不得部署。** 路由清单必须传给静态验证器；任一类型、lint、测试、构建、路由 HTML、title、canonical 或 sitemap 检查失败，必须返回非零退出码并停止 Cloudflare 部署。
14. **视觉值必须来自语义 Token。** 品牌色、文字色、背景、边框、圆角、阴影、间距和内容宽度使用统一设计变量；页面组件不得各自散落任意颜色和尺寸。
15. **即时聊天不能替代可靠询盘。** Tidio 是用户明确选择后启用的第三方增强项；站内表单仍执行 D1 先入库、Resend 后通知。不得声称 Tidio 对话自动进入 D1，也不得因用户暂未提供 Tidio Public Key 阻塞建站。

## 技术选择原则

- **新建极速站默认技术栈固定为 Vite + React + TypeScript。** React 负责可复用页面组件，Vite 负责编译样式、脚本和静态资源，构建期生成器使用 React 服务端渲染能力遍历 route manifest，并把每条已知路由写成独立完整 HTML。
- **样式层默认使用 Tailwind CSS v4 与 `@tailwindcss/vite`，并强制使用语义 Token。** `bg-primary`、`text-muted-foreground` 等语义类表达用途，不在业务组件里散落 `bg-blue-500`、十六进制品牌色或任意阴影。
- **shadcn 选择性使用，不默认全量安装。** 表单、按钮、弹层、折叠和无障碍交互优先复用所需组件；营销区块、产品卡和页面模板按项目视觉方向组合。只添加实际使用的源码组件，避免给纯静态页面带来无用客户端 JavaScript。
- **默认不安装 Next.js。** 本方案不需要 Next.js 服务端、App Router、Server Actions、ISR 或图片服务。只有现有项目已经使用 Next.js 且静态导出合格，或用户明确要求 Next.js 时才保留；不得为了框架名重写项目。
- 构建产物默认写入 `dist/`。`/products/example/` 应对应 `dist/products/example/index.html`；不得只输出一个 `index.html` 再用 SPA fallback 承接所有网址。
- 默认把 React 当作构建期组件系统，不把整套 React 运行时无条件发送到浏览器。导航、折叠和询盘表单优先使用原生 HTML、CSS 与少量渐进增强脚本；确实需要状态交互时才对局部组件 hydration。
- 现有项目先读取 `package.json`、lockfile、构建配置和输出目录，不为换技术栈而重写可用项目。
- 可以使用 hydration 保留菜单、筛选和表单交互，但核心内容必须已存在于初始 HTML。
- Pages Function 默认只匹配 `/api/*`；静态页面和静态资源不应无故调用 Function。
- 多语言优先根据国家/语言策略选择独立域名、子域名或子目录；每种语言生成独立 HTML、canonical 与正确的 hreflang。
- 外部 Skill 是可选增强，不是导入本目录后的硬依赖。视觉阶段可参考 `$frontend-design`；React 或 shadcn 实现可按需参考已安装的对应 Skill。缺失时使用本包参考与当前官方文档，不阻塞、不擅自安装其他 Skill、Hooks 或付费设计工具。
- 外部建议须适配本项目的静态 HTML、真实证据与询盘边界；不得照搬 SPA 入口、把核心目录改成仅客户端加载，或为了视觉效果换框架。技术事实以项目版本和官方文档为准，具体适配见 [前端设计系统](references/frontend-design-system.md)。

## 标准工作流

### 1. 研究项目与业务

先读项目规则、文件、路由、内容数据、构建脚本、测试和部署配置。新站用少量分轮问题确认产品、采购者、目标国家、询盘动作、真实证据、语言、首版页面和更新方式。

如果用户提供行业关键词或竞争地图，优先寻找“基础一般但采购词流量高”的可达对标，而不是只参考品牌最强或设计最漂亮的网站。

### 2. 输出可确认的建站契约

使用 [项目契约模板](assets/site-contract.example.yaml) 形成；客户不懂技术时按 [客户接入表单模板](assets/onboarding-intake.example.yaml) 分步收集：

- 业务与目标买家。
- 精准搜索意图和页面分类依据。
- route matrix、页面模板和主 CTA。
- 内容真源、语言策略和 SEO 字段来源。
- 询盘字段、收件人、反垃圾策略、感谢页路由和转化事件。
- 是否启用 Tidio、客户 Project 的 Public Key、显示范围、隐私策略和性能验收口径。
- 域名注册商、Cloudflare DNS 接管状态、Resend 发信子域与账号归属。
- `local` 或 `r2` 媒体模式。
- 部署范围、授权状态和验收标准。

关键事实不完整时标记 `待确认`，不要用模板假数据补齐。

### 3. 确定设计方向，完成真实样板

把获客参考与视觉参考分开，先明确每类页面的买家任务。按 [设计记录模板](assets/design-brief.example.md) 在项目创建或补充 `DESIGN.md`，记录方向、Token 来源、图片规则与已确认选择；默认给一个有依据的方向，只有重要偏好不明时才提供少量首屏备选。

优先完成首页、一个分类页和一个产品详情页；特殊业务可按差异补充样板。样板从第一天使用正式内容真源、route resolver 和静态文档生成器，预览实际构建产物，不先做 SPA 再返工。使用真实内容和素材，完成桌面/手机截图自查与定点修改，用户确认后再扩展全站。细则见前端设计系统与测试与交接。

### 4. 静态生成全部页面

从 route manifest 和内容数据生成每条路由。Vite 编译共享资源，构建期 React 生成器将完整文档写入对应的 `dist/<route>/index.html`；列表、详情、语言变体和 metadata 必须来自同一真源。不得手写大量内容重复的 JSX 页面，也不得把主要正文留给浏览器端 React 渲染。生成后检查每个 route 对应独立 HTML 文件。

若用户确认 Tidio，由同一个完整文档生成器把经过校验的官方 loader 写在选定公开页面的 `</body>` 前。极速版是多页静态输出，不能只改根 `index.html` 后假设其他 HTML 自动继承。

### 5. 建立询盘闭环

实现 `/api/inquiry`：校验字段和 Turnstile、去重、先写 D1，再调用 Resend，最后记录邮件状态。D1 保存成功后，前端携带非个人身份的询盘编号跳转到独立 `/thank-you/`；感谢页说明下一步并触发一次转化事件。Resend 失败但询盘已保存时仍可进入感谢页；数据库写入失败则不得跳转。

Tidio 的聊天记录留在客户自己的 Tidio Inbox。除非用户另行要求并授权 API/webhook 集成，不把聊天同步到 D1 写成已有能力；Tidio 不可用时，站内 RFQ 仍必须独立工作。

### 6. 执行媒体模式

- `local`：压缩、命名并写入静态资源目录，随 Pages 构建发布。
- `r2`：每个客户/品牌使用独立 Bucket 或明确命名空间；Agent 上传资源，生产 URL 使用客户控制的自定义域名。R2 只做媒体层，不把本方案升级成 CMS。

模式选择和切换规则见 [Cloudflare 运行与部署](references/cloudflare-runtime-and-deployment.md)。

### 7. 验证和部署

首次上线先按 [账号与域名接入](references/account-and-domain-onboarding.md) 完成 Cloudflare 与 Resend onboarding。再按 [自动化质量闸门](references/automated-quality-gate.md) 将 typecheck、lint、test、build 和必须传入 route manifest 的静态验证串成一个命令。Cloudflare Pages 的 Build command 和人工部署命令都必须先运行该闸门；不允许绕过。浏览器验证桌面、手机、导航、404、询盘成功/失败和真实内容；部署后再从匿名网络完成一次端到端 smoke。

启用 Tidio 时，质量闸门还必须验证目标 HTML 都且只包含一个客户 Public Key loader；生产 smoke 发送唯一前缀测试消息并由客户在 Tidio Inbox 回读，同时重测启用后的 PageSpeed。

只有实际跑过测试才能写“通过”。PageSpeed 四项 100 只能在保留页面、设备、时间和正式测试结果时宣称。

### 8. 交接 Agent 更新能力

记录内容真源、route manifest、`DESIGN.md`、媒体清单、构建/部署命令、环境变量、询盘查询和回滚方法。后续 Agent 按局部、模板或全站范围改真源，检查影响路由、重建、运行质量闸门并复核受影响页面；不得直接改 `dist` 或未经要求重做已确认设计。

## 两种媒体模式

### `local`：默认极速模式

适用于单站、普通产品图、没有运行时上传需求的项目。图片随代码部署，架构最少、迁移最容易。

切换到 `r2` 的信号：

- 同一品牌的多个域名或小语种站共用素材。
- PDF、视频或单个大文件接近 Pages 限制。
- 静态文件数量接近当前 Pages 计划限制。
- 用户明确要求媒体与部署包解耦。

### `r2`：共享媒体模式

适用于多站共享和大型资源。Agent 可通过 Wrangler 创建 Bucket、上传对象并配置 Pages；首次仍需要用户完成 Cloudflare OAuth 或提供最小权限 Token。生产环境使用自定义媒体域名，不使用 `r2.dev`。

如果用户只是想在后台实时上传产品和图片，应停止扩展极速版，重新评估完整 `$b2b-builder`，而不是在本 Skill 中偷偷造半套 CMS。

## 询盘最小状态模型

每条询盘至少保存：

- `id`、`submission_key`、`created_at`。
- 姓名、邮箱、公司、电话、国家和需求字段。
- 来源 URL 与 UTM。
- `inquiry_status`。
- `email_status`、`resend_email_id`、`retry_count`、`last_error`。

重复提交由 `submission_key` 唯一约束拦截；Resend 使用同一询盘编号作为幂等键。生产项目应提供失败邮件查询和补发入口。

## 完成定义

- 用户确认的页面清单与构建产物一一对应。
- 每条 SEO 路由直接返回包含主要内容的 HTML，关闭 JavaScript 仍可理解。
- 标题、description、H1、canonical、hreflang、结构化数据、sitemap、robots 和 404 符合当前项目策略。
- 页面分类来自买家任务和搜索数据，不来自老板主观图册目录。
- 首屏说明卖什么、卖给谁、为什么可信、如何询盘。
- 新站/改版的设计方向与样板确认有记录；设计取值来自代码 Token，`DESIGN.md` 解释规则而不维护第二套值。
- 代表性页面有实际桌面/手机截图与问题处理记录，或明确未验证原因；构建通过和 PageSpeed 得分不能替代视觉验收。
- 媒体模式已记录；`r2` 不是未启用却写成已完成的能力。
- 询盘在邮件调用前写入 D1，失败可见、可重试。
- 只有询盘成功入库才进入独立 `/thank-you/`；页面 `noindex`、不进 sitemap，转化事件使用唯一询盘编号去重且不传 PII。
- 类型、lint、测试、build、静态 HTML、桌面/移动视觉和生产 smoke 已验证，或明确列出未运行原因。
- 项目提供单一质量闸门命令，强制执行 `typecheck → lint → test → build → validate:static`；部署只能在该命令成功后继续。
- 静态验证必须传入 route manifest，并证明路由、HTML、唯一 title、自引用 canonical 与 sitemap 一致。
- 若启用 Tidio，安装范围、Public Key 来源、隐私处理、逐页 loader 检查、真实消息验收和启用后的性能证据均已记录；若未启用，不把它写成已完成。
- Secret 不在 Git、日志、客户端 bundle 或交接文档中。
- 交付内容真源、更新方法、部署方法、询盘查看方法、测试证据、已知风险与回滚路径。
