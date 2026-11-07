import { apiClient } from '@/lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterRequest {
  name: string;
  age: number;
  email: string;
  password: string;
  confirm_password: string;
}

export interface MessageResponse {
  message: string;
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post<LoginResponse>('/auth/signin', payload);

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const register = async (payload: RegisterRequest): Promise<MessageResponse> => {
  try {
    const { data } = await apiClient.post<MessageResponse>('/auth/signup', payload);

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const forgetPassword = async (email: string): Promise<MessageResponse> => {
  try {
    const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password', { email });

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logout = async (): Promise<MessageResponse> => {
  try {
    const { data } = await apiClient.post<MessageResponse>('/auth/logout');

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
