export function mergeProjection(
  reqProjection: Record<string, number> | null | undefined,
  iamProjection: Record<string, number> | null | undefined,
): Record<string, number> {
  const req = reqProjection ?? {};
  const iam = iamProjection ?? {};

  const reqKeys = Object.keys(req);
  const reqValues = Object.values(req);
  const iamKeys = Object.keys(iam);
  const iamValues = Object.values(iam);

  const isReqPositiveProjection = reqValues.some((val) => val === 1);
  const isIamPositiveProjection = iamValues.some((val) => val === 1);
  const projection: Record<string, number> = {};

  if (!reqKeys.length && !iamKeys.length) return {};
  if (reqKeys.length && !iamKeys.length) return req;
  if (!reqKeys.length && iamKeys.length) return iam;

  if (isIamPositiveProjection)
    throw new Error("IAM projection cannot use positive numbers!");

  // Both negative: merge them (exclusion list union)
  if (!isReqPositiveProjection) return { ...req, ...iam };

  // req is positive (inclusion), iam is negative (exclusion):
  // keep only req fields NOT excluded by iam
  reqKeys.forEach((key) => {
    if (!iamKeys.includes(key)) projection[key] = 1;
  });
  return projection;
}
