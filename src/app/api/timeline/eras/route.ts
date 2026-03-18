import { NextRequest } from "next/server";
import EraModel from "@/models/ScEra";

/**
 * GET /api/timeline/eras
 *
 * Supports all api-query-params filters plus:
 *   ?locale=fr        — reduce LocalizedString fields to a single locale
 *   ?sort=startYear   — sort by any field
 *   ?limit=20&skip=0  — pagination (X-Total-Count / X-Has-More headers)
 */
export async function GET(req: NextRequest) {
  return EraModel.withAqp(req);
}
