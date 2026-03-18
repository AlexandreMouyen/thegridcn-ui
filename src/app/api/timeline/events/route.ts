import { NextRequest } from "next/server";
import EventModel from "@/models/ScEvent";

/**
 * GET /api/timeline/events
 *
 * Supports all api-query-params filters plus:
 *   ?locale=fr           — reduce LocalizedString fields to a single locale
 *   ?eraSlug=age-of-sail — filter by era (forwarded straight to MongoDB)
 *   ?sort=order          — sort by any field
 *   ?limit=20&skip=0     — pagination (X-Total-Count / X-Has-More headers)
 */
export async function GET(req: NextRequest) {
  return EventModel.withAqp(req);
}
