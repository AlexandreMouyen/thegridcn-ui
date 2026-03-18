import { userHasPermission } from "@/iam";
import { USER_ROLES } from "@/types/user";
import { IUser } from "@/types/user";
import { IEra, IEvent } from "@/types/timeline";
import { Types } from "mongoose";
import { JWT } from "next-auth/jwt";

const userId = new Types.ObjectId();
const userIdStr = userId.toString();

const selfUser: IUser = {
  _id: userId,
  email: "user@example.com",
  roles: [USER_ROLES.USER],
};

const otherUser: IUser = {
  _id: new Types.ObjectId(),
  email: "other@example.com",
  roles: [USER_ROLES.USER],
};

const era: IEra = {
  _id: new Types.ObjectId(),
  slug: "test-era",
  name: { en: "Test Era" },
  shortName: { en: "TE" },
  startYear: 100,
  endYear: 200,
  description: { en: "A test era" },
};

const event: IEvent = {
  _id: new Types.ObjectId(),
  slug: "test-event",
  title: { en: "Test Event" },
  date: { year: 150 },
  eraSlug: "test-era",
  tags: [],
  content: { en: "Content" },
  significance: "standard",
  order: 1,
};

describe("userHasPermission", () => {
  it("must return false if the JWT is null", () => {
    expect(userHasPermission(null, "users", "view")).toBe(false);
    expect(userHasPermission(null, "eras", "view")).toBe(false);
    expect(userHasPermission(null, "events", "view")).toBe(false);
  });

  // ── VISITOR ──────────────────────────────────────────────────────────────
  describe("VISITOR", () => {
    const token: JWT = { roles: [USER_ROLES.VISITOR] };

    it("can view eras and events", () => {
      expect(userHasPermission(token, "eras", "view", era)).toBe(true);
      expect(userHasPermission(token, "events", "view", event)).toBe(true);
    });

    it("cannot create, edit, or delete eras or events", () => {
      expect(userHasPermission(token, "eras", "create")).toBe(false);
      expect(userHasPermission(token, "eras", "edit")).toBe(false);
      expect(userHasPermission(token, "eras", "delete")).toBe(false);
      expect(userHasPermission(token, "events", "create")).toBe(false);
      expect(userHasPermission(token, "events", "edit")).toBe(false);
      expect(userHasPermission(token, "events", "delete")).toBe(false);
    });

    it("cannot perform any user action", () => {
      expect(userHasPermission(token, "users", "view")).toBe(false);
      expect(userHasPermission(token, "users", "edit")).toBe(false);
      expect(userHasPermission(token, "users", "delete")).toBe(false);
      expect(userHasPermission(token, "users", "create")).toBe(false);
    });
  });

  // ── USER ─────────────────────────────────────────────────────────────────
  describe("USER", () => {
    const token: JWT = { sub: userIdStr, roles: [USER_ROLES.USER] };

    it("can view eras and events", () => {
      expect(userHasPermission(token, "eras", "view", era)).toBe(true);
      expect(userHasPermission(token, "events", "view", event)).toBe(true);
    });

    it("can view, edit and delete their own user record", () => {
      expect(userHasPermission(token, "users", "view", selfUser)).toBe(true);
      expect(userHasPermission(token, "users", "edit", selfUser)).toBe(true);
      expect(userHasPermission(token, "users", "delete", selfUser)).toBe(true);
    });

    it("cannot view, edit or delete another user's record", () => {
      expect(userHasPermission(token, "users", "view", otherUser)).toBe(false);
      expect(userHasPermission(token, "users", "edit", otherUser)).toBe(false);
      expect(userHasPermission(token, "users", "delete", otherUser)).toBe(
        false,
      );
    });

    it("cannot view own user without providing data", () => {
      expect(userHasPermission(token, "users", "view")).toBe(false);
    });

    it("cannot create users or eras or events", () => {
      expect(userHasPermission(token, "users", "create")).toBe(false);
      expect(userHasPermission(token, "eras", "create")).toBe(false);
      expect(userHasPermission(token, "events", "create")).toBe(false);
    });
  });

  // ── MODERATOR ────────────────────────────────────────────────────────────
  describe("MODERATOR", () => {
    const token: JWT = { roles: [USER_ROLES.MODERATOR] };

    it("can view, create and edit eras and events", () => {
      expect(userHasPermission(token, "eras", "view")).toBe(true);
      expect(userHasPermission(token, "eras", "create")).toBe(true);
      expect(userHasPermission(token, "eras", "edit")).toBe(true);
      expect(userHasPermission(token, "events", "view")).toBe(true);
      expect(userHasPermission(token, "events", "create")).toBe(true);
      expect(userHasPermission(token, "events", "edit")).toBe(true);
    });

    it("cannot delete eras or events", () => {
      expect(userHasPermission(token, "eras", "delete")).toBe(false);
      expect(userHasPermission(token, "events", "delete")).toBe(false);
    });

    it("can view users but cannot create, edit or delete them", () => {
      expect(userHasPermission(token, "users", "view")).toBe(true);
      expect(userHasPermission(token, "users", "create")).toBe(false);
      expect(userHasPermission(token, "users", "edit")).toBe(false);
      expect(userHasPermission(token, "users", "delete")).toBe(false);
    });
  });

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  describe("ADMIN", () => {
    const token: JWT = { roles: [USER_ROLES.ADMIN] };

    it("has full CRUD on eras, events and users", () => {
      for (const resource of ["eras", "events", "users"] as const) {
        expect(userHasPermission(token, resource, "view")).toBe(true);
        expect(userHasPermission(token, resource, "create")).toBe(true);
        expect(userHasPermission(token, resource, "edit")).toBe(true);
        expect(userHasPermission(token, resource, "delete")).toBe(true);
      }
    });
  });
});
