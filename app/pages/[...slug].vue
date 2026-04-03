<script setup lang="ts">
// Catch-all route: handles /{URL} pattern for bookmarklet support.
// e.g. /https://example.com/article -> redirect to /app?url=https://example.com/article
definePageMeta({
  layout: false,
});

useSeoMeta({
  robots: { index: false, follow: false },
});

const route = useRoute();
const slug = route.params.slug as string[];

// Reconstruct the URL from slug segments
// /https://example.com/article -> slug = ['https:', '', 'example.com', 'article']
const fullUrl = slug.join('/');

if (fullUrl.startsWith('http:') || fullUrl.startsWith('https:')) {
  // Looks like a valid URL, redirect to /app with url param
  await navigateTo(`/app?url=${encodeURIComponent(fullUrl)}`, { redirectCode: 302 });
} else {
  // Not a URL, send to homepage
  await navigateTo('/', { redirectCode: 302 });
}
</script>
