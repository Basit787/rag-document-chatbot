import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/AuthForm';

export const Route = createFileRoute('/auth/register/')({
  component: Register,
});

function Register() {
  return <AuthForm mode="register" />;
}
