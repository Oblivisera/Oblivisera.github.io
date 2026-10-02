---
title: Markdown 写作速查
date: 2024-05-15
description: 写文章时会用到的 Markdown 语法，以及 VitePress 的扩展语法
---

# Markdown 写作速查

写文章时随手翻的一页。

## 基础语法

### 标题

```markdown
# 一级标题（正文里请从二级开始用）
## 二级标题
### 三级标题
```

### 强调与行内代码

```markdown
**加粗** · *斜体* · ~~删除线~~ · `行内代码`
```

效果：**加粗** · *斜体* · ~~删除线~~ · `行内代码`

### 列表

```markdown
- 无序项
  - 嵌套一层

1. 有序项
2. 第二项
```

### 引用

```markdown
> 这是一段引用。
```

> 这是一段引用。

### 表格

```markdown
| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `base` | 部署的基础路径 | `/` |
| `title` | 网站标题 | — |
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `base` | 部署的基础路径 | `/` |
| `title` | 网站标题 | — |

### 链接与图片

```markdown
[站内链接](/posts/hello-world)
[外部链接](https://vitepress.dev)
![图片说明](/logo.svg)
```

站内链接**不要**带 `.md` 后缀，也不要用完整网址。

## 代码块

用三个反引号包裹，并在开头写上语言名即可获得语法高亮：

````markdown
```js
export function greet(name) {
  return `你好，${name}`
}
```
````

```js
export function greet(name) {
  return `你好，${name}`
}
```

还可以给代码块加标题和高亮行（VitePress 扩展）：

````markdown
```js{2} [greet.js]
export function greet(name) {
  return `你好，${name}`   // 这一行会被高亮
}
```
````

```js{2} [greet.js]
export function greet(name) {
  return `你好，${name}`   // 这一行会被高亮
}
```

## VitePress 扩展语法

### 提示框

```markdown
::: tip 提示
有用的补充信息。
:::

::: warning 注意
容易踩坑的地方。
:::

::: danger 危险
会造成数据丢失的操作。
:::

::: details 点击展开
折叠起来的长内容。
:::
```

::: tip 提示
有用的补充信息。
:::

::: warning 注意
容易踩坑的地方。
:::

::: danger 危险
会造成数据丢失的操作。
:::

::: details 点击展开
折叠起来的长内容。
:::

### 代码组

````markdown
::: code-group

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add -D vitepress
```

:::
````

::: code-group

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add -D vitepress
```

:::

### 目录

在文章里任意位置写 `[[toc]]`，会就地生成该级别以下的目录。

## Frontmatter

每个 `.md` 文件开头的 `---` 之间是元信息：

```yaml
---
title: 文章标题
date: 2024-05-15
description: 一句话摘要
---
```

其中 `title` 会显示在浏览器标签页，`description` 会进入搜索结果。
