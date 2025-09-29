
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Heart, 
  Bell, 
  LineChart, 
  Settings, 
  Shield,
  User,
  History,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItemProps = {
  icon: React.ElementType;
  title: string;
  path: string;
  active?: boolean;
};

const NavItem = ({ icon: Icon, title, path, active }: NavItemProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Link to={path} className="w-full">
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
          active 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-secondary/50'
        )}
      >
        <Icon size={isMobile ? 24 : 20} />
        <span className="text-base font-medium truncate">{title}</span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, title: 'Dashboard', path: '/' },
    { icon: Activity, title: 'Health Metrics', path: '/metrics' },
    { icon: Heart, title: 'Vitals', path: '/vitals' },
    { icon: LineChart, title: 'Trends', path: '/trends' },
    { icon: Brain, title: 'Advanced Health', path: '/advanced-health' },
    { icon: Bell, title: 'Alerts', path: '/alerts' },
    { icon: Shield, title: 'Blockchain', path: '/blockchain' },
    { icon: History, title: 'Activities', path: '/activities' },
    { icon: User, title: 'Profile', path: '/profile' },
    { icon: Settings, title: 'Settings', path: '/settings' }
  ];

  return (
    <div className="h-full w-full bg-sidebar p-4 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
          <Shield size={20} className="text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold">Biologic Chain</h1>
      </div>

      <nav className="space-y-2 overflow-y-auto flex-1 pr-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.path} 
            {...item} 
            active={location.pathname === item.path} 
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
