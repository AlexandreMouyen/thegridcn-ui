import { getIAMFilterAndProjection } from "@/iam";
import { USER_ROLES } from "@/types/user";
import { IUser } from "@/types/user";
import { IEra, IEvent } from "@/types/timeline";
import { Types } from "mongoose";

const userId = new Types.ObjectId();
const userIdStr = userId.toString();

const selfUser: IUser = {
  _id: userId,
  email: "user@example.com",
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

describe("getIAMFilterAndProjection", () => {
  it("must return null for users when the JWT is null (VISITOR has no user access)", () => {
    expect(getIAMFilterAndProjection(null, "users", "view")).toBeNull();
  });

  it("must allow viewing eras/events when JWT is null (treated as VISITOR)", () => {
    expect(getIAMFilterAndProjection(null, "eras", "view")).toStrictEqual([
      {},
      {},
    ]);
    expect(getIAMFilterAndProjection(null, "events", "view")).toStrictEqual([
      {},
      {},
    ]);
  });

  // ── VISITOR ──────────────────────────────────────────────────────────────
  describe("VISITOR", () => {
    const token = { roles: [USER_ROLES.VISITOR] };

    it("can view eras with empty filter/projection", () => {
      expect(
        getIAMFilterAndProjection(token, "eras", "view", era),
      ).toStrictEqual([{}, {}]);
    });

    it("can view events with empty filter/projection", () => {
      expect(
        getIAMFilterAndProjection(token, "events", "view", event),
      ).toStrictEqual([{}, {}]);
    });

    it("returns null for user view (no access)", () => {
      expect(getIAMFilterAndProjection(token, "users", "view")).toBeNull();
    });

    it("returns null for era delete (no access)", () => {
      expect(getIAMFilterAndProjection(token, "eras", "delete")).toBeNull();
    });
  });

  // ── USER ─────────────────────────────────────────────────────────────────
  describe("USER", () => {
    const token = { sub: userIdStr, roles: [USER_ROLES.USER] };

    it("returns scoped filter when viewing own user record", () => {
      expect(
        getIAMFilterAndProjection(token, "users", "view", selfUser),
      ).toStrictEqual([{ _id: userIdStr }, {}]);
    });

    it("returns empty filter/projection when editing own user record", () => {
      expect(
        getIAMFilterAndProjection(token, "users", "edit", selfUser),
      ).toStrictEqual([{}, {}]);
    });

    it("returns null when viewing a different user's record", () => {
      const other: IUser = {
        _id: new Types.ObjectId(),
        email: "x@x.com",
        roles: [USER_ROLES.USER],
      };
      expect(
        getIAMFilterAndProjection(token, "users", "view", other),
      ).toBeNull();
    });

    it("returns null when user record data is not provided", () => {
      expect(getIAMFilterAndProjection(token, "users", "view")).toBeNull();
    });

    it("can view eras and events with empty filter/projection", () => {
      expect(
        getIAMFilterAndProjection(token, "eras", "view", era),
      ).toStrictEqual([{}, {}]);
      expect(
        getIAMFilterAndProjection(token, "events", "view", event),
      ).toStrictEqual([{}, {}]);
    });

    it("returns null for era create (no USER access)", () => {
      expect(getIAMFilterAndProjection(token, "eras", "create")).toBeNull();
    });
  });

  // ── MODERATOR ────────────────────────────────────────────────────────────
  describe("MODERATOR", () => {
    const token = { roles: [USER_ROLES.MODERATOR] };

    it("can view/create/edit eras and events", () => {
      expect(getIAMFilterAndProjection(token, "eras", "view")).toStrictEqual([
        {},
        {},
      ]);
      expect(getIAMFilterAndProjection(token, "eras", "create")).toStrictEqual([
        {},
        {},
      ]);
      expect(getIAMFilterAndProjection(token, "eras", "edit")).toStrictEqual([
        {},
        {},
      ]);
      expect(getIAMFilterAndProjection(token, "events", "view")).toStrictEqual([
        {},
        {},
      ]);
      expect(
        getIAMFilterAndProjection(token, "events", "create"),
      ).toStrictEqual([{}, {}]);
      expect(getIAMFilterAndProjection(token, "events", "edit")).toStrictEqual([
        {},
        {},
      ]);
    });

    it("returns null for era/event delete (no MODERATOR access)", () => {
      expect(getIAMFilterAndProjection(token, "eras", "delete")).toBeNull();
      expect(getIAMFilterAndProjection(token, "events", "delete")).toBeNull();
    });

    it("can view users but not edit/create/delete them", () => {
      expect(getIAMFilterAndProjection(token, "users", "view")).toStrictEqual([
        {},
        {},
      ]);
      expect(getIAMFilterAndProjection(token, "users", "edit")).toBeNull();
      expect(getIAMFilterAndProjection(token, "users", "create")).toBeNull();
      expect(getIAMFilterAndProjection(token, "users", "delete")).toBeNull();
    });
  });

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  describe("ADMIN", () => {
    const token = { roles: [USER_ROLES.ADMIN] };

    it("has full access to eras, events and users with empty filter/projection", () => {
      for (const resource of ["eras", "events", "users"] as const) {
        expect(
          getIAMFilterAndProjection(token, resource, "view"),
        ).toStrictEqual([{}, {}]);
        expect(
          getIAMFilterAndProjection(token, resource, "create"),
        ).toStrictEqual([{}, {}]);
        expect(
          getIAMFilterAndProjection(token, resource, "edit"),
        ).toStrictEqual([{}, {}]);
        expect(
          getIAMFilterAndProjection(token, resource, "delete"),
        ).toStrictEqual([{}, {}]);
      }
    });
  });
});
