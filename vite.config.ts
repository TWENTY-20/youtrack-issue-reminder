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
                    external: [/^@jetbrains\/youtrack-scripting-api/],
                    output: {
                        entryFileNames: "backend.js",
                        dir: "build"
                    }
                }
            }
        };
    }

    if (mode === "workflows") {
        return {
            build: {
                outDir: "build",
                emptyOutDir: false,
                lib: {
                    entry: [
                        "./src/onScheduleMailScheduler.js",
                        "./src/onChangeIssueResolved.js",
                        "./src/onChangeIssueRemoved.js",
                        "./src/aiTools/create_reminder.js",
                        "./src/aiTools/get_reminders.js",
                    ],
                    formats: ["cjs"],
                    fileName: (_format, entryName) => `${entryName}.js`,
                },
                rollupOptions: {
                    external: [/^@jetbrains\/youtrack-scripting-api/],
                },
            },
        };
    }


    return {

        plugins: [
            react(),
            tailwindcss(),
            viteStaticCopy({
                targets: [
                    {src: "./logo.svg", dest: "."},
                    {src: "./logoDark.svg", dest: "."},
                    {src: "./manifest.json", dest: "."},
                    {src: "./entity-extensions.json", dest: "."},
                    {src: "./settings.json", dest: "."}
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
    };
});
