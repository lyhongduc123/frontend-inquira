/**
 * React hooks for user settings
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userSettingsApi, type UpdateUserSettingsRequest } from "@/lib/api";
import { defaultRetry, defaultRetryDelay, handleMutationError, handleMutationSuccess } from "@/lib/utils/react-query-utils";

export function useUserSettings() {
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: () => userSettingsApi.get(),
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserSettingsRequest) => userSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      handleMutationSuccess("Settings updated successfully");
    },
    onError: (error) => {
      handleMutationError(error, "update settings");
    },
  });
}
