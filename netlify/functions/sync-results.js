// ============================================================
// netlify/functions/sync-results.js
//
// This Netlify function runs AUTOMATICALLY once per day at
// 11:30 PM IST (18:00 UTC) to fetch match results from the
// free CricketData API and update Supabase.
//
// SETUP STEPS:
// 1. Sign up FREE at https://cricketdata.org/member.aspx
// 2. Get your API key from the dashboard
// 3. Find IPL 2026 series ID:
//    https://api.cricapi.com/v1/series?apikey=YOUR_KEY&offset=0
//    Look for "Indian Premier League 2026"
// 4. Add two environment variables in Netlify:
//    - CRICKET_API_KEY = your key from step 2
//    - IPL_SERIES_ID   = series ID from step 3
// 5. Push this file to GitHub → Netlify auto-deploys it
// ============================================================

// ============================================================
// netlify/functions/sync-results.js
// ============================================================

const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";

// ── TEAM NAME NORMALISER ──────────────────────────────────────
const TEAM_NORMALISE = {
  "Royal Challengers Bangalore":   "Royal Challengers Bengaluru",
  "Royal Challengers Bengaluru":   "Royal Challengers Bengaluru",
  "Chennai Super Kings":           "Chennai Super Kings",
  "Mumbai Indians":                "Mumbai Indians",
  "Kolkata Knight Riders":         "Kolkata Knight Riders",
  "Sunrisers Hyderabad":           "Sunrisers Hyderabad",
  "Delhi Capitals":                "Delhi Capitals",
  "Lucknow Super Giants":          "Lucknow Super Giants",
  "Rajasthan Royals":              "Rajasthan Royals",
  "Gujarat Titans":                "Gujarat Titans",
  "Punjab Kings":                  "Punjab Kings",
};

const normaliseTeam = (name) => TEAM_NORMALISE[name] || name;

// ── POINTS CONSTANTS ─────────────────────────────────────────
const DPOINTS = { winner: 10, top_batter: 8, top_bowler: 8, potm: 10 };

