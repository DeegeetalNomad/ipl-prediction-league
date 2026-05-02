// ============================================================
// sync-results-locally.js
// NORMAL RUN:  node sync-results-locally.js
// PATCH POTM (Single Match):  node sync-results-locally.js --potm "Jacob Duffy" --date 2026-03-28
// PATCH POTM (Double Header): node sync-results-locally.js --potm "Virat Kohli" --date 2026-04-05 --team "Royal Challengers Bengaluru"
// ============================================================

import { fileURLToPath } from 'url';

const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";
const CRICKET_API_KEY = "f11db63d-469c-4694-beed-3567c4de6fdd";
const IPL_SERIES_ID   = "87c62aac-bc3c-4738-ab93-19da0690488f";

const TEAM_NORMALISE = {
  "Royal Challengers Bangalore":  "Royal Challengers Bengaluru",
  "Royal Challengers Bengaluru":  "Royal Challengers Bengaluru",
  "Chennai Super Kings":          "Chennai Super Kings",
  "Mumbai Indians":               "Mumbai Indians",
  "Kolkata Knight Riders":        "Kolkata Knight Riders",
  "Sunrisers Hyderabad":          "Sunrisers Hyderabad",
  "Delhi Capitals":               "Delhi Capitals",
  "Lucknow Super Giants":         "Lucknow Super Giants",
  "Rajasthan Royals":             "Rajasthan Royals",
  "Gujarat Titans":               "Gujarat Titans",
  "Punjab Kings":                 "Punjab Kings",
};

const normaliseTeam = (name) => TEAM_NORMALISE[name] || name;
const DPOINTS = { winner: 10, top_batter: 8, top_bowler: 8, potm: 10 };

// ─── Supabase helper ────────────────────────────────────────
const sbFetch = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey:         SB_KEY,
      Authorization:  `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer:         opts.prefer || "return=representation",
    },
    method: opts.method || "GET",
    body:   opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
};

// ─── Parse CLI args ─────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const potmOverride = getArg("--potm");   // e.g. "Jacob Duffy"
const dateOverride = getArg("--date");   // e.g. "2026-03-28"
const teamOverride = getArg("--team");   // e.g. "Royal Challengers Bengaluru"

// ─── MODE: Manual POTM patch ────────────────────────────────
const patchPotm = async (potmName, dateStr, teamName) => {
  console.log(`\n🔧 POTM PATCH MODE`);
  console.log(`   Player: ${potmName}`);
  console.log(`   Date:   ${dateStr}`);
  if (teamName) console.log(`   Team filter: ${teamName}`);

  // Find the match in DB for that date
  const matches = await sbFetch(
    `daily_matches?match_date=gte.${dateStr}T00:00:00Z&match_date=lte.${dateStr}T23:59:59Z&status=eq.completed`
  );

  if (!matches || matches.length === 0) {
    console.log(`\n❌ No completed match found for ${dateStr}.`);
    console.log(`   Check the date or make sure the main sync has already run first.`);
    return;
  }

  let targetMatches = matches;

  // If a team is provided, filter the matches down to only the one involving that team
  if (teamName) {
    const normTeam = normaliseTeam(teamName);
    targetMatches = matches.filter(m => m.team1 === normTeam || m.team2 === normTeam);
    
    if (targetMatches.length === 0) {
      console.log(`\n❌ Found matches on ${dateStr}, but none involving "${normTeam}".`);
      return;
    }
  }

  // SAFETY NET: If there are multiple matches on this date and no team was specified, ABORT!
  if (targetMatches.length > 1) {
    console.log(`\n🚨 SAFETY ABORT: There are ${targetMatches.length} matches completed on ${dateStr}!`);
    console.log(`   To avoid overwriting the POTM for BOTH matches, please run the command again`);
    console.log(`   and include the --team flag to specify which match you want to patch.\n`);
    console.log(`   Example: node sync-results-locally.js --potm "${potmName}" --date ${dateStr} --team "${targetMatches[0].team1}"`);
    return;
  }

  // Proceed with patching the single target match
  for (const dbMatch of targetMatches) {
    console.log(`\n   Patching: ${dbMatch.team1} vs ${dbMatch.team2}`);

    // Save POTM to DB
    await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body:   { actual_potm: potmName },
    });

    // Recalculate points for all predictions for this match
    const predictions = await sbFetch(
      `daily_predictions?match_id=eq.${dbMatch.id}&select=id,predicted_winner,predicted_batter,predicted_bowler,predicted_potm`
    );

    let potmWinners = 0;
    await Promise.all((predictions || []).map(async pred => {
      const pts =
        (pred.predicted_winner === dbMatch.actual_winner     ? DPOINTS.winner     : 0) +
        (pred.predicted_batter === dbMatch.actual_top_batter ? DPOINTS.top_batter : 0) +
        (pred.predicted_bowler === dbMatch.actual_top_bowler ? DPOINTS.top_bowler : 0) +
        (pred.predicted_potm   === potmName                  ? DPOINTS.potm       : 0);

      if (pred.predicted_potm === potmName) potmWinners++;

      await sbFetch(`daily_predictions?id=eq.${pred.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body:   { points_earned: pts },
      });
    }));

    console.log(`   ✅ POTM saved: "${potmName}"`);
    console.log(`   💰 Points recalculated for ${(predictions || []).length} users`);
    console.log(`   🎉 ${potmWinners} user(s) got the POTM bonus (+10 pts)`);
  }
};

