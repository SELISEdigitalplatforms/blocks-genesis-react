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
import StudioIconLight from "@/assets/images/apps/studio-app-dark.svg";
import StudioIconDark from "@/assets/images/apps/studio-app-light.svg";
import type { BlocksApp } from "./app-switcher";

export const APP_SWITCHER_DATA: BlocksApp[] = [
  {
    key: "blocks-iam",
    label: "IAM",
    description: "Identity & Access",
    url: window.process?.env.BLOCKS_IAM_BASE_URL || "",
    icon: {
      darkModeIcon: IamIconDark,
      lightModeIcon: IamIconLight,
    },
    clientId: "BLOCKS_IAM_CLIENT_ID",
    redirectUri: "BLOCKS_IAM_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-localization",
    label: "Localization",
    description: "Localization",
    url: window.process?.env.BLOCKS_LOCALIZATION_BASE_URL || "",
    icon: {
      darkModeIcon: LocalizationIconDark,
      lightModeIcon: LocalizationIconLight,
    },
    clientId: "BLOCKS_LOCALIZATION_CLIENT_ID",
    redirectUri: "BLOCKS_LOCALIZATION_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-agents",
    label: "Agents",
    description: "AI Platform",
    url: window.process?.env.BLOCKS_AGENTS_BASE_URL || "",
    icon: {
      darkModeIcon: AgentsIconDark,
      lightModeIcon: AgentsIconLight,
    },
    clientId: "BLOCKS_AGENTS_CLIENT_ID",
    redirectUri: "BLOCKS_AGENTS_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-data",
    label: "Data",
    description: "Data Integration",
    url: window.process?.env.BLOCKS_DATA_BASE_URL || "",
    icon: {
      darkModeIcon: DataIconDark,
      lightModeIcon: DataIconLight,
    },
    clientId: "BLOCKS_DATA_CLIENT_ID",
    redirectUri: "BLOCKS_DATA_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-os",
    label: "OS",
    description: "Operating System",
    url: window.process?.env.BLOCKS_OS_BASE_URL || "",
    icon: {
      darkModeIcon: OsIconDark,
      lightModeIcon: OsIconLight,
    },
    clientId: "BLOCKS_OS_CLIENT_ID",
    redirectUri: "BLOCKS_OS_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-utilities",
    label: "Utilities",
    description: "Utility Tools",
    url: window.process?.env.BLOCKS_UTILITIES_BASE_URL || "",
    icon: {
      darkModeIcon: UtilitiesIconDark,
      lightModeIcon: UtilitiesIconLight,
    },
    clientId: "BLOCKS_UTILITIES_CLIENT_ID",
    redirectUri: "BLOCKS_UTILITIES_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-logic",
    label: "Logic",
    description: "Business Logic",
    url: window.process?.env.BLOCKS_LOGIC_BASE_URL || "",
    icon: {
      darkModeIcon: LogicIconDark,
      lightModeIcon: LogicIconLight,
    },
    clientId: "BLOCKS_LOGIC_CLIENT_ID",
    redirectUri: "BLOCKS_LOGIC_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-monitor",
    label: "Monitor",
    description: "Monitoring & Logs",
    url: window.process?.env.BLOCKS_MONITOR_BASE_URL || "",
    icon: {
      darkModeIcon: MonitorIconDark,
      lightModeIcon: MonitorIconLight,
    },
    clientId: "BLOCKS_MONITOR_CLIENT_ID",
    redirectUri: "BLOCKS_MONITOR_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-release",
    label: "Release",
    description: "CI/CD & Releases",
    url: window.process?.env.BLOCKS_RELEASE_BASE_URL || "",
    icon: {
      darkModeIcon: ReleaseIconDark,
      lightModeIcon: ReleaseIconLight,
    },
    clientId: "BLOCKS_RELEASE_CLIENT_ID",
    redirectUri: "BLOCKS_RELEASE_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
  {
    key: "blocks-studio",
    label: "Studio",
    description: "Development Platform",
    url: window.process?.env.BLOCKS_STUDIO_BASE_URL || "",
    icon: {
      darkModeIcon: StudioIconDark,
      lightModeIcon: StudioIconLight,
    },
    clientId: "BLOCKS_STUDIO_CLIENT_ID",
    redirectUri: "BLOCKS_STUDIO_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
  },
];
