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
| `npm run check:search` | 验证中文搜索可用、且无无关结果 |
| `npm run check:pages` | 验证暗色模式与「最后更新」时间正常 |
| `npm run verify` | 构建 + 上面三项检查，一条命令跑完 |

> `npm run verify` 也是 CI 里实际执行的命令：任何一项检查不过，
> 部署就会中止，不会把坏掉的站点发上线。

## 写一篇新文章

```bash
npm run new "我的第一篇文章"
```

这会在 `docs/posts/` 下生成一个 Markdown 文件。接着：

1. 打开文件写正文，**记得填 frontmatter 里的 `title` 和 `date`**
   （`date` 决定排序，缺失会排到最后并给出构建警告）；
2. 推送到 GitHub，网站会自动更新。

**不需要手动改侧边栏。** 左侧导航和文章底部的「上一篇/下一篇」
都是在构建时扫描 `docs/posts/` 目录生成的，新增或删除文章会自动同步。
同理，删文章只要删掉 `.md` 文件即可，不会留下死链。

排序规则：按 frontmatter 的 `date` 从新到旧。列表中的顺序即阅读顺序 ——
「上一篇」是更新的文章，「下一篇」是更旧的文章；最后一篇（最旧）的
「下一篇」位置会显示「回到文章归档」。

## 用 Obsidian 写作

可以直接把 Obsidian 里的笔记复制进来，以下语法都已支持：

| 语法 | 效果 |
| --- | --- |
| `[[你好，世界]]` | 站内链接，**按标题或文件名**匹配 |
| `[[你好，世界\|点这里]]` | 自定义显示文字 |
| `![[图片.png]]` | 嵌入图片（文件放 `docs/public/` 下） |
| `==高亮==` | 高亮 |
| `%%注释%%` | 直接删掉，不会出现在页面上 |
| `[^1]` + `[^1]: 内容` | 脚注 |
| `$x^2$`、`$$...$$` | 数学公式 |
| `- [ ]` / `- [x]` | 任务列表复选框 |
| ` ```mermaid ` | 流程图等，跟随深浅色主题 |
| `> [!note] 标题` | 提示框（和 VitePress 的 `::: tip` 等价） |

实现在 `docs/.vitepress/markdown-plugins.mts` 与 `config.mts` 的 `markdown.config`。

**几点需要注意：**

- **维基链接找不到目标时不会生成死链**，而是原样显示 `[[xxx]]` 并在构建日志里
  告警。这样写错字不会把整个部署搞挂，但也意味着要留意构建输出。
- **`![[笔记]]` 只能嵌入图片**，不支持把另一篇笔记的正文嵌进来
  （Obsidian 的 transclusion）。指向笔记时会被忽略并告警。
- **Mermaid 会让构建变慢**：从约 3 秒增加到约 22 秒，产物从 1.2 MB 增加到 6 MB。
  这些额外体积是**按需加载**的 —— 不含图表的页面完全不会下载（首页只加载约 172 KB）。
  如果不需要图表，去掉 `theme/index.ts` 里的 `MermaidDiagram` 注册即可恢复原来的构建速度。

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
│  │     ├─ Layout.vue          # 底部「上一篇/下一篇」及归档兜底
│  │     └─ custom.css          # 自定义样式（换主题色改这里）
│  ├─ public/                   # 静态资源，按原样拷贝
│  │  ├─ logo-light.jpg         # 浅色模式标志（黑字）
│  │  ├─ logo-dark.jpg          # 深色模式标志（白字）
│  │  └─ favicon.svg
│  ├─ posts/                    # 文章目录
│  │  ├─ index.md               # 文章归档页
│  │  └─ *.md                   # 各篇文章
│  ├─ index.md                  # 首页
│  └─ about.md                  # 关于页
├─ scripts/
│  ├─ new-post.mjs              # 新建文章脚本
│  ├─ check-links.mjs           # 站内链接自检
│  ├─ check-search.mjs          # 中文搜索自检
│  └─ check-pages.mjs           # 暗色模式 / 更新时间自检
├─ .github/workflows/deploy.yml # 自动部署配置
└─ package.json
```

## 一些说明

- **图片**放在 `docs/public/` 下，引用时写 `/图片名.png`。
- **标志分日间/夜间两张**：`logo-light.jpg`（黑字，浅色模式）和
  `logo-dark.jpg`（白字，深色模式）。VitePress 1.6 没有内置的 `logoDark`，
  所以由 `custom.css` 里两条 `.dark ... { content: url('/logo-dark.jpg') }`
  按主题替换导航栏和首页头图。换标志时**两个文件一起换**，尺寸建议 640×640
  （头图最大显示 320px，640 刚好覆盖 2 倍屏，再大只是浪费流量）。
- **站内链接**不要带 `.md` 后缀，写成 `/posts/hello-world`；从首页这类同目录文件
  跳转时相对路径 `./posts/hello-world` 也可以。
- **改主题色**：编辑 `docs/.vitepress/theme/custom.css` 里的 `--vp-c-brand-*` 变量。
- **搜索**是本地索引，构建时自动生成，不需要任何第三方服务。
  中文分词用的是二元切分（bigram），配置在 `config.mts` 的
  `search.options.miniSearch.options.tokenize`。
  > 为什么不用 `Intl.Segmenter`：它会把「博客」拆成「博」「客」两个单字，
  > 导致搜索结果又杂又不准。二元切分不需要词典，召回和精度都更稳。
- **frontmatter 不会被索引**。首页那些 `features` 写在 frontmatter 里，
  所以搜不到；想让它可被搜索，需要写进正文。
- **`base` 路径**在 `config.mts` 中为 `'/'`。仓库名是 `Oblivisera.github.io`
  时保持不动；若改成别的仓库名，需改为 `'/<仓库名>/'`。

## 首次部署到 GitHub

仓库里已包含 `.github/workflows/deploy.yml`。推送代码后，到仓库
**Settings → Pages**，把 **Source** 设为 **GitHub Actions**，等待第一次构建完成。
