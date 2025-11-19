import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ModeToggle } from '@/components/mode-toggle';
import { UserAvatar } from '@/components/UserAvatar';
import { format } from 'date-fns';

const MainLayout = ({ children }) => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <header className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Daily Task Automator
          </h1>
          {location.pathname !== '/' && (
            <nav className="flex gap-4 text-sm">
              <Link 
                to="/tasks" 
                className={`hover:text-indigo-500 transition-colors ${location.pathname === '/tasks' ? 'text-indigo-500 font-medium' : 'text-muted-foreground'}`}
              >
                Tasks
              </Link>
              <Link 
                to="/settings" 
                className={`hover:text-indigo-500 transition-colors ${location.pathname === '/settings' ? 'text-indigo-500 font-medium' : 'text-muted-foreground'}`}
              >
                Settings
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-mono text-muted-foreground hidden md:block">
            {format(time, "do MMM ''yy / hh:mm a")}
          </div>
          <ModeToggle />
          <UserAvatar />
        </div>
      </header>
      <main className="flex-1 p-6 w-full">
        {children}
      </main>
      <footer className="p-4 border-t border-border text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Daily Task Automator
      </footer>
      <Toaster />
    </div>
  );
};

export default MainLayout;
