// ============================================================
// clean-schedule.js (RUN FROM ROOT FOLDER)
// Run this manually using: node clean-schedule.js
// ============================================================

import { fileURLToPath } from 'url';

const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";

const CRICKET_API_KEY = "f11db63d-469c-4694-beed-3567c4de6fdd"; 
const IPL_SERIES_ID   = "87c62aac-bc3c-4738-ab93-19da0690488f";

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

const sbFetch = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
    },
    method: opts.method || "GET",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status !== 204 ? await res.json() : null;
};

const runClean = async () => {
  console.log("Fetching official IPL 2026 schedule from API...");
  const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`);
  const seriesData = await seriesRes.json();
  const apiMatches = seriesData?.data?.matchList || [];

  // Create a strict set of matches from the official API
  const officialSet = new Set();
  apiMatches.forEach(m => {
    if (!m.teams || m.teams.length < 2) return;
    const t1 = normaliseTeam(m.teams[0]);
    const t2 = normaliseTeam(m.teams[1]);
    const teams = [t1, t2].sort();
    const dateStr = m.dateTimeGMT.split("T")[0];
    officialSet.add(`${teams[0]} vs ${teams[1]} on ${dateStr}`);
  });

  console.log(`API returned ${officialSet.size} unique matches.`);

  console.log("\nFetching matches from your Database...");
  const dbMatches = await sbFetch("daily_matches?select=*");
  console.log(`Database returned ${dbMatches.length} total rows.`);

  const dbGroups = {};
  
  for (const dbm of dbMatches) {
    let t1 = normaliseTeam(dbm.team1);
    let t2 = normaliseTeam(dbm.team2);
    
    // Skip TBD playoff games to be safe
    if (t1.includes("TBD") || t2.includes("TBD")) continue;

    const teams = [t1, t2].sort();
    const dateStr = dbm.match_date.split("T")[0];
    const sig = `${teams[0]} vs ${teams[1]} on ${dateStr}`;

    if (!dbGroups[sig]) dbGroups[sig] = [];
    dbGroups[sig].push(dbm);
  }

  let deletedCount = 0;

  for (const [sig, matches] of Object.entries(dbGroups)) {
    // 1. If this match doesn't exist in the API AT ALL (wrong date)
    if (!officialSet.has(sig)) {
      console.log(`❌ FAKE/WRONG DATE MATCH FOUND: ${sig}`);
      for (const m of matches) {
        try {
          await sbFetch(`daily_matches?id=eq.${m.id}`, { method: "DELETE", prefer: "return=minimal" });
          console.log(`   -> Deleted safely from DB!`);
          deletedCount++;
        } catch (e) {
          console.log(`   -> ⚠️ Could not delete (Probably has predictions attached).`);
        }
      }
    } 
    // 2. If it DOES exist in API, but there are DUPLICATES in the DB
    else if (matches.length > 1) {
      console.log(`⚠️ EXACT DUPLICATE FOUND: ${sig} (${matches.length} rows)`);
      // Keep the first one, try to delete the rest
      for (let i = 1; i < matches.length; i++) {
        try {
          await sbFetch(`daily_matches?id=eq.${matches[i].id}`, { method: "DELETE", prefer: "return=minimal" });
          console.log(`   -> Deleted duplicate safely!`);
          deletedCount++;
        } catch (e) {
          // If deletion fails due to foreign keys, try deleting the OTHER empty one instead!
          console.log(`   -> ⚠️ Could not delete duplicate ${i}. Trying to delete the empty original instead...`);
          try {
            await sbFetch(`daily_matches?id=eq.${matches[0].id}`, { method: "DELETE", prefer: "return=minimal" });
            console.log(`   -> Deleted the original empty one instead. Safely resolved!`);
            deletedCount++;
          } catch (e2) {
             console.log(`   -> ⚠️ Both have predictions. Cannot delete either.`);
          }
        }
      }
    }
  }

  console.log(`\n🎉 CLEANUP COMPLETE! Deleted ${deletedCount} bad/duplicate matches.`);
  console.log("Go check your live app now, the RR vs CSK match should be perfectly visible in the top 3 tabs!");
};

if (process.argv[1] === fileURLToPath(import.meta.url)) { runClean(); }