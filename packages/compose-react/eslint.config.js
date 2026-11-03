import config from "@blocks-kit/eslint-config/react";
import {
  hardcodedTextExemptFiles,
  noHardcodedTextRule,
} from "./src/eslint/no-hardcoded-text.js";

export default [
  ...config,
  {
    // The shared rule file is plain data loaded by this config before the build, outside the TS project.
    ignores: ["eslint.config.js", "dist/**", "src/eslint/no-hardcoded-text.js"],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // No hard-coded user-facing text: the shared rule this package also publishes as
  // `@seliseblocks/genesis-os/eslint` (src/eslint), so every Blocks app enforces the same thing.
  {
    files: ["**/*.tsx"],
    rules: { "no-restricted-syntax": noHardcodedTextRule },
  },
  {
    files: [...hardcodedTextExemptFiles],
    rules: { "no-restricted-syntax": "off" },
  },
];
