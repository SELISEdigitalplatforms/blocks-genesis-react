import { userService } from "@/services/user.service";
import { useUserStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export const useGetUserInfo = (options?: { enabled?: boolean }) => {
  const userStore = useUserStore();
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      const user = await userService.getUserInfo();
      userStore.setUserDetails(user.data);
      return user;
    },
    ...options,
  });
};
