"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, Users } from "lucide-react";
import { LeaderboardIntro } from "@/components/leaderboard/leaderboard-intro";
import { SeasonRow } from "@/components/leaderboard/season-row";
import { CommunityMetrics } from "@/components/leaderboard/community-metrics";
import { LeaderboardControls } from "@/components/leaderboard/leaderboard-controls";
import { RealLeaderboardPodium } from "@/components/leaderboard/real-leaderboard-podium";
import { RankingsTable } from "@/components/leaderboard/rankings-table";
import { Pagination } from "@/components/leaderboard/pagination";
import { SeasonProgress } from "@/components/leaderboard/season-progress";
import { FeaturedAchievements } from "@/components/leaderboard/featured-achievements";
import { CommunityActivityTicker } from "@/components/leaderboard/community-activity-ticker";
import type { LeaderboardPeriod, LeaderboardResponse } from "@/types/leaderboard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type PageState = "loading" | "ready" | "empty" | "error";

function isPeriod(value: string | null): value is LeaderboardPeriod {
  return value === "global" || value === "weekly" || value === "monthly" || value === "alltime";
}

export function LeaderboardPageClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  const period = isPeriod(searchParams.get("period")) ? (searchParams.get("period") as LeaderboardPeriod) : "global";
  const country = searchParams.get("country") ?? "all";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateParams(next: Partial<{ period: string; country: string; search: string; page: number }>, opts?: { resetPage?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.period !== undefined) params.set("period", next.period);
    if (next.country !== undefined) params.set("country", next.country);
    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
    }
    if (opts?.resetPage) params.delete("page");
    if (next.page !== undefined) params.set("page", String(next.page));
    router.push(`/leaderboard?${params.toString()}`, { scroll: false });
  }

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setPageState((prev) => (prev === "ready" || prev === "empty" ? prev : "loading"));
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({ period, country, search, page: String(page) });
      const res = await fetch(`/api/leaderboard?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Leaderboard API returned ${res.status}`);
      const json = (await res.json()) as LeaderboardResponse;
      if (requestId !== requestIdRef.current) return; // a newer request superseded this one
      setData(json);
      setPageState(json.state === "empty" ? "empty" : "ready");
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setPageState("error");
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }, [period, country, search, page]);

  useEffect(() => {
    // Deferred a tick so the fetch's setState calls aren't synchronous
    // within the effect body itself.
    void Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-leaderboard-controls]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      );
      if (!reduced) {
        gsap.to("[data-status-dot]", { opacity: 0.4, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (pageState !== "ready" || !rootRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-podium-card]", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" });
      gsap.fromTo(
        "[data-ranking-row]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: reduced ? 0 : 0.04, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-season-progress], [data-achievements]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      );
    }, rootRef);
    return () => ctx.revert();
  }, [pageState, data]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      updateParams({ page: nextPage });
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const skeletonRows = useMemo(() => Array.from({ length: 7 }), []);

  return (
    <div ref={rootRef}>
      <LeaderboardIntro />
      <SeasonRow seasonNumber={data?.season.number ?? 4} endsAt={data?.season.endsAt ?? null} />

      <CommunityMetrics metrics={data?.metrics ?? null} ready={pageState === "ready" || pageState === "empty"} />

      <LeaderboardControls
        period={period}
        onPeriodChange={(p) => updateParams({ period: p }, { resetPage: true })}
        country={country}
        onCountryChange={(c) => updateParams({ country: c }, { resetPage: true })}
        countries={data?.countries ?? []}
        searchValue={search}
        onSearchChange={(s) => updateParams({ search: s }, { resetPage: true })}
      />

      <div ref={tableRef} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[68%_32%]">
        <div className="min-w-0">
          {pageState === "error" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-8 text-center">
              <AlertTriangle className="h-6 w-6 text-[var(--danger)]" />
              <p className="text-sm font-semibold text-[var(--danger)]">Couldn&apos;t load the leaderboard</p>
              <p className="text-xs text-[var(--text-secondary)]">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void fetchData()}
                className="mt-1 flex h-10 min-h-[44px] items-center rounded-lg bg-[var(--orange)] px-4 text-xs font-bold uppercase tracking-wide text-white"
              >
                Retry
              </button>
            </div>
          )}

          {pageState === "loading" && (
            <div aria-busy="true" aria-live="polite">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-56 animate-pulse rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-soft)]" />
                ))}
              </div>
              <div className="mt-4 space-y-1">
                {skeletonRows.map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg border border-[var(--border-muted)] bg-[var(--surface-soft)]" />
                ))}
              </div>
            </div>
          )}

          {pageState === "empty" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <Users className="h-8 w-8 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--white)]">No hunters match these filters.</p>
              <p className="text-xs text-[var(--text-secondary)]">Try a different country or clear your search.</p>
              <button
                type="button"
                onClick={() => updateParams({ country: "all", search: "" }, { resetPage: true })}
                className="mt-1 flex h-10 min-h-[44px] items-center rounded-lg border border-[var(--border)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--white)] hover:border-[var(--orange)]/50"
              >
                Clear Filters
              </button>
            </div>
          )}

          {pageState === "ready" && data && (
            <>
              {page === 1 && <RealLeaderboardPodium />}

              <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)]">Global Rankings</h2>
              <RankingsTable users={data.users} />
              <Pagination
                page={data.pagination.page}
                pageSize={data.pagination.pageSize}
                total={data.pagination.total}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Demo Data — seeded community dataset, not live production accounts.
              </p>
            </>
          )}
        </div>

        <div>
          <SeasonProgress verified={data?.season.verifiedReports ?? 0} target={data?.season.targetVerifiedReports ?? 1} />
          <FeaturedAchievements />
        </div>
      </div>

      <CommunityActivityTicker />
    </div>
  );
}
