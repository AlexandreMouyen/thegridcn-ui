import { Types } from "mongoose";

export type WithMongoId<T> = T & { readonly _id: Types.ObjectId };

/** Replaces specific fields K with their populated version P */
export type Populated<T, K extends keyof T, P> = Omit<T, K> & {
  [Key in K]: P;
};

/** Serialize specific fields K with string */
export type Serialized<T, K extends keyof T> = Omit<T, K> & {
  [Key in K]: string;
};
