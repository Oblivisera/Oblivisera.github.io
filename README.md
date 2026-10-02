# Oblivisera 的博客

个人博客，基于 [VitePress](https://vitepress.dev) 构建，部署在 GitHub Pages。

上线地址：<https://oblivisera.github.io/>

## 快速开始

```bash
npm install       # 首次运行，安装依赖
npm run dev       # 本地开发，浏览器打开 http://localhost:5173
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器，改文件即时刷新 |
| `npm run build` | 构建到 `docs/.vitepress/dist` |
| `npm run preview` | 本地预览构建结果（上线前的最终检查） |
| `npm run new "标题"` | 新建一篇文章，自动生成 frontmatter |
| `npm run check:links` | 检查构建产物里有没有失效的站内链接 |

## 写一篇新文章

```bash
npm run new "我的第一篇文章"
```

这会在 `docs/posts/` 下生成一个 Markdown 文件。接着：

1. 打开文件写正文；
2. 在 `docs/.vitepress/config.mts` 的 `sidebar` 里加一行，文章才会出现在左侧导航：

   ```ts
   { text: '我的第一篇文章', link: '/posts/my-first-post' }
   ```

3. 本地预览确认后推送到 GitHub，网站会自动更新。

## 发布流程

推送到 `main` 分支即可，GitHub Actions 会自动构建并发布：

```bash
git add .
git commit -m "新增文章：xxx"
git push
```

大约一两分钟后，<https://oblivisera.github.io/> 就会更新。

## 目录结构

```
.
├─ docs/                        # 网站根目录，只有这里的内容会被发布
│  ├─ .vitepress/
│  │  ├─ config.mts             # 全站配置：导航、侧边栏、搜索、主题
│  │  └─ theme/
│  │     ├─ index.ts            # 主题入口
│  │     └─ custom.css          # 自定义样式（换主题色改这里）
│  ├─ public/                   # 静态资源，按原样拷贝
│  │  ├─ logo.svg
│  │  └─ favicon.svg
│  ├─ posts/                    # 文章目录
│  │  ├─ index.md               # 文章归档页
│  │  └─ *.md                   # 各篇文章
│  ├─ index.md                  # 首页
│  └─ about.md                  # 关于页
├─ scripts/
│  ├─ new-post.mjs              # 新建文章脚本
│  └─ check-links.mjs           # 链接自检脚本
├─ .github/workflows/deploy.yml # 自动部署配置
└─ package.json
```

## 一些说明

- **图片**放在 `docs/public/` 下，引用时写 `/图片名.png`。
- **站内链接**不要带 `.md` 后缀，写成 `/posts/hello-world`；从首页这类同目录文件
  跳转时相对路径 `./posts/hello-world` 也可以。
- **改主题色**：编辑 `docs/.vitepress/theme/custom.css` 里的 `--vp-c-brand-*` 变量。
- **搜索**是本地索引，构建时自动生成，不需要任何第三方服务。
- **`base` 路径**在 `config.mts` 中为 `'/'`。仓库名是 `Oblivisera.github.io`
  时保持不动；若改成别的仓库名，需改为 `'/<仓库名>/'`。

## 首次部署到 GitHub

仓库里已包含 `.github/workflows/deploy.yml`。推送代码后，到仓库
**Settings → Pages**，把 **Source** 设为 **GitHub Actions**，等待第一次构建完成。
