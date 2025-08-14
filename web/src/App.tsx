/**
 * Pulse Web — App.tsx
 * Version: v0.1.7
 * Purpose: App shell + routes. Uses global glass bottom dock; Friends under Me.
 * Changes (v0.1.7):
 *  - Added /groups/:id route to GroupDetail page.
 *  - Header uses TopBarRight (theme + language) for consistency.
 */

import React from "react";
import Protected from "@/components/Protected";
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

// Global glass dock + top-right controls
import GlassDockBottom from "@/components/GlassDockBottom";
import { TopBarRight } from "@/components/TopBarRight";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header (clean) */}
      <header className="sticky top-0 z-20 w-full border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2">
          <div className="text-sm font-semibold">Pulse</div>
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

          {/* Group detail */}
          <Route path="/groups/:id" element={<GroupDetail />} />

          {/* Subpages linked from Me menu */}
          <Route path="/friends" element={<Protected><Friends /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/wallet" element={<Protected><Wallet /></Protected>} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />

          {/* Auth + UI previews */}
          <Route path="/login" element={<Login />} />
          <Route path="/ui" element={<StyleGuide />} />
          <Route path="/ui-glass" element={<UiGlass />} />
          <Route path="/ui-glass-top" element={<UiGlassTop />} />
          <Route path="/ui-glass-bottom" element={<UiGlassBottom />} />

          {/* 404 → Discover */}
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </main>

      {/* Global glass bottom dock */}
      <GlassDockBottom />
    </div>
  );
}
