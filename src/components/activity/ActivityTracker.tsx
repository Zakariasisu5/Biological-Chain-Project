
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityTracker } from '@/utils/activityTracker';
import { useAuth } from '@/contexts/AuthContext';

const ActivityTracker = () => {
  const location = useLocation();
  const { trackActivity } = useActivityTracker();
  const { currentUser, isAuthenticated } = useAuth();
  
  // Track page views
  useEffect(() => {
    if (currentUser?.id) {
      // Map path to a readable page name
      const pathToPageName: Record<string, string> = {
        '/': 'Dashboard',
        '/metrics': 'Health Metrics',
        '/vitals': 'Vitals',
        '/trends': 'Trends',
        '/alerts': 'Alerts',
        '/blockchain': 'Blockchain',
        '/profile': 'User Profile',
        '/settings': 'Settings',
        '/activities': 'Activity History'
      };
      
      const pageName = pathToPageName[location.pathname] || location.pathname;
      
      trackActivity('view_page', location.pathname, { pageName });
    }
  }, [location.pathname, currentUser, trackActivity]);
  
  // Track authentication events
  useEffect(() => {
    // When user logs in, track the login event
    if (currentUser?.id && isAuthenticated) {
      trackActivity('login', 'auth', { method: 'email' });
    }
  }, [isAuthenticated, currentUser, trackActivity]);
  
  return null; // This is a utility component with no UI
};

export default ActivityTracker;
