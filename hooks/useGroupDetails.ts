"use client"

import { getGroupList } from "@/services/group.service";
import { useQuery } from "@tanstack/react-query";

export function useGroupDetails() {
    return useQuery({
        queryKey: ["group"],
        queryFn: getGroupList,
        staleTime: 15_000,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    })
}
