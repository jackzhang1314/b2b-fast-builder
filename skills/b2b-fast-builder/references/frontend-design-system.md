# 前端设计系统

用于初始化新站样式、搭建三个样板页和扩展全站。目标是加快构建、统一视觉，同时保持静态 HTML 和低 JavaScript 成本。

## 1. 默认组合

新建极速站默认使用：

- Tailwind CSS v4，通过 `@tailwindcss/vite` 接入 Vite。
- CSS 变量与 Tailwind theme variables 组成的语义 Token。
- 项目自有的 React 页面组件和区块组件。
- 按需加入 shadcn 源码组件，不全量安装组件库。

shadcn 适合按钮、表单控件、弹层、折叠、下拉菜单等需要状态与无障碍细节的组件；Hero、产品卡、规格表、信任证据和 CTA 区块应围绕当前品牌组合，不套用统一模板外观。

## 2. 语义 Token 契约

先定义角色，再选择具体视觉值。至少覆盖：

- 颜色：`background`、`foreground`、`primary`、`primary-foreground`、`secondary`、`muted`、`muted-foreground`、`border`、`input`、`ring`、`destructive`。
- 字体：正文、标题、数据或参数；同时定义字号、字重、行高与字距层级。
- 空间：页面 section、组件 gap、控件高度、页面左右留白。
- 形状：圆角、边框、阴影。
- 布局：正文宽度、营销页最大宽度、窄屏断点。

业务组件只使用语义名称，例如 `bg-background`、`text-foreground`、`bg-primary`、`text-muted-foreground` 和 `border-border`。不得把品牌主色散落成 `bg-blue-500`、`#123456` 或重复的任意值；品牌调整应主要修改 Token，而不是逐页搜索替换。

Tailwind v4 的 theme variables 必须定义在顶层；如果值需要生成工具类，用 `@theme` 或项目已验证的 `@theme inline` 映射。如果只是普通 CSS 变量且不需要对应工具类，用 `:root`。不要保留 Tailwind v3 的 `tailwind.config.ts` 作为 v4 主题真源。

## 3. shadcn 使用边界

- 先读取项目的 `components.json` 和 shadcn CLI `info`，确认版本、base、别名、图标库、Tailwind 版本和已安装组件。
- 添加或更新组件前使用当前包管理器运行 shadcn CLI，并先读取该组件当前文档。
- 只安装页面实际需要的组件；安装后读取源码、修正导入、验证类型和无障碍结构。
- 优先用组件现有 variant，不在调用处覆盖颜色与字体。
- 静态导航和简单详情优先原生 HTML/CSS；只有真正需要状态的局部组件才加载浏览器端 React。
- 不把 shadcn 的默认样式当品牌设计。三个样板页确认 Token、排版、密度、图片比例和 CTA 后，再扩展全站。

## 4. 构建和验收

- 关闭 JavaScript 后，标题、正文、参数、链接、联系方式和询盘说明仍可阅读。
- 构建后的 HTML 已包含语义结构；Tailwind 与 shadcn 只改变表现和局部交互。
- 运行 typecheck、lint、production build 和静态输出验证。
- 检查未使用客户端依赖、过大的 JavaScript chunk、布局偏移、键盘操作和表单错误提示。
- 桌面与移动端不得用两套独立内容；响应式只改变布局，不改变搜索引擎与用户看到的核心事实。

官方实现细节以 [shadcn 的 Vite 安装文档](https://ui.shadcn.com/docs/installation/vite)、[shadcn 的 Tailwind v4 文档](https://ui.shadcn.com/docs/tailwind-v4) 和 [Tailwind theme variables 文档](https://tailwindcss.com/docs/theme) 为准。
