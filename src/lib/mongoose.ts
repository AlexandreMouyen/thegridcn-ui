/**
 * withAqp — Mongoose static helper that parses URL query params via
 * `api-query-params`, enforces IAM filter/projection, applies locale
 * reduction on translatable fields, and returns a typed Next.js Response.
 *
 * Usage on a model:
 *   ModelSchema.static("withAqp", withAqp);
 *   const res = await Model.withAqp(req, { consumeLocale: true });
 */

import { Model, SortOrder } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import aqp from "api-query-params";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import { isDate } from "@/lib/dates";
import { mergeProjection } from "@/lib/mergeProjection";
import {
  JSONErrorResponse,
  sendForbidden,
  sendJSONResponse,
  sendNotFound,
  sendOk,
} from "@/types/api-responses";
import {
  getIAMFilterAndProjection,
  getUserHighestRole,
  Permissions,
} from "@/iam";
import { locales, defaultLocale } from "@/i18n/routing";

type Locale = (typeof locales)[number];

const ENV = process.env.NODE_ENV ?? "development";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AqpOptions = {
  /**
   * When true (default), the `locale` query param is consumed and used to
   * reduce translatable fields to a single locale string.
   */
  consumeLocale?: boolean;
  /**
   * MongoDB Atlas Search paths for full-text `q=` queries.
   */
  searchPaths?: string[];
  /**
   * When true, return the raw `[items, headers]` tuple instead of a
   * NextResponse. Useful for server-side callers that need to further
   * transform data.
   */
  raw?: boolean;
};

const defaultOptions: Required<AqpOptions> = {
  consumeLocale: true,
  searchPaths: [],
  raw: false,
};

// Maximum edit distance for Atlas Search autocomplete fuzzy matching.
const MAX_FUZZY_EDITS = 1;

// ── Locale reduction ──────────────────────────────────────────────────────────

/**
 * Returns true if the Mongoose schema object has at least one field whose
 * Map type contains every configured locale as a sub-key — i.e. it is a
 * `LocalizedString` field.
 */
function isTranslatableModel(schemaObj: object): boolean {
  return Object.values(schemaObj as Record<string, unknown>).some((value) => {
    if (
      value !== null &&
      typeof value === "object" &&
      "type" in (value as object)
    ) {
      const t = (value as { type: unknown }).type;
      return (
        t !== null &&
        typeof t === "object" &&
        locales.every((locale) => locale in (t as object))
      );
    }
    return false;
  });
}

/**
 * Recursively replaces `LocalizedString` map objects (`{ en: "…", fr: "…" }`)
 * with the string for the requested locale, falling back to `defaultLocale`.
 */
