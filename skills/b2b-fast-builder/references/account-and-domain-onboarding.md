# 账号与域名接入

用于第一次正式上线：建立客户自己的 Cloudflare 与 Resend 账号、把网站域名接入 Cloudflare DNS、验证发信域名并安全保存 API Key。界面、权限名和命令会变化，执行时重新读取 Cloudflare 与 Resend 官方文档。

## 1. 默认决策

极速建站默认采用：

```text
域名继续在原注册商续费
        ↓
Nameserver 指向 Cloudflare
        ↓
Cloudflare 统一管理 DNS、Pages 域名与 SSL
        ↓
Resend 的验证记录也写入 Cloudflare DNS
```

这叫把 Cloudflare 设为权威 DNS，不是转移域名注册商。客户仍在原购买平台拥有并续费域名。

以下情况不要强制迁移整站 DNS：

- 客户有 IT 团队、企业级 DNS、复杂邮件系统或合规限制。
- 只能发布一个子域名，且现有 DNS 提供商允许添加指向 Pages 的 CNAME。
- 用户明确要求保留现有权威 DNS。

Cloudflare Pages 的根域名接入通常要求该域名成为同一 Cloudflare 账号中的 Zone；外部 DNS 可用子域名 CNAME，但自动化会分散到两个平台。

## 2. 客户看到的四步

不要把后面的技术清单原样丢给客户。客户界面只展示四步：

1. **告诉我网站地址。** 输入域名、在哪里买的，以及接收询盘的邮箱。
2. **连接 Cloudflare。** 点击按钮，在弹出的 Cloudflare 页面登录并授权；完成后回到当前流程。
3. **让域名指向新网站。** 系统给出两行内容并打开对应购买平台的设置说明，客户只需复制、保存并点击“我已经完成”。
4. **连接询盘邮件。** 登录 Resend，按引导完成一次授权；如果需要 API Key，只粘贴到带掩码的“邮件发送密钥”安全框。

其余动作由 Agent 完成，并用“检查中、已完成、需要你操作”三个状态反馈。默认隐藏 Zone、DNS、MX、DKIM、D1、Binding 等术语；需要客户操作时，既显示页面上的真实字段名，也用一句白话解释用途。

按 [客户接入表单模板](../assets/onboarding-intake.example.yaml) 收集信息。能从仓库、公开 DNS、Cloudflare 或已授权账户读取的字段，不重复向客户提问。

## 3. 输入框与授权边界

可以进入普通对话框或表单：

- 网站域名和购买平台名称。
- 接收询盘的邮箱。
- 是否正在使用企业邮箱、旧网站和其他子域名。
- 原 DNS 导出文件、公开记录列表或解析页面截图。
- 公司名称、发件人显示名称等非敏感设置。

只能进入专用安全输入框：

- Resend API Key。
- Cloudflare API Token。
- 注册商 API Token。

不能收集到聊天或普通表单：

- 账号密码、短信验证码、双重验证代码。
- Global API Key、恢复码和浏览器 Cookie。

安全输入框必须带掩码，直接写入目标平台 Secret 或本机安全凭据存储；Agent 输出、日志、录屏、分析事件和错误提示均不得回显其值。

## 4. 账号归属

- Cloudflare、Resend、域名注册商和 Git 仓库默认都属于客户。
- 用户自己完成注册、登录、服务条款、套餐选择、付费确认和双重验证。
- Agent 可以打开正确页面、检查状态并在授权后配置资源，但不能代替用户拥有账号。
- 不让用户把 API Key、OAuth Token 或注册商密码粘贴到聊天；优先使用浏览器授权、CLI 安全输入或平台 Secret 表单。

## 5. 把现有域名接入 Cloudflare

按以下顺序执行，不能跳过 DNS 盘点：

1. 用户注册或登录自己的 Cloudflare 账号。
2. 添加根域名，例如 `example.com`，取得 Cloudflare 分配的两条 Nameserver。
3. 导出并核对原 DNS，至少覆盖 A、AAAA、CNAME、MX、TXT、CAA、SRV、DKIM、DMARC 和各类平台验证记录。Cloudflare 自动扫描只能作为起点，不能当作完整备份。
4. 在 Cloudflare 补齐缺失记录，特别确认企业邮箱和验证记录不会中断。
5. 如果原注册商启用了 DNSSEC，先按官方迁移流程关闭旧 DNSSEC/DS。
6. 用户登录原域名注册商，把 Nameserver 替换成 Cloudflare 给出的两条。这一步只有在注册商 API 已单独授权时才能由 Agent 自动完成。
7. 等 Cloudflare Zone 变为 Active，逐项验证网站、企业邮箱和关键子域名。
8. 在 Cloudflare 重新启用 DNSSEC，并按要求把 DS 信息写回注册商。
9. 通过 Pages 项目的 Custom domains 流程绑定根域名和 `www`，不要只手工添加 CNAME 而跳过 Pages 关联。

切换 Nameserver 属于生产变更。执行前保存旧 Nameserver、完整 DNS 导出和回滚步骤；目标域名不清楚时停止。

