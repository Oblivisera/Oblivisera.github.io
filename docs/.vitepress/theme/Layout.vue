<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { Layout } = DefaultTheme

const { page } = useData()

// 只在文章页显示这个按钮。
// 归档页自己不需要「回到归档」，关于页和首页也不属于文章。
const showArchiveLink = computed(() => {
  const p = page.value.relativePath
  return p.startsWith('posts/') && p !== 'posts/index.md'
})
</script>

<template>
  <Layout>
    <!--
      放在 doc-footer-before 插槽：这块在 .vp-doc 之外，
      不会和 Markdown 正文的排版样式互相干扰。
      上一篇/下一篇已在 custom.css 里隐藏。
    -->
    <template #doc-footer-before>
      <div v-if="showArchiveLink" class="archive-back">
        <a class="archive-back-link" :href="withBase('/posts/')">
          <span class="archive-back-arrow" aria-hidden="true">←</span>
          回到文章归档
        </a>
      </div>
    </template>
  </Layout>
</template>
