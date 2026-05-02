const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";
const CRICKET_API_KEY = "f11db63d-469c-4694-beed-3567c4de6fdd";
const IPL_SERIES_ID   = "87c62aac-bc3c-4738-ab93-19da0690488f";

const sbFetch = async (path) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
  });
  const txt = await res.text();
  return txt ? JSON.parse(txt) : [];
};

const findMissing = async () => {
  console.log("Searching API for matches missing in your database...\n");
  
  const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`);
  const seriesData = await seriesRes.json();
  const apiMatches = seriesData?.data?.matchList || [];

  const today = new Date().toISOString().split('T')[0];
  const dbMatches = await sbFetch(`daily_matches?match_date=gte.${today}T00:00:00Z`);
  
  // Create a list of all the dates currently in your database
  const dbDates = dbMatches.map(m => m.match_date.split('T')[0]);

  apiMatches.forEach(m => {
    const apiDate = m.dateTimeGMT.split('T')[0];
    
    // If the API has a match for today or later, but your DB doesn't have that date...
    if (apiDate >= today && !dbDates.includes(apiDate)) {
      console.log(`🚨 MISSING IN DB: ${apiDate} -> ${m.name}`);
    }
  });
};

findMissing();