import config from "@blocks-kit/eslint-config/react";

export default [
  ...config,
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      // shadcn primitives intentionally co-locate components, hooks,
      // contexts, and CVA variants in one file. Disabling these for the
      // primitives folder keeps the upstream files copy-paste compatible
      // with `pnpm dlx shadcn@latest add ...`.
      "react-refresh/only-export-components": "off",
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "vaul-drawer-wrapper"] },
      ],
    },
  },
];
