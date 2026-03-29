// ============================================================
// STEP 1: seed-schedule.js
// Run this ONCE from your terminal to populate all IPL 2026
// matches into Supabase. Never run it again.
//
// HOW TO RUN:
//   1. cd C:\Users\Swapnil\ipl-prediction-league
//   2. node seed-schedule.js
// ============================================================

const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";

// ── All 74 IPL 2026 matches ──────────────────────────────────
// Times are in UTC. IST = UTC + 5:30
// 3:30 PM IST = 10:00 UTC
// 7:30 PM IST = 14:00 UTC
const MATCHES = [
  // ── MARCH ──
  { match_date:"2026-03-28T14:00:00Z", team1:"Royal Challengers Bengaluru", team2:"Sunrisers Hyderabad",     venue:"M. Chinnaswamy Stadium, Bengaluru" },
  { match_date:"2026-03-29T14:00:00Z", team1:"Rajasthan Royals",             team2:"Chennai Super Kings",    venue:"Barsapara Cricket Stadium, Guwahati" },
  { match_date:"2026-03-30T10:00:00Z", team1:"Punjab Kings",                 team2:"Gujarat Titans",         venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  { match_date:"2026-03-30T14:00:00Z", team1:"Mumbai Indians",               team2:"Kolkata Knight Riders",  venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-03-31T14:00:00Z", team1:"Delhi Capitals",               team2:"Lucknow Super Giants",   venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-04-01T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Rajasthan Royals",       venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-04-02T14:00:00Z", team1:"Chennai Super Kings",          team2:"Royal Challengers Bengaluru", venue:"MA Chidambaram Stadium, Chennai" },
  { match_date:"2026-04-03T14:00:00Z", team1:"Gujarat Titans",               team2:"Mumbai Indians",         venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-04-04T10:00:00Z", team1:"Kolkata Knight Riders",        team2:"Delhi Capitals",         venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-04-04T14:00:00Z", team1:"Lucknow Super Giants",         team2:"Punjab Kings",           venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-04-05T14:00:00Z", team1:"Royal Challengers Bengaluru",  team2:"Rajasthan Royals",       venue:"M. Chinnaswamy Stadium, Bengaluru" },
  { match_date:"2026-04-06T10:00:00Z", team1:"Mumbai Indians",               team2:"Chennai Super Kings",    venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-04-06T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Gujarat Titans",         venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-04-07T14:00:00Z", team1:"Delhi Capitals",               team2:"Punjab Kings",           venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-04-08T14:00:00Z", team1:"Kolkata Knight Riders",        team2:"Lucknow Super Giants",   venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-04-09T14:00:00Z", team1:"Rajasthan Royals",             team2:"Mumbai Indians",         venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-04-10T14:00:00Z", team1:"Chennai Super Kings",          team2:"Delhi Capitals",         venue:"MA Chidambaram Stadium, Chennai" },
  { match_date:"2026-04-11T10:00:00Z", team1:"Punjab Kings",                 team2:"Royal Challengers Bengaluru", venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  { match_date:"2026-04-11T14:00:00Z", team1:"Gujarat Titans",               team2:"Kolkata Knight Riders",  venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-04-12T14:00:00Z", team1:"Lucknow Super Giants",         team2:"Sunrisers Hyderabad",    venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-04-13T10:00:00Z", team1:"Rajasthan Royals",             team2:"Delhi Capitals",         venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-04-13T14:00:00Z", team1:"Mumbai Indians",               team2:"Punjab Kings",           venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-04-14T14:00:00Z", team1:"Royal Challengers Bengaluru",  team2:"Chennai Super Kings",    venue:"Nava Raipur International Cricket Stadium, Raipur" },
  { match_date:"2026-04-15T14:00:00Z", team1:"Kolkata Knight Riders",        team2:"Rajasthan Royals",       venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-04-16T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Delhi Capitals",         venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-04-17T14:00:00Z", team1:"Gujarat Titans",               team2:"Lucknow Super Giants",   venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-04-18T10:00:00Z", team1:"Chennai Super Kings",          team2:"Punjab Kings",           venue:"MA Chidambaram Stadium, Chennai" },
  { match_date:"2026-04-18T14:00:00Z", team1:"Mumbai Indians",               team2:"Royal Challengers Bengaluru", venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-04-19T14:00:00Z", team1:"Delhi Capitals",               team2:"Kolkata Knight Riders",  venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-04-20T10:00:00Z", team1:"Lucknow Super Giants",         team2:"Rajasthan Royals",       venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-04-20T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Chennai Super Kings",    venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-04-21T14:00:00Z", team1:"Punjab Kings",                 team2:"Kolkata Knight Riders",  venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  { match_date:"2026-04-22T14:00:00Z", team1:"Gujarat Titans",               team2:"Royal Challengers Bengaluru", venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-04-23T14:00:00Z", team1:"Rajasthan Royals",             team2:"Lucknow Super Giants",   venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-04-24T14:00:00Z", team1:"Mumbai Indians",               team2:"Sunrisers Hyderabad",    venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-04-25T10:00:00Z", team1:"Delhi Capitals",               team2:"Royal Challengers Bengaluru", venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-04-25T14:00:00Z", team1:"Chennai Super Kings",          team2:"Gujarat Titans",         venue:"MA Chidambaram Stadium, Chennai" },
  { match_date:"2026-04-26T14:00:00Z", team1:"Kolkata Knight Riders",        team2:"Punjab Kings",           venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-04-27T10:00:00Z", team1:"Lucknow Super Giants",         team2:"Mumbai Indians",         venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-04-27T14:00:00Z", team1:"Royal Challengers Bengaluru",  team2:"Delhi Capitals",         venue:"Nava Raipur International Cricket Stadium, Raipur" },
  { match_date:"2026-04-28T14:00:00Z", team1:"Rajasthan Royals",             team2:"Gujarat Titans",         venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-04-29T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Kolkata Knight Riders",  venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-04-30T14:00:00Z", team1:"Punjab Kings",                 team2:"Chennai Super Kings",    venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  // ── MAY ──
  { match_date:"2026-05-01T14:00:00Z", team1:"Mumbai Indians",               team2:"Delhi Capitals",         venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-05-02T10:00:00Z", team1:"Gujarat Titans",               team2:"Sunrisers Hyderabad",    venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-05-02T14:00:00Z", team1:"Lucknow Super Giants",         team2:"Royal Challengers Bengaluru", venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-05-03T14:00:00Z", team1:"Kolkata Knight Riders",        team2:"Chennai Super Kings",    venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-05-04T10:00:00Z", team1:"Rajasthan Royals",             team2:"Punjab Kings",           venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-05-04T14:00:00Z", team1:"Delhi Capitals",               team2:"Mumbai Indians",         venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-05-05T14:00:00Z", team1:"Royal Challengers Bengaluru",  team2:"Kolkata Knight Riders",  venue:"M. Chinnaswamy Stadium, Bengaluru" },
  { match_date:"2026-05-06T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Lucknow Super Giants",   venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-05-07T14:00:00Z", team1:"Chennai Super Kings",          team2:"Rajasthan Royals",       venue:"MA Chidambaram Stadium, Chennai" },
  { match_date:"2026-05-08T14:00:00Z", team1:"Punjab Kings",                 team2:"Mumbai Indians",         venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  { match_date:"2026-05-09T10:00:00Z", team1:"Gujarat Titans",               team2:"Delhi Capitals",         venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-05-09T14:00:00Z", team1:"Kolkata Knight Riders",        team2:"Royal Challengers Bengaluru", venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-05-10T14:00:00Z", team1:"Lucknow Super Giants",         team2:"Chennai Super Kings",    venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-05-11T10:00:00Z", team1:"Rajasthan Royals",             team2:"Sunrisers Hyderabad",    venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-05-11T14:00:00Z", team1:"Mumbai Indians",               team2:"Gujarat Titans",         venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-05-12T14:00:00Z", team1:"Delhi Capitals",               team2:"Chennai Super Kings",    venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-05-13T14:00:00Z", team1:"Punjab Kings",                 team2:"Lucknow Super Giants",   venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  { match_date:"2026-05-14T14:00:00Z", team1:"Royal Challengers Bengaluru",  team2:"Gujarat Titans",         venue:"M. Chinnaswamy Stadium, Bengaluru" },
  { match_date:"2026-05-15T14:00:00Z", team1:"Kolkata Knight Riders",        team2:"Sunrisers Hyderabad",    venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-05-16T10:00:00Z", team1:"Chennai Super Kings",          team2:"Lucknow Super Giants",   venue:"MA Chidambaram Stadium, Chennai" },
  { match_date:"2026-05-16T14:00:00Z", team1:"Rajasthan Royals",             team2:"Mumbai Indians",         venue:"Sawai Mansingh Stadium, Jaipur" },
  { match_date:"2026-05-17T14:00:00Z", team1:"Delhi Capitals",               team2:"Gujarat Titans",         venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-05-18T10:00:00Z", team1:"Punjab Kings",                 team2:"Sunrisers Hyderabad",    venue:"Maharaja Yadavindra Singh Stadium, Mullanpur" },
  { match_date:"2026-05-18T14:00:00Z", team1:"Mumbai Indians",               team2:"Rajasthan Royals",       venue:"Wankhede Stadium, Mumbai" },
  { match_date:"2026-05-19T14:00:00Z", team1:"Lucknow Super Giants",         team2:"Kolkata Knight Riders",  venue:"BRSABV Ekana Cricket Stadium, Lucknow" },
  { match_date:"2026-05-20T14:00:00Z", team1:"Royal Challengers Bengaluru",  team2:"Punjab Kings",           venue:"M. Chinnaswamy Stadium, Bengaluru" },
  { match_date:"2026-05-21T14:00:00Z", team1:"Gujarat Titans",               team2:"Chennai Super Kings",    venue:"Narendra Modi Stadium, Ahmedabad" },
  { match_date:"2026-05-22T14:00:00Z", team1:"Sunrisers Hyderabad",          team2:"Mumbai Indians",         venue:"Rajiv Gandhi International Stadium, Hyderabad" },
  { match_date:"2026-05-23T10:00:00Z", team1:"Kolkata Knight Riders",        team2:"Rajasthan Royals",       venue:"Eden Gardens, Kolkata" },
  { match_date:"2026-05-23T14:00:00Z", team1:"Delhi Capitals",               team2:"Lucknow Super Giants",   venue:"Arun Jaitley Stadium, Delhi" },
  { match_date:"2026-05-24T14:00:00Z", team1:"Chennai Super Kings",          team2:"Mumbai Indians",         venue:"MA Chidambaram Stadium, Chennai" },
  // ── PLAYOFFS (venues TBC by BCCI - using Bengaluru as placeholder) ──
  { match_date:"2026-05-27T14:00:00Z", team1:"TBD (1st)",  team2:"TBD (2nd)", venue:"Qualifier 1 - Venue TBC" },
  { match_date:"2026-05-28T14:00:00Z", team1:"TBD (3rd)",  team2:"TBD (4th)", venue:"Eliminator - Venue TBC" },
  { match_date:"2026-05-30T14:00:00Z", team1:"TBD",        team2:"TBD",        venue:"Qualifier 2 - Venue TBC" },
  { match_date:"2026-05-31T14:00:00Z", team1:"TBD (Final)",team2:"TBD (Final)",venue:"Final - M. Chinnaswamy Stadium, Bengaluru" },
];

// ─────────────────────────────────────────────
// INSERT ALL MATCHES INTO SUPABASE
// ─────────────────────────────────────────────
async function seed() {
  console.log(`\n🏏 IPL 2026 Schedule Seeder`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total matches to insert: ${MATCHES.length}\n`);

  let inserted = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const match of MATCHES) {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/daily_matches`, {
        method: "POST",
        headers: {
          apikey:          SB_KEY,
          Authorization:   `Bearer ${SB_KEY}`,
          "Content-Type":  "application/json",
          Prefer:          "return=minimal,resolution=ignore-duplicates",
        },
        body: JSON.stringify({
          ...match,
          status: "upcoming",
        }),
      });

      if (res.status === 201 || res.status === 200) {
        console.log(`✅ ${match.team1} vs ${match.team2} — ${new Date(match.match_date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}`);
        inserted++;
      } else if (res.status === 409) {
        console.log(`⏭️  Already exists: ${match.team1} vs ${match.team2}`);
        skipped++;
      } else {
        const txt = await res.text();
        console.log(`❌ Failed: ${match.team1} vs ${match.team2} — ${txt}`);
        errors++;
      }
    } catch (e) {
      console.log(`❌ Error: ${match.team1} vs ${match.team2} — ${e.message}`);
      errors++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Inserted: ${inserted}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`\n🎉 Done! All matches are now in Supabase.`);
  console.log(`Your app will auto-show next 48h matches to users.\n`);
}

seed().catch(console.error);
