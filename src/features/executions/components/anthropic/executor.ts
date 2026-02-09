
import Handlebars from "handlebars"
import { NonRetriableError } from "inngest";
import {generateText} from "ai"
import {createAnthropic} from "@ai-sdk/anthropic"
import type {NodeExecutor} from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";


Handlebars.registerHelper("json",(context) => {
    const jsonString =JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString
})



type AnthropicData = {
    variableName?: string;
    // model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

//https://codewithantonio.com
//https://jsonplaceholder.typicode/com/todos/2
// {{json todo.httpResponse.data}}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async({
    data,
    nodeId,
    context,
    step,
    publish,

}) => {
    //TODO: Publish "loading" state for http request
    await publish(
        anthropicChannel().status({
            nodeId,
            status: "loading",
        })
    )

    if (!data.variableName){
        await publish(
            anthropicChannel().status({
                nodeId,
                status:"error",
            })
        );
        throw new NonRetriableError("Anthropic node: Variable name is missing");
    }


    if (!data.userPrompt){
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error",
            })
        )
        throw new NonRetriableError("Anthropic node: User prompt is missing");
    }
    
    //TODO: Fetch credential that user selected



    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "you are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    //TODO: Fetch credential that user selected

    const credentialValue = process.env.ANTHROPIC_API_KEY!;


    const anthropic = createAnthropic({
        apiKey: credentialValue,
    })

    try{
        const {steps} = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic("gpt-4"),
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
            anthropicChannel().status({
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
            anthropicChannel().status({
                nodeId,
                status: "error",
            })
        )
        throw error;
    }
    


   
};