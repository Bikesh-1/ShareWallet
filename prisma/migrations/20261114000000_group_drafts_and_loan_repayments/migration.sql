ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'LOAN_REPAYMENT';

ALTER TABLE "Group"
  ADD COLUMN "repaymentDueDate" TEXT,
  ADD COLUMN "repaymentTerms" TEXT,
  ADD COLUMN "interestFree" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE "GroupDraft" (
  "id" TEXT NOT NULL,
  "draftCode" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "isFinalized" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupDraftMember" (
  "id" TEXT NOT NULL,
  "draftId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupDraftMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupDraftMessage" (
  "id" TEXT NOT NULL,
  "draftId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupDraftMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GroupDraft_draftCode_key" ON "GroupDraft"("draftCode");
CREATE INDEX "GroupDraft_creatorId_idx" ON "GroupDraft"("creatorId");
CREATE UNIQUE INDEX "GroupDraftMember_draftId_userId_key" ON "GroupDraftMember"("draftId", "userId");
CREATE INDEX "GroupDraftMember_userId_idx" ON "GroupDraftMember"("userId");
CREATE INDEX "GroupDraftMessage_draftId_createdAt_idx" ON "GroupDraftMessage"("draftId", "createdAt");

ALTER TABLE "GroupDraft"
  ADD CONSTRAINT "GroupDraft_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupDraftMember"
  ADD CONSTRAINT "GroupDraftMember_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "GroupDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "GroupDraftMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupDraftMessage"
  ADD CONSTRAINT "GroupDraftMessage_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "GroupDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "GroupDraftMessage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
