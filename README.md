# B2B Fast Builder

### 外贸独立站 AI 站群方案

**用 AI 建设和维护多个细分产品站、小语种本地站，以较低成本覆盖 Google 长尾采购需求，争取更多自然搜索询盘。**

这套方案面向希望拓展海外获客渠道的外贸公司、工厂和 SEO 团队。核心不是只做一个漂亮网站，而是把“研究需求、建站、发布内容、接收询盘、持续更新”变成一套可以反复使用的流程，逐步扩展到更多产品和市场。

**免费额度起步 · 无需 CMS · AI 持续更新 · 完整静态 HTML · 询盘先存档再通知**

本仓库将这套流程封装为 Skill。导入具备文件、代码执行和部署能力的 AI Agent，由它按规范完成项目；你提供真实业务资料，确认内容、样式与必要授权。

[方案思路](#multi-site) · [成本优势](#cost) · [无需 CMS](#no-cms) · [小语种布局](#languages) · [开始使用](#quick-start)

<a id="multi-site"></a>

## 一、用多个有明确定位的网站，覆盖更多采购需求

海外客户找产品，不只有一个大词。他可能按产品规格、使用场景、适配型号寻找供应商，也可能使用自己国家常用的语言和叫法。

这些更具体的搜索，就是我们要研究的长尾需求。

一个团队可以围绕不同产品和市场，逐步建设一组外贸独立站：每个站专注自己的产品、买家和服务范围，每个页面回答具体的采购问题。

例如：设备整机站介绍机型与选型；配件站回答规格与适配；面向德国客户的站点，则用当地搜索用语解释产品、交付和售后。这些是规划示例，具体方向仍需搜索数据验证。

**网站数量带来更多布局空间，真正产生价值的是每个站承接的需求。** 同一业务中高度重合的需求可以放在同站分类页，不必为每个近义词另建一个域名。

<a id="cost"></a>

## 二、为什么能把建站与运行成本压低？

传统多站运营，容易变成多套后台、多套插件、多份更新工作。本方案把产品页面提前生成，内容交给 AI Agent 维护，让每增加一个站时的重复工作更少。

| 环节 | 本方案怎么做 | 节省在哪里 |
|---|---|---|
| 页面建设 | 复用 React 组件、内容结构与建站流程 | 同类页面不必每次从头开发 |
| 内容更新 | Agent 修改资料并重新发布 | 不必逐站搭建和维护 CMS |
| 网页访问 | 提前生成静态 HTML，交给 Cloudflare Pages | 普通产品浏览不必每次运行服务端页面渲染 |
| 询盘接收 | D1 保存记录，Resend 发邮件 | 可以从现有免费额度起步 |
| 产品图片 | 默认随站发布，需要共享时再用 R2 | 普通项目不用先配置独立图片服务 |

Cloudflare Pages 对不触发 Functions 的静态资源请求免费；询盘接口另计额度。D1 和 Resend 也提供免费方案。[Pages 计费](https://developers.cloudflare.com/pages/functions/pricing/)、[D1 计费](https://developers.cloudflare.com/d1/platform/pricing/)、[Resend 计费](https://resend.com/pricing)

**在免费额度覆盖的范围内，核心托管、询盘存档和邮件通知可以不产生服务费。** 域名、AI 工具、内容审核和超额用量仍需预算，所以这是一套低成本方案，不是无限网站永久零成本。

<details>
<summary>扩展网站数量前，检查哪些额度？</summary>

截至 2026-09-05：

- Pages 每账号有 100 个项目的限制，免费方案提供每月 500 次构建；文件数量、大小也有限制，不等于无限站点。[Pages 限制](https://developers.cloudflare.com/pages/platform/limits/)
- Pages Functions 与 Workers Free 共用每日 100,000 次请求额度，不是每个站各送一份。[Functions 计费](https://developers.cloudflare.com/pages/functions/pricing/)
- D1 免费方案每账号最多 10 个数据库，每库最大 500 MB、总计 5 GB，并有读写限制。如果每站独立建库，要把数据库数量一起纳入预算；达到限制可能导致写入失败。[D1 限制](https://developers.cloudflare.com/d1/platform/limits/)、[D1 计费](https://developers.cloudflare.com/d1/platform/pricing/)
- Resend 免费方案为每月 3,000 封、每日 100 封邮件，支持 3 个发信域名。网站域名和邮件发信域名是两回事；若各站都要独立发信身份，需另外评估套餐。[Resend 计费](https://resend.com/pricing)

按账号、项目和所选服务核算，不能把免费额度简单乘以网站数量。规模超过本方案限制时，需要另行评估托管架构和付费方案。

</details>

<a id="no-cms"></a>

## 三、有了 AI Agent，这类网站可以不需要 CMS

CMS 就是登录后上产品、换图、写文章的内容管理后台。对于允许修改后重新发布的产品站，这些操作可以直接交给 AI Agent。

你可以这样告诉它：

> 把这三款产品加到德语站，使用我上传的图片和参数，先给我检查，再发布。

> 更新这款设备的交期，并检查受影响的页面。

Agent 修改项目中的内容文件，生成网页，完成检查后重新部署。**没有 CMS，不代表不能更新；只是把更新入口从管理后台，换成了 AI Agent。**

当你运营多个站时，这个取舍尤其有价值：不用为每个站再维护一套后台、插件和运营账号。页面组件与更新流程可以复用，真实产品信息仍分别核对。

如果团队需要多人审核、后台实时编辑或复杂内容权限，仍应选择带 CMS 的版本。定时更新也需要支持调度的 Agent 或额外配置，并非本仓库自带的常驻服务。

<a id="languages"></a>

## 四、小语种网站与国家域名，怎么配合？

面向不同国家，不只是把英文换成另一种语言，还要考虑客户实际怎么搜、使用什么单位、关心哪些采购条件。

本方案的做法是：

1. **找当地需求**：研究目标市场的搜索用语、竞争网站和内容缺口。
2. **制作本地化页面**：AI 根据真实资料协助翻译和整理，核对产品术语、参数及交付信息。
3. **配置合适的网址**：为对应国家选择可注册的国家域名，或按业务需要使用语言目录。
4. **生成完整 HTML**：每种语言的页面有独立网址和正文，不依赖访问时临时翻译。

例如，`.de` 明确指向德国市场。国家域名能提供清晰的地域定位信号，Google 也说明地域定向可能改善目标国家的排名；这种优势应与当地语言和真实业务内容结合，而不是只靠域名后缀。[Google 官方说明](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites#geotargeting)

国家与语言不是一一对应的。我们按“目标国家 + 客户语言 + 服务范围”布局，不机械地给每种语言分配一个国家域名。

**先找到当地客户没有被充分满足的需求，再用 AI 降低补齐这些内容的成本。** 这是小语种布局的机会来源，不是默认所有小语种都低竞争。

## 五、网站怎样把搜索访问接成询盘？

> 网站不是你想展示什么就做什么，而是客户在谷歌搜什么、数据指向什么，就优先做什么。

Skill 指导 Agent 根据关键词、修饰词和采购意图安排导航、分类页与产品页。同一需求的不同说法可以由一页回答，需求不同再拆页，避免堆出大量内容相同的页面。

每个重要网址提前生成完整 HTML，产品标题、正文、参数和内部链接直接包含在页面中，为搜索引擎读取内容提供基础。

客户提交表单后，执行这条流程：

```text
校验表单 → D1 保存询盘 → Resend 邮件通知 → 感谢页与转化追踪
```

记录保存成功后才进入感谢页；邮件暂时失败，已经入库的询盘仍可查询和按项目实现补发。数据库写入失败则保留表单并提示，不能假装提交成功。

这不是自带询盘后台的 CRM：记录通过 D1 控制台或项目查询工具查看。可选 Tidio 即时聊天，其对话留在 Tidio，不替代站内表单存档。

## 六、实际使用：先做好样板，再复用到更多站

1. **你和 AI 确认方向**：提供产品、买家、目标市场和现有资料，规划首个站的页面。
2. **先做三个样板页**：首页、分类页、详情页，确认专业 B2B 企业风格，再扩展全站。
3. **换成真实内容**：Agent 主动引导你上传公司介绍、参数表和产品照片，核对后替换预览素材。
4. **接通并测试**：到需要时才引导配置 Cloudflare、邮件和所选聊天，部署后测试真实询盘。
5. **复用与持续更新**：保留已验证的组件和流程，为下一个品类或国家调整内容、域名与收件配置，逐站检查发布。

每个站保留自己的内容、配置和回退方法。同一品牌的素材可按需共用 R2；不同客户的素材和询盘必须隔离。

本仓库提供的是可重复执行的建站规范、模板与验证脚本，**不是已经内置批量发站、统一调度和跨站经营看板的 SaaS 平台**。实际功能由 Agent 在项目中构建和验证。

## 七、适合哪些团队？

- **外贸公司**：经常研究新品类，计划用多个产品站承接细分采购需求。
- **工厂和工贸企业**：已有真实产品与交付能力，准备拓展多个国家和语言市场。
- **SEO 服务团队**：需要重复交付、维护多个 B2B 询盘站，希望减少建站和后台维护工作。

<a id="quick-start"></a>

## 八、开始使用

将完整 [b2b-fast-builder Skill 目录](https://github.com/jackzhang1314/b2b-fast-builder/tree/main/skills/b2b-fast-builder) 导入你的 Agent。只支持仓库扫描的工具，可使用 [仓库地址](https://github.com/jackzhang1314/b2b-fast-builder)。不要只复制 `SKILL.md`，还需要配套参考、模板与脚本。

然后发送：

```text
使用 b2b-fast-builder，帮我执行外贸独立站 AI 站群方案。

我的产品：[填写]
目标买家：[填写]
计划布局的国家与语言：[填写]
关键词、参考站和产品资料：[链接或附件]

先规划各站的定位与区别，再完成第一个站的样板和询盘流程。
采用无 CMS、完整静态 HTML，由 AI 协助后续更新。
优先使用免费额度，扩展前告诉我账号限制和预计新增成本。
先看设计，再收集真实素材；需要哪个服务时再引导配置。
首站确认后，复用已验证的方法逐步建设其他网站。
```

你控制域名、生产账号和项目资料；Agent 在得到相应权限后操作。密码、验证码与私有 API Key 不发到普通聊天，按引导使用官方授权或安全配置渠道。

## 九、交付与使用边界

- **能检查的要实测**：静态 HTML、页面标题、规范网址、语言标记、站点地图、手机端、表单、收件与感谢页都应检查，失败不得直接发布。
- **效果用数据验证**：收录、排名、访问和询盘分别观察；不把 PageSpeed 满分当成排名保证，也不把网站数量当成询盘数量。
- **多站仍需真实价值**：AI 与多域名不提供处罚豁免，不能用复制站或规模化低价值页面掩盖内容问题。[Google 搜索政策](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content)

## 技术与实施文档

<details>
<summary>展开查看技术组成与实施规范</summary>

- 页面：Vite + React + TypeScript，构建时为每个重要网址生成完整 HTML，默认不用 Next.js。
- 样式：Tailwind CSS v4、统一语义 Token，按需使用 shadcn；以真实产品和采购信息为设计中心。
- 托管与询盘：Cloudflare Pages + Pages Functions + Turnstile + D1 + Resend。
- 可选增强：R2 共享媒体、Tidio 即时聊天。
- 更新：修改内容源文件，检查、重建并部署；静态前端可迁移，数据库与邮件集成迁移需要适配。

当前 Skill 使用 Pages；Cloudflare 已提供面向更大规模的其他托管路线，本仓库没有因此自动切换架构。超出项目限制时须另行选型。

实施入口与参考：

- [Skill 入口](https://github.com/jackzhang1314/b2b-fast-builder/blob/main/skills/b2b-fast-builder/SKILL.md)
- [页面规划](https://github.com/jackzhang1314/b2b-fast-builder/blob/main/skills/b2b-fast-builder/references/b2b-planning-and-conversion.md)
- [静态 HTML 与多语言](https://github.com/jackzhang1314/b2b-fast-builder/blob/main/skills/b2b-fast-builder/references/static-seo-contract.md)
- [主动上线引导](https://github.com/jackzhang1314/b2b-fast-builder/blob/main/skills/b2b-fast-builder/references/guided-launch.md)
- [部署、询盘与图片](https://github.com/jackzhang1314/b2b-fast-builder/blob/main/skills/b2b-fast-builder/references/cloudflare-runtime-and-deployment.md)
- [自动化检查](https://github.com/jackzhang1314/b2b-fast-builder/blob/main/skills/b2b-fast-builder/references/automated-quality-gate.md)

</details>

仓库目前尚未附带 `LICENSE`；公开可见不等于已经授予任意商业使用或再分发许可。第三方代码、图片和其他素材遵守各自许可。
