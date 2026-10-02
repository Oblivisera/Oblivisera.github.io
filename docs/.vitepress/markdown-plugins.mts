/**
 * Obsidian 语法的 markdown-it 插件。
 *
 * 只处理 VitePress 没有原生支持的两种语法：
 *   1. [[维基链接]] / ![[嵌入]]
 *   2. %%注释%%
 *
 * 其余（脚注、==高亮==、任务列表、数学公式）都有现成的标准插件，
 * 在 config.mts 里直接 use 即可，不必自己写。
 *
 * 注意：markdown 是在构建时编译成 HTML 的，所以这些插件只在构建（和 dev 服务器）
 * 阶段运行，不会增加浏览器端体积。
 */

// 这里不引入 markdown-it 的类型：VitePress 打包配置时用的是 esbuild，
// 不做类型检查，而 MarkdownIt 的类型名在不同版本间有差异，引用反而容易出错。
type Md = any
type State = any

/** 把 [[目标]] 变成站内链接；![[目标]] 变成图片或链接 */
export function obsidianWikiLink(
  md: Md,
  resolve: (target: string, isEmbed: boolean) => { href: string; isImage: boolean } | null,
  onMissing?: (target: string) => void
) {
  const BANG = 0x21 // !
  const BRACKET = 0x5b // [

  function rule(state: State, silent: boolean): boolean {
    const src: string = state.src
    const start: number = state.pos

    // 判断是 [[ 还是 ![[
    const isEmbed = src.charCodeAt(start) === BANG
    const open = isEmbed ? start + 1 : start
    if (src.charCodeAt(open) !== BRACKET || src.charCodeAt(open + 1) !== BRACKET) {
      return false
    }

    const close = src.indexOf(']]', open + 2)
    if (close === -1) return false

    const raw = src.slice(open + 2, close)
    // 空目标、跨行、嵌套中括号都不认为是维基链接
    if (!raw || raw.includes('\n') || raw.includes('[') || raw.includes(']')) {
      return false
    }

    // Obsidian 支持 [[目标|显示文字]] 和 [[目标#小节|显示文字]]
    const [targetPart, labelPart] = raw.split('|')
    const target = targetPart.split('#')[0].trim()
    const label = (labelPart ?? targetPart).split('#').pop()!.trim()
    if (!target) return false

    const hit = resolve(target, isEmbed)

    if (!silent) {
      if (!hit) {
        // 解析不到就原样保留，绝不生成死链（否则整个构建会失败）
        onMissing?.(target)
        const text = state.push('text', '', 0)
        text.content = isEmbed ? `![[${raw}]]` : `[[${raw}]]`
      } else if (hit.isImage) {
        const token = state.push('image', 'img', 0)
        token.attrs = [
          ['src', hit.href],
          ['alt', label]
        ]
        // 这个 text token 只作为 image 的 children（供 alt 使用），
        // 必须用 new state.Token 构造，不能 state.push，
        // 否则它会插进正文流里变成一行可见文字。
        const alt = new state.Token('text', '', 0)
        alt.content = label
        token.children = [alt]
      } else {
        const linkOpen = state.push('link_open', 'a', 1)
        linkOpen.attrs = [['href', hit.href]]
        const text = state.push('text', '', 0)
        text.content = label || target
        state.push('link_close', 'a', -1)
      }
    }

    state.pos = close + 2
    return true
  }

  // 必须排在 link / image 之前，否则 [[ 会被当成普通链接、![[ 会被当成图片语法
  md.inline.ruler.before('link', 'obsidian_wikilink', rule)
}

/**
 * 去掉 %%注释%%。
 * Obsidian 里这段是隐藏的，但 VitePress 会原样显示出来 ——
 * 如果注释里写了"这段先不发"，就会真的被读者看到。
 *
 * 直接改 state.src：在 block 解析之前把注释抠掉，最省事也最不容易出错。
 */
export function obsidianComment(md: Md) {
  md.core.ruler.before('block', 'obsidian_comment', (state: State) => {
    if (state.src && state.src.includes('%%')) {
      // 非贪婪匹配，允许跨行
      state.src = state.src.replace(/%%[\s\S]*?%%/g, '')
    }
  })
}
