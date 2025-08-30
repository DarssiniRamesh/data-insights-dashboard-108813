"use strict";

/**
 * Collection of read-only data fetchers for the dashboard.
 * Centralizes all initial SELECT queries required by widgets.
 * No mutations/writes are performed here.
 */

import { useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  mapKpiTile,
  normalizeVisitsToMonthlySeries,
  aggregateCountByStatus,
  computeTaskDistribution,
  mapActivities,
  mapCampaign,
} from "../lib/adapters";

/**
 * Helpers to compute date bounds in JS for client-side filters.
 */
function getMonthStartISO(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  return d.toISOString();
}
function monthsBackISO(months = 12, date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth() - (months - 1), 1, 0, 0, 0, 0);
  return d.toISOString();
}

/**
 * PUBLIC_INTERFACE
 * useQueries
 * Exposes memoized async functions that fetch data for the dashboard:
 * - getKpis: sales, new customers, in-progress projects, new applications (this month)
 * - getVisitorStats: monthly new vs returning visits for past N months
 * - getTasksDistribution: counts by status for tasks, plus computed donut metadata
 * - getRecentActivities: latest activity feed with optional user join
 * - getActiveCampaign: the currently active campaign card
 */
export function useQueries() {
  /** Returns an object with async read-only selectors for the dashboard. */

  // KPI metrics (current month counts)
  // Sales, New Customers, Projects In Progress, New Applications
  const getKpis = useCallback(async () => {
    const monthStartIso = getMonthStartISO();

    // Sales this month
    const salesPromise = supabase
      .from("sales")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStartIso);

    // New Customers this month
    const customersPromise = supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStartIso);

    // Projects In Progress
    const projectsPromise = supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress");

    // New Applications this month
    const applicationsPromise = supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStartIso);

    const [salesRes, customersRes, projectsRes, applicationsRes] = await Promise.all([
      salesPromise,
      customersPromise,
      projectsPromise,
      applicationsPromise,
    ]);

    const sales = salesRes?.count ?? 0;
    const newCustomers = customersRes?.count ?? 0;
    const inProgress = projectsRes?.count ?? 0;
    const newApps = applicationsRes?.count ?? 0;

    // Map to UI tiles
    return [
      mapKpiTile("Sales", sales, { icon: "shopping_bag" }),
      mapKpiTile("New Customers", newCustomers, { icon: "users" }),
      mapKpiTile("Projects In Progress", inProgress, { icon: "progress" }),
      mapKpiTile("New Applications", newApps, { icon: "inbox" }),
    ];
  }, []);

  // Visitor statistics (new vs returning) for last 12 months by default.
  // Note: since Supabase client aggregation via SQL functions may vary with RLS,
  // we fetch recent rows and aggregate client-side for portability.
  const getVisitorStats = useCallback(async (months = 12) => {
    const since = monthsBackISO(months);
    const { data, error } = await supabase
      .from("visits")
      .select("id,type,ts,created_at")
      .gte("ts", since);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useQueries] getVisitorStats error:", error);
      return { categories: [], series: [] };
    }

    return normalizeVisitsToMonthlySeries(data || [], months);
  }, []);

  // Tasks distribution for donut
  const getTasksDistribution = useCallback(async () => {
    // Fetch only required fields to minimize payload
    const { data, error } = await supabase.from("tasks").select("id,status");
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useQueries] getTasksDistribution error:", error);
      return computeTaskDistribution({});
    }

    const countMap = aggregateCountByStatus(data || [], "status");
    return computeTaskDistribution(countMap);
  }, []);

  // Recent activity feed
  const getRecentActivities = useCallback(async (limit = 10) => {
    // Attempt to join users if available; fallback to activities only
    // Supabase syntax for joins (RPC-ish): select('*, users:author_id(name,avatar_url)')
    const { data, error } = await supabase
      .from("activities")
      .select("id, author_id, message, created_at, status, users:author_id ( name, avatar_url )")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[useQueries] getRecentActivities join failed, retrying base select:", error?.message || error);
      const fallback = await supabase
        .from("activities")
        .select("id, author_id, message, created_at, status")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fallback.error) {
        // eslint-disable-next-line no-console
        console.error("[useQueries] getRecentActivities error:", fallback.error);
        return [];
      }

      // Map without joined user fields
      return mapActivities(
        (fallback.data || []).map((r) => ({
          ...r,
          name: undefined,
          avatar_url: undefined,
        }))
      );
    }

    // Flatten joined fields for mapper compatibility
    const rows = (data || []).map((r) => ({
      ...r,
      name: r?.users?.name,
      avatar_url: r?.users?.avatar_url,
    }));

    return mapActivities(rows);
  }, []);

  // Active campaign card
  const getActiveCampaign = useCallback(async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[useQueries] getActiveCampaign error:", error);
      return null;
    }

    return mapCampaign(data);
  }, []);

  return {
    getKpis,
    getVisitorStats,
    getTasksDistribution,
    getRecentActivities,
    getActiveCampaign,
  };
}
