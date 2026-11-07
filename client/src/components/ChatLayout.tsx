import { Link } from '@tanstack/react-router';
import { PanelLeft, SquarePen } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import useMobile from '#/hooks/useMobile';
import { IconButton } from '@/components/IconButton';
import { ModelPicker } from '@/components/ModelPicker';
import { ModeToggle } from '@/components/mode-toggle';
import { Sidebar } from '@/components/Sidebar';

export function ChatLayout({ children }: { children: ReactNode }) {
  const { isMobile } = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 px-2">
          {!sidebarOpen && (
            <>
              <IconButton
                label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft />
              </IconButton>
              <IconButton label="New chat" asChild>
                <Link to="/">
                  <SquarePen />
                </Link>
              </IconButton>
            </>
          )}
          <ModelPicker />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