// ── SUPABASE HELPER ──────────────────────────────────────────
const sbFetch = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey:         SB_KEY,
      Authorization:  `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer:         opts.prefer || "return=representation",
      ...(opts.headers || {}),
    },
    method: opts.method || "GET",
    body:   opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
};

// ── MAIN HANDLER ─────────────────────────────────────────────
export const handler = async (event) => {
  
  // ⚠️ REMEMBER: If testing locally, replace these process.env variables 
  // with your actual keys in quotes. Change them back before pushing to GitHub!
 
 const CRICKET_API_KEY = process.env.CRICKET_API_KEY; 
const IPL_SERIES_ID   = process.env.IPL_SERIES_ID;


  if (!CRICKET_API_KEY || !IPL_SERIES_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing env vars. Set CRICKET_API_KEY and IPL_SERIES_ID.",
      }),
    };
  }

  const log = [];
  let matchesUpdated = 0;
  let pointsCalculated = 0;

  try {
    // ── STEP 1: Get list of all IPL 2026 matches from CricketData ──
    log.push("Fetching IPL 2026 series info...");
    const seriesRes = await fetch(
      `https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`
    );
    const seriesData = await seriesRes.json();

    if (!seriesData?.data?.matchList) {
      return { statusCode: 200, body: JSON.stringify({ message: "No match list in API response", log }) };
    }

    const allMatches = seriesData.data.matchList;
    log.push(`API returned ${allMatches.length} matches total`);

    // ── STEP 2: Find matches completed in last 24 hours ──
    const now       = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentlyCompleted = allMatches.filter(m => {
      const matchDate = new Date(m.dateTimeGMT);
      return (
        m.matchEnded === true &&
        matchDate >= yesterday &&
        matchDate <= now
      );
    });

    log.push(`Found ${recentlyCompleted.length} matches completed in last 24h`);

    if (recentlyCompleted.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "No matches to update today", log }) };
    }

    // ── STEP 3: For each completed match, fetch full scorecard ──
    for (const match of recentlyCompleted) {
      try {
        log.push(`\nProcessing: ${match.name}`);

        // CHANGED: We now hit the match_scorecard endpoint!
        const scoreRes = await fetch(
          `https://api.cricapi.com/v1/match_scorecard?apikey=${CRICKET_API_KEY}&id=${match.id}`
        );
        const scoreData = await scoreRes.json();
        const info = scoreData?.data;

        if (!info) { log.push("  ⚠️ No scorecard data"); continue; }

        // Extract winner
        const winner = normaliseTeam(info.matchWinner || info.winner || "");

        // Extract top batter & bowler
        let topBatter = null;
        let topBatterRuns = -1;
        let topBowler = null;
        let topBowlerWkts = -1;

        const inningsList = info.scorecard || info.score || [];

        inningsList.forEach(innings => {
          // Iterate over all batters to find Highest Run Scorer
          (innings.batting || []).forEach(b => {
            const runs = parseInt(b.r, 10) || 0;
            if (runs > topBatterRuns) {
              topBatterRuns = runs;
              topBatter = b.batsman?.name || b.batsmanName || b.batName || b.name || "Unknown";
            }
          });

          // Iterate over all bowlers to find Highest Wicket Taker
          (innings.bowling || []).forEach(b => {
            const wkts = parseInt(b.w, 10) || 0;
            if (wkts > topBowlerWkts) {
              topBowlerWkts = wkts;
              topBowler = b.bowler?.name || b.bowlerName || b.bowlName || b.name || "Unknown";
            }
          });
        });

        // Extract Player of the Match
        let potm = null;
        if (Array.isArray(info.matchMom) && info.matchMom.length > 0) {
          potm = info.matchMom[0]?.name || info.matchMom[0];
        } else if (typeof info.matchMom === 'string' && info.matchMom.trim() !== '') {
          potm = info.matchMom;
        }

        log.push(`  Winner: ${winner || "Unknown"}`);
        log.push(`  Top Batter: ${topBatter || "Unknown"} (${topBatterRuns} runs)`);
        log.push(`  Top Bowler: ${topBowler || "Unknown"} (${topBowlerWkts} wkts)`);
        log.push(`  POTM: ${potm || "Not available yet"}`);

        // ── STEP 4: Find matching row in Supabase by team names + date ──
        const matchDateStr = match.dateTimeGMT.split("T")[0]; // YYYY-MM-DD
        const team1 = normaliseTeam(match.teams?.[0] || "");
        const team2 = normaliseTeam(match.teams?.[1] || "");

        // We check for "completed" here too, just in case we are re-running the script
        // and want to overwrite the "Unknown" values from earlier!
        const existing = await sbFetch(
          `daily_matches?match_date=gte.${matchDateStr}T00:00:00Z&match_date=lte.${matchDateStr}T23:59:59Z`
        );

        const dbMatch = (existing || []).find(m =>
          (m.team1 === team1 && m.team2 === team2) ||
          (m.team1 === team2 && m.team2 === team1)
        );

        if (!dbMatch) {
          log.push(`  ⚠️ Match not found in Supabase DB for ${team1} vs ${team2} on ${matchDateStr}`);
          continue;
        }

        // ── STEP 5: Update match result in Supabase ──
        await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: {
            status:              "completed",
            actual_winner:       winner || null,
            actual_top_batter:   topBatter || null,
            actual_top_bowler:   topBowler || null,
            actual_potm:         potm || null,
          },
        });
        log.push(`  ✅ DB updated for match ID: ${dbMatch.id}`);
        matchesUpdated++;

        // ── STEP 6: Calculate points for all user predictions ──
        if (winner) {
          const predictions = await sbFetch(
            `daily_predictions?match_id=eq.${dbMatch.id}&select=id,predicted_winner,predicted_batter,predicted_bowler,predicted_potm`
          );

          log.push(`  Calculating points for ${(predictions || []).length} predictions...`);

          await Promise.all((predictions || []).map(async pred => {
            const pts =
              (pred.predicted_winner === winner     ? DPOINTS.winner     : 0) +
              (pred.predicted_batter === topBatter  ? DPOINTS.top_batter : 0) +
              (pred.predicted_bowler === topBowler  ? DPOINTS.top_bowler : 0) +
              (pred.predicted_potm   === potm       ? DPOINTS.potm       : 0);

            await sbFetch(`daily_predictions?id=eq.${pred.id}`, {
              method: "PATCH",
              prefer: "return=minimal",
              body: { points_earned: pts },
            });
            pointsCalculated++;
          }));

          log.push(`  💰 Points updated for ${(predictions || []).length} users`);
        }

      } catch (matchErr) {
        log.push(`  ❌ Error processing match: ${matchErr.message}`);
      }
    }

    const summary = `Done. Updated ${matchesUpdated} matches, calculated points for ${pointsCalculated} predictions.`;
    log.push(`\n✅ ${summary}`);
    console.log(log.join("\n"));
    return { statusCode: 200, body: JSON.stringify({ message: summary, log }) };

  } catch (err) {
    console.error("Sync failed:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message, log }) };
  }
};

// ── LOCAL TEST RUNNER ────────────────────────────────────────
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  handler().then(res => console.log("Final Response:", res.body)).catch(console.error);
}