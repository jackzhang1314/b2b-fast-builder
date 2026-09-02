# 静态 SEO 输出契约

用于选择 React 静态方案、设计内容真源、生成路由、实现多语言 SEO 和检查构建产物。框架与搜索引擎规则会变化；实施前核对项目安装版本、包内类型和当前官方文档。

## 1. 合格输出

每条重要路由都应在构建目录中拥有独立 HTML，例如：

```text
dist/
├── index.html
├── products/index.html
├── mini-excavators/index.html
├── 2-ton-mini-excavator/index.html
├── applications/construction/index.html
├── contact/index.html
├── thank-you/index.html
├── 404.html
├── robots.txt
└── sitemap.xml
```

请求 `/2-ton-mini-excavator/` 时，HTTP 响应中的 HTML 已包含产品标题、说明、参数、图片 alt、内部链接、metadata 和 JSON-LD。React 可以在浏览器 hydration，但不能承担主要内容的首次生成。

不合格输出：

```html
<body>
  <div id="root"></div>
  <script type="module" src="/assets/app.js"></script>
</body>
```

如果正文只在 JavaScript 执行后出现，即使部署在 Pages，也只是静态托管的客户端 SPA，不是本 Skill 定义的 SEO 静态页面。

## 2. 框架选择

先检查现有项目能否预生成全部已知路由。满足输出契约就保留，不为追求某个名称重写。

新项目选择时比较：

- 能否从 route manifest 和本地内容数据批量预生成 HTML。
- React 组件、局部 hydration 与 TypeScript 支持。
- 动态参数路由能否在 build 时列举。
- metadata、canonical、hreflang、sitemap 与 404 是否可确定生成。
- Cloudflare Pages 的当前官方部署支持。
- 构建速度、bundle 大小、维护复杂度和锁定风险。

可以考虑静态导出型 React 框架、支持 React islands 的静态生成器或经过验证的 React 预渲染方案。不要默认安装一个陈旧的“React Static”包；先核对维护状态和当前官方类型。

## 3. 内容真源

推荐组织：

```text
content/
├── site.ts
├── navigation.ts
├── categories/
├── products/
├── applications/
├── posts/
└── locales/
```

- 每个业务实体使用明确的 TypeScript 类型或经过 schema 验证的数据。
- slug、route、canonical、导航和 sitemap 从同一 route resolver 生成。
- 不在页面 JSX、导航和 sitemap 中维护三份 URL。
- 不直接修改 `dist`；它是可重建产物，不是内容真源。
- 用户资料不完整时保留显式 placeholder，禁止静默编造。

## 4. 每页 SEO 最小字段

- 唯一、准确的 `<title>`。
- 与页面意图一致的 meta description。
- 一个清楚的 H1 和合理的 H2/H3 层级。
- 自引用或正确指向的 canonical。
- 多语言页面的双向 hreflang 与 `x-default` 策略。
- Open Graph 基础字段。
- 与真实内容一致的 Organization、Product、BreadcrumbList、Article 或 FAQ JSON-LD；没有真实字段就不输出。
- 可抓取的 `<a href>` 内部链接，不用 hash route 代替页面 URL。
- 图片 width/height、alt、响应式尺寸和非首屏 lazy loading。
- 正确的 `lang` 属性。

## 5. 状态码与重复内容

- 不存在的产品和路由返回真正的 404，不把所有未知路径回退成 200 首页。
- 永久迁移使用 301/308，并更新内部链接、canonical 和 sitemap。
- 相同内容不能只替换国家词、产品词或语言标签就生成大量页面。
- 列表筛选参数默认不创建无限可索引组合；只有独立需求和内容价值时生成静态落地页。
- 草稿、占位、测试和预览路由保持 noindex，且不进入 sitemap。
- 询盘感谢页 `/thank-you/` 保持 `noindex, follow`，不进入 sitemap 或主导航；它是转化确认页，不是 SEO 落地页。

## 6. 多语言

- 翻译不是逐字替换；产品术语、单位、CTA、联系方式和合规说明按市场本地化。
- 每种语言必须有独立、稳定 URL，并在 HTML 响应中直接包含译文。
- 缺少某语言对应页时，不生成指向不存在页面的 hreflang。
- 独立域名、子域名和子目录均可，但 route manifest 必须记录市场、语言、canonical host 和对应页面集合。
- 同一产品图片可复用；页面正文、metadata 与买家任务不能只靠图片区分。

## 7. Pages 路由边界

Pages Function 默认只服务 API。构建产物中显式生成 `_routes.json`，把静态文件排除在 Function 调用之外；具体语法以当前 Cloudflare 官方文档为准。

典型目标：

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

不要让全站静态请求无理由进入 Function，也不要用 Function 为每个产品页动态拼 HTML，从而破坏极速静态方案。

## 8. 确定性检查

构建后运行：

```bash
node /path/to/b2b-fast-builder/scripts/validate-static-output.mjs \
  dist \
  routes.json
```

然后抽查源响应：

```bash
curl -fsSL https://example.com/2-ton-mini-excavator/
```

不能只在浏览器 Elements 面板看执行 JavaScript 后的 DOM；必须查看网络响应或 View Source。

自动检查只能发现结构性问题，不能证明关键词选择、文案真实性、搜索意图或业务转化正确。
