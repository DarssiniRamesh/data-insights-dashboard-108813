import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { 
    languageOptions: { 
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      // Enable common browser and test globals to avoid false positives.
      // Alternatively, you could set env: { browser: true, jest: true } once ESLint supports env in flat config natively.
      globals: {
        window: true,
        document: true,
        navigator: true,
        console: true,
        // Jest/testing-library
        test: true,
        it: true,
        expect: true,
        describe: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
      }
    },
    rules: {
      // Prevent noise from unused React import with React 17+ JSX transform and common unused vars.
      "no-unused-vars": ["error", { varsIgnorePattern: "React|App" }]
    }
  },
  pluginJs.configs.recommended,
  {
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error"
    }
  }
]
