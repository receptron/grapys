<template>
  <div class="readme-viewer">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-600">Loading documentation...</div>
    </div>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-red-600">
      <p class="font-semibold">Failed to load documentation</p>
      <p class="mt-2 text-sm">{{ error }}</p>
      <a :href="fallbackUrl" target="_blank" class="mt-4 inline-block text-sm underline">View on GitHub instead</a>
    </div>
    <div v-else v-html="renderedMarkdown" class="prose prose-lg max-w-none"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const props = defineProps<{
  url?: string;
  fallbackUrl?: string;
}>();

const loading = ref(true);
const error = ref<string | null>(null);
const renderedMarkdown = ref("");

const defaultUrl = "https://raw.githubusercontent.com/receptron/grapys/main/packages/vueweave/README.md";
const fallbackUrl = computed(() => props.fallbackUrl || "https://github.com/receptron/grapys/tree/main/packages/vueweave");

const fetchReadme = async () => {
  const url = props.url || defaultUrl;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();

    renderedMarkdown.value = simpleMarkdownToHtml(markdown);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unknown error";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReadme);

const simpleMarkdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^[\]]*)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");

  // Lists (simple)
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  return html;
}
</script>

<style scoped>
.readme-viewer :deep(h1) {
  margin-bottom: 1.5rem;
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
}

.readme-viewer :deep(h2) {
  margin-bottom: 1rem;
  margin-top: 2rem;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.readme-viewer :deep(h3) {
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.readme-viewer :deep(p) {
  margin-bottom: 1rem;
  color: #374151;
}

.readme-viewer :deep(code) {
  border-radius: 0.25rem;
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
  color: #ec4899;
}

.readme-viewer :deep(pre) {
  margin: 1rem 0;
  overflow-x: auto;
  border-radius: 0.5rem;
  background-color: #111827;
  padding: 1rem;
}

.readme-viewer :deep(pre code) {
  background-color: transparent;
  color: #f3f4f6;
}

.readme-viewer :deep(a) {
  color: #4f46e5;
}

.readme-viewer :deep(a:hover) {
  color: #3730a3;
  text-decoration: underline;
}

.readme-viewer :deep(ul) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}

.readme-viewer :deep(li) {
  margin-bottom: 0.5rem;
  color: #374151;
}

.readme-viewer :deep(strong) {
  font-weight: 600;
  color: #111827;
}
</style>
