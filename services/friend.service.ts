import { FriendList } from "@/types/friend";

async function readJsonResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const body = await res.text();
        console.error("Expected JSON from API, received:", {
            url: res.url,
            status: res.status,
            contentType,
            body: body.slice(0, 300),
        });
        throw new Error(`API returned non-JSON response (${res.status}). Check the API URL and server logs.`);
    }

    return res.json() as Promise<T>;
}

export async function getFriendList(): Promise<FriendList[]> {
    const res = await fetch("/api/addfriends");
    const data = await readJsonResponse<{ message?: string; error?: string; friendlist: FriendList[] }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch friends");
    return data.friendlist;
}

export async function createFriend(body: { coustumerId: string }) {
    const res = await fetch("/api/addfriends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await readJsonResponse<{ message?: string; error?: string }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to add friend");
    return data;
}