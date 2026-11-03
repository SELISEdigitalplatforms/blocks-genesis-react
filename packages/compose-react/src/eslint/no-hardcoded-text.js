// Shared "no hard-coded user-facing text" lint rule for every Blocks application.
// Plain JavaScript so this package's own eslint.config.js can import it before it is built; it is also
// published as `@seliseblocks/genesis-os/eslint` (ESM and CJS) for the apps.
// Uses ESLint's built-in `no-restricted-syntax`, so consumers need no extra plugin.

export const HARDCODED_TEXT_MESSAGE =
  "User-facing text must use an i18n key (useT/tStatic) in the module's .en.json, not a hard-coded string.";

/**
 * Selectors for user-facing text written directly in JSX: text with at least two lowercase letters (so
 * acronyms such as SAST pass) and string or plain template values of placeholder, title, alt and aria-label.
 */
export const hardcodedTextSelectors = [
  { selector: "JSXText[value=/[a-z]{2,}/]", message: HARDCODED_TEXT_MESSAGE },
  {
    selector:
      "JSXAttribute[name.name=/^(placeholder|title|alt|aria-label)$/] > Literal[value=/[a-z]{2,}/]",
    message: HARDCODED_TEXT_MESSAGE,
  },
  {
    selector:
      "JSXAttribute[name.name=/^(placeholder|title|alt|aria-label)$/] > JSXExpressionContainer > TemplateLiteral[expressions.length=0][quasis.0.value.raw=/[a-z]{2,}/]",
    message: HARDCODED_TEXT_MESSAGE,
  },
];

/** The rule entry, ready for `rules: { "no-restricted-syntax": noHardcodedTextRule }`. */
export const noHardcodedTextRule = ["error", ...hardcodedTextSelectors];

/** Files where hard-coded text is expected (tests, stories, test helpers); turn the rule off for these. */
export const hardcodedTextExemptFiles = [
  "**/*.test.{ts,tsx}",
  "**/*.spec.{ts,tsx}",
  "**/*.stories.{ts,tsx}",
  "**/__tests__/**",
  "**/__mocks__/**",
  "**/test-utils/**",
];
