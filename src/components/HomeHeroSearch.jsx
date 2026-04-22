"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Users } from "lucide-react";

import { GlobalSearch } from "@/components/GlobalSearch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const DEFAULT_TRAVELLERS = "2";

function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function HomeHeroSearch({ className = "" }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [travellers, setTravellers] = useState(DEFAULT_TRAVELLERS);

  const minDate = useMemo(() => todayISO(), []);

  return (
    <form
      className={[
        "gh-glass w-full rounded-2xl p-3 shadow-gh-soft",
        "md:rounded-3xl md:p-4",
        className,
      ].join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="md:grid-cols-[1.45fr_0.8fr_0.8fr_0.85fr] md:items-center">
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-white">
          <GlobalSearch variant="hero" tone="header-dark" />
        </div>

      </div>
    </form>
  );
}
