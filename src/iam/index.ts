/**
 * Identity and Access Management
 */

import {
  APIFilterType,
  APIProjectionType,
  PermissionCheck,
  Permissions,
} from "./permissions";
import { getUserHighestRole, ROLES, RolesWithPermissions } from "./roles";
import { UserRole } from "@/types/user";
import { JWT } from "next-auth/jwt";

export * from "./permissions";
export * from "./roles";

function getPermission<Resource extends keyof Permissions>(
  token: JWT | null,
  role: UserRole,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"],
): boolean | [APIFilterType<Resource>, APIProjectionType<Resource>] | null {
  const permission: PermissionCheck<Resource> | undefined = (
    ROLES as RolesWithPermissions
  )[role][resource]?.[action];

  if (!permission) return false;
  if (typeof permission === "boolean") return permission;
  return permission(token, data);
}

export function userHasPermission<Resource extends keyof Permissions>(
  token: JWT | null,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"],
) {
  if (!token) return false;
  return (token.roles ?? []).some(
    (role) =>
      !!getPermission<Resource>(
        token,
        role as UserRole,
        resource,
        action,
        data,
      ),
  );
}

/**
 * Retrieve the MongoDB filter and projection based on the user's highest role.
 * @param token     The currently authenticated user's JWT
 * @param resource  The resource to check
 * @param action    The requested action
 * @param data      Optional resource data
 */
export function getIAMFilterAndProjection<Resource extends keyof Permissions>(
  token: JWT | null,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"],
): [APIFilterType<Resource>, APIProjectionType<Resource>] | null {
  const higherRole = getUserHighestRole(token);
  const permission = getPermission<Resource>(
    token,
    higherRole,
    resource,
    action,
    data,
  );

  if (typeof permission === "boolean") return permission ? [{}, {}] : null;
  return permission;
}
