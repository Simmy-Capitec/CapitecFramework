import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdopters,
  getAdopter,
  createAdopter,
  type Adopter,
} from '@/lib/api';
import { toast } from 'sonner';

// ===================================================================
// QUERY KEYS
// ===================================================================

export const adopterKeys = {
  all: ['adopters'] as const,
  lists: () => [...adopterKeys.all, 'list'] as const,
  details: () => [...adopterKeys.all, 'detail'] as const,
  detail: (id: number) => [...adopterKeys.details(), id] as const,
};

// ===================================================================
// QUERIES
// ===================================================================

/**
 * Hook to fetch all adopters
 */
export function useAdopters() {
  return useQuery({
    queryKey: adopterKeys.lists(),
    queryFn: getAdopters,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single adopter
 */
export function useAdopter(id: number, enabled = true) {
  return useQuery({
    queryKey: adopterKeys.detail(id),
    queryFn: () => getAdopter(id),
    enabled: enabled && id > 0,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ===================================================================
// MUTATIONS
// ===================================================================

/**
 * Hook to create a new adopter
 */
export function useCreateAdopter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdopter,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adopterKeys.lists() });
      toast.success(`Adopter "${data.data.first_name} ${data.data.last_name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create adopter';
      toast.error(`Error creating adopter: ${message}`);
    },
  });
}