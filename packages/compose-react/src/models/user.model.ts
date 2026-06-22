export interface BaseUser {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  language: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  organizationIds: string[];
  lastUsedOrganizationId: string | null;
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
  profileImageId: string;
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
  employeeId: string | null;
  isMultiOrgEnabled: boolean;
  organizations: IMembership[];
}

export interface IMembership {
  organizationId: string;
  roles: string[];
  permissions: string[];
}
