
/**
 * Pulse Web — pages/Profile.tsx
 * File version: 0.1.0
 * Purpose: Basic profile page stub.
 */
import { useAuthStore } from "@/state/auth";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuthStore();
  if (!user) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="font-semibold mb-2">You’re not logged in</div>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-body">
          <div className="text-lg font-semibold">{user.name || user.username}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn border" onClick={()=>logout()}>Logout</button>
      </div>
    </div>
  );
}
