---
name: typescript-mongoose
description: TypeScript + Mongoose model pattern — defining explicit interfaces, enum constants, LocalizedString fields, typed models, and full withAqp usage. Use when creating a new Mongoose model, adding fields, ensuring type safety, wiring withAqp to a route, or configuring full-text search weights.
---

# TypeScript + Mongoose Models + `withAqp`

## Core Rule: Interface Lives in `types/`, Not in the Model File

**Never** derive the interface from the schema with `InferSchemaType` when the interface is also imported by the model. That creates a circular import. Always write the interface explicitly in `src/types/<model-name>.ts` and import it into the model.

```
src/types/<model>.ts   ← interface, enum constants, utility types (no Mongoose schema)
src/models/<Model>.ts  ← schema + model (imports interface from types/)
src/app/api/<resource>/route.ts ← one-liner: return Model.withAqp(req)
```

---

## 1. Define the Interface (`src/types/<model>.ts`)

```ts
import { Types } from "mongoose";

// ── Enum constants ──────────────────────────────────────────────────────────
// Use `as const` objects instead of TypeScript enums — they serialize cleanly
// and are usable as plain values at runtime.
export const USER_ROLES = {
  VISITOR: "VISITOR",
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

// Derive the union type from the const object — single source of truth.
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type UserGender = (typeof USER_GENDERS)[keyof typeof USER_GENDERS];

// ── Interface ───────────────────────────────────────────────────────────────
// • Always include `readonly _id: Types.ObjectId` explicitly.
// • Mark all Mongoose-optional fields with `?`.
// • Use `Date` for timestamps, not `string`.
// • Do NOT import anything from `src/models/` here (circular import).
export interface IUser {
  readonly _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[]; // use string[] so assignment from the schema works simply
  image?: string;
  gender?: UserGender;
  age?: number;
  ip?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Checklist:**

- [ ] `_id` is `Types.ObjectId` (not `string`, not `ObjectId` from `bson`)
- [ ] Enums are `as const` objects with a matching union type
- [ ] File has zero imports from `src/models/`

---

## 2. Define the Schema + Model (`src/models/<Model>.ts`)

```ts
import mongoose, { Model } from "mongoose";

import { IUser, USER_ROLES, USER_GENDERS } from "@/types/user";

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    roles: {
      type: [String],
      required: true,
      enum: Object.values(USER_ROLES), // keep in sync with the const object
      default: [USER_ROLES.VISITOR], // always use the constant, not a raw string
    },
    image: { type: String },
    gender: { type: String, enum: Object.values(USER_GENDERS) },
    age: { type: Number },
    ip: { type: String },
  },
  { timestamps: true }, // auto-adds createdAt / updatedAt
);

// Alias so the model type doesn't need to be inlined everywhere.
type IUserModel = Model<IUser>;

