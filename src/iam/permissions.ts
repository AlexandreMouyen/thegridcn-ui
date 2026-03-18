/**
 * IAM | Permissions
 */

import { IUser } from "@/types/user";
import { IEra, IEvent } from "@/types/timeline";
import { JWT } from "next-auth/jwt";
import { IGlossaryTerm } from "@/types/glossary";

export type Permissions = {
  eras: {
    dataType: IEra;
    action: "view" | "create" | "edit" | "delete";
  };
  events: {
    dataType: IEvent;
    action: "view" | "create" | "edit" | "delete";
  };
  users: {
    dataType: IUser;
    action: "view" | "create" | "edit" | "delete";
  };
  "glossary-terms": {
    dataType: IGlossaryTerm;
    action: "view" | "create" | "edit" | "delete";
  };
};

export type APIFilterType<Key extends keyof Permissions> = Partial<{
  [key in keyof Permissions[Key]["dataType"]]: Permissions[Key]["dataType"][keyof Permissions[Key]["dataType"]];
}>;

export type APIProjectionType<Key extends keyof Permissions> = Partial<{
  [key in keyof Permissions[Key]["dataType"]]: number;
}>;

export type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((token: JWT | null, data?: Permissions[Key]["dataType"]) => boolean)
  | ((
      token: JWT | null,
      data?: Permissions[Key]["dataType"],
    ) => [APIFilterType<Key>, APIProjectionType<Key>] | null);
