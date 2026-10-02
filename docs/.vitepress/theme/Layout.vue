<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { Layout } = DefaultTheme

const { page, theme } = useData()

type Post = { text: string; link: string; date: string }

// 文章列表来自 config.mts 里对 docs/posts 目录的扫描结果。
// 因为链接是「扫出来的」而不是手写的，所以不会指向不存在的文件。
const posts = computed<Post[]>(() => (theme.value as { posts?: Post[] }).posts ?? [])

// 当前页面在文章列表中的位置；非文章页为 -1
const index = computed(() =>
  posts.value.findIndex(
    (p) => p.link === '/' + page.value.relativePath.replace(/\.md$/, '')
  )
)

const isPost = computed(() => index.value !== -1)

// 上/下篇按列表顺序取，越界即为不存在。
// 不作「是否为死链」的额外判断，是因为列表本来就是扫描真实文件生成的；
// 万一将来数据源变了，check-links 那关也会拦下来。
const prev = computed(() => (index.value > 0 ? posts.value[index.value - 1] : null))
const next = computed(() =>
  index.value >= 0 && index.value < posts.value.length - 1
    ? posts.value[index.value + 1]
    : null
)
</script>

<template>
  <Layout>
    <!--
      doc-after 插槽正好在 VPDocFooter 之后，也就是原来「上一篇/下一篇」的位置。
      自带的那个已在 custom.css 里隐藏，这里换成带归档兜底的版本。
    -->
    <template #doc-after>
      <nav v-if="isPost" class="post-nav" aria-label="文章导航">
        <a
          v-if="prev"
          class="post-nav-link prev"
          :href="withBase(prev.link)"
          rel="prev"
        >
          <span class="post-nav-desc">上一篇</span>
          <span class="post-nav-title">{{ prev.text }}</span>
        </a>
        <!-- 占位，让「下一篇」仍然靠右 -->
        <span v-else class="post-nav-spacer" aria-hidden="true" />

        <a
          v-if="next"
          class="post-nav-link next"
          :href="withBase(next.link)"
          rel="next"
        >
          <span class="post-nav-desc">下一篇</span>
          <span class="post-nav-title">{{ next.text }}</span>
        </a>
        <!-- 没有下一篇（已是最后一篇）：改为回到归档 -->
        <a v-else class="post-nav-link next archive" :href="withBase('/posts/')">
          <span class="post-nav-desc">回到文章归档</span>
          <span class="post-nav-title">查看全部文章 →</span>
        </a>
      </nav>
    </template>
  </Layout>
</template>