// Next.js hot-reload guard: reuse the compiled model if it already exists.
export default (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser>("User", UserSchema);
```

**Checklist:**

- [ ] Schema is typed: `new mongoose.Schema<IModel>(...)` — pass the interface as a generic so TypeScript validates field definitions against the interface
- [ ] Schema field `enum` values come from `Object.values(YOUR_CONST)` — never hardcoded strings
- [ ] Default values reference the const (e.g. `USER_ROLES.VISITOR`), not `"VISITOR"`
- [ ] `{ timestamps: true }` for `createdAt`/`updatedAt`
- [ ] Hot-reload guard: `mongoose.models.X || mongoose.model<IX>("X", XSchema)`
- [ ] Model is the **default export**

---

## 3. Shared Utility Types (`src/types/utils.ts`)

Reusable generic helpers — import from here rather than redefining per model.

```ts
import { Types } from "mongoose";

/** Adds `_id: Types.ObjectId` to any type T. */
export type WithMongoId<T> = T & { readonly _id: Types.ObjectId };

/**
 * Replace populated ref fields with their expanded type.
 * e.g. Populated<IPost, "author", IUser>
 */
export type Populated<T, K extends keyof T, P> = Omit<T, K> & {
  [Key in K]: P;
};

/**
 * Serialize ObjectId fields to plain strings (for JSON / API responses).
 * e.g. Serialized<IPost, "_id" | "author">
 */
export type Serialized<T, K extends keyof T> = Omit<T, K> & {
  [Key in K]: string;
};
```

---

## 4. Using the Model Safely

### Querying

```ts
import User from "@/models/User";
import { IUser } from "@/types/user";

// lean() returns plain objects — cast to the stripped type
const user = await User.findById(id).lean<IUser>();
```

### Creating

```ts
import { USER_ROLES } from "@/types/user";

const newUser = await User.create({
  email: profile.email,
  firstName: profile.given_name,
  lastName: profile.family_name,
  roles: [USER_ROLES.VISITOR],
});
```

### Updating

```ts
await User.findByIdAndUpdate(id, { image: newImage }, { new: true });
```

---

## 6. `LocalizedString` Fields

For multilingual text fields, use a Mongoose `Map<String>` sub-schema. After `.lean()` it serializes as a plain `Record<string, string>`.

### Type definition (`src/types/<model>.ts`)

```ts
// Open-ended: any ISO 639-1 locale code works.
export type LocaleCode = string;

// A map of locale → translated string.
// Stored as a Mongoose Map<string, string> (plain object after .lean()).
export type LocalizedString = Record<LocaleCode, string>;

export interface IArticle {
  readonly _id: Types.ObjectId;
  slug: string;
  title: LocalizedString; // e.g. { en: "Hello", fr: "Bonjour" }
  content: LocalizedString;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Schema definition (`src/models/<Model>.ts`)

```ts
// Reusable sub-schema — define once at the top of the model file.
const LocalizedStringSchema = { type: Map, of: String, required: true };

const ArticleSchema = new mongoose.Schema<IArticle>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: LocalizedStringSchema,
    content: LocalizedStringSchema,
  },
  { timestamps: true },
);
```

`withAqp` detects `{ type: Map, of: String }` fields automatically and reduces them to the requested locale string in API responses (no extra configuration needed).

---

## 7. Wiring `withAqp`

`withAqp` is a Mongoose static that handles IAM, URL query parsing (filter/sort/pagination), locale reduction, and full-text search. **Every model that has a GET list endpoint should register it.**

### Step 1 — Declare the model interface with overloads

Use explicit overloads instead of `ReturnType<typeof withAqp>` so Next.js route validators don't complain:

```ts
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface IArticleModel extends Model<IArticle> {
  // Standard call — returns a NextResponse
  withAqp(req: NextRequest, options?: AqpOptions): Promise<Response>;
  // Raw call — returns [items, headers] tuple (for server-side callers)
  withAqp(
    req: NextRequest,
    options: AqpOptions & { raw: true },
  ): Promise<[IArticle[], Record<string, string>]>;
}
```

### Step 2 — Register the static on the schema

```ts
ArticleSchema.static("withAqp", withAqp);
```

### Step 3 — Use the correct model export

```ts
export default (mongoose.models.Article as IArticleModel) ||
  mongoose.model<IArticle, IArticleModel>("Article", ArticleSchema);
```

### Step 4 — Route handler is a one-liner

```ts
// src/app/api/articles/route.ts
import { NextRequest } from "next/server";
import ArticleModel from "@/models/Article";

export async function GET(req: NextRequest) {
  return ArticleModel.withAqp(req);
}
```

**Never put search config in the route handler.** All configuration belongs in the schema.

---

## 8. Full-Text Search with `withAqp`

`withAqp` runs a 3-level search fallback automatically:

1. **Atlas Search** — fuzzy autocomplete (requires an Atlas `"default"` index)
2. **MongoDB `$text`** — standard text index (if Atlas returns 0 or throws)
3. **Regex** — case-insensitive wildcard across all indexed paths (final fallback)

### Configuring text search

Add a Mongoose text index **with weights** on the schema. `withAqp` introspects `schema.indexes()` — the weights define both which fields to search and how heavily to score each one.

```ts
ArticleSchema.index(
  {
    // All fields that should be searchable
    slug: "text",
    "title.en": "text",
    "title.fr": "text",
    "content.en": "text",
    "content.fr": "text",
  },
  {
    weights: {
      slug: 10, // highest — exact slug matches rank first
      "title.en": 5,
      "title.fr": 5,
      "content.en": 1,
      "content.fr": 1,
    },
  },
);
```

**Weight guidelines:**

| Field type       | Suggested weight |
| ---------------- | ---------------- |
| `slug`           | 8–10             |
| Primary title    | 4–6              |
| Short name / tag | 3–4              |
| Description      | 1–2              |
| Body / long text | 1                |

### How `withAqp` reads the index

`withAqp` calls `getSchemaTextSearchWeights(this.schema)` which:

1. Iterates `schema.indexes()` looking for the first index with at least one `"text"` field
2. Returns `{ [field]: weight }` from the index `weights` option (defaults to `1` for unlisted fields)
3. Derives the search paths from the weight keys — no separate `searchPaths` needed

**Zero route-level config required.** Adding the text index + weights to the schema is enough.

### Overriding at call site (rare)

If you need to override the schema-derived config for a specific route:

```ts
return ArticleModel.withAqp(req, {
  searchWeights: { slug: 15, "title.en": 3 }, // overrides schema weights
  // searchPaths derived from weight keys automatically unless also overridden
});
```

---

## 9. `AqpOptions` Reference

```ts
type AqpOptions = {
  /**
   * When true (default), the `locale` query param is consumed and used to
   * reduce LocalizedString fields to a single locale string in the response.
   */
  consumeLocale?: boolean;

  /**
   * Optional explicit Atlas Search/regex paths.
   * If omitted, paths are derived from the keys of searchWeights.
   */
  searchPaths?: string[];

  /**
   * Optional Atlas Search scoring boost by path.
   * If omitted, withAqp reads weights from the model's text index definition.
   */
  searchWeights?: Record<string, number>;

  /**
   * When true, return [items, headers] tuple instead of NextResponse.
   * Useful for server-side callers that need to transform data further.
   */
  raw?: boolean;
};
```

---

## 10. URL Query Parameters Supported by `withAqp`

All standard `api-query-params` (AQP) syntax plus these special params:

| Parameter      | Description                                    |
| -------------- | ---------------------------------------------- |
| `q=<text>`     | Full-text search (Atlas → `$text` → regex)     |
| `locale=en`    | Locale for response reduction (default: `en`)  |
| `__raw=true`   | Skip locale reduction, return raw DB documents |
| `_sort=field`  | Sort ascending by field                        |
| `_sort=-field` | Sort descending by field                       |
| `_limit=20`    | Page size                                      |
| `_skip=40`     | Offset (for pagination)                        |
| `field=value`  | Exact filter (standard AQP)                    |
| `field>=value` | Comparison filter (standard AQP)               |

---

## 11. Anti-Patterns to Avoid

| ❌ Anti-pattern                                           | ✅ Correct                                               |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `InferSchemaType<typeof Schema>` for the public interface | Explicit `interface IModel { ... }` in `types/`          |
| `new mongoose.Schema({ ... })` without generic            | `new mongoose.Schema<IModel>({ ... })`                   |
| `roles: { default: ["VISITOR"] }` (raw string)            | `roles: { default: [USER_ROLES.VISITOR] }`               |
| Importing from `src/models/` inside `src/types/`          | Types file has zero model imports                        |
| `mongoose.model("X", XSchema)` without hot-reload guard   | `mongoose.models.X \|\| mongoose.model(...)`             |
| `_id: string` in the interface                            | `_id: Types.ObjectId`                                    |
| TypeScript `enum Role { ... }`                            | `const ROLES = { ... } as const` + union type            |
| `ReturnType<typeof withAqp>` in the model interface       | Explicit overloads (standard and `{ raw: true }`)        |
| Search config in the route handler                        | Weights in the schema text index `weights` option        |
| Separate `searchPaths` + `searchWeights` arrays           | `searchWeights` keys are the paths — one source of truth |
| `toLocaleString()` / `Intl.*` in components               | `useFormatter` / `getFormatter` from `next-intl`         |

---

## Quick Templates

### Simple model (no search)

**`src/types/<model>.ts`**

```ts
import { Types } from "mongoose";

export interface I<Model> {
  readonly _id: Types.ObjectId;
  slug: string;
  // ... fields
  createdAt?: Date;
  updatedAt?: Date;
}
```

**`src/models/<Model>.ts`**

```ts
import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { I<Model> } from "@/types/<model>";
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface I<Model>Model extends Model<I<Model>> {
  withAqp(req: NextRequest, options?: AqpOptions): Promise<Response>;
  withAqp(
    req: NextRequest,
    options: AqpOptions & { raw: true },
  ): Promise<[I<Model>[], Record<string, string>]>;
}

const <Model>Schema = new mongoose.Schema<I<Model>>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    // ... fields
  },
  { timestamps: true },
);

<Model>Schema.static("withAqp", withAqp);

export default (mongoose.models.<Model> as I<Model>Model) ||
  mongoose.model<I<Model>, I<Model>Model>("<Model>", <Model>Schema);
```

---

### Model with LocalizedString fields + full-text search

**`src/models/<Model>.ts`**

```ts
import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { I<Model> } from "@/types/<model>";
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface I<Model>Model extends Model<I<Model>> {
  withAqp(req: NextRequest, options?: AqpOptions): Promise<Response>;
  withAqp(
    req: NextRequest,
    options: AqpOptions & { raw: true },
  ): Promise<[I<Model>[], Record<string, string>]>;
}

// Reusable sub-schema for translatable string fields.
const LocalizedStringSchema = { type: Map, of: String, required: true };

const <Model>Schema = new mongoose.Schema<I<Model>>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: LocalizedStringSchema,
    description: LocalizedStringSchema,
    // ... other fields
  },
  { timestamps: true },
);

// Text index with weights — withAqp reads these automatically.
// Higher weight = ranks higher in search results.
<Model>Schema.index(
  {
    slug: "text",
    "name.en": "text",
    "name.fr": "text",
    "description.en": "text",
    "description.fr": "text",
  },
  {
    weights: {
      slug: 10,
      "name.en": 5,
      "name.fr": 5,
      "description.en": 1,
      "description.fr": 1,
    },
  },
);

<Model>Schema.static("withAqp", withAqp);

export default (mongoose.models.<Model> as I<Model>Model) ||
  mongoose.model<I<Model>, I<Model>Model>("<Model>", <Model>Schema);
```

**`src/app/api/<resource>/route.ts`**

```ts
import { NextRequest } from "next/server";
import <Model>Model from "@/models/<Model>";

export async function GET(req: NextRequest) {
  return <Model>Model.withAqp(req);
}
```
