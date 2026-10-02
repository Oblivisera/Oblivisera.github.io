// 检查构建产物里的「暗色模式」与「最后更新」两项功能是否真的可用。
//
// 为什么值得单独测：
// 1. lastUpdated 依赖 git 提交历史（VitePress 会跑 git log 取时间）。
//    CI 里如果 checkout 没有 fetch-depth: 0，日期会静默变成空，
//    页面照样构建成功，肉眼很难发现。
// 2. 暗色模式靠 .dark 选择器覆盖 CSS 变量，配置写错时不会报错，
//    只会「切换了没反应」。
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'

const dist = resolve('docs/.vitepress/dist')

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = walk(dist)
const htmlFiles = files.filter((f) => f.endsWith('.html'))
let failures = 0

// ---- 1. lastUpdated：每个页面都应解析出真实时间戳 ----
console.log('=== 最后更新（lastUpdated）===')
let withTimestamp = 0
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8')
  const rel = relative(dist, f)

  // 首页 / 归档页等没有文档页脚的页面不参与
  if (!html.includes('VPLastUpdated')) {
    console.log(`  --      ${rel}（无更新时间为正常）`)
    continue
  }

  const m = html.match(/<time datetime="([^"]*)"/)
  const value = m?.[1] ?? ''
  const valid = value !== '' && !Number.isNaN(+new Date(value))
  if (valid) {
    withTimestamp++
    console.log(`  OK      ${rel}  ->  ${value}`)
  } else {
    failures++
    console.log(`  FAIL    ${rel}  ->  时间戳为空（检查 CI 的 fetch-depth: 0）`)
  }
}
if (withTimestamp === 0) {
  failures++
  console.log('  FAIL    没有任何页面解析出更新时间')
}

// ---- 2. 暗色模式 ----
console.log('\n=== 暗色模式 ===')
const css = files
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

// 2a. 主题切换组件与持久化键
// 站点数据在 HTML 里是转义过的 JSON 字符串（\"appearance\"），先还原再匹配
const indexHtml = readFileSync(join(dist, 'index.html'), 'utf8')
const indexHtmlUnescaped = indexHtml.replace(/\\"/g, '"')
const checks = [
  ['主题切换组件已渲染', indexHtml.includes('VPSwitchAppearance')],
  ['主题偏好持久化键存在', indexHtml.includes('vitepress-theme-appearance')],
  ['appearance 已启用', /"appearance"\s*:\s*true/.test(indexHtmlUnescaped)],
  ['.dark 变量块存在', /\.dark\s*\{/.test(css)],
  ['浅色品牌色在 :root 中', /:root\s*\{[^}]*#3451b2/i.test(css)],
  ['深色品牌色在 .dark 中', /\.dark\s*\{[^}]*#a8b1ff/i.test(css)]
]
for (const [label, ok] of checks) {
  if (!ok) failures++
  console.log(`  ${ok ? 'OK  ' : 'FAIL'}    ${label}`)
}

console.log(
  failures === 0
    ? '\n结论: 暗色模式与最后更新均正常'
    : `\n结论: ${failures} 项异常`
)

// ---- 3. 底部导航 ----
// 规则：文章页显示「上一篇/下一篇」；归档页、关于页等独立正文页显示「返回首页」；
// 首页与 404 两者都不显示。
console.log('\n=== 底部导航 ===')
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8')
  const rel = relative(dist, f).replace(/\\/g, '/')
  const isPost = rel.startsWith('posts/') && rel !== 'posts/index.html'
  // 归档页 / 关于页属于「独立正文页」，应给返回首页入口
  const isStandalone = rel === 'posts/index.html' || rel === 'about.html'

  const hasPostNav = html.includes('class="post-nav"')
  const hasHomeBack = html.includes('class="page-back"')

  let problem = ''
  if (isPost && !hasPostNav) problem = '文章页缺少翻页'
  else if (isPost && hasHomeBack) problem = '文章页不该出现「返回首页」'
  else if (isStandalone && !hasHomeBack) problem = '独立页缺少「返回首页」'
  else if (isStandalone && hasPostNav) problem = '独立页不该出现翻页'
  else if (!isPost && !isStandalone && (hasPostNav || hasHomeBack))
    problem = '首页/404 不该出现底部导航'

  if (problem) {
    failures++
    console.log(`  FAIL    ${rel}  ${problem}`)
  } else {
    const what = isPost ? '翻页' : isStandalone ? '返回首页' : '无（符合预期）'
    console.log(`  OK      ${rel}  ${what}`)
  }
}

console.log(
  failures === 0
    ? '\n结论: 页面检查全部通过'
    : `\n结论: ${failures} 项异常`
)
process.exit(failures === 0 ? 0 : 1)
