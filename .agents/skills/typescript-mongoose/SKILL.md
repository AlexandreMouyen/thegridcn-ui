---
name: typescript-mongoose
description: TypeScript + Mongoose model pattern — defining explicit interfaces, enum constants, and typed models. Use when creating a new Mongoose model, adding fields to an existing model, or ensuring type safety between the schema and the rest of the codebase.
---

# TypeScript + Mongoose Models

## Core Rule: Interface Lives in `types/`, Not in the Model File

**Never** derive the interface from the schema with `InferSchemaType` when the interface is also imported by the model. That creates a circular import. Always write the interface explicitly in `src/types/<model-name>.ts` and import it into the model.

```
src/types/<model>.ts   ← interface, enum constants, utility types (no Mongoose schema)
src/models/<Model>.ts  ← schema + model (imports interface from types/)
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

## 5. Anti-Patterns to Avoid

| ❌ Anti-pattern                                               | ✅ Correct                                         |
| ------------------------------------------------------------- | -------------------------------------------------- |
| `InferSchemaType<typeof UserSchema>` for the public interface | Explicit `interface IUser { ... }` in `types/`     |
| `new mongoose.Schema({ ... })` without generic                | `new mongoose.Schema<IUser>({ ... })`              |
| `roles: { default: ["VISITOR"] }` (raw string)                | `roles: { default: [USER_ROLES.VISITOR] }`         |
| Importing from `src/models/` inside `src/types/`              | Types file has zero model imports                  |
| `mongoose.model("User", UserSchema)` without hot-reload guard | `mongoose.models.User \|\| mongoose.model(...)`    |
| `_id: string` in the interface                                | `_id: Types.ObjectId`                              |
| TypeScript `enum UserRole { ... }`                            | `const USER_ROLES = { ... } as const` + union type |

---

## Quick Template

Copy-paste starting point for a new model:

**`src/types/<model>.ts`**

```ts
import { Types } from "mongoose";

export interface I<Model> {
  readonly _id: Types.ObjectId;
  // ... fields
  createdAt?: Date;
  updatedAt?: Date;
}
```

**`src/models/<Model>.ts`**

```ts
import mongoose, { Model } from "mongoose";
import { I<Model> } from "@/types/<model>";

const <Model>Schema = new mongoose.Schema<I<Model>>(
  {
    // ... fields
  },
  { timestamps: true },
);

type I<Model>Model = Model<I<Model>>;

export default (mongoose.models.<Model> as I<Model>Model) ||
  mongoose.model<I<Model>>("<Model>", <Model>Schema);
```
