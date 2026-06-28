import type { Id } from "@/types";

export interface BaseUser {
  sub: Id;
  name: string;
  preferred_username: string;
  email: string;
  tenant_id: Id;
  org_id: "default" | Id;
  service_access: ["blocks-iam", "blocks-os", "blocks-logic", "blocks-monitor"];
}

export interface UserDetails extends BaseUser {
  itemId: Id;
  createdDate: string;
  lastUpdatedDate: string;
  language: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  organizationIds: Id[];
  lastUsedOrganizationId: Id | null;
  roles: Record<string, string[]>;
  permissions: Record<string, string[]>;
  active: boolean;
  status: number;
  statusReason: string | null;
  deactivatedAtUtc: string | null;
  isVerified: boolean;
  emailVerifiedAtUtc: string | null;
  phoneVerifiedAtUtc: string | null;
  profileImageUrl: string;
  profileImageId: Id;
  mfaEnabled: boolean;
  isMfaVerified: boolean;
  userMfaType: number;
  lastLoggedInTime: string;
  lastLoggedInDeviceInfo: string;
  logInCount: number;
  firstLoggedInTime: string;
  provisioningSource: number;
  externalIdentities: unknown[];
  userCreationType: number;
  department: string | null;
  employeeId: Id | null;
  isMultiOrgEnabled: boolean;
  organizations: IMembership[];
}

export interface IMembership {
  organizationId: Id;
  roles: string[];
  permissions: string[];
}
