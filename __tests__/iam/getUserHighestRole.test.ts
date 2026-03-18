import { getUserHighestRole } from "@/iam";
import { USER_ROLES, UserRole } from "@/types/user";
import { JWT } from "next-auth/jwt";

describe("getUserHighestRole", () => {
  it("must return VISITOR (default) if JWT is null", () => {
    expect(getUserHighestRole(null)).toBe(USER_ROLES.VISITOR);
  });

  it("must return the unique user role", () => {
    const token: JWT = { roles: [USER_ROLES.USER] };
    expect(getUserHighestRole(token)).toBe(USER_ROLES.USER);
  });

  it("must return the highest user role when multiple are present", () => {
    const token: JWT = {
      roles: [USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.VISITOR],
    };
    expect(getUserHighestRole(token)).toBe(USER_ROLES.ADMIN);
  });

  it("must return MODERATOR as highest when MODERATOR and USER are present", () => {
    const token: JWT = { roles: [USER_ROLES.USER, USER_ROLES.MODERATOR] };
    expect(getUserHighestRole(token)).toBe(USER_ROLES.MODERATOR);
  });

  it("must return VISITOR if roles contains only unknown values", () => {
    const token: JWT = { roles: ["DUMMY" as UserRole, "FOO" as UserRole] };
    expect(getUserHighestRole(token)).toBe(USER_ROLES.VISITOR);
  });

  it("must return VISITOR if the roles array is empty", () => {
    const token: JWT = { roles: [] };
    expect(getUserHighestRole(token)).toBe(USER_ROLES.VISITOR);
  });
});
