import reactConfig from "./tooling/eslint/react.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    files: ["packages/ui/src/components/sidebar/sidebar.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/build/**",
      "apps/web/.vite/**",
    ],
  },
];
