import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
// SUPABASE CONFIG
// ─────────────────────────────────────────────
const SB_URL    = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";
// NOTE: Change this admin password in your production code!
const ADMIN_PWD = "ipl2026admin";

// ─────────────────────────────────────────────
// IPL 2026 DATA
// ─────────────────────────────────────────────
const TEAMS = [
  "Chennai Super Kings","Mumbai Indians","Royal Challengers Bengaluru",
  "Kolkata Knight Riders","Sunrisers Hyderabad","Delhi Capitals",
  "Lucknow Super Giants","Rajasthan Royals","Gujarat Titans","Punjab Kings",
];
const SHORT = {
  "Chennai Super Kings":"CSK","Mumbai Indians":"MI",
  "Royal Challengers Bengaluru":"RCB","Kolkata Knight Riders":"KKR",
  "Sunrisers Hyderabad":"SRH","Delhi Capitals":"DC",
  "Lucknow Super Giants":"LSG","Rajasthan Royals":"RR",
  "Gujarat Titans":"GT","Punjab Kings":"PBKS",
};
const TC = {
  "Chennai Super Kings":          { bg:"#F9CD1B", fg:"#0A1931" },
  "Mumbai Indians":               { bg:"#004BA0", fg:"#FFFFFF" },
  "Royal Challengers Bengaluru":  { bg:"#C8102E", fg:"#F9CD1B" },
  "Kolkata Knight Riders":        { bg:"#3A225D", fg:"#F0C040" },
  "Sunrisers Hyderabad":          { bg:"#F7500E", fg:"#000000" },
  "Delhi Capitals":               { bg:"#17479E", fg:"#EF3340" },
  "Lucknow Super Giants":         { bg:"#A72B2A", fg:"#FBBF24" },
  "Rajasthan Royals":             { bg:"#EA1A85", fg:"#FFFFFF" },
  "Gujarat Titans":               { bg:"#1C2B4A", fg:"#8AC0DE" },
  "Punjab Kings":                 { bg:"#ED1B24", fg:"#FFFFFF" },
};
const SQUADS = {
  "Chennai Super Kings":["Ruturaj Gaikwad","MS Dhoni","Sanju Samson","Dewald Brevis","Ayush Mhatre","Kartik Sharma","Sarfaraz Khan","Urvil Patel","Anshul Kamboj","Jamie Overton","Ramakrishna Ghosh","Prashant Veer","Matthew Short","Aman Khan","Zak Foulkes","Shivam Dube","Khaleel Ahmed","Noor Ahmad","Mukesh Choudhary","Nathan Ellis","Shreyas Gopal","Gurjapneet Singh","Akeal Hosein","Matt Henry","Rahul Chahar"],
  "Mumbai Indians":["Rohit Sharma","Suryakumar Yadav","Robin Minz","Sherfane Rutherford","Ryan Rickelton","Quinton de Kock","Danish Malewar","Tilak Varma","Hardik Pandya","Naman Dhir","Mitchell Santner","Raj Angad Bawa","Atharva Ankolekar","Mayank Rawat","Corbin Bosch","Will Jacks","Shardul Thakur","Jasprit Bumrah","Trent Boult","Deepak Chahar","Mayank Markande","Ashwani Kumar","Mohammad Izhar","Raghu Sharma"],
  "Royal Challengers Bengaluru":["Virat Kohli","Phil Salt","Devdutt Padikkal","Rajat Patidar","Jitesh Sharma","Jordan Cox","Krunal Pandya","Tim David","Romario Shepherd","Jacob Bethell","Venkatesh Iyer","Satvik Deswal","Mangesh Yadav","Vicky Ostwal","Vihaan Malhotra","Kanishk Chouhan","Bhuvneshwar Kumar","Josh Hazlewood","Yash Dayal","Nuwan Thushara","Suyash Sharma","Rasikh Dar","Jacob Duffy","Abhinandan Singh"],
  "Kolkata Knight Riders":["Ajinkya Rahane","Angkrish Raghuvanshi","Manish Pandey","Rinku Singh","Rovman Powell","Finn Allen","Tim Seifert","Tejasvi Singh","Rahul Tripathi","Cameron Green","Anukul Roy","Sarthak Ranjan","Daksh Kamra","Rachin Ravindra","Ramandeep Singh","Vaibhav Arora","Matheesha Pathirana","Kartik Tyagi","Prashant Solanki","Akash Deep","Harshit Rana","Umran Malik","Sunil Narine","Varun Chakravarthy"],
  "Sunrisers Hyderabad":["Ishan Kishan","Aniket Verma","Smaran Ravichandran","Heinrich Klaasen","Travis Head","Harshal Patel","Kamindu Mendis","Harsh Dubey","Brydon Carse","Liam Livingstone","Jack Edwards","Abhishek Sharma","Nitish Kumar Reddy","Pat Cummins","Zeeshan Ansari","Jaydev Unadkat","Eshan Malinga","Sakib Hussain","Onkar Tarmale","Shivam Mavi"],
  "Delhi Capitals":["KL Rahul","Karun Nair","David Miller","Ben Duckett","Pathum Nissanka","Prithvi Shaw","Abishek Porel","Tristan Stubbs","Axar Patel","Sameer Rizvi","Ashutosh Sharma","Vipraj Nigam","Ajay Mandal","Tripurana Vijay","Madhav Tiwari","Nitish Rana","Mitchell Starc","T. Natarajan","Mukesh Kumar","Dushmantha Chameera","Lungi Ngidi","Kyle Jamieson","Kuldeep Yadav"],
  "Lucknow Super Giants":["Rishabh Pant","Aiden Markram","Himmat Singh","Matthew Breetzke","Akshat Raghuwanshi","Josh Inglis","Nicholas Pooran","Mitchell Marsh","Abdul Samad","Shahbaz Ahmed","Arshin Kulkarni","Wanindu Hasaranga","Ayush Badoni","Mohammad Shami","Avesh Khan","M. Siddharth","Digvesh Singh","Akash Singh","Arjun Tendulkar","Anrich Nortje","Mayank Yadav","Mohsin Khan"],
  "Rajasthan Royals":["Riyan Parag","Shubham Dubey","Vaibhav Suryavanshi","Donovan Ferreira","Lhuan-dre Pretorius","Shimron Hetmyer","Yashasvi Jaiswal","Dhruv Jurel","Ravindra Jadeja","Sam Curran","Yudhvir Singh Charak","Jofra Archer","Tushar Deshpande","Kwena Maphaka","Ravi Bishnoi","Sushant Mishra","Yash Raj Punia","Adam Milne","Kuldeep Sen","Sandeep Sharma","Nandre Burger"],
  "Gujarat Titans":["Shubman Gill","Jos Buttler","Kumar Kushagra","Anuj Rawat","Tom Banton","Glenn Phillips","Nishant Sindhu","Washington Sundar","Sai Sudharsan","Shahrukh Khan","Jason Holder","Jayant Yadav","Sai Kishore","Kagiso Rabada","Mohammed Siraj","Prasidh Krishna","Manav Suthar","Gurnoor Singh Brar","Ishant Sharma","Luke Wood","Rahul Tewatia","Rashid Khan"],
  "Punjab Kings":["Shreyas Iyer","Nehal Wadhera","Vishnu Vinod","Harnoor Pannu","Prabhsimran Singh","Shashank Singh","Marcus Stoinis","Harpreet Brar","Marco Jansen","Azmatullah Omarzai","Priyansh Arya","Musheer Khan","Mitch Owen","Cooper Connolly","Ben Dwarshuis","Arshdeep Singh","Yuzvendra Chahal","Vyshak Vijaykumar","Yash Thakur","Xavier Bartlett","Lockie Ferguson"],
};
const ALL_PLAYERS = [...new Set(Object.values(SQUADS).flat())].sort();
const LOCK_DATE   = new Date("2026-03-28T10:00:00Z"); // 3:30 PM IST
const isLocked    = () => new Date() >= LOCK_DATE;

// ── SCORING ──
const TPOINTS = { winner:20, finalist2:10, top4_each:5, top_scorer:15, top_wicket_taker:15, max_sixes:10, max_fours:10 };
const MAX_PTS = 95;
const DPOINTS = { winner:10, top_batter:8, top_bowler:8, potm:10 };

