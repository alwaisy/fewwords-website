import demoTaskQueue from "../../queues/demo-task";
import type { DemoTaskData } from "../../queues/demo-task";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validate request body
  const { email, userName, taskName, steps = 5 } = body;

  if (!email || !userName || !taskName) {
    throw createError({
      statusCode: 400,
      message: "Missing required fields: email, userName, taskName",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      message: "Invalid email format",
    });
  }

  // Validate steps
  const stepCount = Math.max(3, Math.min(20, Number(steps) || 5));

  const jobData: DemoTaskData = {
    email,
    userName,
    taskName,
    steps: stepCount,
  };

  // Add job to queue
  const job = await demoTaskQueue.add("demo-task", jobData, {
    jobId: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, // Unique job ID
  });

  console.log(`[DemoAPI] Job enqueued: ${job.id} for ${userName} (${email})`);

  return {
    success: true,
    jobId: job.id,
    message: "Task enqueued successfully. You will receive an email when it's complete.",
    estimatedTime: `${stepCount * 2}-${stepCount * 3} seconds`,
  };
});
