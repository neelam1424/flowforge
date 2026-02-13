import { credentialsRouter } from "@/features/credentials/server/routers";
import {
  // baseProcedure,
  createTRPCRouter,
  // premiumProcedure,
  // protectedProcedure,
} from "../init";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { executionsRouter } from "@/features/executions/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});

export type AppRouter = typeof appRouter;
