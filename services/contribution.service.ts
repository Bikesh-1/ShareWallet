import { Activity } from "@/types/activity";
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

export async function getContributionGroupList(groupCode: string): Promise<Group> {
    const res = await fetch(`/api/group/${encodeURIComponent(groupCode)}`);
    const data = await readJsonResponse<{ error?: string; message?: string; groupDetails: Group }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch group");
    return data.groupDetails;
}

export async function getContribution(groupCode: string): Promise<Activity[]> {
    const res = await fetch(`/api/group/${encodeURIComponent(groupCode)}/contribution`);
    const data = await readJsonResponse<{ error?: string; message?: string; contributionDetails: Activity[] }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch contributions");
    return data.contributionDetails;
}

export async function contribution(body: { groupCode: string; amount: number; month: string }) {
    const { groupCode, amount, month } = body;
    const res = await fetch(`/api/group/${encodeURIComponent(groupCode)}/contribution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, month }),
    });
    const data = await readJsonResponse<{ error?: string; message?: string }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to submit contribution");
    return data;
}