
import Handlebars from "handlebars"
import { NonRetriableError } from "inngest";
import {generateText} from "ai"
import {createOpenAI} from "@ai-sdk/openai"
import type {NodeExecutor} from "@/features/executions/types";
import { openAiChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";


Handlebars.registerHelper("json",(context) => {
    const jsonString =JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString
})



type OpenAiData = {
    variableName?: string;
    // model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

//https://codewithantonio.com
//https://jsonplaceholder.typicode/com/todos/2
// {{json todo.httpResponse.data}}

export const openAiExecutor: NodeExecutor<OpenAiData> = async({
    data,
    nodeId,
    context,
    step,
    publish,

}) => {
    //TODO: Publish "loading" state for http request
    await publish(
        openAiChannel().status({
            nodeId,
            status: "loading",
        })
    )

    if (!data.variableName){
        await publish(
            openAiChannel().status({
                nodeId,
                status:"error",
            })
        );
        throw new NonRetriableError("OpenAI node: Variable name is missing");
    }


    if (!data.userPrompt){
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error",
            })
        )
        throw new NonRetriableError("OpenAI node: User prompt is missing");
    }
     if(!data.credentialId){
            await publish(
                openAiChannel().status({
                    nodeId,
                    status:"error",
                })
            )
            throw new NonRetriableError("OpenAI node: Credential is required")
        }
   



    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "you are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential",()=>{
        return prisma.credential.findUnique({
            where:{
                id: data.credentialId,
            }
        })
    })

    if(!credential){
        throw new NonRetriableError("Gemini node: Credential not found");
    }




    const openai = createOpenAI({
        apiKey: credential.value,
    })

    try{
        const {steps} = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai("gpt-4"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry:{
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }

            }
        ) 

        const text = 
        steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

        await publish(
            openAiChannel().status({
                nodeId,
                status: "success",
            })
        )

        return{
            ...context,
            [data.variableName]:{
                text,

            }
        }

    }catch (error){
        await publish(
            openAiChannel().status({
                nodeId,
                status: "error",
            })
        )
        throw error;
    }
    


   
};