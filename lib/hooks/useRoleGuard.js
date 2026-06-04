"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTokenRole } from "@/lib/utils/toast";

/**
 * Route → allowed roles mapping.
 * Roles are compared case-insensitively.
 */
const ROUTE_ROLES = [
  { prefix: "/admin",                     roles: ["admin"] },
  { prefix: "/service-center",            roles: ["servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/booking-requests",          roles: ["servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/availability",              roles: ["servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/spare-parts-inventory",     roles: ["servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/user-dashboard",            roles: ["user", "client"] },
  { prefix: "/cars",                      roles: ["user", "client"] },
  { prefix: "/bookings",                  roles: ["user", "client"] },
  { prefix: "/book-service",             roles: ["user", "client"] },
  { prefix: "/reservations",              roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/mycar",                     roles: ["user", "client"] },
  { prefix: "/user-profile",              roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/notifications",             roles: ["user", "client"] },
  { prefix: "/booking-success",          roles: ["user", "client"] },
  { prefix: "/reviews/write",            roles: ["user", "client"] },
  { prefix: "/reviews",                   roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic"] },
  { prefix: "/service-centers",           roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic", "admin"] },
  { prefix: "/service-center-profile",     roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic", "admin"] },
  { prefix: "/spare-parts-search",        roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic", "admin"] },
  { prefix: "/spare-parts-results",       roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic", "admin"] },
  { prefix: "/spare-parts-details",       roles: ["user", "client", "servicecenter", "servicecenterowner", "mechanic", "admin"] },
];

/**
 * Client-side role guard hook.
 *
 * Usage:
 *   const { authorized, checking } = useRoleGuard();
 *
 * If the user's JWT role doesn't match the current route's allowed roles,
 * the hook redirects to /login (unauthenticated) or the correct dashboard
 * (wrong role).
 *
 * Returns:
 *   - authorized: boolean — true when the user is allowed on this page
 *   - checking:   boolean — true while the guard is evaluating
 *   - role:       string | null — the decoded role from the JWT
 */
export function useRoleGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const role = getTokenRole();

  useEffect(() => {
    // Find the route rule that matches the current path (most specific/longest prefix first)
    const rule = [...ROUTE_ROLES]
      .sort((a, b) => b.prefix.length - a.prefix.length)
      .find((r) => pathname.startsWith(r.prefix));

    // If no rule covers this route, it's a public page — allow access
    if (!rule) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    // No token at all → redirect to login
    if (!role) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    const normalizedRole = role.toLowerCase();
    const isAllowed = rule.roles.includes(normalizedRole);

    if (isAllowed) {
      setAuthorized(true);
      setChecking(false);
    } else {
      // Redirect to the correct dashboard for their role
      const dest = getDashboardForRole(normalizedRole);
      router.replace(dest);
    }
  }, [pathname, role, router]);

  return { authorized, checking, role };
}

/**
 * Returns the correct dashboard path for a given role.
 */
function getDashboardForRole(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "servicecenter":
    case "servicecenterowner":
    case "mechanic":
      return "/service-center";
    case "user":
    case "client":
    default:
      return "/user-dashboard";
  }
}

export default useRoleGuard;
