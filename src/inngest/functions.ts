import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from 'ai';
import { inngest } from "./client";

const google = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend", "5s");

    console.warn("Something is missing");
    console.error("This is an error I want to track");

    const { text } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-1.5-flash"),
      system: "You are a helpful assistant.",
      prompt: "What is 2+2?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    return { text };
  },
);



// //above is working code
// import { inngest } from "./client";

// export const helloWorld = inngest.createFunction(
//   { id: "hello-world" },
//   { event: "test/hello.world" },
//   async ({ event, step }) => {
//     await step.sleep("wait-a-moment", "1s");
//     return { message: `Hello ${event.data.email}!` };
//   },
// );



















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
