"use strict";

/**
 * Read-only data hooks for the Voting Dashboard.
 * All queries are SELECTs against Supabase tables (apps, profiles, votes, contest_weeks, contest_winners).
 * Realtime triggers are handled in useRealtimeVotingDashboard.
 * Defensive coding:
 * - All joins are optional-safe and tolerate RLS-denied nested fields by falling back to placeholder text.
 * - Empty states return consistent shapes to avoid UI errors.
 */

import { useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

/** PUBLIC_INTERFACE
 * startOfTodayISO
 * Returns ISO string for today 00:00:00 used to filter "votes today".
 */
function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** PUBLIC_INTERFACE
 * daysBackISO
 * Returns ISO string for midnight N days ago for range filtering (default 7).
 */
function daysBackISO(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** PUBLIC_INTERFACE
 * daysRangeISO
 * Alias for daysBackISO, making intent explicit for chart ranges.
 */
function daysRangeISO(days = 14) {
  return daysBackISO(days);
}

/** PUBLIC_INTERFACE
 * toDateKey
 * Formats a date-like into YYYY-MM-DD (daily bucket key). Returns empty string on invalid date.
 */
function toDateKey(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(+d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** PUBLIC_INTERFACE
 * enumerateDaysInclusive
 * Returns an array of day keys (YYYY-MM-DD) from fromISO to toISO inclusive.
 */
function enumerateDaysInclusive(fromISO, toISO) {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  const out = [];
  if (Number.isNaN(+from) || Number.isNaN(+to)) return out;
  const cur = new Date(from);
  while (cur <= to) {
    out.push(toDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/**
 * PUBLIC_INTERFACE
 * useVotingQueries
 * Exposes memoized async read-only selectors tailored to the voting schema:
 * - getActiveWeek(): Fetch the current active contest week (or null).
 * - getVotingKpis(): KPI tiles (active week label, votes today, total votes, top app, new users 7d, apps 7d).
 * - getVotesOverTime(days?): Daily vote counts for active week, default last 14 days.
 * - getLeaderboard(limit?): Top apps by votes for active week with share computation.
 * - getRecentVotes(limit?): Recent votes with optional voter/app/week label joins.
 * - getWinnersHistory(limit?): Past winners with nested app/owner and week label.
 * - getActiveWeekContext(): Summary for ActiveWeekCard (label, date range, participants proxy, unique voters proxy, ends_in).
 */
// PUBLIC_INTERFACE
export function useVotingQueries() {
  // PUBLIC_INTERFACE
  // getActiveWeek: returns the latest active contest week or null.
  const getActiveWeek = useCallback(async () => {
    const { data, error } = await supabase
      .from("contest_weeks")
      .select("*")
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useVotingQueries] getActiveWeek error:", error);
      return null;
    }
    return data || null;
  }, []);

  // PUBLIC_INTERFACE
  // getVotingKpis: builds KPI tiles using multiple safe, read-only selects.
  const getVotingKpis = useCallback(async () => {
    const activeWeek = await getActiveWeek();
    const weekId = activeWeek?.id || null;

    const todayIso = startOfTodayISO();
    const last7Iso = daysBackISO(7);

    const votesTodayP = supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso);

    const totalVotesWeekP = weekId
      ? supabase
          .from("votes")
          .select("id", { count: "exact", head: true })
          .eq("contest_week_id", weekId)
      : Promise.resolve({ count: 0 });

    // Optional-safe join; if RLS blocks nested apps, we still count app_id on client.
    const topAppP = weekId
      ? supabase
          .from("votes")
          .select("app_id, apps:app_id ( name )", { count: "exact" })
          .eq("contest_week_id", weekId)
      : Promise.resolve({ data: [] });

    const newUsers7dP = supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last7Iso);

    const appsSubmitted7dP = supabase
      .from("apps")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last7Iso);

    const [votesTodayRes, totalVotesRes, topAppRes, newUsersRes, apps7dRes] = await Promise.all([
      votesTodayP,
      totalVotesWeekP,
      topAppP,
      newUsers7dP,
      appsSubmitted7dP,
    ]);

    const votesToday = votesTodayRes?.count ?? 0;
    const totalVotes = totalVotesRes?.count ?? 0;

    // Compute top app using client-side aggregation to avoid complex SQL and tolerate RLS on joins.
    let topAppName = "-";
    let topAppCount = 0;
    if (Array.isArray(topAppRes?.data) && weekId) {
      const counts = {};
      (topAppRes.data || []).forEach((r) => {
        const appId = r?.app_id;
        if (!appId) return;
        counts[appId] = (counts[appId] || 0) + 1;
      });
      let maxId = null;
      Object.entries(counts).forEach(([appId, cnt]) => {
        const n = Number(cnt) || 0;
        if (n > topAppCount) {
          topAppCount = n;
          maxId = appId;
        }
      });
      if (maxId) {
        const row = (topAppRes.data || []).find((r) => String(r.app_id) === String(maxId));
        topAppName = row?.apps?.name || `App ${maxId}`;
      }
    }

    const newUsers7d = newUsersRes?.count ?? 0;
    const appsSubmitted7d = apps7dRes?.count ?? 0;

    return {
      activeWeek,
      kpis: [
        { key: "active_week", label: "Active Week", value: activeWeek?.label || "—", icon: "📅", accentVar: "var(--primary)", tintVar: "var(--tile-blue)" },
        { key: "votes_today", label: "Votes Today", value: votesToday, icon: "🗳️", accentVar: "var(--accent-pink)", tintVar: "var(--tile-pink)" },
        { key: "total_votes", label: "Total Votes", value: totalVotes, icon: "✅", accentVar: "var(--accent-orange)", tintVar: "var(--tile-peach)" },
        { key: "top_app", label: "Top App", value: topAppName, icon: "🌟", badge: topAppCount > 0 ? `${topAppCount}` : null, accentVar: "var(--accent-teal)", tintVar: "var(--tile-mint)" },
        { key: "new_users_7d", label: "New Users (7d)", value: newUsers7d, icon: "👤", accentVar: "var(--primary)", tintVar: "var(--tile-blue)" },
        { key: "apps_7d", label: "Apps Submitted (7d)", value: appsSubmitted7d, icon: "📦", accentVar: "var(--accent-green)", tintVar: "var(--tile-mint)" },
      ],
    };
  }, [getActiveWeek]);

  // PUBLIC_INTERFACE
  // getVotesOverTime: daily counts for active week, default last 14 days.
  const getVotesOverTime = useCallback(async (days = 14) => {
    const activeWeek = await getActiveWeek();
    const weekId = activeWeek?.id;
    const since = daysRangeISO(days);
    const nowIso = new Date().toISOString();

    if (!weekId) {
      return { categories: [], series: [{ name: "Votes", data: [] }] };
    }

    const { data, error } = await supabase
      .from("votes")
      .select("id, created_at")
      .eq("contest_week_id", weekId)
      .gte("created_at", since)
      .lte("created_at", nowIso)
      .order("created_at", { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useVotingQueries] getVotesOverTime error:", error);
      return { categories: [], series: [{ name: "Votes", data: [] }] };
    }

    const daysList = enumerateDaysInclusive(since, nowIso);
    const counts = Object.fromEntries(daysList.map((k) => [k, 0]));
    (data || []).forEach((r) => {
      const k = toDateKey(r?.created_at);
      if (k && counts[k] !== undefined) counts[k] += 1;
    });

    const seriesData = daysList.map((k) => counts[k] || 0);

    return {
      categories: daysList,
      series: [{ name: "Votes", data: seriesData }],
    };
  }, [getActiveWeek]);

  // PUBLIC_INTERFACE
  // getLeaderboard: top apps for active week with vote share. Safe when joins are blocked.
  const getLeaderboard = useCallback(async (limit = 10) => {
    const activeWeek = await getActiveWeek();
    const weekId = activeWeek?.id;
    if (!weekId) return [];

    const { data, error } = await supabase
      .from("votes")
      .select("app_id, apps:app_id ( name, owner_id, owners:owner_id ( username ) )")
      .eq("contest_week_id", weekId);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useVotingQueries] getLeaderboard error:", error);
      return [];
    }

    const countMap = {};
    const metaMap = {};
    (data || []).forEach((r) => {
      const id = r?.app_id;
      if (!id) return;
      countMap[id] = (countMap[id] || 0) + 1;
      if (!metaMap[id]) {
        metaMap[id] = {
          app_name: r?.apps?.name || `App ${id}`,
          owner_name: r?.apps?.owners?.username || "Unknown",
        };
      }
    });

    const totalVotes = Object.values(countMap).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
    const rows = Object.keys(countMap)
      .map((id) => ({
        app_id: id,
        app_name: metaMap[id]?.app_name,
        owner_name: metaMap[id]?.owner_name,
        votes: countMap[id],
        share: Math.round(((countMap[id] || 0) / totalVotes) * 100),
      }))
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, limit);

    return rows;
  }, [getActiveWeek]);

  // PUBLIC_INTERFACE
  // getRecentVotes: recent votes with optional joins; tolerates missing join data.
  const getRecentVotes = useCallback(async (limit = 20) => {
    const { data, error } = await supabase
      .from("votes")
      .select("id, created_at, apps:app_id(name), profiles:voter_id(username), contest_weeks:contest_week_id(label)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useVotingQueries] getRecentVotes error:", error);
      return [];
    }

    return (data || []).map((r) => ({
      id: r?.id,
      created_at: r?.created_at,
      voter_name: r?.profiles?.username || "Unknown",
      app_name: r?.apps?.name || "Unknown App",
      week_label: r?.contest_weeks?.label || "",
    }));
  }, []);

  // PUBLIC_INTERFACE
  // getWinnersHistory: returns normalized winners list, safe when owner join is blocked.
  const getWinnersHistory = useCallback(async (limit = 8) => {
    const { data, error } = await supabase
      .from("contest_winners")
      .select(`
        id,
        decided_at,
        total_votes,
        contest_weeks:contest_week_id (
          label,
          start_date
        ),
        apps:app_id (
          name,
          owner:owner_id (
            username
          )
        )
      `)
      .order("start_date", { referencedTable: "contest_weeks", ascending: false })
      .order("decided_at", { ascending: false })
      .limit(limit);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useVotingQueries] getWinnersHistory error:", error);
      return [];
    }

    return (data || []).map((r) => ({
      id: r?.id,
      week: r?.contest_weeks?.label || "",
      app_name: r?.apps?.name || "",
      owner_name: r?.apps?.owner?.username || "Unknown",
      decided_at: r?.decided_at || null,
      total_votes: r?.total_votes ?? null,
    }));
  }, []);

  // PUBLIC_INTERFACE
  // getActiveWeekContext: composes ActiveWeekCard content with safe fallbacks.
  const getActiveWeekContext = useCallback(async () => {
    const activeWeek = await getActiveWeek();
    if (!activeWeek?.id) {
      return {
        week_label: "—",
        date_range: "",
        participants: 0,
        unique_voters: 0,
        ends_in: "",
      };
    }

    const weekId = activeWeek.id;

    const [participantsRes, votersRes] = await Promise.all([
      supabase
        .from("votes")
        .select("app_id", { count: "exact", head: true })
        .eq("contest_week_id", weekId)
        .neq("app_id", null),
      supabase
        .from("votes")
        .select("voter_id", { count: "exact", head: true })
        .eq("contest_week_id", weekId)
        .neq("voter_id", null),
    ]);

    const end = activeWeek?.end_date ? new Date(activeWeek.end_date) : null;
    let endsIn = "";
    if (end && !Number.isNaN(+end)) {
      const ms = +end - +new Date();
      if (ms > 0) {
        const hrs = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(hrs / 24);
        const remHrs = hrs % 24;
        endsIn = days > 0 ? `${days}d ${remHrs}h` : `${remHrs}h`;
      } else {
        endsIn = "Ended";
      }
    }

    const dateRange =
      activeWeek?.start_date && activeWeek?.end_date
        ? `${new Date(activeWeek.start_date).toLocaleDateString()} – ${new Date(activeWeek.end_date).toLocaleDateString()}`
        : "";

    return {
      week_label: activeWeek?.label || "",
      date_range: dateRange,
      participants: participantsRes?.count ?? 0,
      unique_voters: votersRes?.count ?? 0,
      ends_in: endsIn,
    };
  }, [getActiveWeek]);

  return {
    getActiveWeek,
    getVotingKpis,
    getVotesOverTime,
    getLeaderboard,
    getRecentVotes,
    getWinnersHistory,
    getActiveWeekContext,
  };
}
