import { toast } from 'sonner';

export const showSuccessToast = (message: string) => toast.success(message);

export const showErrorToast = (message: string) => toast.error(message);

export function useToast() {
  return { showSuccessToast, showErrorToast };
}
