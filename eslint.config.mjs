import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...next],
}, {
    files: ["app/layout.tsx"],
    rules: { "@next/next/no-page-custom-font": "off" },
}, {
    files: ["components/brutalist/agxp.jsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
}]);
