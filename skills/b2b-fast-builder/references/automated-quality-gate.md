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
→ validate:integrations（启用了 Tidio 等第三方能力时）
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
    "validate:integrations": "node scripts/validate-tidio-output.mjs dist routes.json tidio.json",
    "quality": "npm run typecheck && npm run lint && npm run test --if-present && npm run build && npm run validate:static && npm run validate:integrations",
    "deploy": "npm run quality && wrangler pages deploy dist"
  }
}
```

- 将本 Skill 的 `scripts/validate-static-output.mjs` 复制到项目 `scripts/`，使 CI 和客户不依赖 Agent 本机的绝对路径。
- 将本 Skill 的 `scripts/validate-tidio-output.mjs` 和 [Tidio 配置示例](../assets/tidio-config.example.json) 一并复制到项目；即使未启用 Tidio，也检查构建产物没有误装示例或其他客户的 loader。
- `build` 必须清理并重建 `dist`，防止已删除路由的旧 HTML 残留。
- `routes.json`、sitemap 和导航 URL 必须来自同一 route resolver，不维护三份独立清单。
- 项目没有测试脚本时可由 `--if-present` 跳过；typecheck、lint、build 和 validate:static 不得跳过。
- 项目启用 Tidio 时，测试必须读取同一 route manifest 和 live-chat 配置，验证目标 HTML 中客户 loader 恰好出现一次；不得只检查 `dist/index.html`。

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

## 6. 设计验收与自动检查的分工

| 检查 | 本包当前覆盖 | 还需什么 |
|---|---|---|
| 逐路由 HTML、title、canonical、sitemap | 静态校验脚本 | 源响应、深层访问和真实页面语义复核 |
| Tidio loader 范围与 Public Key | Tidio 校验脚本 | 正式聊天消息、遮挡与性能测试 |
| 图片可用、尺寸、label、键盘、无溢出 | 实施/验收规范，不是上述脚本全自动覆盖 | 项目测试与浏览器实际观察 |
| 设计方向、素材真实性、采购信息层级 | 设计与业务记录 | 证据核对、截图评审和用户确认 |

新站样板与最终验收都预览同一个正式生成器的实际产物。受影响页面要保留桌面/手机截图和问题关闭记录，流程见 [测试与交接](testing-and-handoff.md)。设计问题不会因为 `quality` 为零退出码而自动消失；未运行浏览器检查时明确未验证。

按项目需要补充可执行浏览器测试，可检查断图、溢出、菜单和表单状态。不要把 LLM 主观审美评分、搜索流量或固定“满分”口号当作确定性部署条件；必须区分已执行代码、人工检查与尚未实施能力。

本包提供规范、模板与校验器，不包含完整整站脚手架。若项目已有验证过的工程起点，先核对版本、构建与授权后复用；不得把尚未测试的生成器宣称为内置合格模板。
