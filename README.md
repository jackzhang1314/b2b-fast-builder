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

## 核心边界

- 每个重要网址必须预生成包含主要内容的独立 HTML，不能用单页应用空壳冒充静态 SEO 网站。
- 站内询盘先写入 D1，再由 Resend 通知；邮件失败不能导致询盘丢失。
- 成功提交后进入独立感谢页，便于广告转化追踪。
- Tidio 是可选即时聊天入口，不能替代站内询盘系统。
- 本地图片随站部署是默认方案；多站共享素材或大文件场景可选择 R2。
- 部署前必须通过类型、代码、构建、路由、metadata、sitemap 与第三方集成检查。
