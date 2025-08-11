
/**
 * Pulse Web — pages/Discover.tsx
 * File version: 0.1.0
 * Purpose: Main list view with basic filters and results.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ActivityCard } from "@/components/ActivityCard";

type Item = {
  group: {
    id: string;
    title: string;
    location_city?: string;
    date_time?: string;
    privacy?: "PUBLIC" | "FRIENDS" | "INVITE";
    max_members?: number;
    sport_id?: string;
  };
  member_count: number;
  sport: { id: string; name: string; icon?: string };
  creator: { id: string; name?: string };
  can_join: boolean;
  join_mode: string;
};

export default function Discover() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get("/groups")
      .then(r => setItems(r.data.data.items))
      .catch(e => setError(e?.response?.data?.error || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        <button className="btn btn-primary">Filters</button>
        <button className="btn border">Created by me</button>
        <button className="btn border">Joined by me</button>
        <button className="btn border">Favorites</button>
      </div>

      {loading && <div>Loading activities…</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(it => (
          <ActivityCard
            key={it.group.id}
            title={it.group.title}
            sport={it.sport?.name}
            city={it.group.location_city}
            dateTime={it.group.date_time}
            privacy={it.group.privacy as any}
            memberCount={it.member_count}
            maxMembers={it.group.max_members}
          />
        ))}
      </div>
    </div>
  );
}