const ROASTS = [
  "Consulting Dhoni's gut feeling…",
  "Checking DRS (Drama Review System)…",
  "Asking Bumrah nicely to load faster…",
  "Waiting for RCB to win a trophy…",
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const teamOf   = (p) => Object.entries(SQUADS).find(([, sq]) => sq.includes(p))?.[0];
const initials = (n = "") => n.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const avColor  = (n = "") => TC[teamOf(n)]?.bg || "#F97316";
const fmtTime  = (d) => new Date(d).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
const fmtDate  = (d) => new Date(d).toLocaleDateString([], { weekday:"short", day:"numeric", month:"short" });

// Hash password via Web Crypto API (Security Patch)
const hashPassword = async (pwd) => {
  const msgBuffer = new TextEncoder().encode(pwd);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ─────────────────────────────────────────────
// SUPABASE MINI-CLIENT
// ─────────────────────────────────────────────
const sb = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer ?? "return=representation",
      ...(opts.headers || {}),
    },
    method: opts.method || "GET",
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(txt);
  return txt ? JSON.parse(txt) : null;
};

// ─────────────────────────────────────────────
// SCORE CALCULATORS
// ─────────────────────────────────────────────
const calcTScore = (pred, act) => {
  if (!act || !pred) return null;
  let s = 0;
  if (pred.winner === act.winner) s += TPOINTS.winner;
  if (pred.finalist2 && (pred.finalist2 === act.finalist2 || pred.finalist2 === act.winner)) s += TPOINTS.finalist2;
  (pred.top4 || []).forEach(t => { if ((act.top4 || []).includes(t)) s += TPOINTS.top4_each; });
  if (pred.top_scorer === act.top_scorer) s += TPOINTS.top_scorer;
  if (pred.top_wicket_taker === act.top_wicket_taker) s += TPOINTS.top_wicket_taker;
  if (pred.max_sixes === act.max_sixes) s += TPOINTS.max_sixes;
  if (pred.max_fours === act.max_fours) s += TPOINTS.max_fours;
  return s;
};

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
const Confetti = ({ active }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const ps = Array.from({ length: 150 }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height - cv.height,
      r: Math.random() * 6 + 4, d: Math.random() * 80 + 40,
      color: Object.values(TC)[Math.floor(Math.random() * 10)].bg,
      tilt: 0, ta: 0, ts: Math.random() * 0.07 + 0.05,
    }));
    let a = 0, fr;
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height); a += 0.01;
      ps.forEach(p => {
        p.ta += p.ts; p.y += (Math.cos(a + p.d) + 1 + p.r / 2) / 2;
        p.x += Math.sin(a); p.tilt = Math.sin(p.ta) * 15;
        ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y); ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r); ctx.stroke();
        if (p.y > cv.height) { p.x = Math.random() * cv.width; p.y = -20; }
      });
      fr = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => cancelAnimationFrame(fr), 4000);
    return () => { cancelAnimationFrame(fr); clearTimeout(t); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999 }} />;
};

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --sf:rgba(30,41,59,0.75); --sf2:rgba(15,23,42,0.65);
      --bd:rgba(255,255,255,0.1); --bd2:rgba(255,255,255,0.2);
      --t:#f8fafc; --t2:#cbd5e1; --t3:#94a3b8;
      --ac:#f97316; --navy:rgba(15,23,42,0.9);
      --green:#10b981; --red:#f43f5e; --gold:#f59e0b;
      --r:20px; --r-sm:14px;
      --sh:0 8px 32px rgba(0,0,0,.3);
      --sh-md:0 8px 32px rgba(0,0,0,.4);
      --sh-lg:0 12px 48px rgba(0,0,0,.5);
      --fd:'Bebas Neue',sans-serif; --fb:'Nunito',sans-serif;
    }
    body{background:#0f172a;color:var(--t);font-family:var(--fb);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
    button,input,select{font-family:var(--fb);}
    .stadium-bg{position:fixed;top:0;left:0;right:0;height:100vh;background:radial-gradient(circle at 50% 0%,#1e293b 0%,#0f172a 60%);z-index:-1;overflow:hidden;}
    .floodlight{position:absolute;width:2px;height:50vh;background:rgba(255,255,255,0.05);top:-10vh;box-shadow:0 0 40px 10px rgba(255,255,255,0.05);}
    @keyframes slideUpFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{0%{opacity:0;transform:scale(0.9)}50%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes pulseLive{0%,100%{opacity:1;box-shadow:0 0 10px var(--ac)}50%{opacity:0.5;box-shadow:none}}
    .fu{animation:slideUpFade 0.4s cubic-bezier(0.16,1,0.3,1) forwards;}
    .pop{animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;}
    .live-dot{animation:pulseLive 1.5s ease infinite;}
    .glow-text{text-shadow:0 0 15px currentColor;}
    ::-webkit-scrollbar{width:0px;}
    select{
      appearance:none;-webkit-appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat:no-repeat;background-position:right 12px center;padding-right:38px!important;
    }
    select option{background:#0f172a;color:#f8fafc;}
    input:focus,select:focus{outline:none;border-color:var(--ac)!important;box-shadow:0 0 0 2px rgba(249,115,22,.2)!important;}
  `}</style>
);

// ─────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────
const inpS = { background:"var(--sf2)", border:"1.5px solid var(--bd)", borderRadius:"var(--r-sm)", padding:"13px 16px", fontSize:15, fontWeight:600, color:"var(--t)", width:"100%", transition:"all .2s" };
const lblS = { fontSize:11, fontWeight:800, color:"var(--t3)", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" };

const Card = ({ children, style = {}, accent }) => (
  <div style={{ background:"var(--sf)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid var(--bd)", borderRadius:"var(--r)", padding:20, boxShadow:"var(--sh)", borderTop: accent ? `3px solid ${accent}` : undefined, ...style }}>
    {children}
  </div>
);

const Inp = ({ label, ...p }) => (
  <div>
    {label && <label style={lblS}>{label}</label>}
    <input {...p} style={{ ...inpS, ...(p.style || {}) }} />
  </div>
);

const Sel = ({ label, value, onChange, options, placeholder, disabled }) => (
  <div>
    {label && <label style={lblS}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      style={{ ...inpS, cursor: disabled ? "not-allowed" : "pointer", color: value ? "var(--t)" : "var(--t3)", opacity: disabled ? 0.6 : 1 }}>
      <option value="">{placeholder || "Choose…"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", disabled, style = {}, ...p }) => {
  const v = {
    primary: { background:"linear-gradient(to right,#f97316,#e11d48)", color:"#fff", boxShadow:"0 0 20px rgba(249,115,22,0.4)", border:"none" },
    navy:    { background:"var(--navy)", color:"#fff", border:"1px solid var(--bd)", boxShadow:"var(--sh)" },
    light:   { background:"rgba(255,255,255,0.05)", color:"var(--t)", border:"1px solid var(--bd)" },
    green:   { background:"linear-gradient(to right,#10b981,#059669)", color:"#fff", boxShadow:"0 0 20px rgba(16,185,129,0.4)", border:"none" },
  }[variant] || {};
  return (
    <button {...p} disabled={disabled}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, borderRadius:"var(--r-sm)", padding:"14px 20px", fontFamily:"var(--fd)", fontSize:20, letterSpacing:"0.05em", cursor:disabled?"not-allowed":"pointer", transition:"all .2s cubic-bezier(0.34,1.56,0.64,1)", width:"100%", opacity:disabled?0.5:1, ...v, ...style }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = "brightness(1.1)"; } }}
      onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}>
      {children}
    </button>
  );
};

const Pill = ({ children, color = "orange", style = {} }) => {
  const c = {
    orange: { bg:"rgba(249,115,22,0.15)",  tc:"#f97316", bd:"rgba(249,115,22,0.3)" },
    green:  { bg:"rgba(16,185,129,0.15)",  tc:"#10b981", bd:"rgba(16,185,129,0.3)" },
    red:    { bg:"rgba(244,63,94,0.15)",   tc:"#f43f5e", bd:"rgba(244,63,94,0.3)" },
    gold:   { bg:"rgba(245,158,11,0.15)",  tc:"#f59e0b", bd:"rgba(245,158,11,0.3)" },
  }[color] || { bg:"var(--sf2)", tc:"var(--t3)", bd:"var(--bd)" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", background:c.bg, color:c.tc, border:`1px solid ${c.bd}`, fontSize:10, fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", padding:"4px 10px", borderRadius:100, whiteSpace:"nowrap", ...style }}>
      {children}
    </span>
  );
};

const Avatar = ({ name, size = 38 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${avColor(name)},#1e293b)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontFamily:"var(--fd)", fontSize:size*0.4, border:"1px solid var(--bd)", boxShadow:"0 4px 10px rgba(0,0,0,0.3)" }}>
    {initials(name)}
  </div>
);

const TeamChip = ({ team, large }) => {
  const c = TC[team] || { bg:"#333", fg:"#fff" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:c.bg, color:c.fg, borderRadius:100, padding: large ? "6px 14px" : "4px 10px", fontFamily:"var(--fd)", fontSize: large ? 16 : 13, whiteSpace:"nowrap", boxShadow:`0 2px 8px ${c.bg}44` }}>
      {large ? team : SHORT[team] || team}
    </span>
  );
};

// Revamped Visual Team Card
const TeamCard = ({ team, selected, onClick, disabled, small }) => {
  const c = TC[team];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ border:`2px solid ${selected ? c.bg : "var(--bd)"}`, borderRadius: small ? 14 : 20, background: selected ? `${c.bg}18` : "var(--sf2)", cursor: disabled ? "not-allowed" : "pointer", padding: small ? "10px 6px" : "16px 8px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, transition:"all .2s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: selected ? `0 0 0 2px ${c.bg}66,0 10px 25px ${c.bg}44` : "var(--sh)", opacity: disabled && !selected ? 0.35 : 1, transform: selected ? "scale(1.03)" : "scale(1)", position:"relative" }}
      onMouseEnter={e => { if (!disabled && !selected) { e.currentTarget.style.borderColor = c.bg + "88"; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = "var(--bd)"; } }}>
      {selected && <div className="pop" style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", fontWeight:900, boxShadow:"0 2px 8px rgba(16,185,129,0.5)" }}>✓</div>}
      
      <div style={{ width: small ? 48 : 64, height: small ? 48 : 64, borderRadius: small ? 10 : 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: selected ? `0 4px 12px ${c.bg}66` : "none", transition: "all 0.2s" }}>
        <span style={{ fontFamily:"var(--fd)", fontSize: small ? 20 : 28, color: c.fg, letterSpacing: "1px" }}>{SHORT[team]}</span>
      </div>
      
      {!small && <span style={{ fontSize:10, color:"var(--t3)", fontWeight:800, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.05em", marginTop:4 }}>{team.split(" ").slice(-1)[0]}</span>}
    </button>
  );
};

const SecHead = ({ icon, title, sub, right }) => (
  <div style={{ marginBottom:16, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {icon && <span style={{ fontSize:24 }}>{icon}</span>}
        <h3 className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:24, color:"var(--t)", letterSpacing:"0.03em" }}>{title}</h3>
      </div>
      {sub && <p style={{ fontSize:12, color:"var(--t3)", marginTop:2, marginLeft: icon ? "34px" : "0", fontWeight:600 }}>{sub}</p>}
    </div>
    {right}
  </div>
);

// Scrolling team ticker
const TeamTicker = () => {
  const items = [...TEAMS, ...TEAMS];
  return (
    <div style={{ overflow:"hidden", background:"var(--navy)", borderBottom:"1px solid var(--bd)", padding:"8px 0" }}>
      <div style={{ display:"inline-flex", animation:"marquee 30s linear infinite" }}>
        {items.map((t, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, marginRight:24, fontSize:14, fontFamily:"var(--fd)", color: TC[t].fg === "#000000" ? "#fff" : TC[t].fg, background: TC[t].bg, padding:"4px 12px", borderRadius:100, whiteSpace:"nowrap", boxShadow:`0 0 10px ${TC[t].bg}44` }}>
            {SHORT[t]}
          </span>
        ))}
      </div>
    </div>
  );
};

// Top-4 picker
const Top4Picker = ({ value, onChange, disabled }) => {
  const toggle = t => {
    if (value.includes(t)) onChange(value.filter(x => x !== t));
    else if (value.length < 4) onChange([...value, t]);
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <label style={lblS}>Top 4 Playoff Teams</label>
        <Pill color={value.length === 4 ? "green" : "gold"}>{value.length}/4 picked</Pill>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
        {TEAMS.map(t => {
          const on = value.includes(t);
          const full = !on && value.length >= 4;
          return <TeamCard key={t} team={t} selected={on} onClick={() => toggle(t)} disabled={disabled || full} small />;
        })}
      </div>
    </div>
  );
};

// Searchable player picker
const PlayerPick = ({ label, value, onChange, disabled }) => {
  const [q, setQ]     = useState("");
  const [open, setOpen] = useState(false);
  const ref           = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = ALL_PLAYERS.filter(p => p.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  const team = value ? teamOf(value) : null;
  const tc   = team ? TC[team] : null;
  return (
    <div ref={ref} style={{ position:"relative" }}>
      {label && <label style={lblS}>{label}</label>}
      <div onClick={() => { if (!disabled) { setOpen(o => !o); setQ(""); } }}
        style={{ ...inpS, cursor: disabled ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"space-between", opacity: disabled ? 0.6 : 1, userSelect:"none", borderColor: value && tc ? tc.bg : "var(--bd)", background: value && tc ? `${tc.bg}15` : "var(--sf2)" }}>
        <div style={{ flex:1, overflow:"hidden", display:"flex", alignItems:"center", gap:10 }}>
          {value && tc && <div style={{ width:12, height:12, borderRadius:"50%", background:tc.bg }} />}
          <span style={{ color: value ? "var(--t)" : "var(--t3)", fontSize:15, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value || "Search player…"}</span>
          {value && team && <span style={{ fontSize:10, fontWeight:800, color: tc?.bg || "var(--t3)", background: tc ? `${tc.bg}22` : "var(--sf2)", padding:"3px 8px", borderRadius:6, flexShrink:0 }}>{SHORT[team] || ""}</span>}
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {open && (
        <div className="pop" style={{ position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:300, background:"rgba(15,23,42,0.97)", backdropFilter:"blur(16px)", border:"1px solid var(--bd)", borderRadius:"var(--r)", boxShadow:"var(--sh-lg)", overflow:"hidden" }}>
          <div style={{ padding:12, borderBottom:"1px solid var(--bd)", background:"var(--sf2)" }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type a name…" style={{ ...inpS, padding:"12px 16px", fontSize:15, background:"rgba(0,0,0,0.2)" }} />
          </div>
          <div style={{ maxHeight:250, overflowY:"auto" }}>
            {filtered.length === 0 && <div style={{ padding:20, color:"var(--t3)", fontSize:14, fontWeight:600, textAlign:"center" }}>No players found</div>}
            {filtered.map(p => {
              const pt = teamOf(p); const c = TC[pt] || { bg:"#888", fg:"#fff" };
              return (
                <div key={p} onClick={() => { onChange(p); setOpen(false); setQ(""); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", cursor:"pointer", background: value === p ? `${c.bg}22` : "transparent", borderLeft: value === p ? `4px solid ${c.bg}` : "4px solid transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background = value === p ? `${c.bg}22` : "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = value === p ? `${c.bg}22` : "transparent"}>
                  <span style={{ fontSize:15, fontWeight: value === p ? 800 : 600, color: value === p ? "#fff" : "var(--t2)" }}>{p}</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, background:c.bg, color:c.fg, padding:"2px 10px", borderRadius:100, fontFamily:"var(--fd)" }}>
                    {SHORT[pt] || ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingScreen = () => (
  <div className="fu" style={{ textAlign:"center", padding:"100px 0" }}>
    <div style={{ fontSize:50, marginBottom:16 }} className="live-dot">🏏</div>
    <h2 style={{ fontFamily:"var(--fd)", fontSize:28, color:"var(--ac)" }}>Loading…</h2>
    <p style={{ color:"var(--t3)", fontWeight:700, marginTop:8 }}>{ROASTS[Math.floor(Math.random() * ROASTS.length)]}</p>
  </div>
);

// ─────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username:"", password:"", name:"" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let user;
      if (mode === "signup") {
        if (!form.name.trim() || !form.username.trim() || !form.password.trim()) throw new Error("Please fill all fields.");
        const ex = await sb(`users?username=eq.${form.username.toLowerCase()}&select=id`);
        if (ex?.length) throw new Error("Username already taken. Please choose another.");
        
        // Security Patch: Hash password before saving
        const hashedPwd = await hashPassword(form.password);
        [user] = await sb("users", { method:"POST", body:{ username:form.username.toLowerCase().trim(), password:hashedPwd, name:form.name.trim() } });
      } else {
        // Security Patch: Hash password before comparing
        const hashedPwd = await hashPassword(form.password);
        const rows = await sb(`users?username=eq.${form.username.toLowerCase()}&password=eq.${hashedPwd}&select=*`);
        if (!rows?.length) throw new Error("Invalid username or password.");
        user = rows[0];
      }
      onLogin(user);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="fu" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 20px", position:"relative", zIndex:10 }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div className="pop" style={{ display:"inline-block", padding:16, borderRadius:24, background:"linear-gradient(135deg,#f97316,#e11d48)", boxShadow:"0 0 40px rgba(249,115,22,0.5)", marginBottom:20 }}>
          <span style={{ fontSize:52 }}>🏆</span>
        </div>
        <h1 className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:52, lineHeight:1, color:"#fff", letterSpacing:"0.02em" }}>
          IPL <span style={{ color:"var(--ac)" }}>PREDICTOR</span>
        </h1>
        <p style={{ color:"var(--t3)", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.15em", fontSize:13, marginTop:8 }}>
          Predict. Compete. Dominate.
        </p>

        <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:20, flexWrap:"wrap" }}>
          {[["🎯","Pick the champion & top players"],["🏏","Predict each match winner"],["🏆","Climb the leaderboard"]].map(([ic, tx]) => (
            <div key={tx} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, maxWidth:100 }}>
              <span style={{ fontSize:28 }}>{ic}</span>
              <span style={{ fontSize:11, color:"var(--t3)", fontWeight:700, textAlign:"center", lineHeight:1.3 }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:380, width:"100%", margin:"0 auto" }}>
        <Card style={{ padding:24, boxShadow:"var(--sh-lg)" }}>
          <div style={{ display:"flex", background:"rgba(0,0,0,0.3)", padding:4, borderRadius:12, marginBottom:20 }}>
            {[["login","Sign In"],["signup","Join Now"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }}
                style={{ flex:1, padding:"10px 0", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"var(--fb)", fontWeight:800, fontSize:14, transition:"all .2s", background: mode===m ? "var(--ac)" : "transparent", color: mode===m ? "#fff" : "var(--t3)", boxShadow: mode===m ? "0 4px 12px rgba(249,115,22,0.4)" : "none" }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {mode === "signup" && <Inp value={form.name} onChange={set("name")} placeholder="Your Full Name" />}
            <Inp value={form.username} onChange={set("username")} placeholder="Username" autoCapitalize="none" />
            <Inp type="password" value={form.password} onChange={set("password")} placeholder="Password" onKeyDown={e => e.key === "Enter" && submit()} />
            {err && <div className="pop" style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:"var(--r-sm)", padding:"12px 14px", fontSize:14, color:"var(--red)", fontWeight:700 }}>⚠️ {err}</div>}
            <Btn onClick={submit} disabled={busy}>
              {busy ? "Consulting 3rd Umpire…" : mode === "login" ? "Enter Stadium 🏟️" : "Create Account 🚀"}
            </Btn>
          </div>
        </Card>
        <p style={{ textAlign:"center", fontSize:12, color:"var(--t3)", marginTop:20, fontWeight:700, letterSpacing:"0.05em" }}>
          🔒 TOURNAMENT PICKS LOCK 28 MAR · 3:30 PM IST
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MATCHDAY LIVE SCREEN
// ─────────────────────────────────────────────
const TodayScreen = ({ user }) => {
  const [matches,  setMatches]  = useState([]);
  const [myPreds,  setMyPreds]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState("");
  const [saving,   setSaving]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ms = await sb("daily_matches?select=*&order=match_date.asc").catch(() => []);
      setMatches(ms || []);
      if ((ms || []).length) {
        const ids = (ms || []).map(m => m.id);
        const preds = await sb(`daily_predictions?user_id=eq.${user.id}&match_id=in.(${ids.join(",")})&select=*`).catch(() => []);
        const pm = {}; (preds || []).forEach(p => { pm[p.match_id] = p; });
        setMyPreds(pm);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const savePred = async (matchId, data) => {
    setSaving(matchId);
    try {
      const ex = myPreds[matchId];
      if (ex) {
        await sb(`daily_predictions?id=eq.${ex.id}`, { method:"PATCH", body:{ ...data, updated_at: new Date().toISOString() } });
      } else {
        await sb("daily_predictions", { method:"POST", body:{ user_id: user.id, match_id: matchId, ...data } });
      }
      setMyPreds(p => ({ ...p, [matchId]: { ...(p[matchId] || {}), match_id: matchId, ...data } }));
      setToast("✅ Prediction locked!"); setTimeout(() => setToast(""), 2500);
    } catch (e) { setToast("❌ " + e.message); setTimeout(() => setToast(""), 3000); }
    setSaving(null);
  };

  const totalDaily = Object.values(myPreds).reduce((s, p) => s + (p.points_earned || 0), 0);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px" }} className="fu">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <div>
          <h2 className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:42, lineHeight:1, color:"var(--t)" }}>
            Matchday <span style={{ color:"var(--ac)" }}>Live</span>
          </h2>
          <p style={{ color:"var(--t3)", fontWeight:700, fontSize:12, marginTop:4 }}>Pick match winners for bonus points</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:10, color:"var(--t3)", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em" }}>My Daily Pts</p>
          <p className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:32, color:"var(--gold)", lineHeight:1 }}>{totalDaily}</p>
        </div>
      </div>

      {toast && <div className="pop" style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"var(--r-sm)", padding:"12px 16px", marginBottom:16, fontSize:14, fontWeight:800, color:"var(--green)" }}>{toast}</div>}

      {matches.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 16px" }}>
          <div style={{ fontSize:64, marginBottom:16, opacity:0.7 }}>🏟️</div>
          <p style={{ fontFamily:"var(--fd)", fontSize:28, color:"var(--t)" }}>No Matches Today</p>
          <p style={{ fontSize:14, color:"var(--t3)", marginTop:8, fontWeight:600, marginBottom:24 }}>Check back on match days for live predictions!</p>
          <Card accent="var(--gold)" style={{ textAlign:"left" }}>
            <p style={{ fontSize:11, fontWeight:800, color:"var(--gold)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>💰 Daily Points Per Match</p>
            {[["Match Winner","10 pts"],["Top Batter","8 pts"],["Top Bowler","8 pts"],["Player of Match","10 pts"]].map(([k, v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:"var(--t2)", marginBottom:8, fontWeight:600 }}>
                <span>{k}</span><span style={{ fontWeight:800, color:"var(--gold)" }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {matches.map(m => <MatchCard key={m.id} match={m} myPred={myPreds[m.id]} onSave={d => savePred(m.id, d)} saving={saving === m.id} />)}
        </div>
      )}
    </div>
  );
};

// Individual match card
const MatchCard = ({ match, myPred, onSave, saving }) => {
  const t1 = TC[match.team1] || { bg:"#333", fg:"#fff" };
  const t2 = TC[match.team2] || { bg:"#333", fg:"#fff" };
  const isCompleted = match.status === "completed";
  const isLive      = match.status === "live";
  const canPredict  = !isCompleted && !isLive;

  const [pred, setPred] = useState({
    predicted_winner: myPred?.predicted_winner || "",
    predicted_batter: myPred?.predicted_batter || "",
    predicted_bowler: myPred?.predicted_bowler || "",
    predicted_potm:   myPred?.predicted_potm   || "",
  });
  const [expanded, setExpanded] = useState(!myPred?.predicted_winner && canPredict);
  const upd = (k, v) => setPred(p => ({ ...p, [k]: v }));
  const matchPlayers = [...(SQUADS[match.team1] || []), ...(SQUADS[match.team2] || [])].sort();

  return (
    <div style={{ borderRadius:24, overflow:"hidden", boxShadow:"var(--sh-lg)", background:"var(--sf)", border:`1px solid ${isLive ? "var(--ac)" : isCompleted ? "var(--green)" : "var(--bd)"}`, backdropFilter:"blur(12px)" }}>
      {/* Team header */}
      <div style={{ display:"flex", height:100 }}>
        <div style={{ flex:1, background:t1.bg, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          <span style={{ fontSize:100, position:"absolute", opacity:0.1, fontFamily:"var(--fd)", color:t1.fg, transform:"rotate(-10deg) scale(1.5)" }}>{SHORT[match.team1]}</span>
          <span style={{ fontFamily:"var(--fd)", fontSize:36, color:t1.fg, zIndex:10, textShadow:"0 4px 10px rgba(0,0,0,0.4)" }}>{SHORT[match.team1]}</span>
        </div>
        <div style={{ position:"absolute", left:"50%", top:50, transform:"translate(-50%,-50%)", width:46, height:46, borderRadius:"50%", background:"var(--navy)", border:"3px solid var(--sf)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:20, boxShadow:"0 4px 12px rgba(0,0,0,0.5)" }}>
          {isLive      ? <span className="live-dot" style={{ fontFamily:"var(--fd)", fontSize:14, color:"var(--ac)" }}>LIVE</span>
          : isCompleted ? <span style={{ fontFamily:"var(--fd)", fontSize:14, color:"var(--green)" }}>DONE</span>
          : <span style={{ fontFamily:"var(--fd)", fontSize:18, color:"#fff" }}>VS</span>}
        </div>
        <div style={{ flex:1, background:t2.bg, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          <span style={{ fontSize:100, position:"absolute", opacity:0.1, fontFamily:"var(--fd)", color:t2.fg, transform:"rotate(10deg) scale(1.5)" }}>{SHORT[match.team2]}</span>
          <span style={{ fontFamily:"var(--fd)", fontSize:36, color:t2.fg, zIndex:10, textShadow:"0 4px 10px rgba(0,0,0,0.4)" }}>{SHORT[match.team2]}</span>
        </div>
      </div>

      <div style={{ padding:"12px 16px", background:"rgba(0,0,0,0.3)", borderTop:"1px solid var(--bd)", borderBottom: expanded ? "1px solid var(--bd)" : "none" }}>
        <p style={{ fontSize:11, color:"var(--t2)", fontWeight:800, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          {fmtDate(match.match_date)} · {fmtTime(match.match_date)} · {match.venue}
        </p>
      </div>

      <div style={{ padding:20 }}>
        {isCompleted && match.actual_winner && (
          <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"var(--r-sm)", padding:"12px 16px", marginBottom:16 }}>
            <p style={{ fontSize:11, fontWeight:800, color:"var(--green)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Official Result</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["🏆 Winner", match.actual_winner],["🏏 Batter", match.actual_top_batter],["🎯 Bowler", match.actual_top_bowler],["🌟 POTM", match.actual_potm]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize:10, color:"var(--t3)", fontWeight:800, textTransform:"uppercase" }}>{k}</p>
                  <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginTop:2 }}>{TEAMS.includes(v) ? <TeamChip team={v} /> : v}</p>
                </div>
              ))}
            </div>
            {myPred?.points_earned > 0 && (
              <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"rgba(245,158,11,0.15)", borderRadius:10, border:"1px solid rgba(245,158,11,0.3)" }}>
                <span style={{ fontSize:20 }}>🎉</span>
                <span style={{ fontFamily:"var(--fd)", fontSize:18, color:"var(--gold)" }}>+{myPred.points_earned} pts earned!</span>
              </div>
            )}
          </div>
        )}

        {myPred?.predicted_winner && !expanded && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--sf2)", borderRadius:"var(--r-sm)", padding:"12px 16px", border:"1px solid var(--bd)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"var(--t3)", fontWeight:800, textTransform:"uppercase" }}>Your Pick:</span>
              <TeamChip team={pred.predicted_winner} large />
            </div>
            {canPredict && <button onClick={() => setExpanded(true)} style={{ fontSize:12, fontWeight:800, color:"var(--ac)", background:"rgba(249,115,22,0.1)", padding:"6px 12px", borderRadius:6, border:"1px solid rgba(249,115,22,0.3)", cursor:"pointer", textTransform:"uppercase" }}>Edit</button>}
          </div>
        )}

        {canPredict && expanded && (
          <div className="fu" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ ...lblS, marginBottom:10 }}>🏆 Match Winner (10 pts)</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[match.team1, match.team2].map(t => {
                  const c = TC[t]; const sel = pred.predicted_winner === t;
                  return (
                    <button key={t} onClick={() => upd("predicted_winner", t)}
                      style={{ border:`2px solid ${sel ? "#fff" : "transparent"}`, borderRadius:16, background:c.bg, padding:16, cursor:"pointer", transition:"all .2s", boxShadow: sel ? `0 0 20px ${c.bg}88` : "none", transform: sel ? "scale(1.02)" : "scale(1)", opacity: sel || !pred.predicted_winner ? 1 : 0.5, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <span style={{ fontFamily:"var(--fd)", fontSize:32, color:c.fg, lineHeight:1 }}>{SHORT[t]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              <Sel label="🔥 Top Batter (8 pts)" value={pred.predicted_batter} onChange={v => upd("predicted_batter", v)} options={matchPlayers} />
              <Sel label="🎯 Top Bowler (8 pts)" value={pred.predicted_bowler} onChange={v => upd("predicted_bowler", v)} options={matchPlayers} />
              <Sel label="🌟 Player of the Match (10 pts)" value={pred.predicted_potm} onChange={v => upd("predicted_potm", v)} options={matchPlayers} />
            </div>
            <Btn onClick={() => { onSave(pred); setExpanded(false); }} disabled={saving || !pred.predicted_winner} variant="primary">
              {saving ? "Consulting Umpires…" : "Lock In Prediction 🔒"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TOURNAMENT PICKS (3-step)
// ─────────────────────────────────────────────
const PicksScreen = ({ user }) => {
  const locked = isLocked();
  const empty  = { winner:"", finalist2:"", top4:[], top_scorer:"", top_wicket_taker:"", max_sixes:"", max_fours:"" };
  const [pred,     setPred]     = useState(empty);
  const [saved,    setSaved]    = useState(false);
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState(null);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    (async () => {
      const rows = await sb(`predictions?user_id=eq.${user.id}&select=*`).catch(() => []);
      if (rows?.length) { setPred(rows[0]); setSaved(true); }
      setLoading(false);
    })();
  }, [user.id]);

  const upd = (k, v) => setPred(p => ({ ...p, [k]: v }));
  const fields   = [pred.winner, pred.finalist2, pred.top4.length === 4, pred.top_scorer, pred.top_wicket_taker, pred.max_sixes, pred.max_fours];
  const done     = fields.filter(Boolean).length;
  const complete = done === 7;

  const save = async () => {
    if (!complete) return;
    setStatus("saving");
    try {
      if (saved) {
        await sb(`predictions?user_id=eq.${user.id}`, { method:"PATCH", body:{ ...pred, updated_at: new Date().toISOString() } });
      } else {
        await sb("predictions", { method:"POST", body:{ ...pred, user_id: user.id } });
        setConfetti(true); setTimeout(() => setConfetti(false), 4000);
      }
      setSaved(true); setStatus("saved"); setTimeout(() => setStatus(null), 3000);
    } catch (e) { setStatus("error:" + e.message); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px" }} className="fu">
      <Confetti active={confetti} />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <div>
          <h2 className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:42, lineHeight:1, color:"var(--t)" }}>
            Tournament <span style={{ color:"var(--gold)" }}>Picks</span>
          </h2>
          <p style={{ color:"var(--t3)", fontWeight:800, fontSize:12, marginTop:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {locked ? "🔒 Picks Locked" : "⏰ Locks Mar 28 · 3:30 PM IST"}
          </p>
        </div>
        {/* Circular progress */}
        {!locked && (
          <div style={{ position:"relative", width:54, height:54, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }} viewBox="0 0 36 36">
              <path strokeDasharray="100,100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <path strokeDasharray={`${(done / 7) * 100},100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={complete ? "#10b981" : "#f97316"} strokeWidth="3" style={{ transition:"stroke-dasharray 0.5s ease" }} />
            </svg>
            <span style={{ position:"absolute", fontFamily:"var(--fd)", fontSize:20, color:"#fff" }}>{done}/7</span>
          </div>
        )}
      </div>

      {locked && saved && (
        <div className="pop" style={{ display:"flex", alignItems:"center", gap:16, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"var(--r)", padding:"16px 20px", marginBottom:20 }}>
          <span style={{ fontSize:36 }}>🧘‍♂️</span>
          <div>
            <p style={{ fontWeight:800, fontSize:16, color:"var(--green)" }}>Picks locked in!</p>
            <p style={{ fontSize:13, color:"var(--t2)", marginTop:2, fontWeight:600 }}>Time to pray your captain doesn't get ducked.</p>
          </div>
        </div>
      )}

      {/* Step tabs */}
      {!locked && (
        <div style={{ display:"flex", gap:8, marginBottom:24, background:"rgba(0,0,0,0.3)", border:"1px solid var(--bd)", borderRadius:"var(--r-sm)", padding:6 }}>
          {[["1","🏆 Podium", pred.winner && pred.finalist2],["2","🏅 Top 4", pred.top4.length===4],["3","🎖️ Players", pred.top_scorer && pred.top_wicket_taker && pred.max_sixes && pred.max_fours]].map(([n, l, isDone]) => (
            <button key={n} onClick={() => setStep(Number(n))}
              style={{ flex:1, padding:"10px 4px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"var(--fb)", fontWeight:800, fontSize:12, transition:"all .2s", textAlign:"center", background: step===Number(n) ? "var(--navy)" : "transparent", color: step===Number(n) ? "#fff" : isDone ? "var(--green)" : "var(--t3)", boxShadow: step===Number(n) ? "var(--sh)" : "none" }}>
              <div style={{ fontSize:16, marginBottom:4 }}>{isDone ? "✅" : l.split(" ")[0]}</div>
              {l.split(" ").slice(1).join(" ")}
            </button>
          ))}
        </div>
      )}

      {/* STEP 1 — Podium */}
      {(step === 1 || locked) && (
        <Card style={{ marginBottom:16 }} accent="var(--ac)">
          <SecHead icon="🏆" title="The Finals" sub="Predict IPL Champion & Runner-up" />
          <div style={{ marginBottom:24 }}>
            <label style={{ ...lblS, marginBottom:12 }}>🥇 Champion (20 pts)</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
              {TEAMS.map(t => (
                <TeamCard key={t} team={t} selected={pred.winner===t} onClick={() => { upd("winner",t); if(pred.finalist2===t) upd("finalist2",""); }} disabled={locked} small />
              ))}
            </div>
          </div>
          {pred.winner && (
            <div className="fu">
              <label style={{ ...lblS, marginBottom:12 }}>🥈 Runner-Up (10 pts)</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                {TEAMS.filter(t => t !== pred.winner).map(t => (
                  <TeamCard key={t} team={t} selected={pred.finalist2===t} onClick={() => upd("finalist2",t)} disabled={locked} small />
                ))}
              </div>
            </div>
          )}
          {!locked && <Btn onClick={() => setStep(2)} disabled={!(pred.winner && pred.finalist2)} variant="navy" style={{ marginTop:20 }}>Next: Top 4 →</Btn>}
        </Card>
      )}

      {/* STEP 2 — Top 4 */}
      {(step === 2 || locked) && (
        <Card style={{ marginBottom:16 }} accent="var(--gold)">
          <SecHead icon="🏅" title="Top 4 Playoff" sub="Pick 4 semi-finalists (5 pts each)" />
          <Top4Picker value={pred.top4} onChange={v => upd("top4",v)} disabled={locked} />
          {!locked && (
            <div style={{ display:"flex", gap:12, marginTop:20 }}>
              <Btn onClick={() => setStep(1)} variant="light" style={{ flex:"0 0 auto", width:100 }}>←</Btn>
              <Btn onClick={() => setStep(3)} disabled={pred.top4.length !== 4} variant="navy" style={{ flex:1 }}>Next: Players →</Btn>
            </div>
          )}
        </Card>
      )}

      {/* STEP 3 — Player Awards */}
      {(step === 3 || locked) && (
        <Card style={{ marginBottom:16 }} accent="var(--green)">
          <SecHead icon="🎖️" title="Player Awards" sub="Search across all 250+ IPL players" />
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <PlayerPick label="🍊 Orange Cap — Top Run Scorer (15 pts)"   value={pred.top_scorer}       onChange={v => upd("top_scorer",v)}       disabled={locked} />
            <PlayerPick label="💜 Purple Cap — Most Wickets (15 pts)"      value={pred.top_wicket_taker} onChange={v => upd("top_wicket_taker",v)} disabled={locked} />
            <PlayerPick label="💥 Most Sixes in Tournament (10 pts)"       value={pred.max_sixes}        onChange={v => upd("max_sixes",v)}        disabled={locked} />
            <PlayerPick label="🏏 Most Fours in Tournament (10 pts)"       value={pred.max_fours}        onChange={v => upd("max_fours",v)}        disabled={locked} />
          </div>
          {!locked && <Btn onClick={() => setStep(2)} variant="light" style={{ marginTop:20 }}>← Back to Top 4</Btn>}
        </Card>
      )}

      {/* Save button */}
      {!locked && (
        <div style={{ position:"sticky", bottom:90, zIndex:40, marginTop:24 }}>
          <Btn onClick={save} disabled={!complete || status==="saving"} variant={complete ? (saved ? "navy" : "green") : "light"} style={{ padding:"18px 0", fontSize:22, boxShadow: complete ? "0 10px 30px rgba(0,0,0,0.5)" : "none" }}>
            {status==="saving" ? "Consulting Umpires…" : saved ? "✅ Update Predictions" : "🔒 Lock It In"}
          </Btn>
          {status === "saved" && (
            <div className="pop" style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"var(--r-sm)", padding:"12px 16px", marginTop:12, fontSize:16, color:"var(--green)", fontWeight:800, textAlign:"center" }}>
              🎉 Predictions saved! Good luck!
            </div>
          )}
          {status?.startsWith("error:") && (
            <div className="pop" style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:"var(--r-sm)", padding:"12px 16px", marginTop:12, fontSize:14, color:"var(--red)", fontWeight:700, textAlign:"center" }}>
              ❌ {status.replace("error:","")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────
const LeaderboardScreen = ({ user }) => {
  const [players,  setPlayers]  = useState([]);
  const [actuals,  setActuals]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const users = await sb("users?select=id,name,username").catch(() => []);
        const preds = await sb("predictions?select=*").catch(() => []);
        const acts  = await sb("actuals?select=*").catch(() => []);
        const act   = acts?.[0] || null; setActuals(act);
        // Daily points
        const dp  = await sb("daily_predictions?select=user_id,points_earned").catch(() => []);
        const dm  = {}; (dp || []).forEach(p => { dm[p.user_id] = (dm[p.user_id] || 0) + (p.points_earned || 0); });
        const pm  = {}; (preds || []).forEach(p => { pm[p.user_id] = p; });
        const ranked = (users || [])
          .map(u => ({ ...u, pred: pm[u.id] || null, tScore: pm[u.id] && act ? calcTScore(pm[u.id], act) : null, dScore: dm[u.id] || 0 }))
          .map(u => ({ ...u, total: (u.tScore || 0) + u.dScore }))
          .sort((a, b) => b.total - a.total);
        setPlayers(ranked);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const top3 = players.slice(0, 3);
  const me   = players.find(p => p.id === user.id);
  const myRank = players.findIndex(p => p.id === user.id) + 1;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px" }} className="fu">
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h2 className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:46, lineHeight:1, color:"var(--t)" }}>
          Global <span style={{ color:"var(--ac)" }}>Rankings</span>
        </h2>
        <p style={{ color:"var(--t3)", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", fontSize:12, marginTop:6 }}>
          {actuals ? "Live Standings" : "Tournament not started yet"}
        </p>
      </div>

      {/* My position banner */}
      {me && actuals && (
        <div className="pop" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:"var(--r)", padding:"16px 20px", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28 }}>{"🥇🥈🥉".split("")[myRank-1] || `#${myRank}`}</span>
            <div>
              <p style={{ fontWeight:800, fontSize:14, color:"var(--t)" }}>You're #{myRank} of {players.length}</p>
              <p style={{ fontSize:12, color:"var(--t2)", marginTop:2, fontWeight:600 }}>
                {myRank === 1 ? "🏆 You're leading!" : `🔥 ${players[0].total - me.total} pts behind ${players[0].name.split(" ")[0]}`}
              </p>
            </div>
          </div>
          <p style={{ fontFamily:"var(--fd)", fontSize:32, color:"var(--ac)", lineHeight:1 }}>{me.total}</p>
        </div>
      )}

      {/* Podium */}
      {actuals && top3.length > 0 && (
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:8, height:200, marginBottom:32 }}>
          {[1, 0, 2].map(idx => {
            const m = top3[idx]; if (!m) return <div key={idx} style={{ width:"30%" }} />;
            const rank   = idx === 1 ? 2 : idx === 0 ? 1 : 3;
            const isMe   = m.id === user.id;
            const colors = { 1:"linear-gradient(to top,#ca8a04,#fde047)", 2:"linear-gradient(to top,#475569,#cbd5e1)", 3:"linear-gradient(to top,#9a3412,#fdba74)" };
            const medals = { 1:"🥇", 2:"🥈", 3:"🥉" };
            const h      = rank === 1 ? "100%" : rank === 2 ? "78%" : "58%";
            return (
              <div key={m.id} className="fu" style={{ width:"30%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", position:"relative", animationDelay:`${idx*0.1}s` }}>
                <div style={{ position:"absolute", top: rank===1?-15:rank===2?25:55, display:"flex", flexDirection:"column", alignItems:"center", zIndex:10 }}>
                  <span style={{ fontSize:26, marginBottom:4 }}>{medals[rank]}</span>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:colors[rank], display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--fd)", fontSize:22, color:"#000", boxShadow:"0 10px 20px rgba(0,0,0,0.5)", border: isMe ? "3px solid #fff" : "2px solid rgba(255,255,255,0.4)" }}>{initials(m.name)}</div>
                </div>
                <div style={{ width:"100%", height:h, background:colors[rank], borderRadius:"12px 12px 0 0", opacity:0.85, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:38, boxShadow:"inset 0 4px 10px rgba(255,255,255,0.3)" }}>
                  <span style={{ fontWeight:800, color:"#000", fontSize:12, overflow:"hidden", whiteSpace:"nowrap", width:"90%", textAlign:"center", textOverflow:"ellipsis" }}>{m.name.split(" ")[0]}</span>
                  <span style={{ fontFamily:"var(--fd)", fontSize:26, color:"#000", lineHeight:1, marginTop:4 }}>{m.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!actuals && (
        <div className="pop" style={{ display:"flex", gap:16, alignItems:"center", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:"var(--r)", padding:20, marginBottom:24 }}>
          <span style={{ fontSize:36 }}>⏳</span>
          <div>
            <p style={{ fontWeight:800, fontSize:16, color:"var(--gold)" }}>Tournament scores pending</p>
            <p style={{ fontSize:13, color:"var(--t2)", fontWeight:600, marginTop:4 }}>Admin enters results after milestones. Daily match points calculate live.</p>
          </div>
        </div>
      )}

      {/* Full list */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {players.map((p, i) => {
          const isMe = p.id === user.id;
          const pct  = p.total ? Math.max(5, Math.round((p.total / (MAX_PTS + 36)) * 100)) : 0;
          return (
            <div key={p.id} className="fu" style={{ animationDelay:`${i*0.04}s`, position:"relative", overflow:"hidden", borderRadius:"var(--r)", border: isMe ? "2px solid var(--ac)" : "1px solid var(--bd)", background: isMe ? "rgba(249,115,22,0.1)" : "var(--sf)", backdropFilter:"blur(12px)", transform: isMe ? "scale(1.02)" : "scale(1)", boxShadow: isMe ? "0 10px 30px rgba(249,115,22,0.2)" : "var(--sh)" }}>
              {actuals && <div style={{ position:"absolute", inset:0, zIndex:0, height:"100%", background:"linear-gradient(to right,rgba(249,115,22,0.15),rgba(225,29,72,0.15))", width:`${pct}%`, transition:"width 1.5s cubic-bezier(0.16,1,0.3,1)" }} />}
              <div style={{ position:"relative", zIndex:1, padding:16, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:26, color: i<3 ? "var(--gold)" : "var(--t3)", width:36, textAlign:"center" }}>#{i+1}</div>
                <Avatar name={p.name} size={42} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:800, fontSize:16, color: isMe ? "var(--ac)" : "#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</span>
                    {isMe && <Pill color="orange">You</Pill>}
                  </div>
                  {p.pred?.winner ? <div style={{ marginTop:6 }}><TeamChip team={p.pred.winner} /></div> : <div style={{ marginTop:6 }}><Pill color="red">No Pick Yet</Pill></div>}
                  <div style={{ marginTop:6, display:"flex", gap:12 }}>
                    <span style={{ fontSize:11, color:"var(--t3)", fontWeight:700 }}>🏆 <b style={{ color:"var(--t2)" }}>{p.tScore ?? "-"}</b></span>
                    <span style={{ fontSize:11, color:"var(--t3)", fontWeight:700 }}>🏏 <b style={{ color:"var(--t2)" }}>{p.dScore}</b></span>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontFamily:"var(--fd)", fontSize:38, color: actuals ? "#fff" : "var(--t3)", lineHeight:1 }}>{actuals ? p.total : "-"}</p>
                  {actuals && <p style={{ fontSize:10, color:"var(--t3)", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em" }}>PTS</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ADMIN SCREEN  — only visible at /admin
// ─────────────────────────────────────────────
const AdminScreen = () => {
  const [unlocked,    setUnlocked]    = useState(false);
  const [pwd,         setPwd]         = useState("");
  const [act,         setAct]         = useState({ winner:"", finalist2:"", top4:[], top_scorer:"", top_wicket_taker:"", max_sixes:"", max_fours:"" });
  const [saved,       setSaved]       = useState(false);
  const [participants,setParticipants]= useState([]);
  const [loading,     setLoading]     = useState(false);
  const [matches,     setMatches]     = useState([]);
  const [newMatch,    setNewMatch]    = useState({ team1:"", team2:"", venue:"", match_date:"" });
  const [matchMsg,    setMatchMsg]    = useState("");

  const unlock = () => { if (pwd === ADMIN_PWD) setUnlocked(true); else alert("Wrong password"); };
  const upd    = (k, v) => setAct(a => ({ ...a, [k]: v }));

  const loadData = async () => {
    setLoading(true);
    const rows = await sb("actuals?select=*").catch(() => []);
    if (rows?.[0]) setAct(rows[0]);
    const preds = await sb("predictions?select=user_id").catch(() => []);
    const uids  = (preds || []).map(p => p.user_id);
    if (uids.length) {
      const users = await sb(`users?id=in.(${uids.join(",")})&select=id,name,username`);
      const pf    = await sb("predictions?select=*").catch(() => []);
      const pm    = {}; (pf || []).forEach(p => { pm[p.user_id] = p; });
      setParticipants((users || []).map(u => ({ ...u, pred: pm[u.id] })));
    }
    const ms = await sb("daily_matches?select=*&order=match_date.asc").catch(() => []);
    setMatches(ms || []);
    setLoading(false);
  };

  useEffect(() => { if (unlocked) loadData(); }, [unlocked]);

  const saveResults = async () => {
    const rows = await sb("actuals?select=id").catch(() => []);
    if (rows?.length) await sb(`actuals?id=eq.${rows[0].id}`, { method:"PATCH", body:act });
    else              await sb("actuals", { method:"POST", body:act });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const addMatch = async () => {
    if (!newMatch.team1 || !newMatch.team2 || !newMatch.match_date || !newMatch.venue) return;
    await sb("daily_matches", { method:"POST", body:{ ...newMatch } });
    setNewMatch({ team1:"", team2:"", venue:"", match_date:"" });
    setMatchMsg("✅ Match added!"); setTimeout(() => setMatchMsg(""), 2500);
    await loadData();
  };

  const saveMatchResult = async (matchId, data) => {
    await sb(`daily_matches?id=eq.${matchId}`, { method:"PATCH", body:{ ...data, status:"completed" } });
    const preds = await sb(`daily_predictions?match_id=eq.${matchId}&select=*`).catch(() => []);
    await Promise.all((preds || []).map(p => {
      const pts =
        (p.predicted_winner === data.actual_winner       ? DPOINTS.winner     : 0) +
        (p.predicted_batter === data.actual_top_batter   ? DPOINTS.top_batter : 0) +
        (p.predicted_bowler === data.actual_top_bowler   ? DPOINTS.top_bowler : 0) +
        (p.predicted_potm   === data.actual_potm         ? DPOINTS.potm       : 0);
      return sb(`daily_predictions?id=eq.${p.id}`, { method:"PATCH", body:{ points_earned: pts } });
    }));
    setMatchMsg("✅ Result saved & points calculated!"); setTimeout(() => setMatchMsg(""), 3000);
    await loadData();
  };

  if (!unlocked) return (
    <div style={{ maxWidth:380, margin:"0 auto", padding:"80px 16px", textAlign:"center" }} className="fu">
      <div style={{ fontSize:64, marginBottom:20 }}>🔐</div>
      <h2 style={{ fontFamily:"var(--fd)", fontSize:42, marginBottom:8, color:"#fff" }}>Admin <span style={{ color:"var(--ac)" }}>Panel</span></h2>
      <p style={{ color:"var(--t3)", fontSize:14, marginBottom:32, fontWeight:700 }}>Restricted Access</p>
      <Card>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Inp type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Admin password" onKeyDown={e => e.key === "Enter" && unlock()} />
          <Btn onClick={unlock} variant="primary">Unlock 🔓</Btn>
        </div>
      </Card>
    </div>
  );

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px" }} className="fu">
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"var(--fd)", fontSize:36, color:"#fff" }}>Admin <span style={{ color:"var(--ac)" }}>Dashboard</span> ⚙️</h2>
      </div>

      {/* Add Match */}
      <Card style={{ marginBottom:16 }} accent="var(--ac)">
        <SecHead icon="📅" title="Schedule a Match" />
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Sel label="Team 1" value={newMatch.team1} onChange={v => setNewMatch(m => ({ ...m, team1:v }))} options={TEAMS} />
          <Sel label="Team 2" value={newMatch.team2} onChange={v => setNewMatch(m => ({ ...m, team2:v }))} options={TEAMS.filter(t => t !== newMatch.team1)} />
          <Inp label="Venue" value={newMatch.venue} onChange={e => setNewMatch(m => ({ ...m, venue:e.target.value }))} placeholder="e.g. Wankhede Stadium" />
          <Inp label="Date & Time" type="datetime-local" value={newMatch.match_date} onChange={e => setNewMatch(m => ({ ...m, match_date:e.target.value }))} />
          <Btn onClick={addMatch} disabled={!newMatch.team1||!newMatch.team2||!newMatch.match_date||!newMatch.venue} variant="navy">Add Fixture</Btn>
          {matchMsg && <p style={{ fontSize:14, fontWeight:800, color:"var(--green)", textAlign:"center" }}>{matchMsg}</p>}
        </div>
      </Card>

      {/* Pending match results */}
      {matches.filter(m => m.status !== "completed").map(m => (
        <AdminMatchResult key={m.id} match={m} onSave={d => saveMatchResult(m.id, d)} />
      ))}

      {/* Tournament actuals */}
      <Card style={{ marginBottom:16 }} accent="var(--gold)">
        <SecHead icon="🏆" title="Tournament Results" sub="Enter once tournament milestones are reached" />
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Sel label="Champion"   value={act.winner}    onChange={v => upd("winner",v)}    options={TEAMS} />
          <Sel label="Runner-Up"  value={act.finalist2} onChange={v => upd("finalist2",v)} options={TEAMS.filter(t => t !== act.winner)} />
          <Top4Picker value={act.top4 || []} onChange={v => upd("top4",v)} disabled={false} />
        </div>
      </Card>

      <Card style={{ marginBottom:16 }} accent="var(--green)">
        <SecHead icon="🎖️" title="Player Awards" />
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <PlayerPick label="Orange Cap"   value={act.top_scorer}       onChange={v => upd("top_scorer",v)} />
          <PlayerPick label="Purple Cap"   value={act.top_wicket_taker} onChange={v => upd("top_wicket_taker",v)} />
          <PlayerPick label="Most Sixes"   value={act.max_sixes}        onChange={v => upd("max_sixes",v)} />
          <PlayerPick label="Most Fours"   value={act.max_fours}        onChange={v => upd("max_fours",v)} />
        </div>
      </Card>

      <Btn onClick={saveResults} variant="primary" style={{ marginBottom:24 }}>{saved ? "✅ Saved!" : "Save Master Results"}</Btn>

      {/* Participants list */}
      <Card>
        <SecHead icon="👥" title={`Participants (${participants.length})`} />
        {participants.length === 0 && <p style={{ color:"var(--t3)", fontSize:14, textAlign:"center", padding:"16px 0" }}>No predictions submitted yet</p>}
        {participants.map((p, i) => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom: i < participants.length-1 ? "1px solid var(--bd)" : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Avatar name={p.name} size={36} />
              <div>
                <p style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{p.name}</p>
                <p style={{ fontSize:12, color:"var(--t3)", fontWeight:600 }}>@{p.username}</p>
              </div>
            </div>
            {p.pred?.winner ? <TeamChip team={p.pred.winner} /> : <Pill color="red">No Pick</Pill>}
          </div>
        ))}
      </Card>
    </div>
  );
};

// Admin: enter match result inline
const AdminMatchResult = ({ match, onSave }) => {
  const [res, setRes] = useState({ actual_winner:"", actual_top_batter:"", actual_top_bowler:"", actual_potm:"" });
  const [sv,  setSv]  = useState(false);
  const mp = [...(SQUADS[match.team1]||[]), ...(SQUADS[match.team2]||[])].sort();
  const save = async () => { setSv(true); await onSave(res); setSv(false); };
  return (
    <Card style={{ marginBottom:16 }} accent="var(--ac)">
      <SecHead icon="⚡" title={`Result: ${SHORT[match.team1]||"?"} vs ${SHORT[match.team2]||"?"}`} sub={`${fmtDate(match.match_date)} · ${match.venue}`} />
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Sel label="Winner"            value={res.actual_winner}      onChange={v => setRes(r => ({ ...r, actual_winner:v }))}      options={[match.team1, match.team2].filter(Boolean)} />
        <Sel label="Top Batter"        value={res.actual_top_batter}  onChange={v => setRes(r => ({ ...r, actual_top_batter:v }))}  options={mp} />
        <Sel label="Top Bowler"        value={res.actual_top_bowler}  onChange={v => setRes(r => ({ ...r, actual_top_bowler:v }))}  options={mp} />
        <Sel label="Player of Match"   value={res.actual_potm}        onChange={v => setRes(r => ({ ...r, actual_potm:v }))}        options={mp} />
        <Btn onClick={save} disabled={sv || !res.actual_winner} variant="primary">{sv ? "Saving…" : "Save Result & Calculate Points"}</Btn>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("ipl_user")); } catch { return null; } });
  const [tab,  setTab]  = useState("picks"); // default to Picks

  const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  const login  = u => { localStorage.setItem("ipl_user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("ipl_user"); setUser(null); };

  if (!user) return (
    <>
      <GS />
      <div className="stadium-bg">
        <div className="floodlight" style={{ left:"20%", transform:"rotate(-20deg)" }} />
        <div className="floodlight" style={{ right:"20%", transform:"rotate(20deg)" }} />
      </div>
      <AuthScreen onLogin={login} />
    </>
  );

  const navItems = [
    { id:"picks", icon:"🏆", label:"Picks" },
    { id:"today", icon:"🏏", label:"Live" },
    { id:"board", icon:"📊", label:"Ranks" },
    ...(isAdminRoute ? [{ id:"admin", icon:"⚙️", label:"Admin" }] : []),
  ];

  return (
    <>
      <GS />
      <div className="stadium-bg">
        <div className="floodlight" style={{ left:"10%", transform:"rotate(-30deg)", opacity:0.5 }} />
        <div className="floodlight" style={{ right:"10%", transform:"rotate(30deg)",  opacity:0.5 }} />
      </div>

      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", zIndex:10 }}>
        {/* Header */}
        <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(15,23,42,0.85)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid var(--bd)", boxShadow:"var(--sh)" }}>
          <div style={{ maxWidth:520, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#f97316,#e11d48)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 0 15px rgba(249,115,22,0.5)" }}>🏏</div>
              <span className="glow-text" style={{ fontFamily:"var(--fd)", fontSize:22, color:"#fff", letterSpacing:"0.05em" }}>IPL PREDICTOR</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Avatar name={user.name} size={32} />
              <span style={{ fontSize:13, color:"var(--t2)", fontWeight:700, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name.split(" ")[0]}</span>
              <button onClick={logout}
                style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:100, padding:"6px 14px", fontSize:11, fontWeight:800, color:"#fff", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.3)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                EXIT
              </button>
            </div>
          </div>
          <TeamTicker />
        </header>

        {/* Content */}
        <main style={{ flex:1, paddingBottom:100 }}>
          {tab === "picks" && <PicksScreen user={user} />}
          {tab === "today" && <TodayScreen user={user} />}
          {tab === "board" && <LeaderboardScreen user={user} />}
          {(tab === "admin" || isAdminRoute) && <AdminScreen />}
        </main>

        {/* Bottom nav */}
        <nav style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"rgba(15,23,42,0.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 -10px 40px rgba(0,0,0,0.5)", paddingBottom:"env(safe-area-inset-bottom)" }}>
          <div style={{ maxWidth:520, margin:"0 auto", display:"flex", justifyContent:"space-around", padding:"8px 0" }}>
            {navItems.map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ flex:1, padding:"8px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", opacity: active ? 1 : 0.55, transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)", position:"relative" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = 0.9; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = 0.55; }}>
                  {active && <div style={{ position:"absolute", top:-8, width:30, height:4, background:"var(--ac)", borderRadius:"0 0 4px 4px", boxShadow:"0 0 10px var(--ac)" }} />}
                  <span style={{ fontSize:26, transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)", transform: active ? "scale(1.2) translateY(-4px)" : "scale(1)", filter: active ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))" : "none" }}>{t.icon}</span>
                  <span style={{ fontSize:10, fontFamily:"var(--fb)", fontWeight:900, letterSpacing:"0.08em", textTransform:"uppercase", color: active ? "var(--ac)" : "var(--t3)", transition:"color 0.3s" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}