// import { auth } from "@/lib/auth";
// import prisma from "@/lib/db";
// import { polarClient } from "@/lib/polar";
// import { initTRPC, TRPCError } from "@trpc/server";
// import { headers } from "next/headers";
// import { cache } from "react";
// import superjson from "superjson";
// export const createTRPCContext = cache(async () => {
//   /**
//    * @see: https://trpc.io/docs/server/context
//    */
//   // return { userId: "user_123" };
//   return{
//     db: prisma,
//   }
// });
// //----------------------------------------------------------------------
// export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
// // Avoid exporting the entire t-object
// // since it's not very descriptive.
// // For instance, the use of a t variable
// // is common in i18n libraries.
// const t = initTRPC.context<Context>().create({
//   /**
//    * @see https://trpc.io/docs/server/data-transformers
//    */
//   transformer: superjson,
// });
// // Base router and procedure helpers
// export const createTRPCRouter = t.router;
// export const createCallerFactory = t.createCallerFactory;
// export const baseProcedure = t.procedure;


// export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "Unathorized",
//     });
//   }

//   return next({ ctx: { ...ctx, auth: session } });
// });


// export const premiumProcedure = protectedProcedure.use(
//   async ({ ctx, next }) => {
//     const customer = await polarClient.customers.getStateExternal({
//       externalId: ctx.auth.user.id,
//     });
//     if (
//       !customer.activeSubscriptions ||
//       customer.activeSubscriptions.length === 0
//     ) {
//       throw new TRPCError({
//         code: "FORBIDDEN",
//         message: "Active subscription required",
//       });
//     }
//     return next({ ctx: { ...ctx, customer } });
//   },
// );


import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { polarClient } from "@/lib/polar";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

// 1. Define and Export the Context
export const createTRPCContext = cache(async () => {
  return {
    db: prisma,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// 2. Initialize tRPC with the Context type
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// 3. Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// 4. Protected Procedure (Requires Login)
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

// 5. Smart Premium Procedure (4-Workflow Grace Period)
export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const userId = ctx.auth.user.id;

    // Check how many workflows the user currently has
    const workflowCount = await prisma.workflow.count({
      where: { userId },
    });

    // GRACE PERIOD: If they have created 0, 1, 2, or 3 workflows, let them pass
    if (workflowCount < 4) {
      return next({ ctx });
    }

    // LIMIT REACHED: Now we verify their Polar subscription
    try {
      const customer = await polarClient.customers.getStateExternal({
        externalId: userId,
      });

      const hasActiveSub = 
        customer.activeSubscriptions && 
        customer.activeSubscriptions.length > 0;

      if (!hasActiveSub) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "LIMIT_REACHED",
        });
      }

      // If they have a sub, attach customer info to context and proceed
      return next({ ctx: { ...ctx, customer } });
    } catch (error: any) {
      // Catching Polar 404s or network issues
      // Since they are > 4 workflows, we must block them until they have a sub
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "LIMIT_REACHED",
      });
    }
  },
);