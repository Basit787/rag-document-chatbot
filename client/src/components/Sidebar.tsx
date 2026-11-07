import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { cn } from 'cn';
import { LogOut, PanelLeft, SquarePen, Trash2 } from 'lucide-react';
import useMobile from '#/hooks/useMobile';
import { useDeleteThread, useLogout, useMe, useThreads } from '@/api/hook';
import { IconButton } from '@/components/IconButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isMobile } = useMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-65 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Chats</SheetTitle>
          <SheetDescription className="sr-only">
            Start a new chat or open a previous one
          </SheetDescription>
          <SidebarContent onClose={onClose} onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <aside className="flex w-65 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <SidebarContent onClose={onClose} />
    </aside>
  );
}

function SidebarContent({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const { threadId } = useParams({ strict: false });
  const { data: me } = useMe();
  const { data: threads = [] } = useThreads();
  const { mutate: deleteChat } = useDeleteThread();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const onDelete = (id: string) =>
    deleteChat(id, {
      onSuccess: () => {
        if (id === threadId) navigate({ to: '/' });
      },
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-2">
        <IconButton label="Close sidebar" onClick={onClose}>
          <PanelLeft />
        </IconButton>
        <IconButton label="New chat" asChild>
          <Link to="/" onClick={onNavigate}>
            <SquarePen />
          </Link>
        </IconButton>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <Button
          variant="ghost"
          className="mb-4 w-full justify-start gap-2 hover:bg-sidebar-accent"
          asChild
        >
          <Link to="/" onClick={onNavigate}>
            <SquarePen />
            New chat
          </Link>
        </Button>

        {threads.length > 0 && (
          <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
            Chats
          </p>
        )}
        <ul className="space-y-0.5">
          {threads.map((t) => (
            <li key={t.id} className="group relative">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start pr-9 font-normal hover:bg-sidebar-accent',
                  t.id === threadId && 'bg-sidebar-accent',
                )}
                asChild
              >
                <Link
                  to="/c/$threadId"
                  params={{ threadId: t.id }}
                  onClick={onNavigate}
                >
                  <span className="truncate">{t.title}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete chat"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
                onClick={() => onDelete(t.id)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2 border-t border-sidebar-border py-2 pr-2 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm">{me?.email}</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <IconButton label="Sign out" disabled={loggingOut}>
              <LogOut />
            </IconButton>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => logout()}>
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
