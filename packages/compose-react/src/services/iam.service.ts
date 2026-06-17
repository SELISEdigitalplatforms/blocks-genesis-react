import { OrganizationService } from "./organization.service";

class IAMService {
  constructor(public organization: OrganizationService) {}
}

export const iamService = new IAMService(new OrganizationService());
