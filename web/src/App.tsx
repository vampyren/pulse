
/**
 * Pulse Web — App.tsx
 * File version: 0.1.0
 * Purpose: Router and app shell setup.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Discover from "@/pages/Discover";
import MapView from "@/pages/MapView";
import Profile from "@/pages/Profile";
import Friends from "@/pages/Friends";
import Chat from "@/pages/Chat";
import Login from "@/pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Discover />} />
          <Route path="map" element={<MapView />} />
          <Route path="friends" element={<Friends />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
