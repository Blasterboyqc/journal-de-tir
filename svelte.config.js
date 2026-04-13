import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter({
			// GitHub Pages: déploiement depuis le dossier docs/
			pages: 'docs',
			assets: 'docs',
			fallback: 'index.html',
			precompress: false,
			strict: false,
		}),
		paths: {
			base: '/journal-de-tir'
		}
	}
};

export default config;
