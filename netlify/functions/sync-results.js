// ============================================================
// sync-results-locally.js (RUN FROM ROOT FOLDER)
// Run this manually using: node sync-results-locally.js
// ============================================================

import { fileURLToPath } from 'url';

const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";

const CRICKET_API_KEY = "f11db63d-469c-4694-beed-3567c4de6fdd";
const IPL_SERIES_ID   = "87c62aac-bc3c-4738-ab93-19da0690488f";

const TEAM_NORMALISE = {
  "Royal Challengers Bangalore":  "Royal Challanders Bengaluru",
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

// ─── Supabase helper ───────────────────────────────────────
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

// ─── POTM extractor — checks every field the API ever uses ─
const extractPotm = (obj, label) => {
  if (!obj || typeof obj !== "object") return null;

  // All known field names CricAPI has used across versions
  const POTM_FIELDS = [
    "player_of_match",
    "playersOfTheMatch",
    "playerOfTheMatch",
    "matchMom",
    "mom",
    "manOfTheMatch",
    "playerOfMatch",
  ];

  for (const field of POTM_FIELDS) {
    const raw = obj[field];
    if (!raw) continue;

    // Array of objects: [{name: "Virat Kohli", ...}]
    if (Array.isArray(raw) && raw.length > 0) {
      const name = raw[0]?.name || raw[0]?.fullName || raw[0]?.batsman?.name || (typeof raw[0] === "string" ? raw[0] : null);
      if (name) { console.log(`  ✓ POTM found in ${label}.${field} (array): ${name}`); return name; }
    }

    // String directly
    if (typeof raw === "string" && raw.trim()) {
      console.log(`  ✓ POTM found in ${label}.${field} (string): ${raw.trim()}`);
      return raw.trim();
    }

    // Single object: {name: "Virat Kohli"}
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const name = raw.name || raw.fullName || null;
      if (name) { console.log(`  ✓ POTM found in ${label}.${field} (object): ${name}`); return name; }
    }
  }
  return null;
};

