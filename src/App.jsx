import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
// SUPABASE CONFIG
// ─────────────────────────────────────────────
const SB_URL    = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";
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
  "Chennai Super Kings":         { bg:"#F9CD1B", fg:"#0A1931", accent:"#0A1931" },
  "Mumbai Indians":              { bg:"#004BA0", fg:"#FFFFFF", accent:"#D4AF37" },
  "Royal Challengers Bengaluru": { bg:"#C8102E", fg:"#FFFFFF", accent:"#FFD700" },
  "Kolkata Knight Riders":       { bg:"#3A225D", fg:"#F0C040", accent:"#F0C040" },
  "Sunrisers Hyderabad":         { bg:"#F7500E", fg:"#FFFFFF", accent:"#1A1A2E" },
  "Delhi Capitals":              { bg:"#17479E", fg:"#FFFFFF", accent:"#EF3340" },
  "Lucknow Super Giants":        { bg:"#A72B2A", fg:"#FBBF24", accent:"#FBBF24" },
  "Rajasthan Royals":            { bg:"#EA1A85", fg:"#FFFFFF", accent:"#1A1A6E" },
  "Gujarat Titans":              { bg:"#1C2B4A", fg:"#8AC0DE", accent:"#8AC0DE" },
  "Punjab Kings":                { bg:"#ED1B24", fg:"#FFFFFF", accent:"#FBBF24" },
};
const TEAM_EMOJI = {
  "Chennai Super Kings":"🦁","Mumbai Indians":"🔵","Royal Challengers Bengaluru":"🔴",
  "Kolkata Knight Riders":"💜","Sunrisers Hyderabad":"🌅","Delhi Capitals":"🔷",
  "Lucknow Super Giants":"🟤","Rajasthan Royals":"💗","Gujarat Titans":"⚡","Punjab Kings":"🔴",
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
const LOCK_DATE   = new Date("2026-03-28T10:00:00Z");
const isLocked    = () => new Date() >= LOCK_DATE;
const POINTS      = { winner:20, finalist2:10, top4_each:5, top_scorer:15, top_wicket_taker:15, max_sixes:10, max_fours:10 };
const MAX_PTS     = 95;

// ─────────────────────────────────────────────
// SUPABASE MINI-CLIENT
// ─────────────────────────────────────────────
const sb = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      "Content-Type":"application/json",
      Prefer: opts.prefer ?? "return=representation",
      ...(opts.headers||{}),
    },
    method: opts.method||"GET",
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(txt);
  return txt ? JSON.parse(txt) : null;
};

const calcScore = (pred, act) => {
  if (!act||!pred) return null;
  let s = 0;
  if (pred.winner===act.winner) s += POINTS.winner;
  if (pred.finalist2 && (pred.finalist2===act.finalist2||pred.finalist2===act.winner)) s += POINTS.finalist2;
  (pred.top4||[]).forEach(t=>{ if ((act.top4||[]).includes(t)) s += POINTS.top4_each; });
  if (pred.top_scorer===act.top_scorer) s += POINTS.top_scorer;
  if (pred.top_wicket_taker===act.top_wicket_taker) s += POINTS.top_wicket_taker;
  if (pred.max_sixes===act.max_sixes) s += POINTS.max_sixes;
  if (pred.max_fours===act.max_fours) s += POINTS.max_fours;
  return s;
};

const genCode    = () => Math.random().toString(36).substring(2,8).toUpperCase();
const initials   = (n="") => n.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const AV_COLORS  = ["#E8480C","#004BA0","#C8102E","#3A225D","#F7500E","#17479E","#EA1A85","#1A7A4A"];
const avColor    = (n="") => AV_COLORS[n.charCodeAt(0)%AV_COLORS.length];

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
const Confetti = ({active}) => {
  const ref = useRef(null);
  useEffect(()=>{
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pieces = Array.from({length:150},()=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height-canvas.height,
      r:Math.random()*6+4, d:Math.random()*80+40,
      color:["#E8480C","#F9CD1B","#004BA0","#C8102E","#EA1A85","#1A7A4A","#F7500E","#F0C040"][Math.floor(Math.random()*8)],
      tilt:0, tiltAngle:0, tiltSpeed:Math.random()*.1+.04,
    }));
    let angle=0, frame;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height); angle+=.01;
      pieces.forEach(p=>{
        p.tiltAngle+=p.tiltSpeed; p.y+=(Math.cos(angle+p.d)+3)*1.5;
        p.x+=Math.sin(angle)*1.5; p.tilt=Math.sin(p.tiltAngle)*12;
        ctx.beginPath(); ctx.lineWidth=p.r/2; ctx.strokeStyle=p.color;
        ctx.moveTo(p.x+p.tilt+p.r/4,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/4);
        ctx.stroke(); if(p.y>canvas.height){p.y=-10;p.x=Math.random()*canvas.width;}
      });
      frame=requestAnimationFrame(draw);
    };
    draw();
    const t=setTimeout(()=>cancelAnimationFrame(frame),3500);
    return()=>{cancelAnimationFrame(frame);clearTimeout(t);};
  },[active]);
  if (!active) return null;
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:999}}/>;
};

