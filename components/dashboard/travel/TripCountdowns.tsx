import Link from "next/link";
import { Plane, Calendar } from "lucide-react";

interface Booking {
  id: string;
  client_name: string;
  destination: string;
  departure_date: string | null;
  travel_dates: string | null;
  status: string;
}

export default function TripCountdowns({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter to upcoming confirmed/approved bookings with a departure date
  const upcoming = bookings
    .filter(b => b.departure_date && ["confirmed", "approved", "completed"].includes(b.status))
    .map(b => {
      const dep = new Date(b.departure_date!);
      dep.setHours(0, 0, 0, 0);
      const days = Math.ceil((dep.getTime() - today.getTime()) / 86400000);
      return { ...b, days };
    })
    .filter(b => b.days >= 0 && b.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plane size={15} className="text-teal" />
          <h3 className="text-sm font-semibold text-navy">Upcoming Departures</h3>
        </div>
        <Link href="/dashboard/pipeline" className="text-xs text-teal hover:underline">View pipeline →</Link>
      </div>

      <div className="space-y-2">
        {upcoming.map((b) => {
          const isToday = b.days === 0;
          const isTomorrow = b.days === 1;
          const isUrgent = b.days <= 7;

          const label = isToday ? "Departs today!" : isTomorrow ? "Departs tomorrow" : `${b.days} days away`;
          const dep = new Date(b.departure_date!);
          const dateStr = dep.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <div key={b.id} className={`flex items-center justify-between p-3 rounded-lg ${isUrgent ? "bg-teal/5 border border-teal/20" : "bg-gray-50"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${isUrgent ? "bg-teal text-white" : "bg-white border border-border"}`}>
                  <Calendar size={12} className={isUrgent ? "text-white" : "text-gray-400"} />
                  <span className={`text-xs font-bold leading-tight ${isUrgent ? "text-white" : "text-navy"}`}>{dateStr}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{b.client_name}</p>
                  <p className="text-xs text-gray-500">{b.destination}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${isToday ? "text-red-600" : isTomorrow ? "text-orange-600" : isUrgent ? "text-teal" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
