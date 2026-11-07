import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner-native';
import { deleteDocument, getDocument, getDocuments, uploadDocument } from './api';
import { queryClient } from '@/lib/query-client';

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: (data) => {
      toast.success(data.message ?? 'Document uploaded successfully.');
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? error.message ?? 'Failed to upload document.');
    },
  });
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });
};

export const useDeleteDocument = () => {
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: (data) => {
      toast.success(data.message ?? 'Document deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? error.message ?? 'Failed to delete document.');
    },
  });
};

export const useDocument = (id: string) =>
  useQuery({
    queryKey: ['documents', id],
    queryFn: () => getDocument(id),
    enabled: !!id,
  });
