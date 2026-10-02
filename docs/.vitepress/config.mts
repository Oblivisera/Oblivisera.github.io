import { defineConfig } from 'vitepress'

export default defineConfig({
  // 用户主页仓库发布在根路径，因此 base 保持 '/'
  // 如果以后改成项目仓库（如 github.com/Oblivisera/blog），需改为 '/blog/'
  base: '/',

  lang: 'zh-CN',
  title: 'Oblivisera',
  description: 'Oblivisera 的个人博客 —— 记录技术、思考与生活',

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
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#3451b2' }],
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

    // 左侧/右侧目录结构
    sidebar: {
      '/posts/': [
        {
          text: '文章',
          items: [
            { text: '文章归档', link: '/posts/' },
            { text: '你好，世界', link: '/posts/hello-world' },
            { text: '用 VitePress 搭建博客', link: '/posts/build-blog-with-vitepress' },
            { text: 'Markdown 写作速查', link: '/posts/markdown-cheatsheet' }
          ]
        }
      ]
    },

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
      copyright: 'Copyright © 2024-present Oblivisera'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Oblivisera' }
    ]
  }
})
