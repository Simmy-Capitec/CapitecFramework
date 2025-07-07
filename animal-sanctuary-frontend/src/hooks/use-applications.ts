import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  type AdoptionApplication,
} from '@/lib/api';
import { toast } from 'sonner';

// ===================================================================
// QUERY KEYS
// ===================================================================

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
};

// ===================================================================
// QUERIES
// ===================================================================

/**
 * Hook to fetch all applications
 */
export function useApplications() {
  return useQuery({
    queryKey: applicationKeys.lists(),
    queryFn: getApplications,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ===================================================================
// MUTATIONS
// ===================================================================

/**
 * Hook to create a new adoption application
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      toast.success('Adoption application submitted successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to submit application';
      toast.error(`Error submitting application: ${message}`);
    },
  });
}

/**
 * Hook to update application status
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reviewNotes }: { 
      id: number; 
      status: AdoptionApplication['status']; 
      reviewNotes?: string; 
    }) => updateApplicationStatus(id, status, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      toast.success('Application status updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update application status';
      toast.error(`Error updating application: ${message}`);
    },
  });
}