import { defineConfig } from 'vite';

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            globalThis.process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = '---------------------------------------------------------';
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            globalThis.process.stdout.write(`${line}\n${msg}\n${line}\n`);

            globalThis.process.stdout.write(`✨ Done ✨\n`);
        },
    };
};

export default defineConfig({
    root: '.',
    base: './',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: 'index.html',
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                },
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            },
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2,
            },
            mangle: true,
            format: {
                comments: false,
            },
        },
    },
    plugins: [phasermsg()],
    logLevel: 'warning',
});

