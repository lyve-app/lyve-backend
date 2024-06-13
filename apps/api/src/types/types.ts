import type { NextFunction, Request, Response } from "express";
import type { DeepPartial } from "utility-types";
import type { IFilterXSSOptions } from "xss";
import { SocketUser } from "./socket";

export type TypedResponse<Data> = {
  success: boolean;
  data: Data | null;
  error: { name: string; code: number; msg: string }[];
};

// See this for the following types
// https://stackoverflow.com/questions/34508081/how-to-add-typescript-definitions-to-express-req-res
// https://stackoverflow.com/questions/61132262/typescript-deep-partial

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

// https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

// More strictly typed Express.Request type
export type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  DeepPartial<ReqBody>,
  DeepPartial<QueryString>
>;

// More strictly typed express middleware type
export type ExpressMiddleware<
  ReqBody = Record<string, unknown>,
  Res = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = (
  req: TypedRequest<ReqBody, QueryString>,
  res: Response<Res>,
  next: NextFunction
) => Promise<void> | void;

export type Sanitized<T> = T extends (...args: unknown[]) => unknown
  ? T // if T is a function, return it as is
  : T extends object
  ? {
      readonly [K in keyof T]: Sanitized<T[K]>;
    }
  : T;

export type SanitizeOptions = IFilterXSSOptions & {
  whiteList?: IFilterXSSOptions["whiteList"];
};

export type CreateUserCredentials = {
  id: string;
  username: string;
  email: string;
};

export type ChatMessage = {
  id: string;
  msg?: string;
  gif?: GIF;
  sender: SocketUser;
  created_at: string;
};

export type GIF = {
  height: string;
  width: string;
  url: string;
};

export interface JwtPayload {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  "allowed-origins": string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    account: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export type Days =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
