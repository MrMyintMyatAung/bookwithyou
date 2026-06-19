import { ProtectedRoute } from "../../components/auth/protected-route";
import { CreateSessionForm } from "../../components/sessions/create-session-form";

export function CreateSessionPage() {
  return (
    <ProtectedRoute>
      <CreateSessionForm />
    </ProtectedRoute>
  );
}
