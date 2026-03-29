// ============================================================
// fetch-dump.js (RUN FROM ROOT FOLDER)
// Run this manually using: node fetch-dump.js
// ============================================================

import fs from 'fs';

const SB_URL = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";

const fetchAll = async () => {
  console.log("Fetching all matches from Supabase...");
  
  const res = await fetch(`${SB_URL}/rest/v1/daily_matches?select=*&order=match_date.asc`, {
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`
    }
  });
  
  const data = await res.json();
  console.log(`Found ${data.length} total rows in the database.`);

  // Create a CSV string
  let csv = "ID,Team 1,Team 2,Match Date,Status\n";
  data.forEach(m => {
    csv += `${m.id},${m.team1},${m.team2},${m.match_date},${m.status}\n`;
  });

  // Save it to a file on your computer
  fs.writeFileSync('database-dump.csv', csv);
  console.log("✅ Successfully saved all records to 'database-dump.csv' in your folder!");
};

fetchAll();