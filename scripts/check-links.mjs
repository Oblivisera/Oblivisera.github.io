// 构建产物链接自检：确认所有站内链接都指向真实存在的文件
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

const dist = resolve('docs/.vitepress/dist')

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

const pages = walk(dist)
let bad = 0
let checked = 0

for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  // 同时检查 href 与 src：图片路径写错时 href 检查是发现不了的
  const refs = [
    ...[...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1])
  ]
  for (const href of refs) {
    if (/^(https?:|mailto:|#|data:)/.test(href)) continue
    let clean = href.split('#')[0].split('?')[0]
    if (!clean) continue
    // 中文文件名在 HTML 里是百分号编码的（/posts/%E6%96%87...），
    // 必须先解码才能对到磁盘上的真实文件，否则中文标题的文章会全部误报死链。
    try {
      clean = decodeURIComponent(clean)
    } catch {
      // 编码不合法就按原样处理
    }
    checked++
    const target = clean.startsWith('/')
      ? join(dist, clean)
      : resolve(dirname(page), clean)
    const ok =
      existsSync(target) ||
      existsSync(join(target, 'index.html')) ||
      existsSync(target + '.html')
    if (!ok) {
      bad++
      console.log(`BROKEN  ${page.replace(dist, '')}  ->  ${href}`)
    }
  }
}

console.log(`\nHTML pages: ${pages.length}`)
console.log(`Internal links checked: ${checked}`)
console.log(bad === 0 ? 'RESULT: all internal links resolve' : `RESULT: ${bad} broken link(s)`)
process.exit(bad === 0 ? 0 : 1)
