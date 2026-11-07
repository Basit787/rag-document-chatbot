import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ModeToggle } from '@/components/mode-toggle';
import { hasToken } from '@/lib/token';

// Guest-only pages: signed-in users go to the chat, bare /auth goes to login.
export const Route = createFileRoute('/auth')({
  beforeLoad: ({ location }) => {
    if (hasToken()) throw redirect({ to: '/' });
    if (location.pathname.replace(/\/$/, '') === '/auth') {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
      <div className="absolute top-2 right-2">
        <ModeToggle />
      </div>
      <Outlet />
    </main>
  );
}
