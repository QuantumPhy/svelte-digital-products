import adapter from '@sveltejs/adapter-auto';
import staticAdapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const base = process.env.COCODING_TEMPLATE_BASE || '';
if(base&&!(/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]+$/).test(base))throw new Error('Invalid template base path');
export default defineConfig(({mode}) => ({
	plugins: [
		tailwindcss(),
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: vitePreprocess(),

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: mode==='cocoding-preview'?staticAdapter({strict:true}):adapter(),
 ...(mode==='cocoding-preview'?{files:{routes:'src/preview-routes',hooks:{server:'src/preview-hooks.server.ts'}}}:{}),
			paths: {base:base as ''|`/${string}`,relative:false}
		})
	],
	server: {
		fs: {
			deny: [
				".env",
				".env.*",
				".git",
				"**/.ssh/**",
				"**/*.pem",
				"**/*.key"
			]
		}
	},
	preview: { allowedHosts: true }
}));
