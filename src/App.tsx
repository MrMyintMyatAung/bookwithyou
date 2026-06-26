import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { RootLayout } from "./components/layout/root-layout";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { ResetPasswordPage } from "./pages/auth/reset-password";
import { SessionListPage } from "./pages/sessions/index";
import { CreateSessionPage } from "./pages/sessions/new";
import { SessionDetailPage } from "./pages/sessions/detail";
import { OwnProfilePage } from "./pages/profile/me";
import { MemberProfilePage } from "./pages/profile/view";
import { EmailConfirmedPage } from "./pages/auth/confirmed";
import { NotFoundPage } from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="sessions" element={<SessionListPage />} />
              <Route path="sessions/new" element={<CreateSessionPage />} />
              <Route path="sessions/:id" element={<SessionDetailPage />} />
              <Route path="confirmed" element={<EmailConfirmedPage />} />
              <Route path="profile" element={<OwnProfilePage />} />
              <Route
                path="profile/:username"
                element={<MemberProfilePage />}
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
