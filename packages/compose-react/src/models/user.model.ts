export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  profileImageId: string;
  lastUsedOrganizationId: string | null;
  roles: Record<string, string[]>;
}
