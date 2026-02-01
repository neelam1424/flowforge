import {
  baseProcedure,
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "../init";
import { workflowsRouter } from "@/features/workflows/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
});

export type AppRouter = typeof appRouter;
