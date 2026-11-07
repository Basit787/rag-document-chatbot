import { Redirect } from 'expo-router';
import { useUserStore } from '@/utils/user-store';

export default function HomeIndex() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/documents" />;
}
