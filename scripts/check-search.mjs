// 端到端验证：从构建产物 index.html 中取出真正会下发到浏览器的站点数据，
// 按 VitePress deserializeFunctions 的方式还原分词器，再跑真实查询。
// 验证对象是「实际发布的产物」，而不是我写在源码里的东西。
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import MiniSearch from 'minisearch'

const dist = resolve('docs/.vitepress/dist')

// ---- 1. 取出并还原站点数据（与浏览器完全一致）----
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const anchor = 'window.__VP_SITE_DATA__=deserializeFunctions(JSON.parse('
const start = html.indexOf(anchor)
if (start === -1) throw new Error('找不到 __VP_SITE_DATA__ 锚点')

// 手动扫描字符串字面量，正确处理反斜杠转义
let i = start + anchor.length
if (html[i] !== '"') throw new Error('站点数据不是预期的字符串字面量')
let j = i + 1
while (j < html.length) {
  if (html[j] === '\\') { j += 2; continue }
  if (html[j] === '"') break
  j++
}
const literal = html.slice(i, j + 1)

// JSON.parse(字面量) -> JSON 文本; 再 parse 一次 -> 对象
const siteData = JSON.parse(JSON.parse(literal))

// 复刻 VitePress 的 deserializeFunctions（注意：下划线开头的键会被跳过）
function deserialize(v) {
  if (Array.isArray(v)) return v.map(deserialize)
  if (typeof v === 'object' && v !== null) {
    return Object.keys(v).reduce((acc, k) => {
      acc[k] = deserialize(v[k])
      return acc
    }, {})
  }
  if (typeof v === 'string' && v.startsWith('_vp-fn_')) {
    return new Function(`return ${v.slice(7)}`)()
  }
  return v
}

const data = deserialize(siteData)
const tokenize = data.themeConfig?.search?.options?.miniSearch?.options?.tokenize

console.log(`站点标题: ${data.title}`)
console.log(`分词器还原: ${typeof tokenize === 'function' ? '成功' : '失败'}`)
if (typeof tokenize !== 'function') {
  console.error('!! 分词器没能下发到浏览器，中文搜索将退回默认切词')
  process.exit(1)
}

// ---- 2. 用还原出的分词器加载索引（与 VPLocalSearchBox 一致）----
const chunks = join(dist, 'assets/chunks')
const idxFile = readdirSync(chunks).find((f) => f.startsWith('@localSearchIndexroot'))
const mod = await import(pathToFileURL(join(chunks, idxFile)).href)

const searchOptions = {
  fuzzy: false,
  prefix: true,
  boost: { title: 4, text: 2, titles: 1 },
  ...data.themeConfig?.search?.options?.miniSearch?.searchOptions
}

const idx = MiniSearch.loadJSON(mod.default, {
  fields: ['title', 'titles', 'text'],
  storeFields: ['title', 'titles'],
  tokenize,
  searchOptions
})

console.log(`索引文档数: ${idx.documentCount}`)

// ---- 3. 分词效果 ----
console.log('\n--- 分词器实际切分效果 ---')
for (const s of ['为什么在信息过载的时代还要自建博客', 'VitePress 搭建博客', '本地全文搜索']) {
  console.log(`  "${s}"`)
  console.log(`     -> [${tokenize(s).join(' | ')}]`)
}

// ---- 4. 真实查询 ----
// 期望值不写死：直接从 Markdown 正文里判断某个词到底存不存在，
// 存在就必须搜得到。注意首页 features 写在 frontmatter 里，
// VitePress 不会索引 frontmatter，因此排除 index.md。
function walkMd(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '.vitepress' || e.name === 'public') continue
      walkMd(p, out)
    } else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}

const corpus = walkMd(resolve('docs'))
  .map((f) => readFileSync(f, 'utf8').replace(/^---[\s\S]*?---/, '')) // 去掉 frontmatter
  .join('\n')

const candidateTerms = [
  '博客', '搜索', '主题色', '静态站点', '归档', '部署', '搭建',
  '导航', '链接', '代码块', '中文', '样式', '图片', '构建'
]
const absentTerms = ['区块链', '量子力学', '文艺复兴', '火山喷发']

console.log('\n--- 中文查询覆盖率（期望值来自正文实际内容）---')
let hitOk = 0
let hitTotal = 0
let falsePos = 0

for (const q of candidateTerms) {
  const inCorpus = corpus.includes(q)
  const r = idx.search(q)
  if (!inCorpus) {
    console.log(`  跳过    "${q}"（正文未出现，不计入）`)
    continue
  }
  hitTotal++
  if (r.length) hitOk++
  console.log(
    `  ${r.length ? '命中  ' : '未命中'}  "${q}" -> ${r.length} 条` +
      (r.length ? `   首条: ${r[0].title ?? '(无)'}` : '   <-- 正文有但搜不到')
  )
}

console.log('\n--- 无关词应搜不到 ---')
for (const q of absentTerms) {
  const r = idx.search(q)
  if (r.length) falsePos++
  console.log(`  ${r.length ? '误命中' : '正确空手'}  "${q}" -> ${r.length} 条`)
}

console.log(`\n正文中存在的词可搜到: ${hitOk}/${hitTotal}`)
console.log(`无关词误命中: ${falsePos}`)
const pass = hitOk === hitTotal && falsePos === 0
console.log(pass ? '\n结论: 中文搜索可用，无误报' : '\n结论: 仍有问题')
process.exit(pass ? 0 : 1)
