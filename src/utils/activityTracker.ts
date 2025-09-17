
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WalletType } from "./walletUtils";

export type ActivityType = 
  | 'login' 
  | 'logout'
  | 'view_page'
  | 'update_profile'
  | 'view_metrics'
  | 'view_vitals'
  | 'view_alerts'
  | 'update_settings'
  | 'view_blockchain'
  | 'registration'
  | 'upload_file'
  | 'download_file'
  | 'export_medical_history'
  | 'connect_wallet'
  | 'disconnect_wallet'; 

interface ActivityDetails {
  [key: string]: any;
}

// Helper function to check if a string is a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Accept either a canonical UUID or an Ethereum address (0x prefixed 40 hex chars)
function isValidUserId(id: string): boolean {
  if (!id) return false;
  const isUUID = isValidUUID(id);
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  const isEth = ethRegex.test(id);
  return isUUID || isEth;
}

// Define the logUserActivity function first
export const logUserActivity = async (
  userId: string,
  activityType: ActivityType,
  page?: string,
  details?: ActivityDetails
) => {
  try {
    // Validate userId format to avoid SQL errors
    if (!userId || !isValidUserId(userId)) {
      console.error('Invalid user ID format for activity logging');
      return; // Skip logging if invalid ID
    }

    // Get browser and device info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };

    // Insert activity record into Supabase
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        page: page || window.location.pathname,
        details: details || {},
        device_info: deviceInfo,
        ip_address: null // IP is captured server-side by Supabase
      } as any);

    if (error) {
      console.error('Error logging user activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Debounce function to limit frequent activity logging
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

// Now create the debounced version after the function is defined
const debouncedLogPageView = debounce(logUserActivity, 1000);

// React hook to use the activity tracker
export const useActivityTracker = () => {
  const { currentUser } = useAuth();
  
  const trackActivity = (
    activityType: ActivityType,
    page?: string,
    details?: ActivityDetails
  ) => {
    if (currentUser?.id && isValidUUID(currentUser.id)) {
      // Use debounced version for page views to prevent excessive logging
      if (activityType === 'view_page') {
        debouncedLogPageView(currentUser.id, activityType, page, details);
      } else {
        // For other types, log immediately
        logUserActivity(currentUser.id, activityType, page, details);
      }
    } else {
      // Skip tracking if user ID is invalid
      console.log('Skipping activity tracking: Invalid user ID');
    }
  };
  
  return { trackActivity };
};
