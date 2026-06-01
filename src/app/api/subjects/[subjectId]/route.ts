import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";

type RouteContext = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { subjectId } = await context.params;
    if (!subjectId?.trim()) {
      return jsonError("Subject ID is required", 400);
    }

    await connectDB();

    const subject = await Subject.findOne({
      subjectId,
      userId: session.userId,
    }).lean();

    if (!subject) {
      return jsonError("Subject not found", 404);
    }

    const topics = await Topic.find({ subjectId })
      .sort({ createdAt: 1 })
      .lean();

    return jsonSuccess({
      subject: {
        subjectId: subject.subjectId,
        syllabusId: subject.syllabusId,
        subjectName: subject.subjectName,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
        topics: topics.map((topic) => ({
          topicId: topic.topicId,
          topicName: topic.topicName,
          difficulty: topic.difficulty,
          status: topic.status,
          createdAt: topic.createdAt,
          updatedAt: topic.updatedAt,
        })),
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

    const { subjectId } = await context.params;
    if (!subjectId?.trim()) {
      return jsonError("Subject ID is required", 400);
    }

    await connectDB();

    const subject = await Subject.findOne({
      subjectId,
      userId: session.userId,
    });

    if (!subject) {
      return jsonError("Subject not found", 404);
    }

    // Delete all topics under this subject first
    await Topic.deleteMany({ subjectId });
    // Then delete the subject
    await Subject.deleteOne({ subjectId, userId: session.userId });

    return jsonSuccess({
      message: "Subject and its topics deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
