import {defineConfig}from'vite';
import {svelte}from'@sveltejs/vite-plugin-svelte';
import {fileURLToPath}from'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),base:'./',plugins:[svelte({configFile:false})],build:{outDir:fileURLToPath(new URL('../../.svelte-kit/table-contract-harness',import.meta.url)),emptyOutDir:true}});
