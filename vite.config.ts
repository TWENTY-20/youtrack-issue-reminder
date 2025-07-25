import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {viteStaticCopy} from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";


// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    if (mode === "backend") {
        return {
            build: {
                lib: {
                    entry: "./src/backend.js",
                    formats: ["cjs"],
                    emptyOutDir: true,
                    name: "backend",
                    fileName: "backend.js"
                },
                rollupOptions: {
                    output: {
                        entryFileNames: "backend.js",
                        dir: "build"
                    }
                }
            }
        };
    }


    return {

        plugins: [
            react(),
            tailwindcss(),
            viteStaticCopy({
                targets: [
                    { src: "./logo.png", dest: "." },
                    { src: "./logoDark.png", dest: "." },
                    { src: "./manifest.json", dest: "." },
                    { src: "./entity-extensions.json", dest: "." },
                    { src: "./settings.json", dest: "." },
                    { src: "./onScheduleMailScheduler.js", dest: "."},
                    { src: "./onChangeIssueResolved.js", dest: "."},
                    { src: "./onChangeIssueRemoved.js", dest: "."}
                ]
            })
        ],
        root: './src',
        base: '',
        publicDir: 'public',
        build: {
            outDir: '../build',
            emptyOutDir: false,
            copyPublicDir: false,
            sourcemap: false,
            target: ['es2022'],
            assetsDir: 'widgets/assets',
            rollupOptions: {
                external: ['@jetbrains/ring-ui/components/select/select.css'],
                input: {
                    main: 'src/widgets/main/index.html',
                    reminder_settings: 'src/widgets/reminder_settings/index.html'
                }
            }
        },
        esbuild: {
            supported: {
                "top-level-await": true
            }
        },
    };
});
