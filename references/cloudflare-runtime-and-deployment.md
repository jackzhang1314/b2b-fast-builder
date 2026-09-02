# Cloudflare 运行与部署

用于 Cloudflare Pages、Pages Functions、D1、Resend、Turnstile、R2、Wrangler、域名和自动部署。Cloudflare 与 Resend 的命令、限制、权限和计费会变化；执行前调用 `$cloudflare` 并检索当前官方文档，不凭本文猜最新参数。

## 1. 固定架构

```text
React 静态预生成 HTML/CSS/JS
        ↓
Cloudflare Pages

访客提交询盘
        ↓
/api/inquiry Pages Function
        ↓
Turnstile 与字段校验
        ↓
D1 先保存询盘
        ↓
Resend 发送通知
        ↓
D1 更新邮件状态
```

媒体是独立策略：

- `local`：图片进入静态构建产物。
- `r2`：图片进入 R2，静态 HTML 引用正式媒体 URL。

使用 R2 不会把页面变成动态页面，也不要求 CMS。

## 2. 认证边界

本地交互式环境优先让用户完成一次 Wrangler OAuth：

```bash
npx wrangler login --use-keyring
npx wrangler whoami
```

用户只负责浏览器登录和授权；Agent 不要求用户把 OAuth Token 粘贴进聊天。

无浏览器的 CI/云端环境使用最小权限的 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。Token 只进入 CI Secret 或安全环境，不写入提交的环境文件、Skill、日志或前端。

首次未启用 R2、D1 或其他需要账户确认的产品时，用户可能需要完成控制台开通或结算确认。Agent 不能凭空创建账号权限、接受付费条款或取得域名所有权。

## 3. `local` 媒体模式

适用：单站、常规产品图片、无需运行时上传。

流程：

```text
原始图片
→ 校验版权与来源
→ 去除不必要元数据
→ 裁切/压缩/生成 WebP 或 AVIF
→ 规范文件名与 alt
→ 放入 public/assets 或框架约定目录
→ build
→ 随 Pages 部署
```

要求：

- 单文件和总文件数必须低于当前 Pages 计划限制。
- 首屏图与列表缩略图使用适合实际展示尺寸的版本。
- 文件名稳定、可读且避免碰撞。
- 不把原始超大摄影文件、视频或大型 PDF 塞进静态部署包。

## 4. `r2` 媒体模式

适用：同一品牌多站共享、大量图片、PDF/视频、大文件或媒体与构建包解耦。

推荐边界：

- 每个客户/品牌一个 Bucket，或有明确隔离规则的命名空间。
- 同一品牌的国家站和小语种站可共享该媒体库。
- 不同客户默认不共用 Bucket，避免权限、迁移和误删除互相影响。
- 生产读取使用客户控制的 `assets.example.com`，不使用 `r2.dev`。
- 对象 key 使用稳定业务路径和版本/hash，覆盖旧对象前考虑缓存与回滚。
- 代码保存对象 key 或正式公共 URL；不要把临时签名上传 URL 写入页面。

代表性自动化命令如下，执行前用当前 Wrangler `--help` 核对：

```bash
npx wrangler r2 bucket create "$R2_BUCKET_NAME"

npx wrangler r2 object put \
  "$R2_BUCKET_NAME/products/yf20/main.webp" \
  --file "./prepared/yf20-main.webp" \
  --content-type "image/webp" \
  --cache-control "public, max-age=31536000, immutable" \
  --remote
```

少量文件可用 Wrangler；批量同步使用经验证的 rclone 或 S3 兼容工具。R2 自定义域名可能需要 Cloudflare REST API、Terraform 或控制台；Agent 只有在用户授权目标账户和 Zone 后才能修改。

本方案没有 CMS，所以无需浏览器上传接口、presigned URL 和 R2 Binding。只有用户明确要求运行时上传时才设计这些能力，并重新评估是否应切换完整 `$b2b-builder`。

## 5. D1 询盘真源

最小表结构：

```sql
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  submission_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  country TEXT,
  message TEXT NOT NULL,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  inquiry_status TEXT NOT NULL DEFAULT 'new',
  email_status TEXT NOT NULL DEFAULT 'pending',
  resend_email_id TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
ON inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_email_status
ON inquiries(email_status, retry_count);
```

实际字段根据合格询盘定义调整。不要保存没有业务必要的敏感信息；日志默认脱敏。

## 6. 询盘请求顺序

1. 检查 method、origin、content-type 与 body 大小。
2. 校验 Turnstile、honeypot、字段长度和邮箱格式。
3. 使用客户端本次提交生成的 `submission_key` 去重。
4. 生成询盘 ID，先插入 D1，`email_status=pending`。
5. 调用 Resend，使用询盘 ID 派生稳定 Idempotency-Key。
6. 成功记录 `sent` 与 Resend ID；失败记录 `failed`、错误和次数。
7. 只要 D1 已保存，可向用户说明“需求已收到”；邮件失败进入补发，不把记录删除。

生产项目提供：

- 最近询盘查询。
- `failed`/长期 `pending` 查询。
- 有上限的补发命令或定时 Worker。
- 每日 D1 与邮件发送状态对账。

## 7. Pages 部署

代表性流程：

```bash
npm run typecheck
npm run lint
npm test
npm run build

npx wrangler pages project create "$PAGES_PROJECT_NAME"
npx wrangler d1 create "$D1_DATABASE_NAME"
npx wrangler d1 migrations apply "$D1_DATABASE_NAME" --remote
npx wrangler pages deploy dist --project-name "$PAGES_PROJECT_NAME"
```

项目已存在时复用，不重复创建。命令名称、参数和输出解析以当前官方文档为准。

Resend Key、Turnstile Secret 通过 Pages Secret 写入；普通收件地址和已确认的非敏感设置可放 Wrangler 配置。部署前检查 preview 与 production 使用的 Binding 和 Secret 是否一致但彼此隔离。

## 8. Agent 自动化边界

取得授权后，Agent 可以自动：

- 创建/复用 Pages、D1 和可选 R2。
- 执行 migration、上传媒体、写配置和 Secret。
- 构建、部署、查询 D1 和运行 smoke。
- 通过 API 配置已授权域名资源。

仍需用户完成或明确：

- 第一次 Cloudflare/Resend 登录和账户开通。
- 目标账户、域名、收件邮箱和付费范围。
- OAuth 授权或最小权限 Token。
- 最终域名切换与真实收件测试。

自动化脚本必须幂等：重复运行时先读取现状，复用正确资源；不得重复创建 Bucket、数据库、域名记录和 API Key。
