
/**
 * Pulse Web — components/ActivityCard.tsx
 * File version: 0.1.0
 * Purpose: Card for group/activity list.
 */
type Props = {
  title: string;
  sport?: string;
  city?: string;
  dateTime?: string;
  privacy?: "PUBLIC" | "FRIENDS" | "INVITE";
  memberCount?: number;
  maxMembers?: number;
};

export function ActivityCard(p: Props) {
  const badge =
    p.privacy === "FRIENDS" ? "badge-blue" :
    p.privacy === "INVITE" ? "badge-purple" : "badge-green";
  return (
    <div className="card hover:shadow-md transition will-change-transform">
      <div className="card-body space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold">{p.title}</div>
          <span className={`badge ${badge}`}>{p.privacy || "PUBLIC"}</span>
        </div>
        <div className="text-sm text-gray-600">
          {p.sport ? <span className="mr-2">{p.sport}</span> : null}
          {p.city ? <span className="mr-2">· {p.city}</span> : null}
          {p.dateTime ? <span className="mr-2">· {new Date(p.dateTime).toLocaleString()}</span> : null}
        </div>
        <div className="text-xs text-gray-500">
          {typeof p.memberCount === "number" && typeof p.maxMembers === "number"
            ? `${p.memberCount}/${p.maxMembers} joined`
            : null}
        </div>
      </div>
    </div>
  );
}
