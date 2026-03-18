import { NextResponse } from "next/server";

export type HttpCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;

export type JSONErrorResponse = { message: string; status: HttpCode };

export function sendJSONResponse<T = string>(
  payload: T,
  status: HttpCode = 500,
  headers: HeadersInit = {},
) {
  let data: JSONErrorResponse | T;
  if (typeof payload === "string") data = { message: payload, status };
  else data = payload;
  return NextResponse.json(data, { status, headers });
}

export function sendOk<T = object>(data: T, headers: HeadersInit = {}) {
  return sendJSONResponse(data, 200, headers);
}

export function sendNoContent(headers: HeadersInit = {}) {
  return sendJSONResponse({}, 204, headers);
}

export function sendBadRequest<T = object>(data: T, headers: HeadersInit = {}) {
  return sendJSONResponse(data, 400, headers);
}

export function sendUnauthorized<T = object>(
  data: T,
  headers: HeadersInit = {},
) {
  return sendJSONResponse(data, 401, headers);
}

export function sendForbidden<T = object>(data: T, headers: HeadersInit = {}) {
  return sendJSONResponse(data, 403, headers);
}

export function sendNotFound<T = object>(data: T, headers: HeadersInit = {}) {
  return sendJSONResponse(data, 404, headers);
}

export function sendServerError<T = object>(
  data: T,
  headers: HeadersInit = {},
) {
  return sendJSONResponse(data, 500, headers);
}
