import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/AuthForm';

export const Route = createFileRoute('/auth/login/')({ component: Login });

function Login() {
  return <AuthForm mode="login" />;
}
