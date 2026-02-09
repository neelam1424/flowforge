import {channel, topic} from "@inngest/realtime";

export const ANTHROPIC_CHANNEL_NAME = "anthropic-execution"

export const anthropicChannel = channel("anthropic-execution")
.addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
