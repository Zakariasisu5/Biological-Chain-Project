
import { getFirestoreClient } from '@/integrations/firebase/client';
import { useAuth } from "@/contexts/AuthContext";
import { WalletType } from "./walletUtils";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

    // Insert activity record into Firestore
    try {
      const db = getFirestoreClient();
      if (!db) {
        console.error('Firestore not initialized, cannot log activity');
        return;
      }
      const col = collection(db, 'user_activities');
      await addDoc(col, {
        user_id: userId,
        activity_type: activityType,
        page: page || window.location.pathname,
        details: details || {},
        device_info: deviceInfo,
        created_at: serverTimestamp(),
      });
    } catch (e) {
      console.error('Error logging user activity to Firestore:', e);
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
    // Prefer canonical Firebase user ID when available, otherwise fall back to wallet address
    const uid = currentUser?.id || currentUser?.walletAddress || '';
    if (!uid) {
      // Skip tracking if we can't identify the user at all
      // keep this log at debug level to avoid noise in production
      console.debug('Skipping activity tracking: no user identifier available');
      return;
    }

    // If the id looks like an Ethereum address, skip strict UUID validation
    const isEth = /^0x[a-fA-F0-9]{40}$/.test(uid);
    if (!isEth && !isValidUUID(uid)) {
      console.debug('Skipping activity tracking: invalid user identifier format');
      return;
    }

    // Use debounced version for page views to prevent excessive logging
    if (activityType === 'view_page') {
      debouncedLogPageView(uid, activityType, page, details);
    } else {
      // For other types, log immediately
      logUserActivity(uid, activityType, page, details);
    }
  };
  
  return { trackActivity };
};
