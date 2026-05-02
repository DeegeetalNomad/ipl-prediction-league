import { fileURLToPath } from 'url';
import crypto from 'crypto'; // We added this to generate unique IDs!

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
  
  const txt = await res.text();
  
  // THE FIX: If Supabase rejects it, print the exact error message!
  if (!res.ok) {
    console.error(`\n❌ SUPABASE REJECTED THE INSERT!`);
    console.error(`Error Details: ${txt}\n`);
    throw new Error(`Supabase error: ${res.status}`);
  }
  
  return txt ? JSON.parse(txt) : null;
};

const runInsert = async () => {
  console.log("Scanning API for missing matches to insert...");
  
  const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`);
  const seriesData = await seriesRes.json();
  const apiMatches = seriesData?.data?.matchList || [];

  const today = new Date().toISOString().split('T')[0];
  const dbMatches = await sbFetch(`daily_matches?match_date=gte.${today}T00:00:00Z`);

  let insertedCount = 0;

  for (const m of apiMatches) {
    const apiDate = m.dateTimeGMT.split('T')[0];
    
    if (apiDate < today) continue;
    if (!m.teams || m.teams.length < 2 || m.name.includes("TBD") || m.name.includes("TBC")) continue;

    const team1 = normaliseTeam(m.teams[0]);
    const team2 = normaliseTeam(m.teams[1]);

    const existsInDb = dbMatches.some(dbM => 
      dbM.match_date.startsWith(apiDate) && 
      ((dbM.team1 === team1 && dbM.team2 === team2) || (dbM.team1 === team2 && dbM.team2 === team1))
    );

    if (!existsInDb) {
      console.log(`➕ Auto-inserting missing match: ${apiDate} -> ${team1} vs ${team2}`);
      
      await sbFetch(`daily_matches`, {
        method: "POST",
        body: {
          id: crypto.randomUUID(), // THE FIX: Generate a unique ID for the new row
          match_date: `${apiDate}T14:00:00Z`, 
          team1: team1,
          team2: team2,
          status: "upcoming"
        }
      });
      insertedCount++;
    }
  }

  console.log(`\n🎉 DONE! Successfully inserted ${insertedCount} missing match(es) into Supabase.`);
};

runInsert();