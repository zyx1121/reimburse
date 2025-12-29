/**
 * Role management utilities for multi-system role management
 *
 * Roles are stored in user_profiles.roles as JSONB:
 * All systems (bento, reimburse, img) use only 'admin' and 'user' roles.
 * Example: {
 *   "bento": ["admin"],
 *   "reimburse": ["user"],
 *   "img": ["admin"]
 * }
 */

export type SystemName = "bento" | "reimburse" | "img";

export type Roles = Partial<Record<SystemName, string[]>>;

export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  is_admin?: boolean | null;
  roles?: Roles | null;
  created_at?: string;
}

/**
 * Check if user has a specific role in a system
 */
export function hasRole(
  roles: Roles | null | undefined,
  system: SystemName,
  role: string
): boolean {
  if (!roles || !roles[system]) {
    return false;
  }
  return roles[system]!.includes(role);
}

/**
 * Check if user has any role in a system
 */
export function hasAnyRoleInSystem(
  roles: Roles | null | undefined,
  system: SystemName
): boolean {
  if (!roles || !roles[system]) {
    return false;
  }
  return Array.isArray(roles[system]) && roles[system]!.length > 0;
}

/**
 * Check if user is admin in a specific system
 */
export function isSystemAdmin(
  roles: Roles | null | undefined,
  system: SystemName
): boolean {
  return hasRole(roles, system, "admin");
}

/**
 * Check if user is admin in any system (legacy support)
 */
export function isGlobalAdmin(
  roles: Roles | null | undefined,
  isAdmin?: boolean | null
): boolean {
  // Check legacy is_admin field first
  if (isAdmin === true) {
    return true;
  }

  // Check if user is admin in any system
  if (!roles) {
    return false;
  }

  return Object.values(roles).some((systemRoles) =>
    Array.isArray(systemRoles) && systemRoles.includes("admin")
  );
}

/**
 * Get all roles for a user in a specific system
 */
export function getSystemRoles(
  roles: Roles | null | undefined,
  system: SystemName
): string[] {
  if (!roles || !roles[system]) {
    return [];
  }
  return Array.isArray(roles[system]) ? roles[system]! : [];
}

/**
 * Check if user has at least one of the specified roles in a system
 */
export function hasAnyRole(
  roles: Roles | null | undefined,
  system: SystemName,
  allowedRoles: string[]
): boolean {
  const userRoles = getSystemRoles(roles, system);
  return allowedRoles.some((role) => userRoles.includes(role));
}

/**
 * Reimburse system specific role checks
 */
export const ReimburseRoles = {
  /**
   * Check if user can approve reimbursement requests
   * Only admins can approve
   */
  canApprove: (roles: Roles | null | undefined): boolean => {
    return hasRole(roles, "reimburse", "admin");
  },

  /**
   * Check if user can view all records (not just their own)
   * Only admins can view all records
   */
  canViewAll: (roles: Roles | null | undefined): boolean => {
    return hasRole(roles, "reimburse", "admin");
  },

  /**
   * Check if user can manage the system
   * Only admins can manage
   */
  canManage: (roles: Roles | null | undefined): boolean => {
    return hasRole(roles, "reimburse", "admin");
  },
} as const;