## 6. Resend 小白接入流程

### 用户必须完成

1. 在 Resend 注册或登录自己的账号。
2. 确认真实收件邮箱，即网站询盘最终通知到哪里。
3. 在 Resend 的 Domains 页面添加一个客户拥有的发信域名。默认优先使用专用子域，例如 `notify.example.com`，把网站询盘邮件与其他邮件信誉隔离。
4. 如果域名已由 Cloudflare 管理，优先点击 Resend 的 **Sign in to Cloudflare**，由 Domain Connect 自动写入验证记录；用户在浏览器中确认授权即可。
5. 等待发信状态变为 Verified。自动验证失败时，再逐条核对 Resend 返回的 SPF、DKIM 和 MX 记录；DMARC 在基础验证后按业务策略补充。
6. 创建生产 API Key：命名为项目名加环境名，权限选择 **Sending access**，并限制到刚验证的发信域名。Key 只显示一次。
7. 通过 Cloudflare Pages 的 Secret 输入框或当前 Wrangler 安全提示，把 Key 保存为 `RESEND_API_KEY`；不要写入源码、普通变量、提交文件、日志或聊天。
8. 确认发件人名称、From 地址和收件地址。Resend 验证域名后不要求额外创建 sender，但 From 必须使用已验证域名；建议使用真实可接收回复的地址。

### Agent 接着完成

1. 在 Pages Function 中读取 `RESEND_API_KEY`，配置 `FROM_EMAIL`、`TO_EMAIL` 和经过校验的 `Reply-To`。
2. 发件地址可使用 `Website Inquiry <lead@notify.example.com>`；访客邮箱只作为经过校验的 Reply-To，不能作为 From。
3. 发送测试询盘，确认 D1 先入库、Resend 返回发送 ID、真实收件箱收到邮件、回复目标正确，并完成 `/thank-you/` 跳转。
4. 记录发信域名、Key 名称和 Secret 名称，不记录 Key 的值。

Resend 默认测试域只能把测试邮件发到该 Resend 账号自己的邮箱。正式向其他收件人发信前，必须验证客户自己的域名并把 From 改为该域名。

## 7. 自动化边界

用户完成一次身份与所有权确认后，Agent 可以自动：

- 用 Cloudflare API 创建或读取 Zone、Pages 项目和自定义域名。
- 用 Cloudflare API 写入 Pages、Resend、DKIM、SPF、DMARC 和其他 DNS 记录。
- 触发并检查 Resend 域名验证、保存 Pages Secret、部署网站并运行 smoke test。
- 生成客户只需操作一次的 Nameserver 清单和核对说明。
- 根据客户提供的 DNS 导出或截图整理记录，先生成变更预览，经确认后再写入 Cloudflare。

需要的授权按最小权限拆分：Pages 使用账号级 Pages Edit；DNS 记录使用目标 Zone 的 DNS Write/Read；创建 Zone 还需要 Zone Edit。Wrangler 主要管理开发平台资源，通用 DNS 记录自动化使用 Cloudflare REST API 或受控 IaC。

Agent 不能在没有额外授权时自动：

- 注册 Cloudflare 或 Resend 账号、接受条款或购买套餐。
- 登录任意域名注册商并修改 Nameserver。
- 创建第一个可管理 Resend 账号资源的凭据。若用 Resend API 自动创建域名，仍需已有的全权限凭据；完成初始化后应撤销临时全权限 Key，运行时只保留域名受限的 Sending access Key。
- 猜测并覆盖现有 DNS、删除旧邮件记录或更改真实收件地址。

## 8. 用户交互策略

按“能自动就自动，不能自动才引导”的顺序处理：

1. Agent 先读取现状并自动填充已知信息。
2. 缺少普通资料时，使用一次只问 1—3 个问题的输入框。
3. 需要登录时直接打开官方授权页面，不让客户自己寻找菜单。
4. 需要客户在注册商操作时，提供平台对应入口、要复制的两行内容和完成按钮。
5. 自动化前先展示“将保留什么、将修改什么”；生产 DNS 写入和 Nameserver 切换必须获得明确确认。
6. 完成后只显示业务结果：网站已打开、询盘已保存、邮件已收到、域名已生效。技术详情折叠展示，供排错和交接使用。

不要要求小白执行终端命令、理解记录类型或在多个控制台来回复制。只有自动化接口不可用时，才退回截图式逐步引导。

## 9. 上线门禁

以下条件全部满足才算账号与域名接入完成：

- 账号、域名、仓库和生产资源归属已记录且由客户控制。
- Cloudflare Zone 为 Active，根域名、`www`、HTTPS 与 canonical host 正常。
- 原有企业邮箱和关键 DNS 记录在 Nameserver 切换后仍正常。
- Resend 发信域名为 Verified，运行时 Key 是域名受限的 Sending access。
- `RESEND_API_KEY` 只存在于 Secret，Git 与前端 bundle 中不存在。
- 一条真实测试询盘完成 D1、邮件、感谢页和转化事件闭环。
- 旧 Nameserver、DNS 导出、回滚方法和后续责任人已经交接。
