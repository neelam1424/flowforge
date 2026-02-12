import {channel, topic} from "@inngest/realtime";

export const DISCORD_CHANNEL_NAME = "discord-execution"

export const discordChannel = channel("discord-execution")
.addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
