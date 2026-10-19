import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
const base = process.env.COCODING_TEMPLATE_BASE || '';
if (base && !/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]+$/.test(base)) throw new Error('Invalid template base path');
export default { preprocess: vitePreprocess(), kit: { adapter: adapter({ fallback: 'index.html' }), paths: { base, relative: false } } };
