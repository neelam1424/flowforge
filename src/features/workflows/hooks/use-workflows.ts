
"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

/**
 * Fetch ALL workflows
 */
export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(
    trpc.workflows.getMany.queryOptions(params)
  );
};

/**
 * Fetch ONE workflow
 */
export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({ id })
  );
};

/**
 * Create workflow
 */
export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created`);

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
      },
    })
  );
};

/**
 * Remove workflow
 */
export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed`);

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getOne.queryKey({ id: data.id }),
        });
      },
    })
  );
};

/**
 * Update workflow name
 */
export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" updated`);

        // invalidate list
        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey(),
        });

        // invalidate detail
        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getOne.queryKey({ id: data.id }),
        });
      },
      onError: (error) => {
        toast.error(`Failed to update workflow: ${error.message}`);
      },
    })
  );
};


/**
 * Update workflow 
 */
export const useUpdateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" saved`);

        // invalidate list
        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey(),
        });

        // invalidate detail
        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getOne.queryKey({ id: data.id }),
        });
      },
      onError: (error) => {
        toast.error(`Failed to save workflow: ${error.message}`);
      },
    })
  );
};



/**
 * Execute workflow 
 */
export const useExecuteWorkflow = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" executed`);

      },
      onError: (error) => {
        toast.error(`Failed to execute workflow: ${error.message}`);
      },
    })
  );
};