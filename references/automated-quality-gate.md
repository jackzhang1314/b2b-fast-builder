# 自动化质量闸门

用于新建项目、修改页面、更新内容和 Cloudflare Pages 部署。目标是让“每个网址都是完整静态 HTML”成为程序闸门，而不是靠 Agent 记忆。

## 1. 唯一流水线

项目必须提供一个稳定入口，按顺序串行：

```text
typecheck
→ lint（warning 也视为失败）
→ test（项目有测试时）
→ build assets + 逐路由生成 HTML
→ validate:static dist routes.json
→ 成功后才允许 deploy
```

不得并行 build 与 static validation，也不得在失败后继续。

## 2. package.json 契约

使用项目已选的包管理器；下列 npm 脚本是语义契约，具体生成命令按项目实现调整：

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "build:assets": "vite build",
    "build:pages": "tsx scripts/generate-static.tsx",
    "build": "npm run build:assets && npm run build:pages",
    "validate:static": "node scripts/validate-static-output.mjs dist routes.json",
    "quality": "npm run typecheck && npm run lint && npm run test --if-present && npm run build && npm run validate:static",
    "deploy": "npm run quality && wrangler pages deploy dist"
  }
}
```

- 将本 Skill 的 `scripts/validate-static-output.mjs` 复制到项目 `scripts/`，使 CI 和客户不依赖 Agent 本机的绝对路径。
- `build` 必须清理并重建 `dist`，防止已删除路由的旧 HTML 残留。
- `routes.json`、sitemap 和导航 URL 必须来自同一 route resolver，不维护三份独立清单。
- 项目没有测试脚本时可由 `--if-present` 跳过；typecheck、lint、build 和 validate:static 不得跳过。

## 3. 静态验证的强制条件

`validate-static-output.mjs` 必须要求两个位置参数：构建目录和 route manifest。验证失败时返回退出码 1，参数或文件错误返回 2。

必须检查：

- route manifest 非空、无重复、只含站内页面路径。
- 每条 route 存在 `dist/<route>/index.html` 或等价静态文件。
- 除专用 `404.html` 外，每个生成的 HTML 都在 route manifest 中，避免旧页面或漏管页面残留。
- 源 HTML 含有有意义正文、title、description、H1、canonical 和可抓取链接。
- 可索引页的 title 唯一、canonical 唯一，canonical 路径与 route 一致，且属于同一个正式站点 origin。
- 所有可索引 canonical 在 sitemap 中恰好出现一次。
- sitemap 不含 noindex 页、未生成页、相对 URL、query/hash 或重复 URL。
- `robots.txt`、`sitemap.xml` 和 `404.html` 存在。

## 4. Cloudflare Pages 拦截

使用 Git 集成时：

```text
Build command: npm run quality
Build output directory: dist
```

Cloudflare Pages 以 Build command 的退出码判定构建成功或失败。所以 `quality` 必须保留原始错误码，禁止 `|| true`、错误吞掉和无条件退出 0。

使用 Wrangler 直接上传时，只允许通过项目 `deploy` 脚本或先显式完成 `quality`。不把裸 `wrangler pages deploy dist` 当作常规交付命令。

## 5. 本地与上线后复核

自动闸门通过后，仍需用浏览器和源响应复核代表性首页、分类页、详情页、联系页和 404。部署后用 `curl` 或 View Source 确认主要内容来自服务器响应，不是执行 JavaScript 后才出现。

自动检查证明结构满足契约，不证明关键词决策、文案真实性、搜索意图或实际询盘转化质量。
