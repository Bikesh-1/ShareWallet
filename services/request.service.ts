import {
  GroupRequestsResponse,
  RequestDetailsResponse,
  SendRequestPayload,
  SendRequestResponse,
  UpdateRequestPayload,
  UpdateRequestResponse,
} from "@/types/request";

export const sendRequest = async (
  groupCode: string,
  data: SendRequestPayload
): Promise<SendRequestResponse> => {
  const response = await fetch(`/api/group/${groupCode}/sendRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to send request.");
  }

  return result;
};

export const getGroupRequests = async (
  groupCode: string
): Promise<GroupRequestsResponse> => {
  const response = await fetch(`/api/group/${groupCode}/sendRequest`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch requests.");
  }

  return result;
};

export const getRequestDetails = async (
  groupCode: string,
  requestId: string
): Promise<RequestDetailsResponse> => {
  const response = await fetch(
    `/api/group/${groupCode}/sendRequest/${requestId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch request details.");
  }

  return result;
};

export const updateRequestStatus = async (
  groupCode: string,
  requestId: string,
  data: UpdateRequestPayload
): Promise<UpdateRequestResponse> => {
  const response = await fetch(
    `/api/group/${groupCode}/sendRequest/${requestId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update request status.");
  }

  return result;
};

export const updateRequestApproval = async (
  groupCode: string,
  requestId: string,
  data: { status: "APPROVED" | "REJECTED" }
) => {
  const response = await fetch(
    `/api/group/${groupCode}/sendRequest/${requestId}/approval`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to update request approval.");
  }
  return result;
};
