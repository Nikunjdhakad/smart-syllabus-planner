import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess, handleApiError } from "@/lib/api";
import { getStudyCoachSummary } from "@/lib/agent/study-coach";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const summary = await getStudyCoachSummary(session.userId);
    return jsonSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
}