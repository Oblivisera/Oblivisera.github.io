<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ code: string }>()

const container = ref<HTMLElement | null>(null)
const failed = ref(false)
const { isDark } = useData()

let counter = 0

async function draw() {
  const el = container.value
  if (!el) return

  // mermaid 体积不小，且只在浏览器端需要，所以动态引入
  const mermaid = (await import('mermaid')).default

  mermaid.initialize({
    startOnLoad: false,
    // 跟随站点主题，深色模式下自动换配色
    theme: isDark.value ? 'dark' : 'default',
    securityLevel: 'loose'
  })

  try {
    const { svg } = await mermaid.render(
      `mermaid-${Date.now()}-${counter++}`,
      decodeURIComponent(props.code)
    )
    el.innerHTML = svg
    failed.value = false
  } catch {
    // 语法写错时不要把整页搞崩，退化成显示原始代码
    failed.value = true
  }
}

// onMounted 只在浏览器执行，因此 SSR 阶段不会碰 mermaid
onMounted(draw)

// 切换深浅色时重新渲染，否则图还是旧配色
watch(isDark, () => nextTick(draw))
</script>

<template>
  <div class="mermaid-diagram">
    <div v-show="!failed" ref="container" />
    <pre v-if="failed" class="mermaid-fallback"><code>{{ decodeURIComponent(code) }}</code></pre>
  </div>
</template>

<style scoped>
.mermaid-diagram {
  margin: 16px 0;
  text-align: center;
  overflow-x: auto;
}

.mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}

.mermaid-fallback {
  text-align: left;
  padding: 16px;
  border: 1px dashed var(--vp-c-danger-1, #d5393e);
  border-radius: 8px;
  overflow-x: auto;
}
</style>
