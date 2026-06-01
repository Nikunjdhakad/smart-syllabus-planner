import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { createTopicSchema } from "@/lib/validations/subject";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const body = createTopicSchema.parse(await request.json());
    await connectDB();

    // Verify the subject belongs to the user
    const subject = await Subject.findOne({
      subjectId: body.subjectId,
      userId: session.userId,
    });
    if (!subject) {
      return jsonError("Subject not found", 404);
    }

    const topic = await Topic.create({
      subjectId: body.subjectId,
      topicName: body.topicName,
      difficulty: body.difficulty,
    });

    return jsonSuccess(
      {
        topic: {
          topicId: topic.topicId,
          subjectId: topic.subjectId,
          topicName: topic.topicName,
          difficulty: topic.difficulty,
          status: topic.status,
        },
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
