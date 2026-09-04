# B2B Fast Builder

### 用 AI，把客户的搜索需求变成你的外贸网站。

面向外贸公司、工厂和 SEO 团队的建站 Skill，适合产品独立站、小语种站和细分市场站。

它是一套给 AI 的**建站工作规范、模板和检查工具**。导入 Codex、Claude Code 等具备文件和代码执行能力的 Agent 后，你提供业务资料、确认效果，AI 按流程规划页面、构建网站、接通询盘并协助后续更新。

[为什么用它](#ai-leverage) · [适用场景](#who) · [看懂架构](#architecture) · [快速开始](#quick-start)

<a id="ai-leverage"></a>
<a id="multi-site"></a>

## 1. 先找到采购需求，再用 AI 把网站做出来

> 网站不是你想展示什么就做什么，而是客户在谷歌搜什么、数据指向什么，就优先做什么。

例如，客户搜索“2 吨小型挖掘机”，页面就应该回答对应机型的参数、用途、交付和询价问题。这就是精准获客：**让正在找产品的买家找到你，而不只是让网站看起来漂亮。**

Skill 指导 Agent 结合关键词、搜索意图和行业对标，规划导航、产品分类和页面内容；没有数据的方向先标记待验证。

有了这套规划，AI 就能复用组件和真实产品资料，协助制作不同语言、不同市场的页面，减少重复设计、写作和维护工作。这也是它适合 **AI 多站运营与长尾 SEO** 的原因。

小语种机会要先看当地需求与现有内容的缺口。确实服务某个国家时，还可以考虑国家域名：例如 `.de` 能明确传递德国市场定位；Google 说明地域定向可能改善目标国家排名，但不是购买域名就自动获得高排名。[官方说明](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites#geotargeting)

**先验证一个市场，再扩展有效的方法。** 同一品牌可以先做语言目录；有不同产品或市场运营需求，再考虑独立站。多站不是处罚隔离工具，复制低价值内容也不会因换域名而合规。[Google 政策](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content)

<a id="who"></a>

## 2. 哪些情况适合用？

- **第一次做外贸独立站**：围绕真实产品和采购需求，建立询盘入口。
- **经常研究新品类的外贸公司**：先验证机会，再快速搭建产品站。
- **拓展小语种市场**：制作当地客户能搜索、能看懂的产品页面。
- **运营多个品牌或细分市场的团队**：复用建站与检查流程，各站独立维护。

本版**没有内容管理后台（CMS）**，适合通过 AI 修改内容、检查后重新发布。需要运营人员登录后台、多人审核或实时编辑，请选带 CMS 的完整版 `b2b-builder`。

<a id="architecture"></a>

## 3. 为什么这套架构适合 AI 建站？

| 架构选择 | 对你的实际价值 |
|---|---|
| 每个重要网址提前生成完整 HTML | 打开页面就能读取产品正文、参数和链接，减少对浏览器脚本的依赖 |
| React 复用页面组件 | 产品页沿用统一布局，新增产品、修改公共样式更方便 |
| 无 CMS，内容保存在项目文件中 | 上产品、换图、改文案交给 Agent，不必为每个站维护后台 |
| 询盘先保存到 D1，再通过 Resend 发邮件 | 邮件暂时失败，已保存的记录仍可查询；邮箱不是唯一存档 |
| 项目、域名与生产账号由你持有 | 后续可继续用具备相应能力的 Agent 更新，减少服务商绑定 |

静态不等于不能交互。客户仍能浏览菜单、填写表单；**询盘成功保存后才进入感谢页**，用于配置广告转化追踪。记录通过 D1 控制台或项目查询工具查看，本版不自带询盘管理后台。

<a id="languages-media"></a>

语言版本各有独立网址和提前生成的完整译文；默认图片随站部署，多站共享素材或有大文件时可选 **R2**。在线聊天可选 **Tidio**，聊天记录留在 Tidio，不替代站内询盘存档。

<a id="workflow"></a>

## 4. 从想法到上线，你只需逐步确认

1. **说清业务**：提供产品、目标客户、市场和参考网站。
2. **看三个样板页**：先做首页、分类页、详情页；你用日常语言或批注反馈。
3. **换成真实资料**：样式确认后，Agent 主动引导你上传公司介绍、产品参数和照片，再完成全站。
4. **按需接通服务**：到部署、邮件或聊天配置时，才引导注册和授权，不一开始就派发账号清单。
5. **验证并上线**：检查手机端和页面，部署后实际测试询盘存档、邮箱收件与感谢页，再交接更新方法。

默认采用专业 B2B 企业风格，重产品实拍与采购信息。预览占位素材须在正式发布前核实或替换；密码、验证码和私有 API Key 不发到普通聊天。

<a id="quick-start"></a>

## 5. 现在开始

**导入完整 Skill：**

- 支持子目录导入：[导入 b2b-fast-builder](https://github.com/jackzhang1314/b2b-fast-builder/tree/main/skills/b2b-fast-builder)。
- 只接受仓库链接：[使用仓库地址](https://github.com/jackzhang1314/b2b-fast-builder)，由工具扫描 `skills/`。
- 手动安装：复制整个 [skills/b2b-fast-builder](skills/b2b-fast-builder/) 文件夹，不要只复制 `SKILL.md`。

导入方式取决于工具能力；仅能聊天、不能操作项目的 AI 无法独立完成部署。

**然后把这段话发给 Agent：**

```text
使用 b2b-fast-builder，帮我做一个无 CMS 的外贸网站。

产品：[填写]
客户：[进口商 / 经销商 / 工厂采购等]
目标市场与语言：[填写]
关键词、参考网站和产品资料：[链接或附件，暂无也可以]

先规划产品分类，再做首页、分类页和详情页三个样板。
设计要专业、大气，适合 B2B 企业。
样式确认后，提醒我上传真实素材；需要上线时再引导注册服务。
每个重要网址生成完整 HTML，询盘先保存，再发到我的邮箱。
```

<a id="quality"></a>

## 6. 最后按什么标准验收？

- **页面完整**：网址各有 HTML；标题、导航、语言关系和站点地图正确。
- **内容可信**：真实产品与企业资料，不编造认证、案例或效果数字。
- **询盘可用**：手机端可提交，记录能查询，邮件能收到，感谢页正常跳转。
- **更新可持续**：交付内容位置、更新与部署方法；自动检查不通过就停止部署。

这些是 Agent 需要落实的交付要求，不是下载 Skill 就已完成的功能。本仓库提供规范、模板和验证脚本；实际成品以项目实现及测试为准。

<a id="technical"></a>

## 实施文档

<details>
<summary>开发者展开：技术栈、检查命令和参考文件</summary>

默认：**Vite + React + TypeScript 构建期静态生成**，不用 Next.js；样式使用 Tailwind CSS v4、语义 Token，按需引入 shadcn。

托管采用 **Cloudflare Pages**；询盘使用 **Pages Functions + Turnstile + D1 + Resend**。Cloudflare 当前推荐新项目优先考虑 Workers，本 Skill 尚未提供相应迁移流程。[平台说明](https://developers.cloudflare.com/pages/)

项目检查顺序：

```text
类型检查 → 代码检查 → 项目测试 → 构建全部 HTML
→ 传入 routes.json 验证 → 检查集成 → 通过后部署
```

已有验证器回归测试：

```bash
node skills/b2b-fast-builder/scripts/test-validate-static-output.mjs
node skills/b2b-fast-builder/scripts/test-validate-tidio-output.mjs
```

当前静态验证器按单站域名验证；多语言还需落实对应检查，不是现成的跨站管理台或一键翻译引擎。定时更新、跨站调度及数据看板需另行配置或开发。

- [Skill 入口](skills/b2b-fast-builder/SKILL.md)
- [页面规划](skills/b2b-fast-builder/references/b2b-planning-and-conversion.md) · [静态 HTML 与多语言](skills/b2b-fast-builder/references/static-seo-contract.md)
- [视觉设计](skills/b2b-fast-builder/references/frontend-design-system.md) · [真实素材交接](skills/b2b-fast-builder/references/content-and-asset-handoff.md)
- [主动上线引导](skills/b2b-fast-builder/references/guided-launch.md) · [账号与域名配置](skills/b2b-fast-builder/references/account-and-domain-onboarding.md)
- [部署与媒体](skills/b2b-fast-builder/references/cloudflare-runtime-and-deployment.md) · [Tidio 聊天](skills/b2b-fast-builder/references/tidio-live-chat.md)
- [自动化检查](skills/b2b-fast-builder/references/automated-quality-gate.md) · [测试与交接](skills/b2b-fast-builder/references/testing-and-handoff.md)

</details>

<a id="faq"></a>

## 费用、效果与许可

- **不是零成本或效果保证**：自然搜索不按点击收广告费，但工具、域名、托管和维护可能收费；不保证收录、询盘或永久 PageSpeed 满分。
- **可迁移不等于零改动**：静态前端可换兼容托管平台，数据库、邮件等集成仍需适配。
- **许可待明确**：本仓库尚未附带 `LICENSE`，公开可见不等于已授予任意商业使用或再分发许可；第三方代码和素材遵守各自许可。

遇到问题可提交 Issues，附 Agent 名称、复现步骤和脱敏报错，不上传密钥或真实客户询盘。
