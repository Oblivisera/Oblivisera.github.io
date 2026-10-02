---
title: 用 VitePress 搭建博客
date: 2024-05-18
description: 从零开始，到部署上线 GitHub Pages 的完整流程
---

# 用 VitePress 搭建博客

这篇记录这个博客本身的搭建过程，方便以后换机器时照着再来一遍。

## 前置条件

- Node.js 18 或更高版本
- Git
- 一个 GitHub 账号

## 一、安装依赖

```bash
npm install
```

如果还没装过，等价于：

```bash
npm install -D vitepress
```

## 二、目录结构

```
Oblivisera.github.io/
├─ docs/                      # 网站根目录
│  ├─ .vitepress/
│  │  ├─ config.mts           # 全站配置：导航、侧边栏、搜索
│  │  └─ theme/               # 自定义主题与样式
│  ├─ public/                 # 原样拷贝的静态资源（图标等）
│  ├─ posts/                  # 文章目录
│  └─ index.md                # 首页
├─ .github/workflows/         # 自动部署脚本
└─ package.json
```

::: warning 注意
`docs` 目录以外的东西不会被发布。图片请放在 `docs/public/` 下，
引用时写 `/图片名.png`（以 `public` 为根）。
:::

## 三、本地预览

```bash
npm run dev
```

浏览器打开终端里提示的地址（默认 `http://localhost:5173`），
改文件会立即热更新。

## 四、写一篇文章

在 `docs/posts/` 新建 `my-post.md`：

```markdown
---
title: 文章标题
date: 2024-05-18
description: 一句话摘要，会用于搜索结果
---

# 文章标题

正文……
```

然后在 `docs/.vitepress/config.mts` 的 `sidebar` 中加入链接，
文章就会出现在左侧导航里。

## 五、构建

```bash
npm run build     # 产物输出到 docs/.vitepress/dist
npm run preview   # 本地预览构建结果
```

## 六、部署到 GitHub Pages

新建仓库，**仓库名必须是 `Oblivisera.github.io`**（用户名 + `.github.io`），
这样网站才会发布在 `https://oblivisera.github.io/` 根路径下。

推送代码：

```bash
git init
git add .
git commit -m "初始化博客"
git branch -M main
git remote add origin https://github.com/Oblivisera/Oblivisera.github.io.git
git push -u origin main
```

仓库里已经带好了 `.github/workflows/deploy.yml`，推送后它会自动构建并发布。

最后去仓库的 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
稍等一两分钟，网站就上线了。

## 日常写作流程

```bash
npm run dev                  # 本地边写边看
git add .
git commit -m "新增文章：xxx"
git push                     # 推送后自动上线
```

就这三步。

## 常见问题

### 页面样式丢失、链接 404

多半是 `base` 配错了。用户主页仓库用 `'/'`；如果仓库名不是
`<用户名>.github.io`，要改成 `'/<仓库名>/'`。

### 想换主题色

改 `docs/.vitepress/theme/custom.css` 里的 `--vp-c-brand-*` 变量即可。

### 想换域名

在 `docs/public/` 放一个 `CNAME` 文件，内容写你的域名（一行），
再去域名服务商配置一条指向 `<用户名>.github.io` 的 CNAME 记录。
