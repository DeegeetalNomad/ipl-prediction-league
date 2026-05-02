const CRICKET_API_KEY = "f11db63d-469c-4694-beed-3567c4de6fdd";
const IPL_SERIES_ID   = "87c62aac-bc3c-4738-ab93-19da0690488f";

const runTest = async () => {
  console.log("🔍 Fetching IPL Series Data...");
  
  const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRICKET_API_KEY}&id=${IPL_SERIES_ID}`);
  const seriesData = await seriesRes.json();
  const apiMatches = seriesData?.data?.matchList || [];

  // Find Thursday's Match (April 30)
  const thursdayMatch = apiMatches.find(m => m.dateTimeGMT.startsWith("2026-04-30"));
  
  if (!thursdayMatch) {
    console.log("❌ Could not find a match for Thursday, April 30.");
    return;
  }

  console.log(`\n✅ Match Found: ${thursdayMatch.name}`);
  console.log(`   Status: ${thursdayMatch.status}`);
  console.log(`   Match Ended: ${thursdayMatch.matchEnded}`);

  console.log("\n📡 Pinging CricAPI for the Scorecard...");
  const scoreRes = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRICKET_API_KEY}&id=${thursdayMatch.id}`);
  const scoreData = await scoreRes.json();

  const scorecard = scoreData?.data?.scorecard;

  if (!scorecard || scorecard.length === 0) {
    console.log("❌ DISASTER: CricAPI returned an EMPTY scorecard for a match that ended 48 hours ago.");
  } else {
    console.log("✅ SUCCESS: The scorecard array exists.");
    
    // Check if it actually contains players
    const hasBatting = scorecard.some(inning => inning.batting && inning.batting.length > 0);
    const hasBowling = scorecard.some(inning => inning.bowling && inning.bowling.length > 0);
    
    console.log(`   Has Batting Data: ${hasBatting}`);
    console.log(`   Has Bowling Data: ${hasBowling}`);
    
    if (hasBatting) {
      console.log(`   Sample Batter: ${scorecard[0].batting[0].batsman.name} (${scorecard[0].batting[0].r} runs)`);
    }
  }
};

runTest();