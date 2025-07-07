import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnimals,
  getAnimal,
  searchAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getAnimalStats,
  type Animal,
  type AnimalWithDetails,
  type AnimalFilters,
  type PaginationResponse,
} from '@/lib/api';
import { toast } from 'sonner';

// ===================================================================
// QUERY KEYS
// ===================================================================

export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (filters?: AnimalFilters) => [...animalKeys.lists(), filters] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: number) => [...animalKeys.details(), id] as const,
  search: (term: string) => [...animalKeys.all, 'search', term] as const,
  stats: () => [...animalKeys.all, 'stats'] as const,
};

// ===================================================================
// QUERIES
// ===================================================================

/**
 * Hook to fetch paginated animals with optional filtering
 */
export function useAnimals(filters?: AnimalFilters) {
  return useQuery({
    queryKey: animalKeys.list(filters),
    queryFn: () => getAnimals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch a single animal with complete details
 */
export function useAnimal(id: number, enabled = true) {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => getAnimal(id),
    enabled: enabled && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to search animals by term
 */
export function useAnimalSearch(term: string, enabled = true) {
  return useQuery({
    queryKey: animalKeys.search(term),
    queryFn: () => searchAnimals(term),
    enabled: enabled && term.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch animal statistics
 */
export function useAnimalStats() {
  return useQuery({
    queryKey: animalKeys.stats(),
    queryFn: getAnimalStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get available animals only (for adoption browsing)
 */
export function useAvailableAnimals(filters?: Omit<AnimalFilters, 'available_only'>) {
  return useAnimals({
    ...filters,
    available_only: true,
  });
}

// ===================================================================
// MUTATIONS
// ===================================================================

/**
 * Hook to create a new animal
 */
export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnimal,
    onSuccess: (data) => {
      // Invalidate and refetch animal lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.stats() });
      
      toast.success(`Animal "${data.data.name}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create animal';
      toast.error(`Error creating animal: ${message}`);
    },
  });
}

/**
 * Hook to update an existing animal
 */
export function useUpdateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Animal> }) =>
      updateAnimal(id, data),
    onSuccess: (data, variables) => {
      // Update specific animal in cache
      queryClient.setQueryData(
        animalKeys.detail(variables.id),
        (old: any) => ({
          ...old,
          data: data.data,
        })
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.stats() });
      
      toast.success(`Animal "${data.data.name}" updated successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update animal';
      toast.error(`Error updating animal: ${message}`);
    },
  });
}

/**
 * Hook to delete an animal (soft delete)
 */
export function useDeleteAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: (data) => {
      // Invalidate and refetch animal lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.stats() });
      
      // Remove from cache
      queryClient.removeQueries({
        queryKey: animalKeys.detail(data.data.animal_id),
      });
      
      toast.success(`Animal "${data.data.name}" deleted successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete animal';
      toast.error(`Error deleting animal: ${message}`);
    },
  });
}

// ===================================================================
// UTILITIES
// ===================================================================

/**
 * Prefetch an animal's details
 */
export function usePrefetchAnimal() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: animalKeys.detail(id),
      queryFn: () => getAnimal(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Get animal from cache if available
 */
export function useAnimalFromCache(id: number): AnimalWithDetails | undefined {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(animalKeys.detail(id)) as any;
  return data?.data;
}

/**
 * Optimistically update animal in cache
 */
export function useOptimisticAnimalUpdate() {
  const queryClient = useQueryClient();

  return (id: number, updater: (old: AnimalWithDetails) => AnimalWithDetails) => {
    queryClient.setQueryData(
      animalKeys.detail(id),
      (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: updater(old.data),
        };
      }
    );
  };
}