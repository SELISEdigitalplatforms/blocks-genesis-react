import type { BlocksApp } from "./app-switcher";
import AgentsIconLight from "@/assets/images/apps/agents-app-dark.svg";
import AgentsIconDark from "@/assets/images/apps/agents-app-light.svg";
import DataIconLight from "@/assets/images/apps/data-app-dark.svg";
import DataIconDark from "@/assets/images/apps/data-app-light.svg";
import IamIconLight from "@/assets/images/apps/iam-app-dark.svg";
import IamIconDark from "@/assets/images/apps/iam-app-light.svg";
import LocalizationIconLight from "@/assets/images/apps/localization-app-dark.svg";
import LocalizationIconDark from "@/assets/images/apps/localization-app-light.svg";
import LogicIconLight from "@/assets/images/apps/logic-app-dark.svg";
import LogicIconDark from "@/assets/images/apps/logic-app-light.svg";
import MonitorIconLight from "@/assets/images/apps/monitor-app-dark.svg";
import MonitorIconDark from "@/assets/images/apps/monitor-app-light.svg";
import OsIconLight from "@/assets/images/apps/os-app-dark.svg";
import OsIconDark from "@/assets/images/apps/os-app-light.svg";
import ReleaseIconLight from "@/assets/images/apps/release-app-dark.svg";
import ReleaseIconDark from "@/assets/images/apps/release-app-light.svg";
import UtilitiesIconLight from "@/assets/images/apps/utilities-app-dark.svg";
import UtilitiesIconDark from "@/assets/images/apps/utilities-app-light.svg";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const APP_SWITCHER_DATA: BlocksApp[] = [
  {
    key: "iam",
    label: "IAM",
    description: "Identity & Access",
    url: getRuntimeEnv("BLOCKS_IAM_BASE_URL"),
    icon: {
      darkModeIcon: IamIconDark,
      lightModeIcon: IamIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_IAM_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_AGENTS_CALLBACK_URL"),
  },
  {
    key: "localization",
    label: "Localization",
    description: "Localization",
    url: getRuntimeEnv("BLOCKS_LOCALIZATION_BASE_URL"),
    icon: {
      darkModeIcon: LocalizationIconDark,
      lightModeIcon: LocalizationIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_LOCALIZATION_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_LOCALIZATION_CALLBACK_URL"),
  },
  {
    key: "agents",
    label: "Agents",
    description: "AI Platform",
    url: getRuntimeEnv("BLOCKS_AGENTS_BASE_URL"),
    icon: {
      darkModeIcon: AgentsIconDark,
      lightModeIcon: AgentsIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_AGENTS_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_AGENTS_CALLBACK_URL"),
  },
  {
    key: "data",
    label: "Data",
    description: "Data Integration",
    url: getRuntimeEnv("BLOCKS_DATA_BASE_URL"),
    icon: {
      darkModeIcon: DataIconDark,
      lightModeIcon: DataIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_DATA_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_DATA_CALLBACK_URL"),
  },
  {
    key: "os",
    label: "OS",
    description: "Operating System",
    url: getRuntimeEnv("BLOCKS_OS_BASE_URL"),
    icon: {
      darkModeIcon: OsIconDark,
      lightModeIcon: OsIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_OS_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_OS_CALLBACK_URL"),
  },
  {
    key: "utilities",
    label: "Utilities",
    description: "Utility Tools",
    url: getRuntimeEnv("BLOCKS_UTILITIES_BASE_URL"),
    icon: {
      darkModeIcon: UtilitiesIconDark,
      lightModeIcon: UtilitiesIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_UTILITIES_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_UTILITIES_CALLBACK_URL"),
  },
  {
    key: "logic",
    label: "Logic",
    description: "Business Logic",
    url: getRuntimeEnv("BLOCKS_LOGIC_BASE_URL"),
    icon: {
      darkModeIcon: LogicIconDark,
      lightModeIcon: LogicIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_LOGIC_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_LOGIC_CALLBACK_URL"),
  },
  {
    key: "monitor",
    label: "Monitor",
    description: "Monitoring & Logs",
    url: getRuntimeEnv("BLOCKS_MONITOR_BASE_URL"),
    icon: {
      darkModeIcon: MonitorIconDark,
      lightModeIcon: MonitorIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_MONITOR_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_MONITOR_CALLBACK_URL"),
  },
  {
    key: "release",
    label: "Release",
    description: "CI/CD & Releases",
    url: getRuntimeEnv("BLOCKS_RELEASE_BASE_URL"),
    icon: {
      darkModeIcon: ReleaseIconDark,
      lightModeIcon: ReleaseIconLight,
    },
    clientId: getRuntimeEnv("BLOCKS_RELEASE_CLIENT_ID"),
    redirectUri: getRuntimeEnv("BLOCKS_RELEASE_CALLBACK_URL"),
  },
];


