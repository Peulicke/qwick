import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        setupFiles: ["src/qwick/vitest-extensions.ts"]
    }
});
