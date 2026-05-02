// ============================================================
// sync-results-locally.js
// NORMAL SYNC: node sync-results-locally.js
// MANUAL FIX:  node sync-results-locally.js --date 2026-05-01 --potm "Sanju Samson" --batter "Riyan Parag" --bowler "Trent Boult"
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
const safeString = (str) => (str || "").trim().toLowerCase();
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
const dateOverride   = getArg("--date");
const potmOverride   = getArg("--potm");
const batterOverride = getArg("--batter");
const bowlerOverride = getArg("--bowler");
const teamOverride   = getArg("--team");

// ─── MODE: Manual DB Patch & Recalculate ────────────────────
const patchManual = async (dateStr) => {
  console.log(`\n🔧 MANUAL OVERRIDE MODE for ${dateStr}`);
  
  const matches = await sbFetch(`daily_matches?match_date=gte.${dateStr}T00:00:00Z&match_date=lte.${dateStr}T23:59:59Z`);

  if (!matches || matches.length === 0) {
    console.log(`❌ No match found in database for ${dateStr}.`);
    return;
  }

  let targetMatches = matches;
  if (teamOverride) {
    const normTeam = normaliseTeam(teamOverride);
    targetMatches = matches.filter(m => m.team1 === normTeam || m.team2 === normTeam);
  }

  if (targetMatches.length > 1) {
    console.log(`🚨 SAFETY ABORT: Multiple matches found on ${dateStr}! Run again and include the --team flag.`);
    return;
  }

  for (const dbMatch of targetMatches) {
    console.log(`\n   Patching: ${dbMatch.team1} vs ${dbMatch.team2}`);

    // Build the payload with whatever you typed in the terminal
    const updatePayload = { status: "completed" };
    if (potmOverride)   updatePayload.actual_potm = potmOverride;
    if (batterOverride) updatePayload.actual_top_batter = batterOverride;
    if (bowlerOverride) updatePayload.actual_top_bowler = bowlerOverride;

    // 1. Save new data to database
    if (Object.keys(updatePayload).length > 1) {
      await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body:   updatePayload,
      });
      console.log(`   ✅ Database updated with manual entries!`);
    }

    // 2. Determine the final "truth" to score against
    const finalWinner = dbMatch.actual_winner;
    const finalPotm   = potmOverride   || dbMatch.actual_potm;
    const finalBatter = batterOverride || dbMatch.actual_top_batter;
    const finalBowler = bowlerOverride || dbMatch.actual_top_bowler;

    // 3. Recalculate points for all users
    const predictions = await sbFetch(`daily_predictions?match_id=eq.${dbMatch.id}&select=id,predicted_winner,predicted_batter,predicted_bowler,predicted_potm`);

    await Promise.all((predictions || []).map(async pred => {
      const isPotmMatch = finalPotm && safeString(pred.predicted_potm) === safeString(finalPotm);
      
      const pts =
        (pred.predicted_winner === finalWinner ? DPOINTS.winner     : 0) +
        (pred.predicted_batter === finalBatter ? DPOINTS.top_batter : 0) +
        (pred.predicted_bowler === finalBowler ? DPOINTS.top_bowler : 0) +
        (isPotmMatch                           ? DPOINTS.potm       : 0);

      await sbFetch(`daily_predictions?id=eq.${pred.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body:   { points_earned: pts },
      });
    }));

    console.log(`   💰 Points perfectly recalculated for ${(predictions || []).length} users based on your overrides.`);
  }
};

// ─── MODE: Normal API Sync ──────────────────────────────────
const runLocalSync = async () => {
  // ... [Normal Sync Logic - Keep your existing local sync code here if you ever want to run it locally, 
  // but honestly, since Netlify handles this now, you only really need this script for the manual patch!]
  console.log("Local Sync triggered. (Note: Netlify handles this automatically now!)");
  console.log("To manually patch a match, run with flags: --date YYYY-MM-DD --batter 'Name' --bowler 'Name'");
};

// ─── Entry point ────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (dateOverride) {
    patchManual(dateOverride);
  } else {
    runLocalSync();
  }
}