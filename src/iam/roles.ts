/**
 * IAM | Roles
 */

import { PermissionCheck, Permissions } from "./permissions";
import { USER_ROLES, UserRole } from "@/types/user";
import { JWT } from "next-auth/jwt";

export type RolesWithPermissions = {
  [R in UserRole]: Partial<{
    [Model in keyof Permissions]: Partial<{
      [Action in Permissions[Model]["action"]]?: PermissionCheck<Model>;
    }>;
  }>;
};

export const ROLES = {
  VISITOR: {
    eras: { view: true },
    events: { view: true },
  },
  USER: {
    eras: { view: true },
    events: { view: true },
    users: {
      view: (token, user) =>
        user && token && user._id.toString() === token.sub
          ? [{ _id: token.sub }, {}]
          : null,
      edit: (token, user) =>
        !!(user && token && user._id.toString() === token.sub),
      delete: (token, user) =>
        !!(user && token && user._id.toString() === token.sub),
    },
  },
  MODERATOR: {
    eras: { view: true, create: true, edit: true },
    events: { view: true, create: true, edit: true },
    users: { view: true },
  },
  ADMIN: {
    eras: { view: true, create: true, edit: true, delete: true },
    events: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    glossaryterms: { view: true, create: true, edit: true, delete: true },
  },
} as const satisfies RolesWithPermissions;

export function userHasRole(token: JWT | null, role: UserRole) {
  if (!token) return false;
  return (token.roles ?? []).includes(role);
}

export function getUserHighestRole(token: JWT | null): UserRole {
  if (!token) return USER_ROLES.VISITOR;

  return (token.roles ?? []).reduce<UserRole>(
    (acc, role) =>
      Object.values(USER_ROLES).findIndex((r) => r === (role as UserRole)) >
      Object.values(USER_ROLES).findIndex((r) => r === acc)
        ? (role as UserRole)
        : acc,
    USER_ROLES.VISITOR,
  );
}
