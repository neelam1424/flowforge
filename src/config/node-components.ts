import { InitialNode } from "@/components/initial-node";
// import {NodeType} from "@prisma/client"
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react"


export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    // [NodeType.OPENAI]: OpenAINode,

}as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;