import { mergeProjection } from "@/lib/mergeProjection";

describe("mergeProjection", () => {
  it("must return an empty object when both inputs are empty/null", () => {
    expect(mergeProjection(null, null)).toStrictEqual({});
    expect(mergeProjection(null, {})).toStrictEqual({});
    expect(mergeProjection({}, null)).toStrictEqual({});
    expect(mergeProjection({}, {})).toStrictEqual({});
  });

  it("must return the req projection when iam projection is empty/null", () => {
    const param: Record<string, number> = { _id: -1, slug: -1 };
    expect(mergeProjection(param, null)).toStrictEqual(param);
    expect(mergeProjection(param, {})).toStrictEqual(param);
  });

  it("must return the iam projection when req projection is empty/null", () => {
    const param: Record<string, number> = { _id: -1, slug: -1 };
    expect(mergeProjection(null, param)).toStrictEqual(param);
    expect(mergeProjection({}, param)).toStrictEqual(param);
  });

  it("must merge two negative (exclusion) projections", () => {
    const req: Record<string, number> = { _id: -1, password: -1 };
    const iam: Record<string, number> = { createdAt: -1 };
    expect(mergeProjection(req, iam)).toStrictEqual({ ...req, ...iam });
  });

  it("must drop req-positive fields that appear in the iam-negative projection", () => {
    const req: Record<string, number> = { email: 1, password: 1 };
    const iam: Record<string, number> = { password: -1 };
    // password is excluded by IAM, so only email survives
    expect(mergeProjection(req, iam)).toStrictEqual({ email: 1 });
  });

  it("must keep all req-positive fields that are NOT excluded by IAM", () => {
    const req: Record<string, number> = { slug: 1, name: 1, description: 1 };
    const iam: Record<string, number> = { description: -1 };
    expect(mergeProjection(req, iam)).toStrictEqual({ slug: 1, name: 1 });
  });

  it("must throw when req has a positive projection and iam also has positive numbers", () => {
    const positive: Record<string, number> = { slug: 1, name: 1 };
    // Only throws when both sides are non-empty and iam contains positive nums
    expect(() => mergeProjection(positive, positive)).toThrow();
    expect(() => mergeProjection({ email: 1 }, { slug: 1 })).toThrow();
  });

  it("must NOT throw (returns iam directly) when req is empty and iam is positive", () => {
    // Early-return path: req empty → return iam as-is, no guard reached
    const positive: Record<string, number> = { slug: 1, name: 1 };
    expect(() => mergeProjection(null, positive)).not.toThrow();
    expect(() => mergeProjection({}, positive)).not.toThrow();
  });

  it("identical negative projections must return a merged (unchanged) object", () => {
    const param: Record<string, number> = { _id: -1, password: -1 };
    expect(mergeProjection(param, param)).toStrictEqual(param);
  });
});