// ─────────────────────────────────────────────
// GLOBAL STYLES — CARNIVAL THEME
// ─────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#0D0D1A;
      --bg2:#13132A;
      --sf:#1A1A30;
      --sf2:#20203A;
      --bd:#2E2E52;
      --bd2:#3D3D6A;
      --t:#F0EFF8;
      --t2:#A8A6C8;
      --t3:#6A6890;
      --ac:#FF4D00;
      --ac2:#FF7A33;
      --gold:#FFD700;
      --gold2:#FFA500;
      --gr:#00C96B;
      --re:#FF3B5C;
      --r:16px; --r-sm:10px; --r-xs:8px;
      --sh:0 2px 12px rgba(0,0,0,.4);
      --sh-md:0 4px 24px rgba(0,0,0,.5);
      --sh-lg:0 8px 40px rgba(0,0,0,.6);
      --fd:'Bebas Neue',sans-serif;
      --fb:'Nunito',sans-serif;
      --glow-or: 0 0 20px rgba(255,77,0,.4);
      --glow-gold: 0 0 20px rgba(255,215,0,.3);
    }
    html{scroll-behavior:smooth;}
    body{background:var(--bg);color:var(--t);font-family:var(--fb);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
    button{font-family:var(--fb);}
    select{appearance:none;-webkit-appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A8A6C8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat:no-repeat;background-position:right 12px center;padding-right:38px!important;}
    select option{background:#1A1A30;color:#F0EFF8;}
    input:focus,select:focus{outline:none;border-color:var(--ac)!important;box-shadow:0 0 0 3px rgba(255,77,0,.2)!important;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    .fu{animation:fadeUp .35s ease forwards;}
    .pop{animation:pop .35s cubic-bezier(.34,1.56,.64,1) forwards;}
    .float{animation:float 3s ease-in-out infinite;}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:4px}
    .ticker-wrap{overflow:hidden;white-space:nowrap;}
    .ticker-inner{display:inline-flex;animation:marquee 24s linear infinite;}
  `}</style>
);

// ─────────────────────────────────────────────
// TEAM COLOR BADGE STRIP (animated ticker)
// ─────────────────────────────────────────────
const TeamTicker = () => {
  const items = [...TEAMS, ...TEAMS];
  return (
    <div className="ticker-wrap" style={{background:"var(--sf)",borderBottom:"1px solid var(--bd)",padding:"8px 0"}}>
      <div className="ticker-inner">
        {items.map((t,i) => {
          const c = TC[t];
          return (
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,marginRight:28,fontSize:13,fontFamily:"var(--fd)",letterSpacing:"0.06em",color:c.fg,background:c.bg,padding:"3px 12px",borderRadius:100}}>
              {SHORT[t]}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────
const inp = {
  background:"var(--sf2)",
  border:"1.5px solid var(--bd)",
  borderRadius:"var(--r-sm)",
  padding:"12px 16px",
  fontSize:14,
  color:"var(--t)",
  fontFamily:"var(--fb)",
  width:"100%",
  transition:"border-color .15s,box-shadow .15s",
};
const lbl = {
  fontSize:11,fontWeight:800,fontFamily:"var(--fb)",
  color:"var(--t2)",textTransform:"uppercase",
  letterSpacing:"0.1em",display:"block",marginBottom:6,
};

const Card = ({children, style={}, glow}) => (
  <div style={{
    background:"var(--sf)",
    border:"1.5px solid var(--bd)",
    borderRadius:"var(--r)",
    padding:20,
    boxShadow: glow ? "var(--glow-or)" : "var(--sh)",
    ...style
  }}>{children}</div>
);

const Inp = ({label,hint,...p}) => (
  <div>
    {label&&<label style={lbl}>{label}</label>}
    <input {...p} style={{...inp,...(p.style||{})}}/>
    {hint&&<p style={{fontSize:11,color:"var(--t3)",marginTop:4}}>{hint}</p>}
  </div>
);

const Sel = ({label,value,onChange,options,placeholder,disabled}) => (
  <div>
    {label&&<label style={lbl}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
      style={{...inp,cursor:disabled?"not-allowed":"pointer",color:value?"var(--t)":"var(--t3)",opacity:disabled?.6:1}}>
      <option value="">{placeholder||"Choose one…"}</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({children,variant="primary",disabled,style={},...p}) => {
  const base = {
    display:"flex",alignItems:"center",justifyContent:"center",gap:6,
    border:"none",borderRadius:"var(--r-sm)",padding:"13px 20px",
    fontFamily:"var(--fb)",fontWeight:800,fontSize:14,cursor:"pointer",
    transition:"all .15s",letterSpacing:"0.02em",width:"100%",
  };
  const v = {
    primary:{
      background:"linear-gradient(135deg,#FF4D00,#FF7A33)",
      color:"#fff",
      boxShadow:"0 4px 16px rgba(255,77,0,.4)",
    },
    secondary:{background:"var(--sf2)",color:"var(--t)",border:"1.5px solid var(--bd)"},
    ghost:{background:"transparent",color:"var(--t2)",border:"1.5px solid var(--bd)"},
    gold:{
      background:"linear-gradient(135deg,#FFD700,#FFA500)",
      color:"#1A1A00",
      boxShadow:"0 4px 16px rgba(255,215,0,.3)",
    },
  };
  return (
    <button {...p} disabled={disabled}
      style={{...base,...(v[variant]||v.primary),...style,opacity:disabled?.4:1,cursor:disabled?"not-allowed":"pointer"}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.filter="brightness(1.1)";}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.filter="none";}}>
      {children}
    </button>
  );
};

const Badge = ({children,color="orange"}) => {
  const c = {
    orange:{bg:"rgba(255,77,0,.15)",tc:"#FF7A33",bd:"rgba(255,77,0,.3)"},
    green: {bg:"rgba(0,201,107,.15)",tc:"#00C96B",bd:"rgba(0,201,107,.3)"},
    red:   {bg:"rgba(255,59,92,.15)",tc:"#FF3B5C",bd:"rgba(255,59,92,.3)"},
    grey:  {bg:"rgba(168,166,200,.1)",tc:"#A8A6C8",bd:"rgba(168,166,200,.2)"},
    gold:  {bg:"rgba(255,215,0,.15)",tc:"#FFD700",bd:"rgba(255,215,0,.3)"},
  }[color]||{bg:"rgba(168,166,200,.1)",tc:"#A8A6C8",bd:"rgba(168,166,200,.2)"};
  return (
    <span style={{
      display:"inline-block",background:c.bg,color:c.tc,
      border:`1px solid ${c.bd}`,
      fontSize:10,fontWeight:800,letterSpacing:"0.07em",
      textTransform:"uppercase",padding:"3px 9px",borderRadius:100,whiteSpace:"nowrap",
    }}>{children}</span>
  );
};

const Avatar = ({name,size=36}) => (
  <div style={{
    width:size,height:size,borderRadius:"50%",
    background:`linear-gradient(135deg,${avColor(name)},${avColor(name+"x")})`,
    display:"flex",alignItems:"center",justifyContent:"center",
    flexShrink:0,color:"#fff",fontFamily:"var(--fb)",fontWeight:900,fontSize:size*.36,
    boxShadow:"0 2px 8px rgba(0,0,0,.3)",border:"2px solid rgba(255,255,255,.1)",
  }}>
    {initials(name)}
  </div>
);

// Big visual team card for picking
const TeamCard = ({team, selected, onClick, disabled, size="md"}) => {
  const c = TC[team];
  const isSmall = size === "sm";
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        border: selected ? `2.5px solid ${c.bg}` : "2px solid var(--bd)",
        borderRadius: isSmall ? "var(--r-sm)" : "var(--r)",
        background: selected
          ? `linear-gradient(135deg,${c.bg}22,${c.bg}44)`
          : "var(--sf2)",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: isSmall ? "10px 8px" : "14px 10px",
        display:"flex",flexDirection:"column",alignItems:"center",gap: isSmall ? 4 : 6,
        transition:"all .2s",
        boxShadow: selected ? `0 0 16px ${c.bg}44` : "none",
        opacity: disabled && !selected ? 0.4 : 1,
        position:"relative",overflow:"hidden",
      }}
      onMouseEnter={e=>{ if(!disabled&&!selected){ e.currentTarget.style.borderColor=c.bg+"88"; e.currentTarget.style.transform="translateY(-2px)"; }}}
      onMouseLeave={e=>{ if(!selected){ e.currentTarget.style.borderColor="var(--bd)"; e.currentTarget.style.transform="none"; }}}
    >
      {selected && (
        <div style={{position:"absolute",top:6,right:6,width:18,height:18,borderRadius:"50%",background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900}}>✓</div>
      )}
      <div style={{
        width: isSmall ? 36 : 48, height: isSmall ? 36 : 48,
        borderRadius: isSmall ? 10 : 14,
        background: `linear-gradient(135deg,${c.bg},${c.bg}cc)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize: isSmall ? 18 : 24,
        boxShadow: selected ? `0 4px 12px ${c.bg}66` : "none",
      }}>
        {TEAM_EMOJI[team] || "🏏"}
      </div>
      <span style={{
        fontFamily:"var(--fd)",
        fontSize: isSmall ? 16 : 20,
        letterSpacing:"0.05em",
        color: selected ? c.bg : "var(--t)",
        lineHeight:1,
      }}>{SHORT[team]}</span>
      {!isSmall && (
        <span style={{fontSize:9,color:"var(--t3)",fontWeight:700,textAlign:"center",lineHeight:1.2,maxWidth:70}}>
          {team.split(" ").slice(-2).join(" ")}
        </span>
      )}
    </button>
  );
};

const TeamChip = ({team,size="sm"}) => {
  const c = TC[team]||{bg:"#ccc",fg:"#333"};
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      background:`${c.bg}22`,
      color:c.bg,
      border:`1.5px solid ${c.bg}55`,
      borderRadius:100,
      padding:size==="lg"?"6px 14px 6px 10px":"4px 10px 4px 7px",
      fontFamily:"var(--fb)",fontWeight:800,
      fontSize:size==="lg"?13:11,whiteSpace:"nowrap",
    }}>
      <span style={{width:size==="lg"?10:7,height:size==="lg"?10:7,borderRadius:"50%",background:c.bg,flexShrink:0}}/>
      {size==="lg"?team:SHORT[team]||team}
    </span>
  );
};

