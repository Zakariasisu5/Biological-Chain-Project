
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Close sidebar when switching to desktop
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Force body to be fixed height on mobile to prevent scrolling issues when sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {isMobile ? (
        <>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[85%] max-w-[300px] border-r">
              <Sidebar />
            </SheetContent>
          
            <div className="flex flex-col flex-1 w-full h-screen overflow-hidden">
              <Header>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </Header>
              <main className="flex-1 overflow-auto p-3 md:p-6">
                <div className="container mx-auto max-w-5xl px-2 sm:px-4">
                  {children}
                </div>
              </main>
            </div>
          </Sheet>
        </>
      ) : (
        <>
          <aside className="h-screen w-64 shrink-0 border-r border-border">
            <Sidebar />
          </aside>
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              <div className="container mx-auto max-w-5xl px-2 sm:px-4 lg:px-0">
                {children}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
