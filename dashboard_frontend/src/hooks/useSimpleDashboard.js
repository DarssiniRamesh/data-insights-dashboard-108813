"use strict";

/**
 * PUBLIC_INTERFACE
 * useSimpleDashboard
 * Provides read-only single-table selectors for basic dashboard views:
 * - profiles
 * - apps
 * - votes
 * - contest_weeks
 * - contest_winners
 *
 * Each selector returns:
 * { count: number, rows: Array<object> }
 *
 * Constraints:
 * - Single-table SELECTs only (no joins, no nested selects).
 * - Order by created_at or updated_at when present; fall back to id desc.
 * - Limit rows by provided limit (default 10).
 */

import { useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

/** Helper: generic recent list fetcher with count using head:true */
async function fetchRecentWithCount({ table, selectFields = "*", orderFieldCandidates = ["created_at", "updated_at", "id"], limit = 10 }) {
  // Determine an order field to use
  const orderField = orderFieldCandidates[0];

  // Count (head request)
  const countPromise = supabase.from(table).select("id", { count: "exact", head: true });

  // Recent rows
  let query = supabase.from(table).select(selectFields).limit(limit);
  try {
    query = query.order(orderField, { ascending: false });
  } catch (e) {
    // Ignore if field missing; some SDKs validate only server-side; server will ignore invalid order in some cases
  }

  const [countRes, rowsRes] = await Promise.all([countPromise, query]);

  const count = countRes?.count ?? 0;
  const rows = rowsRes?.data || [];
  return { count, rows };
}

// PUBLIC_INTERFACE
export function useSimpleDashboard() {
  // Profiles: id, username/display_name, created_at
  const getProfilesSummary = useCallback(async (limit = 10) => {
    const { count, rows } = await fetchRecentWithCount({
      table: "profiles",
      selectFields: "id,username,display_name,created_at",
      orderFieldCandidates: ["created_at", "id"],
      limit,
    });
    // Normalize key presence
    const mapped = (rows || []).map((r) => ({
      id: r?.id,
      username: r?.username ?? r?.display_name ?? "-",
      created_at: r?.created_at ? new Date(r.created_at).toLocaleString() : "-",
    }));
    return { count, rows: mapped };
  }, []);

  // Apps: id, name/title, owner_id (not joining), created_at
  const getAppsSummary = useCallback(async (limit = 10) => {
    // Select only known-safe columns to avoid 400 errors from invalid fields.
    const { count, rows } = await fetchRecentWithCount({
      table: "apps",
      selectFields: "id,name,owner_id,created_at",
      orderFieldCandidates: ["created_at", "id"],
      limit,
    });
    const mapped = (rows || []).map((r) => ({
      id: r?.id,
      // Prefer 'name' and fallback to a generic label if absent.
      name: r?.name ?? `App ${r?.id ?? ""}`,
      owner_id: r?.owner_id ?? "-",
      created_at: r?.created_at ? new Date(r.created_at).toLocaleString() : "-",
    }));
    return { count, rows: mapped };
  }, []);

  // Votes: id, app_id, voter_id, contest_week_id, created_at
  const getVotesSummary = useCallback(async (limit = 10) => {
    const { count, rows } = await fetchRecentWithCount({
      table: "votes",
      selectFields: "id,app_id,voter_id,contest_week_id,created_at",
      orderFieldCandidates: ["created_at", "id"],
      limit,
    });
    const mapped = (rows || []).map((r) => ({
      id: r?.id,
      app_id: r?.app_id ?? "-",
      voter_id: r?.voter_id ?? "-",
      contest_week_id: r?.contest_week_id ?? "-",
      created_at: r?.created_at ? new Date(r.created_at).toLocaleString() : "-",
    }));
    return { count, rows: mapped };
  }, []);

  // Contest Weeks: id, label, status, start_date, end_date, updated_at
  const getContestWeeksSummary = useCallback(async (limit = 10) => {
    const { count, rows } = await fetchRecentWithCount({
      table: "contest_weeks",
      selectFields: "id,label,status,start_date,end_date,updated_at",
      orderFieldCandidates: ["updated_at", "start_date", "id"],
      limit,
    });
    const mapped = (rows || []).map((r) => ({
      id: r?.id,
      label: r?.label ?? "-",
      status: r?.status ?? "-",
      start_date: r?.start_date ? new Date(r.start_date).toLocaleDateString() : "-",
      end_date: r?.end_date ? new Date(r.end_date).toLocaleDateString() : "-",
    }));
    return { count, rows: mapped };
  }, []);

  // Contest Winners: id, contest_week_id, app_id, total_votes, decided_at
  const getContestWinnersSummary = useCallback(async (limit = 10) => {
    const { count, rows } = await fetchRecentWithCount({
      table: "contest_winners",
      selectFields: "id,contest_week_id,app_id,total_votes,decided_at,created_at",
      orderFieldCandidates: ["decided_at", "created_at", "id"],
      limit,
    });
    const mapped = (rows || []).map((r) => ({
      id: r?.id,
      contest_week_id: r?.contest_week_id ?? "-",
      app_id: r?.app_id ?? "-",
      total_votes: r?.total_votes ?? "-",
      decided_at: r?.decided_at ? new Date(r.decided_at).toLocaleString() : "-",
    }));
    return { count, rows: mapped };
  }, []);

  return {
    getProfilesSummary,
    getAppsSummary,
    getVotesSummary,
    getContestWeeksSummary,
    getContestWinnersSummary,
  };
}
