<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

type Post = { text: string; link: string; date: string; description: string }

// 文章列表来自 config.mts 对 docs/posts 目录的扫描结果，
// 和侧边栏、上下篇翻页是同一份数据 —— 新增文章不需要再手工改这个页面。
const { theme } = useData()
const posts = computed<Post[]>(() => (theme.value as { posts?: Post[] }).posts ?? [])

// 只做字符串补齐，不用 Date/Intl。
// 日期是"哪一天"而不是"哪一刻"，一旦经过时区换算，
// 构建机（CI 是 UTC）和读者本地就可能差一天。
function formatDate(raw: string): string {
  const m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!m) return raw
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
}

// 描述和标题完全相同时不显示，否则归档页会出现「标题 —— 标题」这种重复
function hasDescription(post: Post): boolean {
  return !!post.description && post.description !== post.text
}
</script>

<template>
  <ul v-if="posts.length" class="post-list">
    <li v-for="post in posts" :key="post.link">
      <span class="post-date">{{ formatDate(post.date) }}</span>
      <a :href="withBase(post.link)">{{ post.text }}</a>
      <template v-if="hasDescription(post)"> —— {{ post.description }}</template>
    </li>
  </ul>
  <p v-else>还没有文章。</p>
</template>
