"use strict";

/**
 * PUBLIC_INTERFACE
 * useRealtimeVotingDashboard
 * Sets up a single Supabase Realtime channel listening to:
 * - votes: INSERT
 * - profiles: INSERT
 * - apps: INSERT
 * - contest_weeks: UPDATE
 * - contest_winners: INSERT/UPDATE
 *
 * Triggers provided callbacks to re-run read-only selectors in the UI.
 */

import { useEffect, useMemo } from "react";
import { createDbChangesChannel, supabase } from "../lib/supabaseClient";
import { debounce } from "../lib/adapters";

export function useRealtimeVotingDashboard({
  onVotesInsert,
  onProfilesInsert,
  onAppsInsert,
  onContestWeekUpdate,
  onWinnersChange,
}) {
  const debounced = useMemo(() => {
    return {
      onVotesInsert: onVotesInsert ? debounce(onVotesInsert, 120) : null,
      onProfilesInsert: onProfilesInsert ? debounce(onProfilesInsert, 150) : null,
      onAppsInsert: onAppsInsert ? debounce(onAppsInsert, 150) : null,
      onContestWeekUpdate: onContestWeekUpdate ? debounce(onContestWeekUpdate, 200) : null,
      onWinnersChange: onWinnersChange ? debounce(onWinnersChange, 200) : null,
    };
  }, [onVotesInsert, onProfilesInsert, onAppsInsert, onContestWeekUpdate, onWinnersChange]);

  useEffect(() => {
    const subs = [
      { event: "INSERT", table: "votes", handler: () => debounced.onVotesInsert && debounced.onVotesInsert() },
      { event: "INSERT", table: "profiles", handler: () => debounced.onProfilesInsert && debounced.onProfilesInsert() },
      { event: "INSERT", table: "apps", handler: () => debounced.onAppsInsert && debounced.onAppsInsert() },
      { event: "UPDATE", table: "contest_weeks", handler: (payload) => debounced.onContestWeekUpdate && debounced.onContestWeekUpdate(payload) },
      { event: "INSERT", table: "contest_winners", handler: () => debounced.onWinnersChange && debounced.onWinnersChange() },
      { event: "UPDATE", table: "contest_winners", handler: () => debounced.onWinnersChange && debounced.onWinnersChange() },
    ];

    const channel = createDbChangesChannel(subs, "voting-dashboard-realtime");

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[useRealtimeVotingDashboard] Error removing channel:", err);
      }
    };
  }, [debounced]);
}
