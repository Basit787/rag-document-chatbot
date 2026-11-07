import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearToken, getToken } from '@/lib/token';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: '/api', timeout: 30_000 });
    this.axiosInstance.interceptors.request.use(this.onRequest);
    this.axiosInstance.interceptors.response.use(
      undefined,
      this.onResponseError,
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.get<T>(url, config)).data;
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.post<T>(url, body, config)).data;
  }

  async delete<T = void>(url: string, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.delete<T>(url, config)).data;
  }

  stream(url: string, body: unknown, signal?: AbortSignal) {
    return this.post<ReadableStream<BufferSource>>(url, body, {
      adapter: 'fetch',
      responseType: 'stream',
      timeout: 0,
      signal,
    });
  }

  private onRequest = (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  };

  private onResponseError = (error: AxiosError<{ message?: string }>) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    // A rejected token means the session is over; a failed login has no token and stays put.
    if (error.response?.status === 401 && error.config?.headers.Authorization) {
      clearToken();
      window.location.replace('/auth/login');
    }
    const message =
      error.response?.data?.message ??
      (error.response
        ? `Request failed (${error.response.status})`
        : 'Server is unreachable');
    return Promise.reject(new Error(message));
  };
}

export const apiClient = new ApiClient();
