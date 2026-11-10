import {
  GroupRequestsResponse,
  RequestDetailsResponse,
  SendRequestPayload,
  SendRequestResponse,
  UpdateRequestPayload,
  UpdateRequestResponse,
} from "@/types/request";

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const body = await response.text();
    console.error("Expected JSON from API, received:", {
      url: response.url,
      status: response.status,
      contentType,
      body: body.slice(0, 300),
    });
    throw new Error(`API returned non-JSON response (${response.status}). Check the API URL and server logs.`);
  }
  return response.json() as Promise<T>;
}

export const sendRequest = async (groupCode: string, data: SendRequestPayload): Promise<SendRequestResponse> => {
  const response = await fetch(`/api/group/${encodeURIComponent(groupCode)}/sendRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await readJsonResponse<SendRequestResponse & { error?: string }>(response);
  if (!response.ok) throw new Error(result.error || "Failed to send request.");
  return result;
};

export const getGroupRequests = async (groupCode: string): Promise<GroupRequestsResponse> => {
  const response = await fetch(`/api/group/${encodeURIComponent(groupCode)}/sendRequest`);
  const result = await readJsonResponse<GroupRequestsResponse & { error?: string }>(response);
  if (!response.ok) throw new Error(result.error || "Failed to fetch requests.");
  return result;
};

export const getRequestDetails = async (groupCode: string, requestId: string): Promise<RequestDetailsResponse> => {
  const response = await fetch(
    `/api/group/${encodeURIComponent(groupCode)}/sendRequest/${encodeURIComponent(requestId)}`
  );
  const result = await readJsonResponse<RequestDetailsResponse & { error?: string }>(response);
  if (!response.ok) throw new Error(result.error || "Failed to fetch request details.");
  return result;
};

export const updateRequestStatus = async (
  groupCode: string,
  requestId: string,
  data: UpdateRequestPayload
): Promise<UpdateRequestResponse> => {
  const response = await fetch(
    `/api/group/${encodeURIComponent(groupCode)}/sendRequest/${encodeURIComponent(requestId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  const result = await readJsonResponse<UpdateRequestResponse & { error?: string }>(response);
  if (!response.ok) throw new Error(result.error || "Failed to update request status.");
  return result;
};

export const updateRequestApproval = async (
  groupCode: string,
  requestId: string,
  data: { status: "APPROVED" | "REJECTED" }
) => {
  const response = await fetch(
    `/api/group/${encodeURIComponent(groupCode)}/sendRequest/${encodeURIComponent(requestId)}/approval`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  const result = await readJsonResponse<{ error?: string; message?: string }>(response);
  if (!response.ok) throw new Error(result.error || "Failed to update request approval.");
  return result;
};