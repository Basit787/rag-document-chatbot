import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { useUserStore } from '@/utils/user-store';

import { forgetPassword, login, logout, register } from './api';

export const useLogin = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      setUser({
        accessToken: data.access_token,
      });

      toast.success('Login successful.');
      router.replace('/documents');
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? error.message ?? 'Login failed.');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,

    onSuccess: (data) => {
      toast.success(data.message ?? 'Registration successful.');
      router.replace('/(auth)/sign-in');
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? error.message ?? 'Registration failed.');
    },
  });
};

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgetPassword,

    onSuccess: (data) => {
      toast.success(data.message ?? 'Password reset link sent.');
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? error.message ?? 'Something went wrong.');
    },
  });
};

export const useLogout = () => {
  const clearUser = useUserStore((state) => state.clearUser);

  return useMutation({
    mutationFn: logout,

    onSuccess: (data) => {
      clearUser();

      toast.success(data.message ?? 'Logged out.');

      router.replace('/(auth)/sign-in');
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? error.message ?? 'Logout failed.');
    },
  });
};
