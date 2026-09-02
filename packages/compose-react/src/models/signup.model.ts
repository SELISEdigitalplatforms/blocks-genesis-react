export interface GetSignUpSettingResponse {
  isSignUpEnable: boolean;
  isEmailPasswordSignUpEnabled: boolean;
  isSSoSignUpEnabled: boolean;
  defaultRolesForNewUser: string[];
  defaultPermissionsForNewUser: string[];
}
