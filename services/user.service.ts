import { UserDetails } from "@/types/user";

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

export async function getUserDetails(): Promise<UserDetails> {
    const res = await fetch("/api/userdetails");
    const data = await readJsonResponse<{ error?: string; message?: string; userDetails: UserDetails }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch profile");
    return data.userDetails;
}

export async function createUserDetails(body: {
    name: string;
    dateOfbirth: string;
    mobileNumber: string;
}) {
    const res = await fetch("/api/userdetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await readJsonResponse<{ error?: string; message?: string }>(res);
    if (!res.ok) throw new Error(data.error || data.message || "Failed to save profile");
    return data;
}