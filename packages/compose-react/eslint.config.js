import config from "@blocks-kit/eslint-config/react";

const HARDCODED_TEXT =
  "User-facing text must use an i18n key (useT/tStatic) in the module's .en.json, not a hard-coded string.";

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
  // No hard-coded user-facing text: visible JSX text and the placeholder/title/alt/aria-label attributes go through
  // i18n keys in src/i18n/locales/<module>.en.json (English only; other languages come from the localization
  // service). Only text with two or more lowercase letters is flagged, so acronyms and symbols pass.
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "JSXText[value=/[a-z]{2,}/]", message: HARDCODED_TEXT },
        {
          selector:
            "JSXAttribute[name.name=/^(placeholder|title|alt|aria-label)$/] > Literal[value=/[a-z]{2,}/]",
          message: HARDCODED_TEXT,
        },
        {
          selector:
            "JSXAttribute[name.name=/^(placeholder|title|alt|aria-label)$/] > JSXExpressionContainer > TemplateLiteral[expressions.length=0][quasis.0.value.raw=/[a-z]{2,}/]",
          message: HARDCODED_TEXT,
        },
      ],
    },
  },
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/*.stories.{ts,tsx}",
      "**/__tests__/**",
      "**/__mocks__/**",
      "**/test-utils/**",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
];