function reduceLocalization(item: object, locale: Locale): object {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(item)) {
    if (
      value !== null &&
      typeof value === "object" &&
      key !== "_id" &&
      !Array.isArray(value) &&
      !isDate(value)
    ) {
      if (locale in (value as object)) {
        result[key] = (value as Record<string, unknown>)[locale];
      } else if (defaultLocale in (value as object)) {
        result[key] = (value as Record<string, unknown>)[defaultLocale];
      } else {
        result[key] = reduceLocalization(value as object, locale);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ── withAqp overloads ─────────────────────────────────────────────────────────

/**
 * Standard usage — returns a `NextResponse`.
 */
export function withAqp<TDoc extends object, TLocalized extends object = TDoc>(
  this: Model<TDoc>,
  req: NextRequest,
  options?: AqpOptions,
): Promise<NextResponse<TLocalized[] | TDoc[] | JSONErrorResponse>>;

/**
 * Raw usage — returns `[items, headers]` tuple.
 */
export function withAqp<TDoc extends object, TLocalized extends object = TDoc>(
  this: Model<TDoc>,
  req: NextRequest,
  options: AqpOptions & { raw: true },
): Promise<[TDoc[] | TLocalized[], Record<string, string>]>;

// ── Implementation ────────────────────────────────────────────────────────────

export async function withAqp<
  TDoc extends object,
  TLocalized extends object = TDoc,
>(
  this: Model<TDoc>,
  req: NextRequest,
  options: AqpOptions = defaultOptions,
): Promise<
  | NextResponse<TLocalized[] | TDoc[] | JSONErrorResponse>
  | [TDoc[] | TLocalized[], Record<string, string>]
> {
  const { consumeLocale, searchPaths } = { ...defaultOptions, ...options };

  try {
    await dbConnect();

    // next-auth reads NEXTAUTH_SECRET from the env automatically when no
    // explicit secret is passed — but we pass it to be safe.
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET ?? "",
    });

    // ── IAM ──────────────────────────────────────────────────────────────────
    // The Mongoose collection name must match a key in Permissions.
    // Collections: "eras", "events", "users"
    const collectionName = this.collection.collectionName as keyof Permissions;
    const iamPerm = getIAMFilterAndProjection(token, collectionName, "view");

    if (!iamPerm) {
      const errMsg =
        ENV === "development"
          ? `You do not have access to [${collectionName}] as ${getUserHighestRole(token)}`
          : "The resource cannot be found.";

      if (options.raw) throw new Error(errMsg);
      return (
        ENV === "development"
          ? sendForbidden({ error: errMsg })
          : sendNotFound({ error: errMsg })
      ) as never;
    }

    // ── Query parsing ─────────────────────────────────────────────────────────
    const params = aqp(req.nextUrl.search, { blacklist: ["__raw", "q"] });
    const useRaw = req.nextUrl.searchParams.get("__raw") === "true";
    const query = req.nextUrl.searchParams.get("q") ?? null;
    const { skip, limit, sort, population } = params;

    let { filter, projection } = params;

    const locale: Locale =
      (filter.locale as Locale | undefined) ?? defaultLocale;

    // Merge IAM constraints on top of client-supplied filter/projection.
    filter = { ...filter, ...iamPerm[0] };
    projection = mergeProjection(
      projection as Record<string, number>,
      iamPerm[1] as Record<string, number>,
    );

    // Remove the synthetic `locale` param so it doesn't leak into the DB query.
    if (consumeLocale && "locale" in filter) delete filter.locale;

    // ── Data fetching ─────────────────────────────────────────────────────────
    let items: TDoc[];

    if (query && searchPaths.length) {
      // Atlas Search — fuzzy autocomplete across specified paths.
      items = await this.aggregate<TDoc>([
        {
          $search: {
            index: "default",
            compound: {
              should: searchPaths.map((path) => ({
                autocomplete: {
                  query,
                  path,
                  fuzzy: { maxEdits: MAX_FUZZY_EDITS },
                },
              })),
            },
          },
        },
      ]);
    } else {
      items = (await this.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort as Record<string, SortOrder>)
        .select(projection)
        .populate(population)
        .lean()) as TDoc[];
    }

    const totalCount =
      query && searchPaths.length
        ? items.length
        : await this.countDocuments(filter);

    // ── Pagination headers ────────────────────────────────────────────────────
    const headers: Record<string, string> = {
      "X-Total-Count": String(totalCount),
      "X-Page": String(skip && limit ? Math.floor(skip / limit) + 1 : 1),
      "X-Per-Page": String(limit ?? 0),
      "X-Has-More": String((skip ?? 0) + items.length < totalCount),
    };

    // ── Locale reduction ──────────────────────────────────────────────────────
    // Only reduce when the model has LocalizedString fields AND __raw=false.
    let localizedItems: TLocalized[] = [];

    if (!useRaw && isTranslatableModel(this.schema.obj)) {
      localizedItems = items.map(
        (item) => reduceLocalization(item as object, locale) as TLocalized,
      );
    }

    const output = localizedItems.length ? localizedItems : items;

    if (options.raw) return [output, headers];
    return sendOk(output, headers);
  } catch (err) {
    if (options.raw) throw err;
    const status =
      (err as { status?: number; statusCode?: number })?.status ??
      (err as { status?: number; statusCode?: number })?.statusCode ??
      500;
    const safeStatus = (
      [200, 201, 204, 400, 401, 403, 404, 500].includes(status) ? status : 500
    ) as import("@/types/api-responses").HttpCode;
    return sendJSONResponse(
      (err as Error)?.message ?? "Unexpected error",
      safeStatus,
    ) as never;
  }
}
