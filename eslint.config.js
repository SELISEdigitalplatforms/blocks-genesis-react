import reactConfig from "./tooling/eslint/react.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/build/**",
    ],
  },
];
