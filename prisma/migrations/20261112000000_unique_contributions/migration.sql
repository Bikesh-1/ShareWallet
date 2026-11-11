-- Prevent duplicate monthly contributions per user/group while allowing multiple
-- request-linked contributions (requestId is non-null for those records).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Contribution"
    WHERE "requestId" IS NULL
    GROUP BY "userId", "groupId", "month"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate monthly contributions exist. Reconcile duplicate Contribution rows before applying this migration.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "Contribution"
    WHERE "requestId" IS NOT NULL
    GROUP BY "requestId", "userId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate request-linked contributions exist. Reconcile duplicate Contribution rows before applying this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX "Contribution_monthly_user_group_unique"
ON "Contribution" ("userId", "groupId", "month")
WHERE "requestId" IS NULL;

CREATE UNIQUE INDEX "Contribution_request_user_unique"
ON "Contribution" ("requestId", "userId")
WHERE "requestId" IS NOT NULL;
