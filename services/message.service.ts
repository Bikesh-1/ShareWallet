import { Message } from "@/types/message";

export async function getMessages(groupCode: string): Promise<Message[]> {
    const res = await fetch(`/api/group/${encodeURIComponent(groupCode)}/message`);
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const body = await res.text();
        console.error("Expected JSON from API, received:", {
            url: res.url, status: res.status, contentType, body: body.slice(0, 300),
        });
        throw new Error(`API returned non-JSON response (${res.status}). Check the API URL and server logs.`);
    }
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    return data.data;
}