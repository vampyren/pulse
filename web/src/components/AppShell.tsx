
/**
 * Pulse Web — components/AppShell.tsx
 * File version: 0.1.0
 * Purpose: App shell with header and bottom navigation (mobile-first).
 */
import { Link, NavLink, Outlet } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { APP_VERSION } from "@/lib/version";
import { useAuthStore } from "@/state/auth";
import { Home, Users, MessageSquare, User, Map } from "lucide-react";

export default function AppShell() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">{BRAND.APP_NAME}</Link>
          <div className="text-xs text-gray-500">web v{APP_VERSION}</div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 bg-white border-t">
        <div className="mx-auto max-w-5xl grid grid-cols-5 text-sm">
          <Tab to="/" label="Discover" icon={<Home size={20} />} />
          <Tab to="/map" label="Map" icon={<Map size={20} />} />
          <Tab to="/friends" label="Friends" icon={<Users size={20} />} />
          <Tab to="/chat" label="Chat" icon={<MessageSquare size={20} />} />
          <Tab to="/profile" label={user ? "Me" : "Login"} icon={<User size={20} />} />
        </div>
      </nav>
    </div>
  );
}

function Tab({ to, label, icon }: { to: string, label: string, icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 py-2 ${isActive ? "text-blue-600" : "text-gray-600"}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
