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
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
};

const runScheduleFix = async () => {
  console.log("Fetching official IPL schedule from CricAPI...");
  
  // 1. Fetch API matches
  const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`);
  const seriesData = await seriesRes.json();
  const apiMatches = seriesData?.data?.matchList || [];

  if (apiMatches.length === 0) {
    console.log("❌ Failed to get matches from API.");
    return;
  }

  // 2. Fetch upcoming matches from Supabase (from today onwards)
  // Getting current date in YYYY-MM-DD format based on local time
  const today = new Date().toISOString().split('T')[0];
  console.log(`Fetching Supabase matches from ${today} onwards...`);
  
  const dbMatches = await sbFetch(`daily_matches?match_date=gte.${today}T00:00:00Z&order=match_date.asc`);
  if (!dbMatches || dbMatches.length === 0) {
    console.log("❌ No upcoming matches found in DB.");
    return;
  }

  // 3. Group API matches by Date
  const apiByDate = {};
  apiMatches.forEach(m => {
    const dateStr = m.dateTimeGMT.split('T')[0];
    if (!apiByDate[dateStr]) apiByDate[dateStr] = [];
    apiByDate[dateStr].push(m);
  });

  // 4. Group DB matches by Date
  const dbByDate = {};
  dbMatches.forEach(m => {
    const dateStr = m.match_date.split('T')[0];
    if (!dbByDate[dateStr]) dbByDate[dateStr] = [];
    dbByDate[dateStr].push(m);
  });

  let matchesUpdated = 0;

  // 5. Compare and Fix
  for (const dateStr of Object.keys(dbByDate)) {
    const dbs = dbByDate[dateStr];
    const apis = apiByDate[dateStr] || [];

    // Sort by chronological order in case of double-headers
    dbs.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
    apis.sort((a, b) => new Date(a.dateTimeGMT) - new Date(b.dateTimeGMT));

    for (let i = 0; i < dbs.length; i++) {
      const dbMatch = dbs[i];
      const apiMatch = apis[i];

      if (!apiMatch) {
        console.log(`⚠️  No API match found for DB match on ${dateStr}`);
        continue;
      }

      // Normalise API teams so they match your app perfectly
      const correctTeam1 = normaliseTeam(apiMatch.teams[0]);
      const correctTeam2 = normaliseTeam(apiMatch.teams[1]);

      // If the DB is wrong, fix it!
      if (dbMatch.team1 !== correctTeam1 || dbMatch.team2 !== correctTeam2) {
        console.log(`🔧 Fixing ${dateStr}: Replacing [${dbMatch.team1} vs ${dbMatch.team2}] with [${correctTeam1} vs ${correctTeam2}]`);
        
        await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: {
            team1: correctTeam1,
            team2: correctTeam2
          }
        });
        matchesUpdated++;
      } else {
        console.log(`✅ ${dateStr} is already correct: ${correctTeam1} vs ${correctTeam2}`);
      }
    }
  }

  console.log(`\n🎉 SCHEDULE FIX COMPLETE: ${matchesUpdated} match(es) updated successfully!`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runScheduleFix();
}