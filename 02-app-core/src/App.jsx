import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ParticipantAuthProvider } from '@/lib/participantAuth';
import Logo from '@/components/Logo';
import ParticipantGate from '@/components/participant/ParticipantGate';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Participant pages
import TodayScreen from '@/pages/participant/TodayScreen';
import BonusScreen from '@/pages/participant/BonusScreen';
import ProgressScreen from '@/pages/participant/ProgressScreen';
import LeaderboardScreen from '@/pages/participant/LeaderboardScreen';
import LearnScreen from '@/pages/participant/LearnScreen';
import ResourcesScreen from '@/pages/participant/ResourcesScreen';
import ProfileScreen from '@/pages/participant/ProfileScreen';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminParticipants from '@/pages/admin/AdminParticipants';
import AdminMitzvahs from '@/pages/admin/AdminMitzvahs';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminClosures from '@/pages/admin/AdminClosures';
import AdminTorah from '@/pages/admin/AdminTorah';
import AdminResources from '@/pages/admin/AdminResources';
import AdminBadges from '@/pages/admin/AdminBadges';
import AdminLogs from '@/pages/admin/AdminLogs';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const participantPage = (page) => <ParticipantGate>{page}</ParticipantGate>;

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <Logo className="h-16 w-auto mx-auto mb-6" />
          <div className="w-8 h-8 mx-auto border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <ParticipantAuthProvider>
      <Routes>
        {/* Public participant routes */}
        <Route path="/" element={participantPage(<TodayScreen />)} />
        <Route path="/today" element={participantPage(<TodayScreen />)} />
        <Route path="/bonus" element={participantPage(<BonusScreen />)} />
        <Route path="/progress" element={participantPage(<ProgressScreen />)} />
        <Route path="/leaderboard" element={participantPage(<LeaderboardScreen />)} />
        <Route path="/learn" element={participantPage(<LearnScreen />)} />
        <Route path="/resources" element={participantPage(<ResourcesScreen />)} />
        <Route path="/profile" element={participantPage(<ProfileScreen />)} />

        {/* Auth routes for admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes - protected by Base44 auth */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/participants" element={<AdminParticipants />} />
          <Route path="/admin/mitzvahs" element={<AdminMitzvahs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/closures" element={<AdminClosures />} />
          <Route path="/admin/torah" element={<AdminTorah />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/badges" element={<AdminBadges />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ParticipantAuthProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
