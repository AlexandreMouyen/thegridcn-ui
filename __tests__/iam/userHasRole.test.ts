import { userHasRole } from "@/iam";
import { USER_ROLES } from "@/types/user";
import { JWT } from "next-auth/jwt";

describe("userHasRole", () => {
  it("should return false if the JWT is null", () => {
    expect(userHasRole(null, USER_ROLES.ADMIN)).toBe(false);
  });

  it("should return true if the JWT has the specified role", () => {
    const token: JWT = { roles: [USER_ROLES.USER] };
    expect(userHasRole(token, USER_ROLES.USER)).toBe(true);
  });

  it("should return false if the JWT does not have the specified role", () => {
    const token: JWT = { roles: [USER_ROLES.USER] };
    expect(userHasRole(token, USER_ROLES.ADMIN)).toBe(false);
  });

  it("should return true if the JWT has the specified role among multiple roles", () => {
    const token: JWT = { roles: [USER_ROLES.USER, USER_ROLES.ADMIN] };
    expect(userHasRole(token, USER_ROLES.ADMIN)).toBe(true);
  });

  it("should return false if the JWT does not have the specified role among multiple roles", () => {
    const token: JWT = { roles: [USER_ROLES.USER, USER_ROLES.ADMIN] };
    expect(userHasRole(token, USER_ROLES.VISITOR)).toBe(false);
  });

  it("should return false if the JWT has an empty role list", () => {
    const token: JWT = { roles: [] };
    expect(userHasRole(token, USER_ROLES.ADMIN)).toBe(false);
  });
});
