import { UserDetails } from "./user";

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type SentRequest = {
  id: string;
  userId: string;
  groupId: string;
  reason: string;
  amount: string;
  /** Confirmed repayments already made against this request. */
  repaidAmount?: number;
  /** Repayment amount submitted but not yet confirmed. */
  pendingRepaymentAmount?: number;
  /** Remaining amount still owed on this request. */
  outstandingAmount?: number;
  month: string;
  status: RequestStatus;
  approvals?: { status: "PENDING" | "APPROVED" | "REJECTED" }[];
  requestAt: string;
  actionAt: string | null;
  user: {
    id: string;
    email: string;
    userdetails: UserDetails;
  };
};

export type SendRequestPayload = {
  reason: string;
  amount: string;
  month: string;
};


export type SendRequestResponse = {
  message: string;
  counts: {
    pending: number;
    accepted: number;
    rejected: number;
  };
};

export type GroupRequestsResponse = {
  sentrequestDetails: SentRequest[];
  currentUserId: string;
  message: string;
};

export type RequestDetailsResponse = {
  sentRequestDetails: SentRequest;
  message: string;
};

export type UpdateRequestPayload = {
  status: Exclude<RequestStatus, "PENDING">;
};

export type UpdateRequestResponse = {
  statusDecided: SentRequest;
  message: string;
};