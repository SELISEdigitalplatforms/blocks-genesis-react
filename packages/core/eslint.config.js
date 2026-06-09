import config from "@blocks-kit/eslint-config/base";

export default [
  ...config,
  {
    ignores: ["eslint.config.js", "dist/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
