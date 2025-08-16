/**
 * Pulse Web — App.tsx
 * Version: v0.3.1
 * Purpose: App shell + routes (HashRouter assumed). Adds RequireAdmin for admin routes and WelcomeUser in header.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Discover from "@/pages/Discover";
import Map from "@/pages/Map";
import Calendar from "@/pages/Calendar";
import Book from "@/pages/Book";
import Chat from "@/pages/Chat";
import Me from "@/pages/Me";
import Login from "@/pages/Login";
import StyleGuide from "@/pages/StyleGuide";
import UiGlass from "@/pages/UiGlass";
import UiGlassTop from "@/pages/UiGlassTop";
import UiGlassBottom from "@/pages/UiGlassBottom";
import Friends from "@/pages/Friends";
import Settings from "@/pages/Settings";
import Wallet from "@/pages/Wallet";
import Favorites from "@/pages/Favorites";
import GroupDetail from "@/pages/GroupDetail";
import AdminFacilities from "@/pages/AdminFacilities";

// Guards & UI
import Protected from "@/components/Protected"; // your existing guard
import GlassDockBottom from "@/components/GlassDockBottom";
import { TopBarRight } from "@/components/TopBarRight";
import RequireAdmin from "@/components/RequireAdmin";   // NEW
import WelcomeUser from "@/components/WelcomeUser";     // NEW

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header (clean) */}
      <header className="sticky top-0 z-20 w-full border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2">
          <div className="flex items-center">
            <div className="text-sm font-semibold">Pulse</div>
            {/* Welcome, username (only when authed) */}
            <WelcomeUser />
          </div>
          <TopBarRight />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-3 py-3 pb-24">
        <Routes>
          {/* Primary routes */}
          <Route path="/" element={<Navigate to="/discover" replace />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/map" element={<Map />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/book" element={<Protected><Book /></Protected>} />
          <Route path="/chat" element={<Protected><Chat /></Protected>} />
          <Route path="/me" element={<Protected><Me /></Protected>} />
          <Route
            path="/admin/facilities"
            element={
              <RequireAdmin>
                <AdminFacilities />
              </RequireAdmin>
            }
          />

          {/* Secondary / misc pages (keep as you already use them) */}
          <Route path="/style" element={<StyleGuide />} />
          <Route path="/ui/glass" element={<UiGlass />} />
          <Route path="/ui/glass/top" element={<UiGlassTop />} />
          <Route path="/ui/glass/bottom" element={<UiGlassBottom />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Catch-all LAST: send unknown routes to Discover */}
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </main>

      {/* Bottom glass dock (mobile) */}
      <GlassDockBottom />
    </div>
  );
}
