import { Group } from "@/types/group";

async function readJsonResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const body = await res.text();
        console.error("Expected JSON from API, received:", {
            url: res.url, status: res.status, contentType, body: body.slice(0, 300),
        });
        throw new Error(`API returned non-JSON response (${res.status}). Check the API URL and server logs.`);
    }
    return res.json() as Promise<T>;
}

export async function getGroupList(): Promise<Group[]> {
    const res = await fetch("/api/group/creategroup");
    const data = await readJsonResponse<{ message?: string; error?: string; groupDetails: Group[] }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch groups");
    return data.groupDetails;
}

export async function createGroup(body: {
    groupName: string;
    description: string;
    monthlyContribution: number;
    dueDate: string;
    totalAmount: number;
}) {
    const res = await fetch("/api/group/creategroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await readJsonResponse<{ error?: string; message?: string }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to create group");
    return data;
}

export async function addingFriend(body: { groupCode: string; coustumerId: string }) {
    const res = await fetch("/api/group/addmember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await readJsonResponse<{ error?: string; message?: string }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to add group member");
    return data;
}