
// "use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma/enums";

/**
 * Fetch ALL credentials
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useSuspenseQuery(
    trpc.credentials.getMany.queryOptions(params)
  );
};

/**
 * Fetch ONE credentials
 */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.credentials.getOne.queryOptions({ id })
  );
};

/**
 * Create credentials
 */
export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" created`);

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(`Failed to create credential: ${error.message}`);
      },
    })
  );
};

/**
 * Remove credentials
 */
export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" removed`);

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getOne.queryKey({ id: data.id }),
        });
      },
    })
  );
};


/**
 * Update credential
 */
export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" saved`);

        // invalidate list
        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey(),
        });

        // invalidate detail
        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getOne.queryKey({ id: data.id }),
        });
      },
      onError: (error) => {
        toast.error(`Failed to save credential: ${error.message}`);
      },
    })
  );
};



/**
 * Hook to fetch credentials by type
 */

export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({type}));
}