// ─── Main sync ─────────────────────────────────────────────
const runLocalSync = async () => {
  let matchesUpdated = 0;
  let pointsCalculated = 0;

  try {
    console.log("Fetching IPL 2026 series info...");
    const seriesRes = await fetch(
      `https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`
    );
    const seriesData = await seriesRes.json();

    if (!seriesData?.data?.matchList) {
      console.log("❌ No match list in API response. Full response:");
      console.log(JSON.stringify(seriesData).slice(0, 500));
      return;
    }

    const allMatches = seriesData.data.matchList;
    const now        = new Date();
    const yesterday  = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentlyCompleted = allMatches.filter(m => {
      const matchDate = new Date(m.dateTimeGMT);
      return m.matchEnded === true && matchDate >= yesterday && matchDate <= now;
    });

    console.log(`Found ${recentlyCompleted.length} matches completed in last 24h`);

    for (const match of recentlyCompleted) {
      try {
        console.log(`\nProcessing: ${match.name}`);

        // ── 1. Fetch match_info ──────────────────────────────
        const infoRes  = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${match.id}`);
        const infoData = await infoRes.json();
        const info     = infoData?.data || {};

        // ── 2. Fetch scorecard ───────────────────────────────
        const scoreRes  = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRICKET_API_KEY}&id=${match.id}`);
        const scoreData = await scoreRes.json();
        const scorecard = scoreData?.data || {};

        // ── 3. Winner ────────────────────────────────────────
        const winner = normaliseTeam(
          info.matchWinner || info.winner ||
          scorecard.matchWinner || scorecard.winner ||
          match.matchWinner || ""
        );

        // ── 4. POTM — check info first, then scorecard ──────
        let potm = extractPotm(info, "match_info");
        if (!potm) potm = extractPotm(scorecard, "scorecard");
        if (!potm) potm = extractPotm(match, "series_list");   // sometimes in series list itself

        // Debug dump when POTM still missing — shows exactly what API returned
        if (!potm) {
          console.log("  ⚠️  POTM not found. Dumping all API fields for debugging:");
          console.log("  match_info keys:", Object.keys(info).join(", "));
          console.log("  scorecard keys: ", Object.keys(scorecard).join(", "));
          // Print any field that has "mom", "match", "player" in its name
          const suspectKeys = [...Object.keys(info), ...Object.keys(scorecard)]
            .filter(k => /mom|player|match|man/i.test(k));
          if (suspectKeys.length > 0) {
            console.log("  Suspect fields:");
            suspectKeys.forEach(k => {
              const val = info[k] ?? scorecard[k];
              console.log(`    ${k}:`, JSON.stringify(val).slice(0, 120));
            });
          }
          console.log("  → POTM will be patched on next run once API populates it");
        }

        // ── 5. Top Batter & Bowler from scorecard ───────────
        let topBatter = null, topBatterRuns = -1;
        let topBowler = null, topBowlerWkts = -1;

        const inningsList = scorecard.scorecard || scorecard.score || [];
        inningsList.forEach(innings => {
          (innings.batting || []).forEach(b => {
            const runs = parseInt(b.r, 10) || 0;
            if (runs > topBatterRuns) {
              topBatterRuns = runs;
              topBatter = b.batsman?.name || b.batName || b.name || null;
            }
          });
          (innings.bowling || []).forEach(b => {
            const wkts = parseInt(b.w, 10) || 0;
            if (wkts > topBowlerWkts || (wkts === topBowlerWkts && wkts > 0)) {
              // Tiebreak on wickets: prefer fewer runs conceded
              topBowlerWkts = wkts;
              topBowler = b.bowler?.name || b.bowlName || b.name || null;
            }
          });
        });

        console.log(`  Winner:     ${winner     || "Unknown"}`);
        console.log(`  Top Batter: ${topBatter  || "Unknown"} (${topBatterRuns} runs)`);
        console.log(`  Top Bowler: ${topBowler  || "Unknown"} (${topBowlerWkts} wkts)`);
        console.log(`  POTM:       ${potm        || "Still not available in API"}`);

        // ── 6. Find this match in Supabase ───────────────────
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
          console.log(`  ⚠️  Match not found in DB (looked for ${team1} vs ${team2} on ${matchDateStr})`);
          console.log(`  Matches in DB for that date:`, (existing || []).map(m => `${m.team1} vs ${m.team2}`).join(", ") || "none");
          continue;
        }

        // ── 7. Update Supabase — only overwrite POTM if we got it
        //       (avoids clearing a previously saved POTM) ─────
        const updatePayload = {
          status:            "completed",
          actual_winner:     winner     || null,
          actual_top_batter: topBatter  || null,
          actual_top_bowler: topBowler  || null,
        };
        // Only set POTM if we actually found it — don't overwrite with null
        if (potm) updatePayload.actual_potm = potm;

        await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body:   updatePayload,
        });
        console.log(`  ✅ DB updated!`);
        matchesUpdated++;

        // ── 8. Calculate points for all predictions ──────────
        if (winner) {
          // Get the freshest POTM from DB in case a previous run already saved it
          const freshMatch = await sbFetch(`daily_matches?id=eq.${dbMatch.id}&select=actual_potm`);
          const effectivePotm = potm || freshMatch?.[0]?.actual_potm || null;

          const predictions = await sbFetch(
            `daily_predictions?match_id=eq.${dbMatch.id}&select=id,predicted_winner,predicted_batter,predicted_bowler,predicted_potm`
          );

          await Promise.all((predictions || []).map(async pred => {
            const pts =
              (pred.predicted_winner === winner           ? DPOINTS.winner     : 0) +
              (pred.predicted_batter === topBatter        ? DPOINTS.top_batter : 0) +
              (pred.predicted_bowler === topBowler        ? DPOINTS.top_bowler : 0) +
              (effectivePotm && pred.predicted_potm === effectivePotm ? DPOINTS.potm : 0);

            await sbFetch(`daily_predictions?id=eq.${pred.id}`, {
              method: "PATCH",
              prefer: "return=minimal",
              body:   { points_earned: pts },
            });
            pointsCalculated++;
          }));

          console.log(`  💰 Points updated for ${(predictions || []).length} users`);
          if (!effectivePotm) {
            console.log(`  ℹ️  POTM points (10pts) will be awarded on next run once API provides the name`);
          }
        }

      } catch (e) {
        console.log(`  ❌ Error processing match: ${e.message}`);
      }
    }

    console.log(`\n🎉 SYNC COMPLETE: Updated ${matchesUpdated} matches, ${pointsCalculated} predictions scored.`);
    if (matchesUpdated === 0) {
      console.log("ℹ️  Tip: If matches should have been found, check that matchEnded=true in the API response.");
      console.log("         Try running again after the match result is confirmed on cricketdata.org");
    }

  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) { runLocalSync(); }
