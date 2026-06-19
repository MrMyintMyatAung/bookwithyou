import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";

export function SignOutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    }
    navigate("/", { replace: true });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      loading={loading}
    >
      {loading ? "Signing out…" : "Sign Out"}
    </Button>
  );
}
