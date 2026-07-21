import { iamService } from "@/services/iam.service";
import { useQuery } from "@tanstack/react-query";

export const useGetMyOrganizations = () => {
  return useQuery({
    queryKey: ["organizations", "my"],
    queryFn: () => iamService.organization.getMyOrganizations(),
    enabled: false,
  });
};
