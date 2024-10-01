import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "react/no-deprecated": "off",
      "no-console": "off"
    },
    settings: {
      react: {
        version: "detect", // Esto ayuda a que ESLint detecte la versión correcta de React
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.recommended,
];
