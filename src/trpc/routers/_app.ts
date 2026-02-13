import { credentialsRouter } from "@/features/credentials/server/routers";
import {
  // baseProcedure,
  createTRPCRouter,
  protectedProcedure,
  // premiumProcedure,
  // protectedProcedure,
} from "../init";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { executionsRouter } from "@/features/executions/server/routers";


export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,



  testAi: protectedProcedure.mutation(async ({ ctx }) => {
    return { success: true };
  }),
});

export type AppRouter = typeof appRouter;
