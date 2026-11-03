/**
 * `@seliseblocks/genesis-os/eslint` — shared lint rules for Blocks applications.
 *
 * ESLint 9 (flat config):
 *   import { noHardcodedTextRule, hardcodedTextExemptFiles } from "@seliseblocks/genesis-os/eslint";
 *   export default [..., { rules: { "no-restricted-syntax": noHardcodedTextRule } },
 *                        { files: [...hardcodedTextExemptFiles], rules: { "no-restricted-syntax": "off" } }];
 *
 * ESLint 8 (.eslintrc.cjs):
 *   const { noHardcodedTextRule, hardcodedTextExemptFiles } = require("@seliseblocks/genesis-os/eslint");
 *   module.exports = { ..., rules: { "no-restricted-syntax": noHardcodedTextRule },
 *     overrides: [{ files: [...hardcodedTextExemptFiles], rules: { "no-restricted-syntax": "off" } }] };
 *
 * A repository that already uses `no-restricted-syntax` merges `hardcodedTextSelectors` into its own entry.
 */
export {
  HARDCODED_TEXT_MESSAGE,
  hardcodedTextExemptFiles,
  hardcodedTextSelectors,
  noHardcodedTextRule,
} from "./no-hardcoded-text.js";
