import { Toaster } from "@/components/ui/toaster"; 
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ActivityTracker from "@/components/activity/ActivityTracker";
import AIAssistant from "@/components/ai-assistant/AIAssistant";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import HealthMetrics from "./pages/HealthMetrics";
import Vitals from "./pages/Vitals";
import Trends from "./pages/Trends";
import Alerts from "./pages/Alerts";
import Blockchain from "./pages/Blockchain";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import UserActivities from "./pages/UserActivities";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const AIAssistantWrapper = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AIAssistant /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ActivityTracker />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/metrics" element={<HealthMetrics />} />
                <Route path="/vitals" element={<Vitals />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/blockchain" element={<Blockchain />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/activities" element={<UserActivities />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* AI Assistant only if logged in */}
            <AIAssistantWrapper />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
