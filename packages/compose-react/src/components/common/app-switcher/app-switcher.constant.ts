import AgentsIcon from "@/assets/images/apps/v2/Agents.svg";
import DataIcon from "@/assets/images/apps/v2/Data.svg";
import IamIcon from "@/assets/images/apps/v2/IAM.svg";
import LocalizationIcon from "@/assets/images/apps/v2/Localization.svg";
import LogicIcon from "@/assets/images/apps/v2/Logic.svg";
import MonitorIcon from "@/assets/images/apps/v2/Monitor.svg";
import OsIcon from "@/assets/images/apps/v2/OS.svg";
import ReleaseIcon from "@/assets/images/apps/v2/Release.svg";
import StudioIcon from "@/assets/images/apps/v2/Studio.svg";
import UtilitiesIcon from "@/assets/images/apps/v2/Utilities.svg";
import type { BlocksApp } from "./app-switcher.types";

const APP_SWITCHER_DATA: BlocksApp[] = [
  {
    key: "blocks-iam",
    label: "IAM",
    description: "Identity & Access",
    url: window.process?.env.BLOCKS_IAM_BASE_URL || "",
    icon: IamIcon,
    clientId: "BLOCKS_IAM_CLIENT_ID",
    redirectUri: "BLOCKS_IAM_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-localization",
    label: "Localization",
    description: "Localization",
    url: window.process?.env.BLOCKS_LOCALIZATION_BASE_URL || "",
    icon: LocalizationIcon,
    clientId: "BLOCKS_LOCALIZATION_CLIENT_ID",
    redirectUri: "BLOCKS_LOCALIZATION_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-agents",
    label: "Agents",
    description: "AI Platform",
    url: window.process?.env.BLOCKS_AGENTS_BASE_URL || "",
    icon: AgentsIcon,
    clientId: "BLOCKS_AGENTS_CLIENT_ID",
    redirectUri: "BLOCKS_AGENTS_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-data",
    label: "Data",
    description: "Data Integration",
    url: window.process?.env.BLOCKS_DATA_BASE_URL || "",
    icon: DataIcon,
    clientId: "BLOCKS_DATA_CLIENT_ID",
    redirectUri: "BLOCKS_DATA_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-os",
    label: "OS",
    description: "Operating System",
    url: window.process?.env.BLOCKS_OS_BASE_URL || "",
    icon: OsIcon,
    clientId: "BLOCKS_OS_CLIENT_ID",
    redirectUri: "BLOCKS_OS_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-utilities",
    label: "Utilities",
    description: "Utility Tools",
    url: window.process?.env.BLOCKS_UTILITIES_BASE_URL || "",
    icon: UtilitiesIcon,
    clientId: "BLOCKS_UTILITIES_CLIENT_ID",
    redirectUri: "BLOCKS_UTILITIES_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-logic",
    label: "Logic",
    description: "Business Logic",
    url: window.process?.env.BLOCKS_LOGIC_BASE_URL || "",
    icon: LogicIcon,
    clientId: "BLOCKS_LOGIC_CLIENT_ID",
    redirectUri: "BLOCKS_LOGIC_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-monitor",
    label: "Monitor",
    description: "Monitoring & Logs",
    url: window.process?.env.BLOCKS_MONITOR_BASE_URL || "",
    icon: MonitorIcon,
    clientId: "BLOCKS_MONITOR_CLIENT_ID",
    redirectUri: "BLOCKS_MONITOR_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-release",
    label: "Release",
    description: "CI/CD & Releases",
    url: window.process?.env.BLOCKS_RELEASE_BASE_URL || "",
    icon: ReleaseIcon,
    clientId: "BLOCKS_RELEASE_CLIENT_ID",
    redirectUri: "BLOCKS_RELEASE_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
  {
    key: "blocks-studio",
    label: "Studio",
    description: "Development Platform",
    url: window.process?.env.BLOCKS_STUDIO_BASE_URL || "",
    icon: StudioIcon,
    clientId: "BLOCKS_STUDIO_CLIENT_ID",
    redirectUri: "BLOCKS_STUDIO_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isDisabled: false,
  },
];

export const filteredAppSwitcherData = APP_SWITCHER_DATA.filter((app) =>
  typeof app.isDisabled === "function" ? !app.isDisabled() : !app.isDisabled,
);
