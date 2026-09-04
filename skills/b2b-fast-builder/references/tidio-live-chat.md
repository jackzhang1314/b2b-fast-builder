# Tidio 即时聊天接入

用于 Vite + React 构建期静态站的 Tidio 选择、账号引导、逐页脚本生成、隐私与验收。Tidio 是可选即时沟通入口，不是 D1、Resend 或站内 RFQ 的替代品。

## 1. 先记录需求，到安装时再注册

规划时只需记录是否需要聊天，不要求注册或提供代码。最迟在页面完成后的 [主动接入阶段](guided-launch.md) 对未决定的用户询问一次，不能等用户说“装聊天”。已同意且实际开始安装时才带注册；仅确认需求不触发账号步骤，已拒绝不重复问。说明：

- 聊天记录进入客户自己的 Tidio Project 和 Inbox；Agent 默认不能查看。
- 站内 RFQ 仍先写 D1、再由 Resend 通知；Tidio 故障或被拦截时不能让询盘入口消失。
- 套餐、消息额度、多语言和 AI 功能以用户注册时的当前页面为准，不承诺永久免费或所有功能可用。

到安装阶段且用户同意后，用通俗步骤引导：

1. 打开 [Tidio](https://www.tidio.com/) 注册或登录客户自己的账号。
2. 进入 `Settings → Live Chat → Installation → Manual install`。
3. 复制官方安装代码，或只复制 `code.tidio.co/` 后、`.js` 前的 Public Key。
4. 把安装代码或 Public Key 发给 Agent；不发送密码、验证码、Cookie 或私有 API Key。

用户暂不提供时继续建站，在交接中标记“未启用，可补装”，不得使用模板、示例或服务商账号的 Public Key。

### 面向小白的分轮话术

每轮只给当前一步；页面入口变化时读官方文档或看用户的非敏感截图，不反复让他找不存在的菜单。

1. **注册**：“先打开 Tidio，用你自己的邮箱注册。它负责网站右下角的在线聊天；注册好回复‘已注册’，不用发密码或验证码。”
2. **拿公开代码**：“打开 Settings（设置）→ Live Chat（在线聊天）→ Installation（安装）→ Manual install（手动安装），复制那段安装代码发给我。不是私有 API Key，也不用你自己改网站代码。”客户的注册引导若已给代码，可直接使用，不重复走菜单。
3. **Agent 安装**：检查公开脚本来源、当前 Project 与安装范围，生成全部目标 HTML、验证并按授权部署；不要求小白装 CLI，不擅自购买 AI 客服套餐。
4. **接收消息**：“以后在 Tidio 的 Inbox（收件箱）回复客户。你主要用电脑还是手机接待？”按选择带用户设置通知、营业时间、时区与离线留言；需要移动端时提供官方应用入口，由用户登录，不索取账号凭据。
5. **真实测试**：“我会发一条‘网站聊天测试-<编号>’，请打开 Inbox 看有没有收到，回复一下，我再检查网站这边能否看到。”无 Agent 发送能力时引导用户在匿名窗口测试，明确由用户完成。

气泡出现只证明脚本加载；用户能看到消息、能回复、离线时有对应提醒才算聊天接通。未核实的通知/套餐能力写成待确认，不承诺全天候自动接待。

## 2. 输入校验

Public Key 会公开出现在网页源码中，不按 Secret 管理，但必须确认属于客户当前 Project。

收到整段代码时只提取 `src`，并验证：

- URL origin 必须恰好是 `https://code.tidio.co`。
- pathname 必须是单个由字母和数字组成的 `<public-key>.js` 文件。
- 不接受 query、fragment、事件属性、附加 inline script 或其他第三方域名。

验证后由项目生成标准 loader，不原样粘贴用户提供的任意 HTML：

```html
<script src="https://code.tidio.co/<public-key>.js" async></script>
```

## 3. 静态多页安装

本 Skill 输出的是每条 route 各自拥有完整 HTML 的静态多页站，不是所有网址共用一个入口壳的 SPA。因此：

- 把 Tidio 配置加入站点契约或类型安全配置真源。
- 由共享 `renderDocument()`/完整文档模板在构建期把 loader 写到目标页面的 `</body>` 前。
- 默认覆盖全部公开业务页面；`/thank-you/`、404 或用户指定页面可通过集中式 include/exclude 规则排除。
- 不手工逐页粘贴，不在 React 业务组件用 `dangerouslySetInnerHTML`，也不能只修改根 `index.html`。
- loader 保留异步加载并使用明确的 `https://` URL；核心正文与站内 RFQ 不依赖它。
- preview 与 production 的开关必须分开，避免测试消息进入生产 Inbox。

`routes.json`、页面生成器、Tidio include/exclude 和集成测试必须共享同一 route resolver。启用后，质量闸门读取 route manifest，逐页验证 loader 的存在范围、官方 host、客户 Public Key 和唯一数量。

项目从本 Skill 复制 `scripts/validate-tidio-output.mjs` 与 `assets/tidio-config.example.json`，把示例改名为 `tidio.json` 并填写客户配置。质量闸门固定运行：

```bash
node scripts/validate-tidio-output.mjs dist routes.json tidio.json
```

`enabled: false` 时验证器会反向检查所有路由，防止模板 Public Key 或其他客户的 loader 被误带上线。

## 4. CSP、隐私和性能

如果网站启用 Content Security Policy，安装前读取 Tidio 当前的 [CSP 官方清单](https://developers.tidio.com/docs/widget-security-policy)，只加入真实需要的 `script-src`、`connect-src`、`img-src`、`media-src`、`font-src` 和样式规则；不要凭旧列表放宽为通配符。

目标市场涉及 GDPR、CIPA 或其他隐私要求时：

- 在隐私政策中说明 Tidio、收集字段、处理目的和第三方政策。
- 按业务法务结论决定立即加载还是同意后加载；需要时在 Pre-Chat Survey/Flow 增加明确同意。
- 不把聊天姓名、邮箱、电话或正文写入分析事件、日志或公开页面。

官方 loader 使用异步方式，但第三方网络和 widget 仍可能影响性能。PageSpeed、Lighthouse 和资源瀑布必须在正式域名、Tidio 实际启用时重测；若要延迟加载，先向用户说明可能减少即时对话，并以当前 [Widget SDK](https://help.tidio.com/hc/en-us/articles/5463607160860-Widget-SDK) 为准。

## 5. 验收

不能只看气泡出现。至少验证：

1. 构建后每个目标 HTML 恰好包含一个客户 loader，非目标 HTML 不包含。
2. 全新匿名窗口的桌面和手机端可见且不遮挡主 CTA、表单和同意控件。
3. 发送带唯一前缀的测试消息；由客户在自己的 Tidio Inbox 回读。
4. agent 在线、离线 ticket、Operating Hours 和通知设置符合客户工作方式。
5. CSP 控制台无阻断；隐私政策和必要同意已上线。
6. 阻止 `code.tidio.co`/Tidio 网络请求后，站内 RFQ 仍可独立提交。
7. 记录启用后的性能结果；不能拿未启用 Tidio 的测试分数代表正式站。

官方安装位置和当前后台入口以 [Tidio 安装文档](https://help.tidio.com/hc/en-us/articles/5378348485660-Install-Tidio-on-Your-Website) 为准；外观、移动端位置、语言、Pre-Chat Survey 和隐私提示以 [Widget 自定义文档](https://help.tidio.com/hc/en-us/articles/5398825058588-Customize-Your-Chat-Widget) 为准。
