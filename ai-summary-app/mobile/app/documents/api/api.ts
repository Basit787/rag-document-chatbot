import { apiClient } from '@/lib/axios';

export interface UploadResponse {
  id: string;
  message: string;
}

export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Document {
  id: string;
  filename: string;
  s3_key: string;
  s3_url: string;
  status: DocumentStatus;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<UploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  try {
    const { data } = await apiClient.get<Document[]>('/documents');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.delete<{ message: string }>(`/documents/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDocument = async (id: string): Promise<Document> => {
      try {
        const { data } = await apiClient.get<Document>(`/documents/${id}`);
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
};

