// 新建文章：node scripts/new-post.mjs "文章标题"
// 会自动生成带 frontmatter 的 Markdown 文件，并提示下一步该改哪里
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const title = process.argv.slice(2).join(' ').trim()

if (!title) {
  console.error('用法: node scripts/new-post.mjs "文章标题"')
  process.exit(1)
}

// 生成文件名：优先用纯 ASCII 短名，保证 URL 干净、好分享；
// 纯中文标题无法转写时，回退为日期编号
const today = new Date()
const ymd = today.toISOString().slice(0, 10)
const asciiSlug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const filename = asciiSlug ? `${asciiSlug}.md` : `post-${ymd.replace(/-/g, '')}.md`
const target = resolve('docs/posts', filename)

if (existsSync(target)) {
  console.error(`文件已存在，未覆盖: ${target}`)
  process.exit(1)
}

if (!asciiSlug) {
  console.log(`提示：标题中没有可转写的英文，已用日期编号命名。`)
  console.log(`      如果想自定义链接，可手动把文件重命名成英文短名。`)
  console.log('')
}

const body = `---
title: ${title}
date: ${ymd}
description: 用一句话概括这篇文章，会显示在搜索结果里
---

# ${title}

在这里开始写正文。

## 小标题

正文……
`

writeFileSync(target, body, 'utf8')

console.log(`已创建: docs/posts/${filename}`)
console.log('')
console.log('下一步：')
console.log('  1. 编辑该文件，写入正文')
console.log('  2. 在 docs/.vitepress/config.mts 的 sidebar 中加入链接：')
console.log(`     { text: '${title}', link: '/posts/${filename.replace(/\.md$/, '')}' }`)
console.log('  3. npm run dev 本地预览，确认无误后提交推送')
