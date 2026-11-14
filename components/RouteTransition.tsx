"use client";

import { usePathname } from "next/navigation";

export default function RouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="sw-page-enter">
      {children}
    </div>
  );
}
