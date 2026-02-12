
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openAiChannel } from "./channels/openai";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";



export const executeWorkflow = inngest.createFunction(
  {
     id: "execute-workflow",
     retries: 0, 
    
    },
  { 
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      discordChannel(),
      slackChannel(),
        ] ,
  },
  async ({ event, step, publish }) => {

    const workflowId = event.data.workflowId;

    if(!workflowId){
      throw new NonRetriableError("Workflow ID is missing")
    }


    const sortedNodes = await step.run("prepare-workflow", async() => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {id: workflowId},
        include: {
          nodes: true,
          connections: true,
        }
      });
      return topologicalSort (workflow.nodes,  workflow.connections);
    });

    const userId= await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where:{id: workflowId},
        select:{
        userId: true,
        }
      })
      return workflow.userId;
    })


    //Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};


    //Execute each node
    for (const node of sortedNodes){
      const executor= getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      })
    }


    return {
      workflowId,
      result: context,
    };
  },
);






















// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { generateText } from "ai";
// import { inngest } from "./client";

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_API_KEY!,
// });

// export const execute = inngest.createFunction(
//   { id: "execute-ai" },
//   { event: "execute/ai" },
//   async ({ step }) => {
//     await step.sleep("pretend", "5s");

//     const { text } = await step.ai.wrap(
//       "gemini-generate-text",
//       generateText,
//       {
//         model: google("gemini-1.5-flash"),
//         system: "You are a helpful assistant.",
//         prompt: "What is 2+2?",
//       }
//     );

//     console.log("AI result:", text);

//     return { success: true };
//   }
// );
