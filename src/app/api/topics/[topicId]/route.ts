import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { updateTopicSchema } from "@/lib/validations/subject";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

/** Find a topic and verify it belongs to the authenticated user. */
async function findOwnedTopic(topicId: string, userId: string) {
  const topic = await Topic.findOne({ topicId });
  if (!topic) return null;

  // Verify ownership through the parent subject
  const subject = await Subject.findOne({
    subjectId: topic.subjectId,
    userId,
  }).lean();

  return subject ? topic : null;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { topicId } = await context.params;
    if (!topicId?.trim()) {
      return jsonError("Topic ID is required", 400);
    }

    const body = updateTopicSchema.parse(await request.json());

    // Ensure at least one field is being updated
    if (!body.topicName && body.difficulty === undefined && !body.status) {
      return jsonError(
        "At least one field (topicName, difficulty, status) is required",
        400,
      );
    }

    await connectDB();

    const topic = await findOwnedTopic(topicId, session.userId);
    if (!topic) {
      return jsonError("Topic not found", 404);
    }

    if (body.topicName) topic.topicName = body.topicName;
    if (body.difficulty !== undefined) topic.difficulty = body.difficulty;
    if (body.status) topic.status = body.status;
    await topic.save();

    return jsonSuccess({
      topic: {
        topicId: topic.topicId,
        subjectId: topic.subjectId,
        topicName: topic.topicName,
        difficulty: topic.difficulty,
        status: topic.status,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { topicId } = await context.params;
    if (!topicId?.trim()) {
      return jsonError("Topic ID is required", 400);
    }

    await connectDB();

    const topic = await findOwnedTopic(topicId, session.userId);
    if (!topic) {
      return jsonError("Topic not found", 404);
    }

    await Topic.deleteOne({ topicId });

    return jsonSuccess({
      message: "Topic deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
