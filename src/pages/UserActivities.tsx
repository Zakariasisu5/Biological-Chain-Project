
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFirestoreClient } from '@/integrations/firebase/client';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityType } from '@/utils/activityTracker';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  page: string;
  details: any;
  device_info: any;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const UserActivities = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Query to fetch user activities
  const {
    data: activities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userActivities', currentUser?.id, filter, searchTerm],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const db = getFirestoreClient();
      if (!db) return [];
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');

      // Build base query
      let q = query(
        collection(db, 'user_activities'),
        where('user_id', '==', currentUser.id),
        orderBy('created_at', 'desc')
      );

      const snap = await getDocs(q);
      let items: UserActivity[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      // Apply client-side filter/search for simplicity
      if (filter !== 'all') {
        items = items.filter(i => i.activity_type === filter);
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        items = items.filter(i => (i.page || '').toLowerCase().includes(term) || (i.activity_type || '').toLowerCase().includes(term));
      }

      return items as UserActivity[];
    },
    enabled: !!currentUser?.id,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error Fetching Activities',
        description: 'Failed to load your activities. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Pagination logic
  const totalPages = activities ? Math.ceil(activities.length / ITEMS_PER_PAGE) : 0;
  const paginatedActivities = activities 
    ? activities.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  // Generate pagination links
  const paginationLinks = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    paginationLinks.push(
      <PaginationItem key={i}>
        <PaginationLink 
          isActive={currentPage === i} 
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  // Activity type badge color mapping
  const activityBadgeColor = (type: ActivityType) => {
    const colors: Record<string, string> = {
      login: 'bg-green-500',
      logout: 'bg-orange-500',
      view_page: 'bg-blue-500',
      update_profile: 'bg-purple-500',
      view_metrics: 'bg-teal-500',
      view_vitals: 'bg-indigo-500',
      view_alerts: 'bg-red-500',
      view_blockchain: 'bg-amber-500',
      update_settings: 'bg-fuchsia-500',
      registration: 'bg-cyan-500',
      upload_file: 'bg-rose-500',
      download_file: 'bg-emerald-500',
      export_medical_history: 'bg-violet-500',
      connect_wallet: 'bg-yellow-500',
      disconnect_wallet: 'bg-gray-500'
    };
    
    return colors[type] || 'bg-gray-500';
  };
  
  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };
  
  // Get relative time
  const getRelativeTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="view_page">Page Views</SelectItem>
                <SelectItem value="update_profile">Profile Updates</SelectItem>
                <SelectItem value="update_settings">Settings</SelectItem>
                <SelectItem value="view_metrics">Health Metrics</SelectItem>
                <SelectItem value="view_vitals">Vitals</SelectItem>
                <SelectItem value="view_alerts">Alerts</SelectItem>
                <SelectItem value="view_blockchain">Blockchain</SelectItem>
                <SelectItem value="upload_file">File Uploads</SelectItem>
                <SelectItem value="download_file">File Downloads</SelectItem>
                <SelectItem value="connect_wallet">Wallet Connections</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your Activities
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-full bg-muted p-1 cursor-help">
                      <Info size={16} className="text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">This page shows your activity history across the platform.
                    Your activities are automatically tracked as you use the application.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : paginatedActivities && paginatedActivities.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead className="hidden sm:table-cell">Details</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="hidden md:table-cell">Device</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedActivities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <Badge className={activityBadgeColor(activity.activity_type)} variant="secondary">
                              {activity.activity_type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{activity.page}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help max-w-[200px] truncate inline-block">
                                    {activity.details?.pageName || 
                                     JSON.stringify(activity.details) !== '{}' 
                                       ? JSON.stringify(activity.details).substring(0, 50) + (JSON.stringify(activity.details).length > 50 ? '...' : '')
                                       : '-'}
                                  </span>
                                </TooltipTrigger>
                                {JSON.stringify(activity.details) !== '{}' && (
                                  <TooltipContent>
                                    <pre className="text-xs max-w-sm overflow-auto">
                                      {JSON.stringify(activity.details, null, 2)}
                                    </pre>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">
                                    {getRelativeTime(activity.created_at)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {formatTimestamp(activity.created_at)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {activity.device_info?.platform || 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {paginationLinks}
                        
                        {totalPages > 5 && currentPage < totalPages && (
                          <>
                            <PaginationItem>
                              <PaginationLink>...</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                onClick={() => setCurrentPage(totalPages)}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            aria-disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No activities found matching your filters.</p>
                <p className="text-sm">Your activity will be tracked automatically as you use the application.</p>
                {(filter !== 'all' || searchTerm) && (
                  <button 
                    onClick={() => {
                      setFilter('all');
                      setSearchTerm('');
                    }}
                    className="mt-4 text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserActivities;
