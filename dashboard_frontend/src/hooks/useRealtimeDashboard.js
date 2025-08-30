"use strict";

/**
 * Unified real-time subscriptions for the dashboard (read-only).
 * Sets up a single channel that listens to DB changes and triggers
 * provided handlers to refresh widget state as needed.
 *
 * No writes/mutations are performed here.
 */

import { useEffect, useMemo } from "react";
import { createDbChangesChannel, supabase } from "../lib/supabaseClient";
import { debounce } from "../lib/adapters";

/**
 * PUBLIC_INTERFACE
 * useRealtimeDashboard
 * Parameters:
 * - onSalesInsert: () => void
 * - onCustomersInsert: () => void
 * - onApplicationsInsert: () => void
 * - onProjectsUpdate: (payload) => void  // can inspect status change if needed
 * - onVisitsInsert: () => void
 * - onTasksChange: () => void  // for INSERT/UPDATE/DELETE
 * - onActivitiesInsert: (payload) => void // for feed prepend
 *
 * Behavior:
 * - Creates a single realtime channel "dashboard-realtime"
 * - Subscribes to:
 *    INSERT on sales, customers, applications, visits, activities
 *    UPDATE on projects
 *    *     on tasks (INSERT/UPDATE/DELETE)
 * - Uses debounced wrappers to limit render thrashing
 * - Cleans up channel on unmount
 */
export function useRealtimeDashboard({
  onSalesInsert,
  onCustomersInsert,
  onApplicationsInsert,
  onProjectsUpdate,
  onVisitsInsert,
  onTasksChange,
  onActivitiesInsert,
}) {
  // Debounce handlers to avoid excessive re-renders on bursts.
  const debounced = useMemo(() => {
    return {
      onSalesInsert: onSalesInsert ? debounce(onSalesInsert, 150) : null,
      onCustomersInsert: onCustomersInsert ? debounce(onCustomersInsert, 150) : null,
      onApplicationsInsert: onApplicationsInsert ? debounce(onApplicationsInsert, 150) : null,
      onProjectsUpdate: onProjectsUpdate ? debounce(onProjectsUpdate, 150) : null,
      onVisitsInsert: onVisitsInsert ? debounce(onVisitsInsert, 150) : null,
      onTasksChange: onTasksChange ? debounce(onTasksChange, 150) : null,
      onActivitiesInsert: onActivitiesInsert ? debounce(onActivitiesInsert, 150) : null,
    };
  }, [
    onSalesInsert,
    onCustomersInsert,
    onApplicationsInsert,
    onProjectsUpdate,
    onVisitsInsert,
    onTasksChange,
    onActivitiesInsert,
  ]);

  useEffect(() => {
    const subs = [
      // KPIs
      { event: "INSERT", table: "sales", handler: () => debounced.onSalesInsert && debounced.onSalesInsert() },
      { event: "INSERT", table: "customers", handler: () => debounced.onCustomersInsert && debounced.onCustomersInsert() },
      { event: "INSERT", table: "applications", handler: () => debounced.onApplicationsInsert && debounced.onApplicationsInsert() },

      // Projects in progress KPI can change on UPDATE
      { event: "UPDATE", table: "projects", handler: (payload) => debounced.onProjectsUpdate && debounced.onProjectsUpdate(payload) },

      // Visits monthly chart
      { event: "INSERT", table: "visits", handler: () => debounced.onVisitsInsert && debounced.onVisitsInsert() },

      // Tasks donut (any change)
      { event: "*", table: "tasks", handler: () => debounced.onTasksChange && debounced.onTasksChange() },

      // Activity feed
      { event: "INSERT", table: "activities", handler: (payload) => debounced.onActivitiesInsert && debounced.onActivitiesInsert(payload) },
    ];

    const channel = createDbChangesChannel(subs, "dashboard-realtime");

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[useRealtimeDashboard] Error removing channel:", err);
      }
    };
  }, [debounced]);
}