const SecHead = ({step,icon,title,sub}) => (
  <div style={{marginBottom:18}}>
    {step&&<div style={{fontSize:10,fontWeight:800,color:"var(--ac)",textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:4}}>Step {step}</div>}
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {icon&&<span style={{fontSize:20}}>{icon}</span>}
      <h3 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:20,color:"var(--t)",letterSpacing:"0.03em"}}>{title}</h3>
    </div>
    {sub&&<p style={{fontSize:12,color:"var(--t3)",marginTop:3,marginLeft:icon?"28px":"0"}}>{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────
// SEARCHABLE PLAYER PICKER
// ─────────────────────────────────────────────
const PlayerPick = ({label,value,onChange,disabled}) => {
  const [q,setQ]       = useState("");
  const [open,setOpen] = useState(false);
  const ref            = useRef(null);

  useEffect(()=>{
    const h = e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const filtered = ALL_PLAYERS.filter(p=>p.toLowerCase().includes(q.toLowerCase())).slice(0,50);
  const teamOf   = p => Object.entries(SQUADS).find(([,sq])=>sq.includes(p))?.[0];
  const team = value ? teamOf(value) : null;
  const tc = team ? TC[team] : null;

  return (
    <div ref={ref} style={{position:"relative"}}>
      {label&&<label style={lbl}>{label}</label>}
      <div onClick={()=>{ if(!disabled){setOpen(o=>!o);setQ("");} }}
        style={{
          ...inp,cursor:disabled?"not-allowed":"pointer",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          opacity:disabled?.6:1,userSelect:"none",
          borderColor: value ? (tc ? tc.bg+"88" : "var(--ac)") : "var(--bd)",
          background: value && tc ? `${tc.bg}11` : "var(--sf2)",
        }}>
        <div style={{flex:1,overflow:"hidden",display:"flex",alignItems:"center",gap:8}}>
          {value && tc && <span style={{width:8,height:8,borderRadius:"50%",background:tc.bg,flexShrink:0}}/>}
          <span style={{color:value?"var(--t)":"var(--t3)",fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value||"Search player…"}</span>
          {value&&<span style={{fontSize:10,color:"var(--t3)",marginLeft:4,flexShrink:0,background:"var(--sf2)",padding:"2px 6px",borderRadius:6}}>{SHORT[teamOf(value)]||""}</span>}
        </div>
        <span style={{color:"var(--t3)",fontSize:11,marginLeft:8,flexShrink:0}}>▾</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:200,background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",boxShadow:"var(--sh-lg)",overflow:"hidden"}}>
          <div style={{padding:10,borderBottom:"1px solid var(--bd)"}}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a name…" style={{...inp,padding:"9px 13px",fontSize:13,background:"var(--bg)"}}/>
          </div>
          <div style={{maxHeight:220,overflowY:"auto"}}>
            {filtered.length===0&&<div style={{padding:"14px 16px",color:"var(--t3)",fontSize:13}}>No players found</div>}
            {filtered.map(p=>{
              const pteam=teamOf(p); const c=TC[pteam]||{bg:"#888"};
              return (
                <div key={p} onClick={()=>{onChange(p);setOpen(false);setQ("");}}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",
                    background:value===p?`${c.bg}22`:"transparent",
                    borderLeft:value===p?`3px solid ${c.bg}`:"3px solid transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background=value===p?`${c.bg}22`:"var(--sf2)"}
                  onMouseLeave={e=>e.currentTarget.style.background=value===p?`${c.bg}22`:"transparent"}>
                  <span style={{fontSize:14,fontWeight:value===p?700:400,color:"var(--t)"}}>{p}</span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:c.bg}}/><span style={{color:"var(--t3)"}}>{SHORT[pteam]||""}</span>
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

// ─────────────────────────────────────────────
// TOP-4 PICKER — visual team grid
// ─────────────────────────────────────────────
const Top4 = ({value,onChange,excluded,disabled}) => {
  const toggle = t => {
    if (value.includes(t)) onChange(value.filter(x=>x!==t));
    else if (value.length<4) onChange([...value,t]);
  };
  const available = TEAMS.filter(t=>!excluded.includes(t));
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <label style={lbl}>Top 4 Playoff Teams</label>
        <Badge color={value.length===4?"green":"gold"}>{value.length}/4 picked</Badge>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {available.map(t=>{
          const on=value.includes(t); const full=!on&&value.length>=4;
          return (
            <TeamCard key={t} team={t} selected={on} onClick={()=>toggle(t)} disabled={disabled||full} size="sm"/>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────
const AuthScreen = ({onLogin}) => {
  const [mode,setMode] = useState("login");
  const [form,setForm] = useState({username:"",password:"",name:""});
  const [err,setErr]   = useState("");
  const [busy,setBusy] = useState(false);
  const urlCode = (()=>{ try{const m=window.location.pathname.match(/\/join\/([A-Z0-9]{4,8})/i);return m?m[1].toUpperCase():null;}catch{return null;}})();
  const set = k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const submit = async()=>{
    setErr(""); setBusy(true);
    try {
      let user;
      if (mode==="signup"){
        if(!form.name.trim()||!form.username.trim()||!form.password.trim()) throw new Error("Please fill in all fields");
        const ex=await sb(`users?username=eq.${form.username.toLowerCase()}&select=id`);
        if(ex?.length) throw new Error("Username taken — try another");
        [user]=await sb("users",{method:"POST",body:{username:form.username.toLowerCase().trim(),password:form.password,name:form.name.trim()}});
      } else {
        const rows=await sb(`users?username=eq.${form.username.toLowerCase()}&password=eq.${form.password}&select=*`);
        if(!rows?.length) throw new Error("Wrong username or password");
        user=rows[0];
      }
      if(urlCode){
        try{
          const rows=await sb(`leagues?code=eq.${urlCode}&select=*`);
          if(rows?.length){
            const l=rows[0];
            const al=await sb(`league_members?league_id=eq.${l.id}&user_id=eq.${user.id}&select=id`);
            if(!al?.length) await sb("league_members",{method:"POST",body:{league_id:l.id,user_id:user.id}});
          }
        } catch{}
        window.history.replaceState({},"","/");
      }
      onLogin(user);
    } catch(e){setErr(e.message);}
    setBusy(false);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden",background:"var(--bg)"}}>

      {/* Animated background blobs */}
      <div style={{position:"absolute",top:-120,right:-80,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,#FF4D0020,transparent 70%)",pointerEvents:"none",animation:"float 6s ease-in-out infinite"}}/>
      <div style={{position:"absolute",bottom:-100,left:-100,width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,#FFD70018,transparent 70%)",pointerEvents:"none",animation:"float 8s ease-in-out infinite reverse"}}/>
      <div style={{position:"absolute",top:"40%",left:-60,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,#C8102E15,transparent 70%)",pointerEvents:"none"}}/>

      {/* Team color strip */}
      <div style={{position:"absolute",top:0,left:0,right:0}}>
        {TEAMS.map((t,i)=>(
          <div key={i} style={{position:"absolute",top:0,left:`${i*10}%`,width:"10%",height:4,background:TC[t].bg,opacity:0.8}}/>
        ))}
      </div>

      <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}} className="fu">

        {/* Logo block */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="float" style={{
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            width:80,height:80,borderRadius:22,
            background:"linear-gradient(135deg,#FF4D00,#FF7A33)",
            fontSize:36,marginBottom:16,
            boxShadow:"0 12px 40px rgba(255,77,0,.5)",
          }}>🏏</div>
          <h1 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:44,color:"var(--t)",lineHeight:1,letterSpacing:"0.05em"}}>IPL PREDICTION</h1>
          <h2 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:28,color:"var(--gold)",letterSpacing:"0.1em",marginTop:2}}>LEAGUE 2026</h2>
          <p style={{fontSize:12,color:"var(--t3)",letterSpacing:"0.15em",textTransform:"uppercase",marginTop:10}}>⚡ Predict · Compete · Win ⚡</p>
        </div>

        {/* Team color pills */}
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          {TEAMS.map(t=>(
            <span key={t} style={{
              background:TC[t].bg,color:TC[t].fg,
              fontSize:10,fontFamily:"var(--fd)",letterSpacing:"0.08em",
              padding:"3px 10px",borderRadius:100,fontWeight:400,
            }}>{SHORT[t]}</span>
          ))}
        </div>

        {/* How it works */}
        <div style={{
          background:"rgba(255,215,0,.07)",
          border:"1px solid rgba(255,215,0,.2)",
          borderRadius:"var(--r)",padding:"13px 16px",marginBottom:18,
        }}>
          <p style={{fontSize:10,fontWeight:800,color:"var(--gold)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>🎯 How it works</p>
          {["1. Join a league with your friends","2. Make your IPL 2026 predictions","3. Watch the live leaderboard!"].map((s,i)=>(
            <p key={i} style={{fontSize:13,color:"var(--t2)",marginBottom:i<2?4:0,fontWeight:600}}>{s}</p>
          ))}
        </div>

        {urlCode&&<div className="pop" style={{background:"rgba(0,201,107,.1)",border:"1px solid rgba(0,201,107,.3)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,fontSize:13,color:"var(--gr)",fontWeight:700,display:"flex",alignItems:"center",gap:8}}>🔗 You've been invited! Sign in to join.</div>}

        {/* Mode toggle */}
        <div style={{display:"flex",background:"var(--sf)",borderRadius:"var(--r-sm)",padding:4,marginBottom:16,border:"1.5px solid var(--bd)"}}>
          {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--fb)",fontWeight:800,fontSize:13,transition:"all .15s",
                background:mode===m?"linear-gradient(135deg,#FF4D00,#FF7A33)":"transparent",
                color:mode===m?"#fff":"var(--t3)",
                boxShadow:mode===m?"0 4px 12px rgba(255,77,0,.3)":"none",
              }}>{l}</button>
          ))}
        </div>

        <Card style={{boxShadow:"var(--sh-lg)"}}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {mode==="signup"&&<Inp label="Your Name" value={form.name} onChange={set("name")} placeholder="e.g. Swapnil"/>}
            <Inp label="Username" value={form.username} onChange={set("username")} placeholder="your_username" autoCapitalize="none"/>
            <Inp label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            {err&&<div style={{background:"rgba(255,59,92,.1)",border:"1px solid rgba(255,59,92,.3)",borderRadius:"var(--r-sm)",padding:"10px 13px",fontSize:13,color:"var(--re)",display:"flex",gap:8,fontWeight:600}}>⚠️ {err}</div>}
            <Btn onClick={submit} disabled={busy} style={{padding:"15px 0",fontSize:15}}>{busy?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}</Btn>
          </div>
        </Card>
        <p style={{textAlign:"center",fontSize:11,color:"var(--t3)",marginTop:14}}>🔒 Predictions lock 28 Mar · 3:30 PM IST</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LEAGUES SCREEN
// ─────────────────────────────────────────────
const LeaguesScreen = ({user,onEnterLeague}) => {
  const [leagues,setLeagues] = useState([]);
  const [loading,setLoading] = useState(true);
  const [joinCode,setJoinCode] = useState("");
  const [err,setErr]         = useState("");
  const [busy,setBusy]       = useState(false);
  const [toast,setToast]     = useState("");
  const [view,setView]       = useState("list");

  const load = useCallback(async()=>{
    setLoading(true);
    try{
      const ms=await sb(`league_members?user_id=eq.${user.id}&select=league_id`);
      const ids=(ms||[]).map(m=>m.league_id);
      if(!ids.length){setLeagues([]);setLoading(false);return;}
      const rows=await sb(`leagues?id=in.(${ids.join(",")})&select=*&order=created_at.asc`);
      const counts=await Promise.all((rows||[]).map(l=>sb(`league_members?league_id=eq.${l.id}&select=user_id`)));
      setLeagues((rows||[]).map((l,i)=>({...l,member_count:counts[i]?.length||0})));
    } catch(e){setErr(e.message);}
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);

  const join = async()=>{
    if(joinCode.length<4) return;
    setBusy(true); setErr("");
    try{
      const rows=await sb(`leagues?code=eq.${joinCode.trim().toUpperCase()}&select=*`);
      if(!rows?.length) throw new Error("League not found — double-check the code with your friend");
      const league=rows[0];
      const al=await sb(`league_members?league_id=eq.${league.id}&user_id=eq.${user.id}&select=id`);
      if(al?.length) throw new Error("You're already in this league!");
      await sb("league_members",{method:"POST",body:{league_id:league.id,user_id:user.id}});
      setJoinCode(""); setView("list");
      setToast(`You've joined "${league.name}"! 🎉`);
      setTimeout(()=>setToast(""),4000);
      load();
    } catch(e){setErr(e.message);}
    setBusy(false);
  };

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px"}} className="fu">

      {/* Hero welcome */}
      <div style={{
        background:"linear-gradient(135deg,#1A1A30,#20203A)",
        border:"1.5px solid var(--bd)",borderRadius:"var(--r)",
        padding:"20px 20px 16px",marginBottom:16,
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,#FF4D0015,transparent 70%)"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <p style={{fontSize:11,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:800,marginBottom:4}}>Welcome back</p>
            <h2 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:28,color:"var(--t)",letterSpacing:"0.03em"}}>{user.name} 👋</h2>
          </div>
          <Avatar name={user.name} size={48}/>
        </div>
        <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
          <Badge color="orange">🏏 IPL 2026</Badge>
          <Badge color="gold">⏰ Locks 28 Mar</Badge>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h3 style={{fontFamily:"var(--fd)",fontSize:22,color:"var(--t)",letterSpacing:"0.04em"}}>My Leagues</h3>
        {view==="list"
          ? <Btn onClick={()=>{setView("join");setErr("");}} variant="secondary" style={{width:"auto",padding:"10px 16px",fontSize:13}}>🔗 Join League</Btn>
          : <Btn onClick={()=>{setView("list");setErr("");}} variant="ghost"     style={{width:"auto",padding:"10px 16px",fontSize:13}}>← Back</Btn>
        }
      </div>

      {toast&&<div className="pop" style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,201,107,.1)",border:"1px solid rgba(0,201,107,.3)",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:12}}><span style={{fontSize:22}}>🎉</span><span style={{fontWeight:700,fontSize:14,color:"var(--gr)"}}>{toast}</span></div>}
      {err&&<div style={{background:"rgba(255,59,92,.1)",border:"1px solid rgba(255,59,92,.3)",borderRadius:"var(--r-sm)",padding:"11px 14px",marginBottom:12,fontSize:13,color:"var(--re)",fontWeight:600}}>⚠️ {err}</div>}

      {view==="join"&&(
        <Card style={{marginBottom:14}} glow>
          <SecHead icon="🔗" title="Join a League" sub="Ask your league admin for their 6-character code"/>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <Inp label="League Code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. RCB007" maxLength={6}
              style={{letterSpacing:"0.3em",fontFamily:"var(--fd)",fontSize:24,textAlign:"center",fontWeight:400,background:"var(--bg)"}} onKeyDown={e=>e.key==="Enter"&&join()}/>
            <Btn onClick={join} disabled={busy||joinCode.length<4} style={{padding:"14px 0"}}>{busy?"Joining…":"Join League →"}</Btn>
          </div>
        </Card>
      )}

      {view==="list"&&(
        loading ? (
          <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)",fontSize:14}}>Loading your leagues…</div>
        ) : leagues.length===0 ? (
          <div style={{textAlign:"center",padding:"48px 16px"}}>
            <div style={{fontSize:52,marginBottom:12}} className="float">🏟️</div>
            <p style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:24,color:"var(--t)",letterSpacing:"0.04em"}}>No League Yet</p>
            <p style={{fontSize:13,color:"var(--t3)",margin:"8px 0 22px",fontWeight:600}}>Enter a code to start playing with friends 👇</p>
            <Btn onClick={()=>setView("join")} style={{width:"auto",padding:"13px 28px",margin:"0 auto"}}>🔗 Enter League Code</Btn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {leagues.map(l=>{
              const colorIndex = l.name.charCodeAt(0) % TEAMS.length;
              const teamColor = TC[TEAMS[colorIndex]].bg;
              return (
                <button key={l.id} onClick={()=>onEnterLeague(l)}
                  style={{width:"100%",textAlign:"left",background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",padding:"16px 18px",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",overflow:"hidden"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=teamColor+"88";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${teamColor}22`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:teamColor,borderRadius:"4px 0 0 4px"}}/>
                  <div style={{paddingLeft:8}}>
                    <p style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:18,color:"var(--t)",letterSpacing:"0.03em"}}>{l.name}</p>
                    <p style={{fontSize:12,color:"var(--t3)",marginTop:3,fontWeight:600}}>{l.member_count} member{l.member_count!==1?"s":""}</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                    <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:15,letterSpacing:"0.25em",color:teamColor,background:`${teamColor}15`,padding:"4px 12px",borderRadius:100}}>{l.code}</span>
                    {l.created_by===user.id&&<Badge color="gold">Admin</Badge>}
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// LEAGUE DETAIL — Leaderboard
// ─────────────────────────────────────────────
const LeagueScreen = ({league,user,onBack}) => {
  const [members,setMembers] = useState([]);
  const [actuals,setActuals] = useState(null);
  const [loading,setLoading] = useState(true);
  const [copied,setCopied]   = useState(false);
  const medals = ["🥇","🥈","🥉"];
  const medalColors = ["#FFD700","#C0C0C0","#CD7F32"];

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const mems=await sb(`league_members?league_id=eq.${league.id}&select=user_id`);
        const uids=mems.map(m=>m.user_id);
        const users=await sb(`users?id=in.(${uids.join(",")})&select=id,username,name`);
        const preds=uids.length?await sb(`predictions?user_id=in.(${uids.join(",")})&select=*`):[];
        const acts=await sb(`actuals?select=*`);
        const act=acts?.[0]||null; setActuals(act);
        const pm={}; (preds||[]).forEach(p=>{pm[p.user_id]=p;});
        const ranked=(users||[]).map(u=>({...u,pred:pm[u.id]||null,score:pm[u.id]&&act?calcScore(pm[u.id],act):null,hasPred:!!pm[u.id]}))
          .sort((a,b)=>{ if(a.score===null&&b.score===null) return 0; if(a.score===null) return 1; if(b.score===null) return -1; return b.score-a.score; });
        setMembers(ranked);
      } catch(e){console.error(e);}
      setLoading(false);
    })();
  },[league.id]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${league.code}`).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
  };

  const me       = members.find(m=>m.id===user.id);
  const myRank   = members.findIndex(m=>m.id===user.id)+1;
  const leader   = members[0];
  const ptsBehind = leader&&me&&me.score!==null&&leader.score!==null&&me.id!==leader.id ? leader.score-me.score : null;

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px"}} className="fu">

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <button onClick={onBack} style={{width:40,height:40,borderRadius:12,background:"var(--sf)",border:"1.5px solid var(--bd)",cursor:"pointer",fontSize:16,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--ac)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";}}>←</button>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:24,color:"var(--t)",letterSpacing:"0.04em"}}>{league.name}</h2>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <button onClick={copyLink} style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,77,0,.1)",border:"1px solid rgba(255,77,0,.25)",borderRadius:100,padding:"4px 12px",cursor:"pointer"}}>
              <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:14,letterSpacing:"0.2em",color:"var(--ac)"}}>{league.code}</span>
              <span style={{fontSize:11,color:"var(--t3)",fontWeight:700}}>{copied?"✓ Copied!":"📋"}</span>
            </button>
            <span style={{fontSize:12,color:"var(--t3)",fontWeight:600}}>{members.length} players</span>
          </div>
        </div>
      </div>

      {/* My position banner */}
      {actuals&&me?.score!==null&&(
        <div className="pop" style={{
          background:"linear-gradient(135deg,rgba(255,77,0,.12),rgba(255,122,51,.08))",
          border:"1.5px solid rgba(255,77,0,.3)",
          borderRadius:"var(--r)",padding:"16px 20px",marginBottom:14,
          display:"flex",alignItems:"center",justifyContent:"space-between",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:36}}>{medals[myRank-1]||`#${myRank}`}</span>
            <div>
              <p style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:18,color:"var(--t)",letterSpacing:"0.03em"}}>You're #{myRank} of {members.length}</p>
              <p style={{fontSize:12,color:"var(--t2)",marginTop:3,fontWeight:600}}>{ptsBehind?`🔥 ${ptsBehind} pts behind ${leader.name.split(" ")[0]}`:"🏆 You're leading!"}</p>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:34,color:"var(--ac)",lineHeight:1}}>{me.score}</p>
            <p style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>/ {MAX_PTS} pts</p>
          </div>
        </div>
      )}

      {loading?(
        <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading leaderboard…</div>
      ):(
        <>
          {!actuals&&(
            <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.2)",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:14}}>
              <span style={{fontSize:24}}>⏳</span>
              <div>
                <p style={{fontWeight:800,fontSize:13,color:"var(--gold)"}}>Tournament not started yet</p>
                <p style={{fontSize:12,color:"var(--t3)",marginTop:2,fontWeight:600}}>Scores appear once the admin enters results</p>
              </div>
            </div>
          )}

          {/* Top 3 podium if results are in */}
          {actuals && members.length >= 3 && members[0].score !== null && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:8,marginBottom:14,alignItems:"flex-end"}}>
              {[members[1],members[0],members[2]].map((m,idx)=>{
                const rank = idx===1?1:idx===0?2:3;
                const mc = medalColors[rank-1];
                if (!m) return <div key={idx}/>;
                return (
                  <div key={m.id} style={{
                    background:`linear-gradient(180deg,${mc}18,${mc}08)`,
                    border:`1.5px solid ${mc}44`,
                    borderRadius:"var(--r)",
                    padding:"14px 10px 12px",textAlign:"center",
                    boxShadow:`0 4px 20px ${mc}22`,
                  }}>
                    <div style={{fontSize:rank===1?32:24,marginBottom:6}}>{medals[rank-1]}</div>
                    <Avatar name={m.name} size={rank===1?44:36} />
                    <p style={{fontWeight:800,fontSize:12,color:"var(--t)",marginTop:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name.split(" ")[0]}</p>
                    {m.score!==null&&<p style={{fontFamily:"var(--fd)",fontSize:rank===1?24:18,color:mc,marginTop:4}}>{m.score}</p>}
                    {m.pred?.winner&&<div style={{marginTop:6,display:"flex",justifyContent:"center"}}><TeamChip team={m.pred.winner}/></div>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {members.map((m,i)=>{
              const isMe=m.id===user.id;
              const pct=m.score!==null?Math.round((m.score/MAX_PTS)*100):0;
              const mc = i < 3 && actuals ? medalColors[i] : null;
              return (
                <div key={m.id} style={{
                  background:isMe?"rgba(255,77,0,.07)":"var(--sf)",
                  border:`1.5px solid ${isMe?"rgba(255,77,0,.3)":mc?`${mc}33`:"var(--bd)"}`,
                  borderRadius:"var(--r)",padding:"13px 16px",
                  boxShadow: mc ? `0 2px 12px ${mc}18` : "none",
                  transition:"all .2s",
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,textAlign:"center",flexShrink:0,fontSize:i<3&&actuals?22:13,fontFamily:"var(--fb)",fontWeight:800,color:mc||"var(--t3)"}}>
                      {actuals&&i<3?medals[i]:`#${i+1}`}
                    </div>
                    <Avatar name={m.name}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"var(--fb)",fontWeight:800,fontSize:14,color:isMe?"var(--ac)":"var(--t)"}}>{m.name}</span>
                        {isMe&&<Badge color="orange">You</Badge>}
                        {!m.hasPred&&<Badge color="red">No pick yet</Badge>}
                      </div>
                      {m.pred?.winner&&<div style={{marginTop:5}}><TeamChip team={m.pred.winner}/></div>}
                      {actuals&&m.score!==null&&(
                        <div style={{marginTop:8,height:5,background:"var(--bg)",borderRadius:100,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:100,background:`linear-gradient(90deg,var(--ac),#FF9A33)`,width:`${pct}%`,transition:"width 1s cubic-bezier(.4,0,.2,1)"}}/>
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {actuals&&m.score!==null?(
                        <>
                          <p style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:26,color:isMe?"var(--ac)":mc||"var(--t)",lineHeight:1}}>{m.score}</p>
                          <p style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>/{MAX_PTS}</p>
                        </>
                      ):<span style={{color:"var(--bd2)",fontSize:18}}>—</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {actuals&&(
            <Card style={{marginTop:14}}>
              <SecHead icon="📊" title="Tournament Results"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["🏆 Champion",actuals.winner],["🥈 Runner-Up",actuals.finalist2],["🍊 Orange Cap",actuals.top_scorer],["💜 Purple Cap",actuals.top_wicket_taker],["💥 Most Sixes",actuals.max_sixes],["🏏 Most Fours",actuals.max_fours]].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k} style={{background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"10px 12px",border:"1px solid var(--bd)"}}>
                    <p style={{fontSize:11,color:"var(--t3)",fontWeight:700}}>{k}</p>
                    <p style={{fontSize:13,fontWeight:800,color:"var(--t)",marginTop:3}}>{v}</p>
                    {TEAMS.includes(v)&&<div style={{marginTop:6}}><TeamChip team={v}/></div>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MY PICKS SCREEN
// ─────────────────────────────────────────────
const PicksScreen = ({user}) => {
  const locked = isLocked();
  const empty  = {winner:"",finalist2:"",top4:[],top_scorer:"",top_wicket_taker:"",max_sixes:"",max_fours:""};
  const [pred,setPred]     = useState(empty);
  const [saved,setSaved]   = useState(false);
  const [step,setStep]     = useState(1);
  const [loading,setLoading] = useState(true);
  const [status,setStatus] = useState(null);
  const [confetti,setConfetti] = useState(false);

  useEffect(()=>{
    (async()=>{
      const rows=await sb(`predictions?user_id=eq.${user.id}&select=*`);
      if(rows?.length){setPred(rows[0]);setSaved(true);}
      setLoading(false);
    })();
  },[user.id]);

  const upd = (k,v)=>setPred(p=>({...p,[k]:v}));
  const fields = [pred.winner,pred.finalist2,pred.top4.length===4,pred.top_scorer,pred.top_wicket_taker,pred.max_sixes,pred.max_fours];
  const done   = fields.filter(Boolean).length;
  const complete = done===7;

  const save = async()=>{
    if(!complete) return;
    setStatus("saving");
    try{
      if(saved){
        await sb(`predictions?user_id=eq.${user.id}`,{method:"PATCH",body:{...pred,updated_at:new Date().toISOString()}});
      } else {
        await sb("predictions",{method:"POST",body:{...pred,user_id:user.id}});
        setConfetti(true); setTimeout(()=>setConfetti(false),3500);
      }
      setSaved(true); setStatus("saved"); setTimeout(()=>setStatus(null),4000);
    } catch(e){setStatus("error:"+e.message);}
  };

  const exclF4   = [pred.winner].filter(Boolean);
  const exclTop4 = [pred.winner,pred.finalist2].filter(Boolean);
  const canNext1 = !!(pred.winner&&pred.finalist2);
  const canNext2 = pred.top4.length===4;

  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>;

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px"}} className="fu">
      <Confetti active={confetti}/>

      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:28,color:"var(--t)",letterSpacing:"0.04em"}}>My Picks 🎯</h2>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
          {locked?<Badge color="red">🔒 Locked</Badge>:<Badge color="orange">⏰ Locks 28 Mar · 3:30 PM IST</Badge>}
          {saved&&!locked&&<Badge color="green">✓ Saved</Badge>}
        </div>
      </div>

      {locked&&saved&&(
        <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(0,201,107,.08)",border:"1px solid rgba(0,201,107,.25)",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:14}}>
          <span style={{fontSize:24}}>🎉</span>
          <div>
            <p style={{fontWeight:800,fontSize:13,color:"var(--gr)"}}>Your picks are locked in!</p>
            <p style={{fontSize:12,color:"var(--t3)",marginTop:2,fontWeight:600}}>Check the leaderboard once the tournament starts</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!locked&&(
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Progress</span>
            <span style={{fontSize:12,fontWeight:800,color:complete?"var(--gr)":"var(--t2)"}}>{done}/7 complete</span>
          </div>
          <div style={{height:8,background:"var(--sf)",borderRadius:100,overflow:"hidden",border:"1px solid var(--bd)"}}>
            <div style={{height:"100%",borderRadius:100,background:complete?"linear-gradient(90deg,#00C96B,#00E07A)":"linear-gradient(90deg,#FF4D00,#FF7A33)",width:`${(done/7)*100}%`,transition:"width .4s ease",boxShadow:complete?"0 0 8px rgba(0,201,107,.5)":"0 0 8px rgba(255,77,0,.5)"}}/>
          </div>
        </div>
      )}

      {/* Step pills */}
      {!locked&&(
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[["1","Tournament","🏆"],["2","Top 4","🏅"],["3","Players","🎖️"]].map(([n,l,ic])=>(
            <button key={n} onClick={()=>setStep(Number(n))}
              style={{flex:1,padding:"12px 6px",borderRadius:"var(--r-sm)",
                border:`1.5px solid ${step===Number(n)?"var(--ac)":"var(--bd)"}`,
                background:step===Number(n)?"linear-gradient(135deg,rgba(255,77,0,.15),rgba(255,77,0,.05))":"var(--sf)",
                color:step===Number(n)?"var(--ac)":"var(--t3)",
                fontFamily:"var(--fb)",fontWeight:800,fontSize:11,cursor:"pointer",transition:"all .15s",textAlign:"center",
                boxShadow:step===Number(n)?"0 0 12px rgba(255,77,0,.2)":"none",
              }}>
              <div style={{fontSize:16,marginBottom:2}}>{ic}</div>
              <div style={{fontSize:9,opacity:.7,marginBottom:1,letterSpacing:"0.1em"}}>STEP {n}</div>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* STEP 1 — visual team picker */}
      {(step===1||locked)&&(
        <Card style={{marginBottom:10}}>
          <SecHead step={locked?null:1} icon="🏆" title="Tournament Podium" sub="Who wins IPL 2026?"/>

          <div style={{marginBottom:16}}>
            <label style={{...lbl,marginBottom:10}}>🥇 IPL 2026 Champion</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {TEAMS.map(t=>(
                <TeamCard key={t} team={t} selected={pred.winner===t}
                  onClick={()=>{ upd("winner",t); if(pred.finalist2===t) upd("finalist2",""); }}
                  disabled={locked} size="sm"/>
              ))}
            </div>
          </div>

          <div>
            <label style={{...lbl,marginBottom:10}}>🥈 Runner-Up (Finalist)</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {TEAMS.filter(t=>t!==pred.winner).map(t=>(
                <TeamCard key={t} team={t} selected={pred.finalist2===t}
                  onClick={()=>upd("finalist2",t)}
                  disabled={locked} size="sm"/>
              ))}
            </div>
          </div>

          {!locked&&step===1&&<Btn onClick={()=>setStep(2)} disabled={!canNext1} style={{marginTop:16,padding:"13px 0"}}>Next: Pick Top 4 →</Btn>}
        </Card>
      )}

      {/* STEP 2 */}
      {(step===2||locked)&&(
        <Card style={{marginBottom:10}}>
          <SecHead step={locked?null:2} icon="🏅" title="Top 4 Playoff Teams" sub="Pick the 4 semi-finalists (winner & runner-up already count)"/>
          <Top4 value={pred.top4} onChange={v=>upd("top4",v)} excluded={exclTop4} disabled={locked}/>
          {!locked&&step===2&&(
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <Btn onClick={()=>setStep(1)} variant="ghost" style={{width:"auto",padding:"13px 20px"}}>← Back</Btn>
              <Btn onClick={()=>setStep(3)} disabled={!canNext2} style={{flex:1,padding:"13px 0"}}>Next: Player Awards →</Btn>
            </div>
          )}
        </Card>
      )}

      {/* STEP 3 */}
      {(step===3||locked)&&(
        <Card style={{marginBottom:10}}>
          <SecHead step={locked?null:3} icon="🎖️" title="Player Awards" sub="Type a name to search"/>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <PlayerPick label="🍊 Orange Cap — Top Run Scorer"   value={pred.top_scorer}       onChange={v=>upd("top_scorer",v)}       disabled={locked}/>
            <PlayerPick label="💜 Purple Cap — Most Wickets"     value={pred.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)} disabled={locked}/>
            <PlayerPick label="💥 Most Sixes in Tournament"      value={pred.max_sixes}        onChange={v=>upd("max_sixes",v)}        disabled={locked}/>
            <PlayerPick label="🏏 Most Fours in Tournament"      value={pred.max_fours}        onChange={v=>upd("max_fours",v)}        disabled={locked}/>
          </div>
          {!locked&&step===3&&<Btn onClick={()=>setStep(2)} variant="ghost" style={{marginTop:12,padding:"11px 0",fontSize:13}}>← Back to Top 4</Btn>}
        </Card>
      )}

      {/* Points card */}
      <Card style={{marginBottom:14}}>
        <SecHead icon="💰" title="Points on Offer"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[["🏆 Champion","20"],["🥈 Runner-Up","10"],["Each Top-4","5"],["🍊 Orange Cap","15"],["💜 Purple Cap","15"],["💥 Sixes","10"],["🏏 Fours","10"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"9px 12px",border:"1px solid var(--bd)"}}>
              <span style={{fontSize:12,color:"var(--t2)",fontWeight:600}}>{k}</span>
              <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:16,color:"var(--gold)"}}>{v} pts</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1.5px solid var(--bd)",marginTop:12,paddingTop:12}}>
          <span style={{fontWeight:800,color:"var(--t2)"}}>Maximum possible</span>
          <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:22,color:"var(--gold)"}}>{MAX_PTS} pts</span>
        </div>
      </Card>

      {!locked&&(
        <Btn onClick={save} disabled={!complete||status==="saving"} variant={complete?"gold":"primary"} style={{padding:"16px 0",fontSize:16,opacity:complete?1:.5}}>
          {status==="saving"?"Saving…":saved?"✅ Update My Picks":"🎯 Save My Picks"}
        </Btn>
      )}

      {status==="saved"&&<div className="pop" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(0,201,107,.1)",border:"1px solid rgba(0,201,107,.25)",borderRadius:"var(--r-sm)",padding:"13px 16px",marginTop:10,fontSize:14,fontWeight:700,color:"var(--gr)"}}>🎉 Picks saved! Good luck!</div>}
      {status?.startsWith("error:")&&<div style={{background:"rgba(255,59,92,.1)",border:"1px solid rgba(255,59,92,.3)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginTop:10,fontSize:13,color:"var(--re)",fontWeight:600}}>❌ {status.replace("error:","")}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────
// ADMIN SCREEN
// ─────────────────────────────────────────────
const AdminScreen = () => {
  const [unlocked,setUnlocked] = useState(false);
  const [pwd,setPwd]           = useState("");
  const [act,setAct]           = useState({winner:"",finalist2:"",top4:[],top_scorer:"",top_wicket_taker:"",max_sixes:"",max_fours:""});
  const [saved,setSaved]       = useState(false);
  const [participants,setParticipants] = useState([]);
  const [loading,setLoading]   = useState(false);
  const [leagueName,setLeagueName] = useState("");
  const [leagueResult,setLeagueResult] = useState(null);

  const unlock = ()=>{ if(pwd===ADMIN_PWD) setUnlocked(true); else alert("Wrong password"); };
  const upd    = (k,v)=>setAct(a=>({...a,[k]:v}));

  useEffect(()=>{
    if(!unlocked) return;
    (async()=>{
      setLoading(true);
      const rows=await sb("actuals?select=*"); if(rows?.[0]) setAct(rows[0]);
      const preds=await sb("predictions?select=user_id");
      const uids=(preds||[]).map(p=>p.user_id);
      if(uids.length){
        const users=await sb(`users?id=in.(${uids.join(",")})&select=id,name,username`);
        const pf=await sb(`predictions?select=*`); const pm={};(pf||[]).forEach(p=>pm[p.user_id]=p);
        setParticipants((users||[]).map(u=>({...u,pred:pm[u.id]})));
      }
      setLoading(false);
    })();
  },[unlocked]);

  const saveResults = async()=>{
    const rows=await sb("actuals?select=id");
    if(rows?.length) await sb(`actuals?id=eq.${rows[0].id}`,{method:"PATCH",body:act});
    else             await sb("actuals",{method:"POST",body:act});
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  const createLeague = async()=>{
    if(!leagueName.trim()) return;
    const code=genCode();
    const rows=await sb("leagues",{method:"POST",body:{name:leagueName.trim(),code,created_by:null}});
    const l=Array.isArray(rows)?rows[0]:rows;
    setLeagueResult({name:leagueName.trim(),code:l?.code||code});
    setLeagueName("");
  };

  if(!unlocked) return (
    <div style={{maxWidth:360,margin:"0 auto",padding:"60px 16px",textAlign:"center"}} className="fu">
      <div style={{fontSize:56,marginBottom:14}} className="float">🔐</div>
      <h2 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:28,marginBottom:6,letterSpacing:"0.05em"}}>Admin Panel</h2>
      <p style={{color:"var(--t3)",fontSize:13,marginBottom:24,fontWeight:600}}>Enter results as the IPL progresses</p>
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Admin Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&unlock()}/>
          <Btn onClick={unlock} style={{padding:"14px 0"}}>Unlock Admin →</Btn>
        </div>
      </Card>
    </div>
  );

  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>;

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px"}} className="fu">
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:28,color:"var(--t)",letterSpacing:"0.05em"}}>Admin Panel ⚙️</h2>
        <p style={{fontSize:13,color:"var(--t3)",marginTop:3,fontWeight:600}}>Manage leagues & enter results</p>
      </div>

      <Card style={{marginBottom:12}}>
        <SecHead icon="✨" title="Create a League"/>
        <div style={{display:"flex",gap:8}}>
          <input value={leagueName} onChange={e=>setLeagueName(e.target.value)} placeholder="e.g. Family IPL 2026"
            style={{...inp,flex:1}} onKeyDown={e=>e.key==="Enter"&&createLeague()}/>
          <Btn onClick={createLeague} disabled={!leagueName.trim()} style={{width:"auto",padding:"0 18px",whiteSpace:"nowrap",flexShrink:0}}>Create</Btn>
        </div>
        {leagueResult&&(
          <div className="pop" style={{marginTop:12,background:"rgba(0,201,107,.08)",border:"1px solid rgba(0,201,107,.25)",borderRadius:"var(--r-sm)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,fontSize:13,color:"var(--gr)"}}>✅ "{leagueResult.name}" created!</span>
            <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:18,letterSpacing:"0.2em",color:"var(--ac)",background:"rgba(255,77,0,.1)",padding:"4px 14px",borderRadius:100}}>{leagueResult.code}</span>
          </div>
        )}
      </Card>

      <Card style={{marginBottom:12}}>
        <SecHead icon="🏆" title="Tournament Results"/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Sel label="IPL 2026 Champion" value={act.winner}    onChange={v=>upd("winner",v)}    options={TEAMS}/>
          <Sel label="Runner-Up"         value={act.finalist2} onChange={v=>upd("finalist2",v)} options={TEAMS.filter(t=>t!==act.winner)}/>
          <Top4 value={act.top4||[]} onChange={v=>upd("top4",v)} excluded={[act.winner,act.finalist2].filter(Boolean)} disabled={false}/>
        </div>
      </Card>

      <Card style={{marginBottom:12}}>
        <SecHead icon="🎖️" title="Player Awards"/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <PlayerPick label="Orange Cap — Top Scorer"   value={act.top_scorer}       onChange={v=>upd("top_scorer",v)}/>
          <PlayerPick label="Purple Cap — Most Wickets" value={act.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)}/>
          <PlayerPick label="Most Sixes"                value={act.max_sixes}        onChange={v=>upd("max_sixes",v)}/>
          <PlayerPick label="Most Fours"                value={act.max_fours}        onChange={v=>upd("max_fours",v)}/>
        </div>
      </Card>

      <Btn onClick={saveResults} style={{padding:"15px 0",fontSize:15,marginBottom:14}}>{saved?"✅ Saved!":"Save Results"}</Btn>

      <Card>
        <SecHead icon="👥" title={`All Participants (${participants.length})`}/>
        {participants.map((p,i)=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<participants.length-1?"1px solid var(--bd)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={p.name} size={34}/>
              <div>
                <p style={{fontWeight:800,fontSize:14,color:"var(--t)"}}>{p.name}</p>
                <p style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>@{p.username}</p>
              </div>
            </div>
            {p.pred?.winner?<TeamChip team={p.pred.winner}/>:<Badge color="red">No pick</Badge>}
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [user,setUser] = useState(()=>{ try{return JSON.parse(localStorage.getItem("ipl_user"));}catch{return null;} });
  const [tab,setTab]   = useState("leagues");
  const [activeLeague,setActiveLeague] = useState(null);

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  const login  = u=>{localStorage.setItem("ipl_user",JSON.stringify(u));setUser(u);};
  const logout = ()=>{localStorage.removeItem("ipl_user");setUser(null);};

  if(!user) return <><GS/><AuthScreen onLogin={login}/></>;

  const enterLeague   = l=>{ setActiveLeague(l); setTab("league-detail"); };
  const backToLeagues = ()=>{ setActiveLeague(null); setTab("leagues"); };

  const navItems = [
    {id:"leagues",icon:"🏟️",label:"Leagues"},
    {id:"picks",  icon:"🎯",label:"My Picks"},
    ...(isAdminRoute?[{id:"admin",icon:"⚙️",label:"Admin"}]:[]),
  ];

  return (
    <>
      <GS/>
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>

        {/* Subtle top gradient accent */}
        <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#FF4D00,#FFD700,#C8102E,#3A225D,#004BA0,#F7500E,#EA1A85)",zIndex:100}}/>

        {/* Header */}
        <header style={{position:"sticky",top:3,zIndex:50,background:"rgba(13,13,26,.92)",backdropFilter:"blur(16px)",borderBottom:"1.5px solid var(--bd)"}}>
          <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={backToLeagues} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:0}}>
              <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#FF4D00,#FF7A33)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 4px 12px rgba(255,77,0,.4)"}}>🏏</div>
              <div>
                <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:16,color:"var(--t)",letterSpacing:"0.05em"}}>IPL PREDICTION</span>
                <span style={{fontFamily:"var(--fd)",fontWeight:400,fontSize:11,color:"var(--gold)",letterSpacing:"0.1em",display:"block",lineHeight:1,marginTop:1}}>LEAGUE 2026</span>
              </div>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Avatar name={user.name} size={30}/>
              <span style={{fontSize:13,color:"var(--t2)",fontWeight:700,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
              <button onClick={logout} style={{background:"rgba(255,59,92,.1)",border:"1px solid rgba(255,59,92,.25)",borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:800,color:"var(--re)",cursor:"pointer"}}>Out</button>
            </div>
          </div>
          <TeamTicker/>
        </header>

        {/* Content */}
        <main style={{paddingBottom:90}}>
          {tab==="leagues"       && <LeaguesScreen user={user} onEnterLeague={enterLeague}/>}
          {tab==="league-detail" && activeLeague && <LeagueScreen league={activeLeague} user={user} onBack={backToLeagues}/>}
          {tab==="picks"         && <PicksScreen user={user}/>}
          {(tab==="admin"||isAdminRoute) && <AdminScreen/>}
        </main>

        {/* Bottom nav */}
        <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"rgba(13,13,26,.96)",backdropFilter:"blur(16px)",borderTop:"1.5px solid var(--bd)"}}>
          <div style={{maxWidth:520,margin:"0 auto",display:"flex"}}>
            {navItems.map(t=>{
              const active=tab===t.id||(t.id==="leagues"&&tab==="league-detail");
              return (
                <button key={t.id} onClick={()=>{setActiveLeague(null);setTab(t.id);}}
                  style={{flex:1,padding:"13px 0 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",transition:"all .15s",
                    borderTop:`2.5px solid ${active?"var(--ac)":"transparent"}`,marginTop:"-1.5px"}}>
                  <span style={{fontSize:20,lineHeight:1}}>{t.icon}</span>
                  <span style={{fontSize:10,fontFamily:"var(--fb)",fontWeight:800,letterSpacing:"0.06em",textTransform:"uppercase",color:active?"var(--ac)":"var(--t3)"}}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
