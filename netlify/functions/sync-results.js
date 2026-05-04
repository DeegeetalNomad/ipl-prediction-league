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
  if (!res.ok) return null;
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
};

// V2 Syntax: Export default async function
export default async (req) => {
  console.log(`\n=========================================`);
  console.log(`🚀 [START] Cloud Sync Job Triggered at ${new Date().toISOString()}`);
  
  try {
    console.log(`📡 [API] Fetching master schedule from CricAPI...`);
    const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`);
    const seriesData = await seriesRes.json();
    
    if (!seriesData?.data?.matchList) {
      console.log(`❌ [API ERROR] No match list returned by CricAPI.`);
      return new Response("No match list", { status: 500 });
    }

    const now = new Date();
    const searchWindow = new Date(now.getTime() - 48 * 60 * 60 * 1000); 

    const completedMatches = seriesData.data.matchList.filter(m => {
      const d = new Date(m.dateTimeGMT);
      return m.matchEnded === true && d >= searchWindow && d <= now;
    });

    console.log(`📊 [LOGIC] Found ${completedMatches.length} completed match(es) in the last 48 hours.`);

    if (completedMatches.length === 0) {
       console.log(`⚠️  [LOGIC] CricAPI says 0 matches have ended.`);
    }

    for (const match of completedMatches) {
      console.log(`\n-----------------------------------------`);
      console.log(`🏏 Processing: ${match.name}`);
      
      const [infoData, scoreData] = await Promise.all([
        fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICKET_API_KEY}&id=${match.id}`).then(r => r.json()),
        fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRICKET_API_KEY}&id=${match.id}`).then(r => r.json()),
      ]);
      
      const info = infoData?.data || {};
      const scorecard = scoreData?.data || {};
      const winner = normaliseTeam(info.matchWinner || info.winner || scorecard.matchWinner || match.matchWinner || "");

      let potm = null;
      const POTM_FIELDS = ["player_of_match","playersOfTheMatch","playerOfTheMatch","matchMom","mom","manOfTheMatch","playerOfMatch"];
      for (const src of [info, scorecard, match]) {
        if (potm) break;
        for (const field of POTM_FIELDS) {
          const raw = src[field];
          if (!raw) continue;
          if (Array.isArray(raw) && raw.length > 0) potm = raw[0]?.name || raw[0]?.fullName || (typeof raw[0] === "string" ? raw[0] : null);
          else if (typeof raw === "string" && raw.trim()) potm = raw.trim();
          else if (raw?.name) potm = raw.name;
          if (potm) break;
        }
      }

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

      console.log(`   --> [API DATA] Winner: ${winner || "MISSING"}`);
      console.log(`   --> [API DATA] POTM: ${potm || "MISSING"}`);
      console.log(`   --> [API DATA] Batter: ${topBatter || "MISSING"} (${topBatterRuns > -1 ? topBatterRuns + ' runs' : 'N/A'})`);
      console.log(`   --> [API DATA] Bowler: ${topBowler || "MISSING"} (${topBowlerWkts > -1 ? topBowlerWkts + ' wkts' : 'N/A'})`);

      const matchDateStr = match.dateTimeGMT.split("T")[0];
      const team1 = normaliseTeam(match.teams?.[0] || "");
      const team2 = normaliseTeam(match.teams?.[1] || "");
      
      const existing = await sbFetch(`daily_matches?match_date=gte.${matchDateStr}T00:00:00Z&match_date=lte.${matchDateStr}T23:59:59Z`);
      const dbMatch = (existing || []).find(m => (m.team1 === team1 && m.team2 === team2) || (m.team1 === team2 && m.team2 === team1));
      
      if (!dbMatch) {
        console.log(`❌ [DB ERROR] Could not find ${team1} vs ${team2} in Supabase for date ${matchDateStr}`);
        continue;
      }

      console.log(`✅ [DB SUCCESS] Found match in Supabase (ID: ${dbMatch.id}). Patching results...`);

      const updatePayload = { status: "completed", actual_winner: winner || null };
      if (potm) updatePayload.actual_potm = potm;
      if (topBatterRuns > -1) updatePayload.actual_top_batter = topBatter;
      if (topBowlerWkts > -1) updatePayload.actual_top_bowler = topBowler;

      await sbFetch(`daily_matches?id=eq.${dbMatch.id}`, { method: "PATCH", prefer: "return=minimal", body: updatePayload });

      if (winner) {
        const fresh = await sbFetch(`daily_matches?id=eq.${dbMatch.id}`);
        const effectivePotm = potm || fresh?.[0]?.actual_potm || null;
        const effectiveBatter = topBatterRuns > -1 ? topBatter : fresh?.[0]?.actual_top_batter;
        const effectiveBowler = topBowlerWkts > -1 ? topBowler : fresh?.[0]?.actual_top_bowler;

        const predictions = await sbFetch(`daily_predictions?match_id=eq.${dbMatch.id}&select=id,predicted_winner,predicted_batter,predicted_bowler,predicted_potm`);
        
        await Promise.all((predictions || []).map(async pred => {
          const isPotmMatch = effectivePotm && safeString(pred.predicted_potm) === safeString(effectivePotm);
          const pts =
            (pred.predicted_winner === winner          ? DPOINTS.winner     : 0) +
            (pred.predicted_batter === effectiveBatter ? DPOINTS.top_batter : 0) +
            (pred.predicted_bowler === effectiveBowler ? DPOINTS.top_bowler : 0) +
            (isPotmMatch                               ? DPOINTS.potm       : 0);
          
          return sbFetch(`daily_predictions?id=eq.${pred.id}`, { method: "PATCH", prefer: "return=minimal", body: { points_earned: pts } });
        }));

        console.log(`💰 [SCORING] Successfully recalculated points for ${(predictions || []).length} users!`);
      } else {
        console.log(`⚠️  [SCORING] Skipped scoring because the API did not provide a Winner yet.`);
      }
    }
    
    console.log(`🏁 [END] Cloud Sync Job Finished Successfully.\n=========================================`);
    return new Response("Sync Complete", { status: 200 });
  } catch (err) {
    console.log(`💥 [FATAL ERROR] Script crashed: ${err.message}`);
    return new Response(err.message, { status: 500 });
  }
};

// V2 Syntax: Set the cron schedule
export const config = {
  schedule: "0 22,0,8,14 * * *"
};