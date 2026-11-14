import { useQuery } from "@tanstack/react-query";
import { getGroupRequests } from "@/services/request.service";

export const useGroupRequests = (groupCode: string) => {
  return useQuery({
    queryKey: ["requests", groupCode],
    queryFn: () => getGroupRequests(groupCode),
    enabled: !!groupCode,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
};
