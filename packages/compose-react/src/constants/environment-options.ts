import { tStatic } from "@/i18n";

const MODULE = "genesis.shared";

// `label` and `subtext` are read when shown, so a language change is picked up.
export const environmentOptions = [
  {
    index: 0,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.DEV_LABEL");
    },
    value: "dev",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.DEV_SUBTEXT");
    },
  },
  {
    index: 1,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.TEST_LABEL");
    },
    value: "test",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.TEST_SUBTEXT");
    },
  },
  {
    index: 2,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.STG_LABEL");
    },
    value: "stg",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.STG_SUBTEXT");
    },
  },
  {
    index: 3,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.IAT_LABEL");
    },
    value: "iat",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.IAT_SUBTEXT");
    },
  },
  {
    index: 4,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.UAT_LABEL");
    },
    value: "uat",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.UAT_SUBTEXT");
    },
  },
  {
    index: 5,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.PROD_SHADOW_LABEL");
    },
    value: "prod-shadow",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.PROD_SHADOW_SUBTEXT");
    },
  },
  {
    index: 6,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.PRE_PROD_LABEL");
    },
    value: "pre-prod",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.PRE_PROD_SUBTEXT");
    },
  },
  {
    index: 7,
    get label() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.PROD_LABEL");
    },
    value: "prod",
    get subtext() {
      return tStatic(MODULE, "ENVIRONMENT_OPTIONS.PROD_SUBTEXT");
    },
  },
];
