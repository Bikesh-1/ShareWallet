"use client"

import { getFriendList } from "@/services/friend.service";
import { useQuery } from "@tanstack/react-query";

export function useFriendList() {
    return useQuery({
        queryKey: ["friend"],
        queryFn: getFriendList,
        staleTime: 15_000,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    })
}
