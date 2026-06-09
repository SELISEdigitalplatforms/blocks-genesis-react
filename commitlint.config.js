export default {
  // extends: ['@commitlint/config-conventional'],
  extends: [],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["ui", "hooks", "docs", "tooling", "release", "deps", "cli", "chore", "test"],
    ],
  },
};
