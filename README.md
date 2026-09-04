# B2B Fast Builder Skill

面向外贸 B2B 网站的极速建站 Agent Skill。它使用 Vite、React 与 TypeScript，在构建期为每个公开网址生成完整 HTML，并配套 Cloudflare Pages、Pages Functions、D1、Resend、可选 R2 与可选 Tidio。

该版本适合无 CMS 的单站、国家站、小语种站和 SEO 专题站。需要内容后台、草稿发布、角色权限或前台编辑时，应使用完整版 `b2b-builder`。

## 安装

支持从 GitHub 子目录导入 Skill 的 Agent，请使用：

```text
https://github.com/jackzhang1314/b2b-fast-builder/tree/main/skills/b2b-fast-builder
```

只接受仓库链接并能自动扫描 `skills/` 目录的 Agent，请使用：

```text
https://github.com/jackzhang1314/b2b-fast-builder
```

可安装 Skill 的唯一真源位于 [`skills/b2b-fast-builder/`](skills/b2b-fast-builder/)。不要单独复制某一份 reference；应导入整个目录，确保脚本、示例配置和按需参考文件同时可用。

## 仓库结构

```text
b2b-fast-builder/
├── README.md
└── skills/
    └── b2b-fast-builder/
        ├── SKILL.md
        ├── agents/
        ├── assets/
        ├── references/
        └── scripts/
```

`SKILL.md` 是入口；`references/` 保存按任务加载的实施规范；`assets/` 提供项目契约与配置示例；`scripts/` 提供静态 SEO 和 Tidio 构建产物的确定性验证。

## 设计与修改流程

获客参考与视觉参考分开 → 用正式静态生成器做三个样板 → 桌面/手机检查与样式确认 → 主动收集客户资料、替换素材并扩展全站 → 真实内容复核 → 按实际需要接通服务、验证上线。

- `DESIGN.md` 记录方向、批准范围和规则，具体视觉值由代码中的语义 Token 维护。
- 不要求客户注册账号或交齐图册才开始设计。前期使用可用的实物摄影/明确标记的 AI 示意，样式通过后主动邀请上传公司介绍、图册、照片和参数表，由 Agent 整理匹配。
- 默认专业、大气、有质感的 B2B 企业设计：实物摄影、清楚分类与规格、克制配色和有秩序的留白；产品主图不用 SVG 插画或通用图标充数。
- 网上公开图片不等于已获准使用；素材保留来源、用途与待替换状态，正式产品图须对应客户真实产品。local/R2 共用逻辑素材 ID。
- 换图、改文案和局部调整不重启全站设计；先判断影响范围，再修改真源、验证和按授权部署。
- 参考 Frontend Design、Impeccable、Stitch 等方法，但不要求安装其他设计 Skill 或开通额外服务。

设计记录、素材清单和视觉检查模板在 `assets/`。本包当前是工作规范、模板与校验脚本，不含完整可运行的整站脚手架；自动校验通过也不代表审美、业务内容或询盘效果已被验证。

## 主动引导上线

先建站，再到实际需要时主动带客户接通相应服务：部署/线上询盘测试时连接 Cloudflare，需要真实邮件时连接 Resend，选用并准备安装聊天时连接 Tidio。不开场派发注册清单；样式确认先邀请客户补真实资料。

- 当前步骤的必要工具先检查，缺失时从官方来源安装；用户不用自己知道 CLI/Skill 名称，也无需为后续可能用到的工具提前注册。
- 每轮只告诉客户当前该打开哪里、做什么、回来回复什么；中断后从未完成步骤继续。
- 普通资料与 Tidio 公开安装代码可在聊天发送；API Key 不进聊天，使用真实安全输入或官方 Secret 页面。
- 实际邮箱收到测试询盘、聊天收件箱能回复才算接通；页面完成不等于服务完成。

详细规范见 [`主动引导上线`](skills/b2b-fast-builder/references/guided-launch.md)。它是 Agent 工作规范，不是内置授权 UI；自动安装和配置以宿主实际工具、权限及客户授权范围为限。

## 核心边界

- 每个重要网址必须预生成包含主要内容的独立 HTML，不能用单页应用空壳冒充静态 SEO 网站。
- 站内询盘先写入 D1，再由 Resend 通知；邮件失败不能导致询盘丢失。
- 成功提交后进入独立感谢页，便于广告转化追踪。
- Tidio 是可选即时聊天入口，不能替代站内询盘系统。
- 本地图片随站部署是默认方案；多站共享素材或大文件场景可选择 R2。
- 部署前必须通过类型、代码、构建、路由、metadata、sitemap 与第三方集成检查。