// ─── MODE: Normal nightly sync ──────────────────────────────
const runLocalSync = async () => {
  let matchesUpdated = 0;
  let pointsCalculated = 0;

  try {
    console.log("Fetching IPL 2026 series info...");
    const seriesRes  = await fetch(
      `https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`
    );
    const seriesData = await seriesRes.json();

    if (!seriesData?.data?.matchList) {
      console.log("❌ No match list returned by API.");
      return;
    }

    const now       = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentlyCompleted = seriesData.data.matchList.filter(m => {
      const d = new Date(m.dateTimeGMT);
      return m.matchEnded === true && d >= yesterday && d <= now;
    });

    console.log(`Found ${recentlyCompleted.length} match(es) completed in last 24h`);

    for (const match of recentlyCompleted) {
      try {
        console.log(`\nProcessing: ${match.name}`);

        // Fetch match info + scorecard
        const [infoData, scoreData] = await Promise.all([
          fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${match.id}`).then(r => r.json()),
          fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRICKET_API_KEY}&id=${match.id}`).then(r => r.json()),
        ]);
        const info      = infoData?.data  || {};
        const scorecard = scoreData?.data || {};

        // Winner
        const winner = normaliseTeam(
          info.matchWinner || info.winner ||
          scorecard.matchWinner || match.matchWinner || ""
        );

        // POTM — try every known field name
        const POTM_FIELDS = ["player_of_match","playersOfTheMatch","playerOfTheMatch","matchMom","mom","manOfTheMatch","playerOfMatch"];
        let potm = null;
        for (const src of [info, scorecard, match]) {
          if (potm) break;
          for (const field of POTM_FIELDS) {
            const raw = src[field];
            if (!raw) continue;
            if (Array.isArray(raw) && raw.length > 0) {
              potm = raw[0]?.name || raw[0]?.fullName || (typeof raw[0] === "string" ? raw[0] : null);
            } else if (typeof raw === "string" && raw.trim()) {
              potm = raw.trim();
            } else if (raw?.name) {
              potm = raw.name;
            }
            if (potm) { console.log(`  ✓ POTM from API (${field}): ${potm}`); break; }
          }
        }

        // Top Batter & Bowler
        let topBatter = null, topBatterRuns = -1;
        let topBowler = null, topBowlerWkts = -1;
        const inningsList = scorecard.scorecard || scorecard.score || [];
        inningsList.forEach(innings => {
          (innings.batting || []).forEach(b => {
            const runs = parseInt(b.r, 10) || 0;
            if (runs > topBatterRuns) { topBatterRuns = runs; topBatter = b.batsman?.name || b.batName || b.name || null; }
          });
          (innings.bowling || []).forEach(b => {
            const wkts = parseInt(b.w, 10) || 0;
            if (wkts > topBowlerWkts) { topBowlerWkts = wkts; topBowler = b.bowler?.name || b.bowlName || b.name || null; }
          });
        });

        console.log(`  Winner:     ${winner     || "Unknown"}`);
        console.log(`  Top Batter: ${topBatter  || "Unknown"} (${topBatterRuns} runs)`);
        console.log(`  Top Bowler: ${topBowler  || "Unknown"} (${topBowlerWkts} wkts)`);
        if (!potm) {
          console.log(`  POTM:       ⚠️  Not in API — run with --potm flag after checking match result`);
          console.log(`              e.g. node sync-results-locally.js --potm "Jacob Duffy" --date ${match.dateTimeGMT.split("T")[0]}`);
        } else {
          console.log(`  POTM:       ${potm}`);
        }

        // Find match in DB
        const matchDateStr = match.dateTimeGMT.split("T")[0];
        const team1 = normaliseTeam(match.teams?.[0] || "");
        const team2 = normaliseTeam(match.teams?.[1] || "");
        const existing = await sbFetch(
          `daily_matches?match_date=gte.${matchDateStr}T00:00:00Z&match_date=lte.${matchDateStr}T23:59:59Z`
        );
        const dbMatch = (existing || []).find(m =>
          (m.team1 === team1 && m.team2 === team2) ||
          (m.team1 === team2 && m.team2 === team1)
        );

        if (!dbMatch) {
          console.log(`  ⚠️  Not found in DB: ${team1} vs ${team2} on ${matchDateStr}`);
          continue;
        }

        // Update DB (never overwrite existing POTM with null)
        const updatePayload = {
          status:            "completed",
          actual_winner:     winner    || null,
          actual_top_batter: topBatter || null,
          actual_top_bowler: topBowler || null,
        };
        if (potm) updatePayload.actual_potm = potm;

        await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, {
          method: "PATCH", prefer: "return=minimal", body: updatePayload,
        });
        console.log(`  ✅ DB updated!`);
        matchesUpdated++;

        // Points (use existing DB potm if API didn't return one)
        if (winner) {
          const fresh = await sbFetch(`daily_matches?id=eq.${dbMatch.id}&select=actual_potm`);
          const effectivePotm = potm || fresh?.[0]?.actual_potm || null;

          const predictions = await sbFetch(
            `daily_predictions?match_id=eq.${dbMatch.id}&select=id,predicted_winner,predicted_batter,predicted_bowler,predicted_potm`
          );
          await Promise.all((predictions || []).map(async pred => {
            const pts =
              (pred.predicted_winner === winner            ? DPOINTS.winner     : 0) +
              (pred.predicted_batter === topBatter         ? DPOINTS.top_batter : 0) +
              (pred.predicted_bowler === topBowler         ? DPOINTS.top_bowler : 0) +
              (effectivePotm && pred.predicted_potm === effectivePotm ? DPOINTS.potm : 0);
            await sbFetch(`daily_predictions?id=eq.${pred.id}`, {
              method: "PATCH", prefer: "return=minimal", body: { points_earned: pts },
            });
            pointsCalculated++;
          }));
          console.log(`  💰 Points updated for ${(predictions || []).length} users`);
        }

      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
      }
    }

    console.log(`\n🎉 SYNC COMPLETE: ${matchesUpdated} match(es) updated, ${pointsCalculated} predictions scored.`);

  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  }
};

// ─── Entry point ────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (potmOverride && dateOverride) {
    patchPotm(potmOverride, dateOverride, teamOverride);
  } else if (potmOverride || dateOverride) {
    console.log("❌ Please provide both --potm \"Player Name\" and --date YYYY-MM-DD");
  } else {
    runLocalSync();
  }
}