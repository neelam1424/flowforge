"use client";


import { formatDistanceToNow } from "date-fns";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useSuspenseExecutions,
} from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
// import { Execution } from "@/generated/prisma/client";
// import { ExecutionStatus } from "@/generated/prisma/client";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";


type ExecutionStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";

interface Execution {
  id: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt: Date | null;
  // ... add other fields you use
}

type CredentialType = "OPENAI" | "ANTHROPIC" | "GEMINI";
type Credential = {
  id: string;
  name: string;
  type: CredentialType;
  createdAt: Date;
  updatedAt: Date;
};



export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionsItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
      <EntityHeader
        title="Executions"
        description="View your workflow execution history"
      />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {

  return (
      <EmptyView
        message="You haven't created any executions yet. Get started by creating your first execution"
      />
   
  );
};


// const credentialLogos: Record<CredentialType, string>={
//   [CredentialType.OPENAI]: "/logos/openai.svg",
//   [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
//   [CredentialType.GEMINI]: "/logos/gemini.svg",

// }

// const credentialLogos = {
//   OPENAI: "/logos/openai.svg",
//   ANTHROPIC: "/logos/anthropic.svg",
//   GEMINI: "/logos/gemini.svg",
// } as const;

// const getStatusIcon = (status: ExecutionStatus)=> {
//   switch(status){
//     case ExecutionStatus.SUCCESS:
//       return <CheckCircle2Icon className="size-5 text-green-600"/>
//     case ExecutionStatus.FAILED:
//       return <XCircleIcon className="size-5 text-red-600"/>
//     case ExecutionStatus.RUNNING:
//       return <Loader2Icon className="size-5 text-blue-600 animate-spin"/>
//     default:
//       return <ClockIcon className="size-5 text-muted-foreground"/>
// }
// }

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case "SUCCESS": // Use the string directly
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case "FAILED":
      return <XCircleIcon className="size-5 text-red-600" />;
    case "RUNNING":
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
}


export const ExecutionsItem = ({
   data, 
  }: { 
    data: Execution & {
      workflow: {
        id: string;
        name: string;
      };
    }
  }) => {

  const duration = data.completedAt
  ? Math.round(
    (new Date(data.completedAt).getTime()- new Date(data.startedAt).getTime())/1000,
  ): null;

  const subtitle = (
    <>
    {data.workflow.name} &bull; Started{" "}
    {formatDistanceToNow(data.startedAt,{addSuffix: true})}
    {duration !== null && <> &bull; Took {duration}s </>}
    </>
  )



  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};
