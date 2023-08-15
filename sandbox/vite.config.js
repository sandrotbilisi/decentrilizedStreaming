import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [glsl()],
	root: 'src/',
	publicDir: '../public/',
	base: './',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: true,
	},
})
