"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const [query, setQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [travellers, setTravellers] = useState(DEFAULT_TRAVELLERS);

  const minDate = useMemo(() => todayISO(), []);

  const openGlobalSearch = useCallback(
    (nextQuery) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent("gh_open_search", {
          detail: {
            query: String(nextQuery || ""),
            meta: {
              checkIn,
              checkOut,
              travellers,
            },
          },
        })
      );
    },
    [checkIn, checkOut, travellers]
  );

  return (
    <form
      className={[
        "gh-glass w-full rounded-2xl p-3 shadow-gh-soft",
        "md:rounded-3xl md:p-4",
        className,
      ].join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        openGlobalSearch(query);
      }}
    >
      <div className="grid gap-3 md:grid-cols-[1.35fr_0.7fr_0.7fr_0.75fr_0.45fr] md:items-center">
        <label className="relative flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white">
          <Search className="h-5 w-5 text-white/80" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages, destinations, hotels…"
            className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-white placeholder:text-white/60 shadow-none focus-visible:ring-0"
          />
        </label>

        <label className="relative flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white">
          <CalendarDays className="h-5 w-5 text-white/80" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black tracking-wide text-white/85">Check In</div>
            <Input
              type="date"
              min={minDate}
              value={checkIn}
              onChange={(e) => {
                const next = e.target.value;
                setCheckIn(next);
                if (checkOut && next && checkOut < next) setCheckOut(next);
              }}
              className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-white shadow-none [color-scheme:dark] focus-visible:ring-0"
            />
          </div>
        </label>

        <label className="relative flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white">
          <CalendarDays className="h-5 w-5 text-white/80" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black tracking-wide text-white/85">Check Out</div>
            <Input
              type="date"
              min={checkIn || minDate}
              value={checkOut}
              onChange={(e) => {
                const next = e.target.value;
                if (checkIn && next && next < checkIn) {
                  setCheckOut(checkIn);
                  return;
                }
                setCheckOut(next);
              }}
              className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-white shadow-none [color-scheme:dark] focus-visible:ring-0"
            />
          </div>
        </label>

        <label className="relative flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white">
          <Users className="h-5 w-5 text-white/80" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black tracking-wide text-white/85">Travellers</div>
            <Select
              value={travellers}
              onChange={(e) => setTravellers(e.target.value)}
              className="h-auto w-full border-0 bg-transparent p-0 pr-6 text-sm font-semibold text-white shadow-none focus-visible:ring-0"
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
              <option value="5">5 Adults</option>
              <option value="6">6 Adults</option>
            </Select>
          </div>
        </label>

        <Button
          type="submit"
          variant="brand"
          className="h-12 w-full rounded-2xl text-sm font-black md:h-14 md:rounded-2xl"
          aria-label="Search"
        >
          Search
        </Button>
      </div>

      <div className="mt-3 hidden text-xs font-semibold text-white/70 md:block">
        Tip: Press the search icon in the header anytime to browse packages and blogs.
      </div>
    </form>
  );
}
