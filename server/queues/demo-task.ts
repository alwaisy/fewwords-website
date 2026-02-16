import { defineQueue } from "#processor";

export type DemoTaskName = "demo-task";
export type DemoTaskData = {
  email: string;
  userName: string;
  taskName: string;
  steps: number;
};

export type DemoTaskResult = {
  success: boolean;
  stepsCompleted: number;
  duration: number;
  message: string;
};

export default defineQueue<DemoTaskData, DemoTaskResult, DemoTaskName>({
  name: "demo-task",
  options: {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs
        age: 7 * 24 * 3600, // 7 days
      },
    },
  },
});
