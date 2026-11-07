import {
  createRootRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';
import { ChatLayout } from '@/components/ChatLayout';
import { hasToken } from '@/lib/token';
import { AppProvider } from '@/provider/AppProvider';

import '../styles.css';

const isAuthPath = (pathname: string) => pathname.startsWith('/auth');

// Everything outside /auth needs a signed-in user.
export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    if (!isAuthPath(location.pathname) && !hasToken()) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  const authPage = useLocation({ select: (l) => isAuthPath(l.pathname) });

  return (
    <AppProvider>
      {authPage ? (
        <Outlet />
      ) : (
        <ChatLayout>
          <Outlet />
        </ChatLayout>
      )}
    </AppProvider>
  );
}
