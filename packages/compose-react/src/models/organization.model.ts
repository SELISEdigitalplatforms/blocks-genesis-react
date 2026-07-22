export interface IMyOrganization {
  itemId: string;
  name: string;
  createdDate: string;
}
export interface IGetMyOrganizationsResponse {
  organizations: IMyOrganization[];
  errors: unknown;
  isSuccess: boolean;
}
