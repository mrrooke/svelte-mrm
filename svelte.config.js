import { preprocessMeltUI } from '@melt-ui/pp';
import sequence from 'svelte-sequential-preprocessor';
import adapter from '@sveltejs/adapter-vercel';

// import adapter from '@sveltejs/adapter-auto';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config}*/
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [sequence([vitePreprocess(), preprocessMeltUI()]), vitePreprocess({})],
	kit: {
		adapter: adapter({
			runtime: 'nodejs18.x'
		})
	},
	compilerOptions: {}
};
export default config;
