/**
 * Pulse — components/GlassDockBottom.tsx
 * Version: v0.1.9
 * Author: Team Pulse
 * Summary: Glassy bottom dock; Me menu items depend on auth. Auth via AuthProvider only.
 * Last-Changed: 2025-08-13
 */

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { logout as apiLogout } from "@/lib/api";

export default function GlassDockBottom() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const authed = !!user;

  // Map/Calendar toggle follows current route
  const [mapIsCalendar, setMapIsCalendar] = useState(false);
  useEffect(() => {
    setMapIsCalendar(loc.pathname.startsWith("/calendar"));
  }, [loc.pathname]);

  // Hover labels on desktop are always shown; mobile uses stacked layout
  const showLabelsDesktop = true;

  // Swipe-up to open Me menu (mobile)
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    setTouchStartY(e.touches[0]?.clientY ?? null);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartY == null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY;
    const deltaY = endY - touchStartY; // negative = upward
    if (deltaY < -30) setMenuOpen(true);
    setTouchStartY(null);
  }

  // close Me menu on any route change
  useEffect(() => {
    setMenuOpen(false);
  }, [loc.pathname]);

  // bounce helper
  function useBounce() {
    const [b, setB] = useState(false);
    const trigger = () => {
      setB(true);
      setTimeout(() => setB(false), 120);
    };
    return { b, trigger };
  }
  const mapBtn = useBounce();
  const meBtn = useBounce();

  function onToggleMap() {
    mapBtn.trigger();
    const goTo = mapIsCalendar ? "/map" : "/calendar";
    setMapIsCalendar(!mapIsCalendar);
    navigate(goTo);
  }

  function onLogout() {
    apiLogout(); // clear JWT
    logout();    // clear context state
    setMenuOpen(false);
    navigate("/login");
  }

  // active states — only Me is active while menu is open
  const activeDiscover = loc.pathname.startsWith("/discover") && !menuOpen;
  const activeMapCal =
    (loc.pathname.startsWith("/map") || loc.pathname.startsWith("/calendar")) && !menuOpen;
  const activeBook = loc.pathname.startsWith("/book") && !menuOpen;
  const activeChat = loc.pathname.startsWith("/chat") && !menuOpen;
  const activeMe =
    menuOpen ||
    loc.pathname.startsWith("/me") ||
    loc.pathname.startsWith("/wallet") ||
    loc.pathname.startsWith("/favorites") ||
    loc.pathname.startsWith("/settings") ||
    loc.pathname.startsWith("/friends");

  const mapIcon = mapIsCalendar ? "📅" : "🗺️";
  const mapLabel = mapIsCalendar ? "Calendar" : "Map";

  return (
    <>
      {/* backdrop to close Me menu */}
      {menuOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/0"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="fixed bottom-3 left-1/2 z-50 w-[min(96%,56rem)] -translate-x-1/2 px-3">
        <nav
          className="grid grid-cols-5 items-center gap-2 rounded-2xl border border-gray-200/70 bg-white/70 p-1.5 sm:p-2 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.14)]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Discover (public) */}
          <DockLink
            to="/discover"
            icon="🏠"
            label="Discover"
            active={activeDiscover}
            showLabelDesktop={showLabelsDesktop}
            onNavigate={() => setMenuOpen(false)}
          />

          {/* Map/Calendar toggle (public) */}
          <button
            onClick={onToggleMap}
            aria-current={activeMapCal ? "page" : undefined}
            title={mapLabel}
            className={[
              "flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-sm transition-colors",
              activeMapCal ? "bg-white font-medium shadow-[0_6px_20px_rgba(0,0,0,0.12)]" : "hover:bg-white/85",
            ].join(" ")}
            style={{
              transform: mapBtn.b ? "scale(1.12) translateY(-1px)" : undefined,
              transition: "transform 120ms ease",
            }}
          >
            <span className="text-base">{mapIcon}</span>
            {/* mobile label (below icon) */}
            <span className="block text-[11px] leading-tight sm:hidden mt-0.5">{mapLabel}</span>
            {/* desktop label (inline, always visible) */}
            {showLabelsDesktop && <span className="hidden sm:inline">{mapLabel}</span>}
          </button>

          {/* Book (public) */}
          <DockLink
            to="/book"
            icon="🏟️"
            label="Book"
            active={activeBook}
            showLabelDesktop={showLabelsDesktop}
            onNavigate={() => setMenuOpen(false)}
          />

          {/* Chat (public) */}
          <DockLink
            to="/chat"
            icon="💬"
            label="Chat"
            active={activeChat}
            showLabelDesktop={showLabelsDesktop}
            onNavigate={() => setMenuOpen(false)}
          />

          {/* Me (menu; items depend on auth) */}
          <div className="relative">
            <button
              onClick={() => {
                meBtn.trigger();
                setMenuOpen((v) => !v);
              }}
              aria-current={activeMe ? "page" : undefined}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="Me"
              className={[
                "flex flex-col sm:flex-row w-full items-center justify-center gap-0.5 sm:gap-2 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-sm transition-colors",
                activeMe ? "bg-white font-medium shadow-[0_6px_20px_rgba(0,0,0,0.12)]" : "hover:bg-white/85",
              ].join(" ")}
              style={{
                transform: meBtn.b ? "scale(1.12) translateY(-1px)" : undefined,
                transition: "transform 120ms ease",
              }}
            >
              <span className="text-base">👤</span>
              {/* mobile label (below icon) */}
              <span className="block text-[11px] leading-tight sm:hidden mt-0.5">Me</span>
              {/* desktop label (inline, always visible) */}
              {showLabelsDesktop && <span className="hidden sm:inline">Me</span>}
            </button>

            {/* Glass menu */}
            {menuOpen && (
              <div className="absolute bottom-[3.25rem] right-0 z-50 w-56 rounded-2xl border border-gray-200/70 bg-white/90 p-2 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
                {authed ? (
                  <>
                    <MenuLink to="/me" label="Profile" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/friends" label="My friends" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/wallet" label="Wallet" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/favorites" label="Favorites" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/settings" label="Settings" onClick={() => setMenuOpen(false)} />
                    <hr className="my-1 border-gray-200/70" />
                    <button onClick={onLogout} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-600">You’re signed out.</div>
                    <MenuLink to="/login" label="Login" onClick={() => setMenuOpen(false)} />
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

/** DockLink — mobile: label below icon; desktop: inline label */
function DockLink({
  to,
  icon,
  label,
  active,
  showLabelDesktop,
  onNavigate,
}: {
  to: string;
  icon: string;
  label: string;
  active: boolean;
  showLabelDesktop: boolean;
  onNavigate?: () => void;
}) {
  const [b, setB] = useState(false);
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      title={label}
      onClick={() => {
        setB(true);
        setTimeout(() => setB(false), 120);
        onNavigate?.();
      }}
      className={[
        "flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-sm transition-colors",
        active ? "bg-white font-medium shadow-[0_6px_20px_rgba(0,0,0,0.12)]" : "hover:bg-white/85",
      ].join(" ")}
      style={{
        transform: b ? "scale(1.12) translateY(-1px)" : undefined,
        transition: "transform 120ms ease",
      }}
    >
      <span className="text-base">{icon}</span>
      {/* mobile label (below icon) */}
      <span className="block text-[11px] leading-tight sm:hidden mt-0.5">{label}</span>
      {/* desktop label (inline) */}
      {showLabelDesktop && <span className="hidden sm:inline">{label}</span>}
    </Link>
  );
}

function MenuLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-xl px-3 py-2 text-sm hover:bg-white">
      {label}
    </Link>
  );
}
