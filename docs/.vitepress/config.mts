import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ── 文章列表 ─────────────────────────────────────────────────────────
// 直接扫描 docs/posts 目录生成，侧边栏和「上一篇/下一篇」共用这一份数据。
// 这样删掉一篇文章后，侧边栏和翻页会自动跟着消失，
// 不会留下指向已删除文件的死链（之前踩过这个坑）。
const postsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../posts')

type Post = { text: string; link: string; date: string }

function loadPosts(): Post[] {
  if (!existsSync(postsDir)) return []

  return readdirSync(postsDir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md') // index.md 是归档页，不是文章
    .map((file) => {
      // 去掉 UTF-8 BOM：Windows 记事本、PowerShell 的 Set-Content 都可能写入 BOM，
      // 留着的话文件开头变成 "\ufeff---"，frontmatter 正则匹配不上，
      // 标题和日期会静默失效。
      const raw = readFileSync(resolve(postsDir, file), 'utf8').replace(/^\uFEFF/, '')
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      const fm = fmMatch ? fmMatch[1] : ''
      const pick = (key: string): string => {
        const m = fm.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
        return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
      }
      const slug = file.replace(/\.md$/, '')
      const title = pick('title')
      const date = pick('date')

      if (!fmMatch) {
        console.warn(`[posts] ${file} 没有解析到 frontmatter，标题与日期将退回默认值`)
      } else if (Number.isNaN(Date.parse(date))) {
        console.warn(`[posts] ${file} 的 date 缺失或无法解析（当前值: "${date}"），将排到最后`)
      }

      return {
        text: title || slug, // 没写 title 就退回文件名
        link: `/posts/${slug}`,
        date
      }
    })
    .sort((a, b) => {
      const ta = Date.parse(a.date)
      const tb = Date.parse(b.date)
      const va = Number.isNaN(ta) ? 0 : ta
      const vb = Number.isNaN(tb) ? 0 : tb
      if (va !== vb) return vb - va // 新的排在前面
      return a.link.localeCompare(b.link) // 日期相同则按链接排序，保证结果稳定
    })
}

const posts = loadPosts()

export default defineConfig({
  // 用户主页仓库发布在根路径，因此 base 保持 '/'
  // 如果以后改成项目仓库（如 github.com/Oblivisera/blog），需改为 '/blog/'
  base: '/',

  lang: 'zh-CN',
  title: 'Oblivisera',
  description: 'Oblivisera 的个人博客',

  // 文章目录里常出现中文和空格，链接检查放宽
  markdown: {
    lineNumbers: true,
    // 代码块配色
    theme: { light: 'github-light', dark: 'github-dark' }
  },

  // 最近更新时间基于 git 提交时间
  lastUpdated: true,

  // 构建时检查站内死链，但放行本地开发地址
  ignoreDeadLinks: [/^https?:\/\/localhost/],

  head: [
    // 浏览器标签页图标：ICO 覆盖 16/32/48，PNG 供不认 ICO 的场景，
    // apple-touch-icon 用于 iOS 添加到主屏幕
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon-32.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#000000ff' }],
    ['meta', { name: 'author', content: 'Oblivisera' }]
  ],

  themeConfig: {
    // 浅色模式用黑字标志；深色模式由 custom.css 换成白字版本
    // （VitePress 1.6 没有内置 logoDark，所以用 CSS 切换）
    logo: '/logo-light.jpg',

    // 顶部导航
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/', activeMatch: '/posts/' },
      { text: '关于', link: '/about' }
    ],

    // 左侧/右侧目录结构（文章部分由 docs/posts 目录自动生成）
    sidebar: {
      '/posts/': [
        {
          text: '文章',
          items: [
            { text: '文章归档', link: '/posts/' },
            ...posts.map((p) => ({ text: p.text, link: p.link }))
          ]
        }
      ]
    },

    // 供 Layout.vue 计算「上一篇/下一篇」（themeConfig 会下发到浏览器）
    posts,

    // 本地全文搜索，无需任何第三方服务
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            // MiniSearch 默认只按空格和标点切词，中文整段会变成一个词条，
            // 搜索「博客」匹配不到「为什么还要写博客」。
            //
            // 这里改用「二元分词」（bigram）：把连续中文切成相邻两字的组合，
            // 例如「本地全文搜索」-> 本地|地全|全文|文搜|搜索。
            // 这是 CJK 全文检索的经典做法，不需要词典，
            // 比 Intl.Segmenter 可靠（后者会把「博客」拆成「博」「客」）。
            // 英文与数字保持整词，不做拆分。
            //
            // 注意：该函数会被 VitePress 序列化后送到浏览器执行，
            // 因此函数体必须自包含，不能引用任何外部变量。
            tokenize: (text: string) => {
              const out: string[] = []
              const re = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+|[A-Za-z0-9_]+/g
              let m: RegExpExecArray | null
              while ((m = re.exec(text)) !== null) {
                const s = m[0]
                if (/^[A-Za-z0-9_]+$/.test(s)) {
                  // 拉丁词/数字：整词保留
                  out.push(s)
                } else if (s.length === 1) {
                  // 单个汉字，无法组二元组
                  out.push(s)
                } else {
                  // 连续汉字：切成长度为 2 的重叠窗口
                  for (let k = 0; k < s.length - 1; k++) {
                    out.push(s.slice(k, k + 2))
                  }
                }
              }
              return out
            }
          },
          searchOptions: {
            // 二元分词后，模糊匹配会引入大量无关结果，这里关掉
            fuzzy: false,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 }
          }
        },
        translations: {
          button: {
            buttonText: '搜索文章',
            buttonAriaLabel: '搜索文章'
          },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    // 暗色模式跟随系统，也可手动切换
    appearance: true,

    // 文章底部的上一页 / 下一页
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' }
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    // 页脚
    footer: {
      message: '基于 VitePress 构建 · 部署于 GitHub Pages',
      copyright: 'Copyright © 2026 Oblivisera'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Oblivisera' }
    ]
  }
})
