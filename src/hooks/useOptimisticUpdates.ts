import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface OptimisticUpdateOptions<T> {
  queryKey: string[];
  updateFn: (data: T) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: any, rollbackData: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    async <TData = T>(
      newData: TData,
      options: OptimisticUpdateOptions<TData>
    ) => {
      const {
        queryKey,
        updateFn,
        onSuccess,
        onError,
        successMessage,
        errorMessage,
      } = options;

      setIsUpdating(true);

      // Get current data for rollback
      const previousData = queryClient.getQueryData<TData[]>(queryKey) || [];
      
      // Apply optimistic update
      queryClient.setQueryData<TData[]>(queryKey, (old = []) => {
        // If updating existing item, replace it; otherwise add new item
        const existingIndex = old.findIndex((item: any) => 
          item.id === (newData as any).id
        );
        
        if (existingIndex >= 0) {
          const updated = [...old];
          updated[existingIndex] = newData;
          return updated;
        } else {
          return [...old, newData];
        }
      });

      try {
        // Perform actual update
        const result = await updateFn(newData);
        
        // Update with real data from server
        queryClient.setQueryData<TData[]>(queryKey, (old = []) => {
          const existingIndex = old.findIndex((item: any) => 
            item.id === (result as any).id
          );
          
          if (existingIndex >= 0) {
            const updated = [...old];
            updated[existingIndex] = result;
            return updated;
          }
          return old;
        });

        onSuccess?.(result);
        
        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }

        return result;
      } catch (error) {
        // Rollback optimistic update
        queryClient.setQueryData<TData[]>(queryKey, previousData);
        
        onError?.(error, newData);
        
        const message = errorMessage || 
          `Failed to update. ${error instanceof Error ? error.message : 'Please try again.'}`;
        
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [queryClient]
  );

  const optimisticDelete = useCallback(
    async <TData = T>(
      itemId: string,
      options: Omit<OptimisticUpdateOptions<TData>, 'updateFn'> & {
        deleteFn: (id: string) => Promise<void>;
      }
    ) => {
      const { queryKey, deleteFn, onSuccess, onError, successMessage, errorMessage } = options;

      setIsUpdating(true);

      // Get current data for rollback
      const previousData = queryClient.getQueryData<TData[]>(queryKey) || [];
      
      // Find item to delete
      const itemToDelete = previousData.find((item: any) => item.id === itemId);
      
      if (!itemToDelete) {
        setIsUpdating(false);
        return;
      }

      // Apply optimistic delete
      queryClient.setQueryData<TData[]>(queryKey, (old = []) =>
        old.filter((item: any) => item.id !== itemId)
      );

      try {
        await deleteFn(itemId);
        
        onSuccess?.(itemToDelete);
        
        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
      } catch (error) {
        // Rollback optimistic delete
        queryClient.setQueryData<TData[]>(queryKey, previousData);
        
        onError?.(error, itemToDelete);
        
        const message = errorMessage || 
          `Failed to delete. ${error instanceof Error ? error.message : 'Please try again.'}`;
        
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });

        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [queryClient]
  );

  return {
    optimisticUpdate,
    optimisticDelete,
    isUpdating,
  };
}

// Specialized hook for appointments
export function useOptimisticAppointments() {
  const { optimisticUpdate, optimisticDelete, isUpdating } = useOptimisticUpdate();

  const updateAppointment = useCallback(
    (appointment: any, updateFn: (data: any) => Promise<any>) =>
      optimisticUpdate(appointment, {
        queryKey: ['appointments'],
        updateFn,
        successMessage: 'Appointment updated successfully',
        errorMessage: 'Failed to update appointment',
      }),
    [optimisticUpdate]
  );

  const deleteAppointment = useCallback(
    (appointmentId: string, deleteFn: (id: string) => Promise<void>) =>
      optimisticDelete(appointmentId, {
        queryKey: ['appointments'],
        deleteFn,
        successMessage: 'Appointment deleted successfully',
        errorMessage: 'Failed to delete appointment',
      }),
    [optimisticDelete]
  );

  return {
    updateAppointment,
    deleteAppointment,
    isUpdating,
  };
}