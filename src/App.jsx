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
  "Chennai Super Kings":         { bg:"#F9CD1B", fg:"#0A1931" },
  "Mumbai Indians":              { bg:"#004BA0", fg:"#FFFFFF" },
  "Royal Challengers Bengaluru": { bg:"#C8102E", fg:"#FFFFFF" },
  "Kolkata Knight Riders":       { bg:"#3A225D", fg:"#F0C040" },
  "Sunrisers Hyderabad":         { bg:"#F7500E", fg:"#FFFFFF" },
  "Delhi Capitals":              { bg:"#17479E", fg:"#EF3340" },
  "Lucknow Super Giants":        { bg:"#A72B2A", fg:"#FBBF24" },
  "Rajasthan Royals":            { bg:"#EA1A85", fg:"#FFFFFF" },
  "Gujarat Titans":              { bg:"#1C2B4A", fg:"#8AC0DE" },
  "Punjab Kings":                { bg:"#ED1B24", fg:"#FFFFFF" },
};

// Official-style SVG logos using team colors (no external images needed)
const TeamLogo = ({ team, size = 40 }) => {
  const c = TC[team] || { bg: "#ccc", fg: "#333" };
  const s = SHORT[team] || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: c.bg, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
      boxShadow: `0 2px 8px ${c.bg}55`,
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800, fontSize: size * 0.36,
        color: c.fg, letterSpacing: "-0.02em", lineHeight: 1,
      }}>{s}</span>
    </div>
  );
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
// SUPABASE CLIENT
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

const genCode  = () => Math.random().toString(36).substring(2,8).toUpperCase();
const initials = (n="") => n.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const AV_COLORS = ["#E8480C","#004BA0","#C8102E","#3A225D","#1A7A4A","#17479E","#EA1A85","#F7500E"];
const avColor  = (n="") => AV_COLORS[n.charCodeAt(0)%AV_COLORS.length];
const teamOf   = p => Object.entries(SQUADS).find(([,sq])=>sq.includes(p))?.[0];

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
    const pieces = Array.from({length:120},()=>({
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
// GLOBAL STYLES — LIGHT THEME, CRICBUZZ-INSPIRED
// ─────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#F4F6F8;
      --bg2:#EAECEF;
      --sf:#FFFFFF;
      --sf2:#F8F9FA;
      --bd:#E2E5EA;
      --bd2:#D0D4DB;
      --t:#0F1419;
      --t2:#3D4550;
      --t3:#8A9099;
      --ac:#E8480C;
      --ac2:#FF6B35;
      --navy:#0F1F3D;
      --green:#0A8F4F;
      --red:#D93025;
      --gold:#C8860A;
      --gold-bg:#FFF8E6;
      --r:14px; --r-sm:10px; --r-xs:8px;
      --sh:0 1px 4px rgba(0,0,0,.08),0 2px 12px rgba(0,0,0,.05);
      --sh-md:0 4px 16px rgba(0,0,0,.10);
      --sh-lg:0 8px 32px rgba(0,0,0,.12);
      --ff-display:'Barlow Condensed',sans-serif;
      --ff-body:'Barlow',sans-serif;
    }
    html{scroll-behavior:smooth;}
    body{background:var(--bg);color:var(--t);font-family:var(--ff-body);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
    button{font-family:var(--ff-body);}
    select{appearance:none;-webkit-appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A9099' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat:no-repeat;background-position:right 12px center;padding-right:38px!important;}
    select option{background:#fff;color:#0F1419;}
    input:focus,select:focus{outline:none;border-color:var(--ac)!important;box-shadow:0 0 0 3px rgba(232,72,12,.12)!important;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(.85);opacity:0}65%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    .fu{animation:fadeUp .3s ease forwards;}
    .pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1) forwards;}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:4px}
  `}</style>
);

// ─────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────
const Card = ({children, style={}, accent}) => (
  <div style={{
    background:"var(--sf)", border:"1px solid var(--bd)",
    borderRadius:"var(--r)", padding:20,
    boxShadow:"var(--sh)",
    borderTop: accent ? `3px solid ${accent}` : undefined,
    ...style
  }}>{children}</div>
);

const inpStyle = {
  background:"var(--sf2)", border:"1.5px solid var(--bd)",
  borderRadius:"var(--r-sm)", padding:"13px 16px",
  fontSize:15, color:"var(--t)", fontFamily:"var(--ff-body)",
  width:"100%", transition:"border-color .15s,box-shadow .15s",
};

const Inp = ({label,hint,...p}) => (
  <div>
    {label && <label style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <input {...p} style={{...inpStyle,...(p.style||{})}}/>
    {hint && <p style={{fontSize:12,color:"var(--t3)",marginTop:4}}>{hint}</p>}
  </div>
);

const Sel = ({label,value,onChange,options,placeholder,disabled}) => (
  <div>
    {label && <label style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
      style={{...inpStyle,cursor:disabled?"not-allowed":"pointer",color:value?"var(--t)":"var(--t3)",opacity:disabled?.6:1}}>
      <option value="">{placeholder||"Choose…"}</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({children,variant="primary",disabled,style={},...p}) => {
  const variants = {
    primary:{background:"var(--ac)",color:"#fff",boxShadow:"0 2px 8px rgba(232,72,12,.3)"},
    navy:{background:"var(--navy)",color:"#fff",boxShadow:"0 2px 8px rgba(15,31,61,.25)"},
    ghost:{background:"transparent",color:"var(--t2)",border:"1.5px solid var(--bd)"},
    light:{background:"var(--sf2)",color:"var(--t)",border:"1.5px solid var(--bd)"},
    green:{background:"var(--green)",color:"#fff",boxShadow:"0 2px 8px rgba(10,143,79,.25)"},
  };
  const v = variants[variant]||variants.primary;
  return (
    <button {...p} disabled={disabled}
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",
        borderRadius:"var(--r-sm)",padding:"13px 20px",fontFamily:"var(--ff-body)",
        fontWeight:700,fontSize:15,cursor:disabled?"not-allowed":"pointer",
        transition:"all .15s",width:"100%",opacity:disabled?.45:1,...v,...style}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.08)";e.currentTarget.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="none";e.currentTarget.style.transform="none";}}>
      {children}
    </button>
  );
};

const Pill = ({children,color="orange",style={}}) => {
  const c = {
    orange:{bg:"#FEF0EB",tc:"#C94400",bd:"#F5C4B4"},
    green: {bg:"#E8F7EF",tc:"#0A6B3B",bd:"#A8DFC0"},
    red:   {bg:"#FDECEA",tc:"#B91C1C",bd:"#F5B4B4"},
    grey:  {bg:"#F1F3F5",tc:"#6B7280",bd:"#D1D5DB"},
    gold:  {bg:"#FFF8E6",tc:"#92650A",bd:"#F0D090"},
    navy:  {bg:"#EBF0FA",tc:"#1E3A8A",bd:"#BDD0F5"},
  }[color]||{bg:"#F1F3F5",tc:"#6B7280",bd:"#D1D5DB"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",background:c.bg,color:c.tc,
      border:`1px solid ${c.bd}`,fontSize:11,fontWeight:700,letterSpacing:"0.04em",
      textTransform:"uppercase",padding:"3px 9px",borderRadius:100,whiteSpace:"nowrap",...style}}>
      {children}
    </span>
  );
};

const Avatar = ({name,size=36}) => (
  <div style={{width:size,height:size,borderRadius:"50%",
    background:`linear-gradient(135deg,${avColor(name)},${avColor(name+"x")})`,
    display:"flex",alignItems:"center",justifyContent:"center",
    flexShrink:0,color:"#fff",fontFamily:"var(--ff-display)",fontWeight:700,
    fontSize:size*.36,boxShadow:"0 2px 6px rgba(0,0,0,.15)",
  }}>
    {initials(name)}
  </div>
);

const Divider = ({label}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}>
    <div style={{flex:1,height:1,background:"var(--bd)"}}/>
    {label && <span style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{label}</span>}
    <div style={{flex:1,height:1,background:"var(--bd)"}}/>
  </div>
);

// Team chip — compact colored pill
const TeamChip = ({team,large}) => {
  const c = TC[team]||{bg:"#ccc",fg:"#333"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,
      background:c.bg, color:c.fg,
      borderRadius:100, padding:large?"5px 12px 5px 8px":"3px 9px 3px 6px",
      fontFamily:"var(--ff-display)", fontWeight:700,
      fontSize:large?13:11, whiteSpace:"nowrap",
    }}>
      <span style={{width:large?8:6,height:large?8:6,borderRadius:"50%",background:c.fg+"55",flexShrink:0}}/>
      {large?team:SHORT[team]||team}
    </span>
  );
};

// Big visual team button for picking
const TeamCard = ({team,selected,onClick,disabled,small}) => {
  const c = TC[team];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      border:`2px solid ${selected?c.bg:"var(--bd)"}`,
      borderRadius:small?10:12,
      background:selected?`${c.bg}18`:"var(--sf2)",
      cursor:disabled?"not-allowed":"pointer",
      padding:small?"8px 4px":"12px 6px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:4,
      transition:"all .15s",
      boxShadow:selected?`0 0 0 1px ${c.bg}66,0 4px 12px ${c.bg}22`:"none",
      opacity:disabled&&!selected?.35:1,
      position:"relative",
    }}
    onMouseEnter={e=>{if(!disabled&&!selected){e.currentTarget.style.borderColor=c.bg+"88";e.currentTarget.style.background=`${c.bg}0a`;}}}
    onMouseLeave={e=>{if(!selected){e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.background="var(--sf2)";}}}>
      {selected && (
        <div style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",
          background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:9,color:c.fg,fontWeight:900}}>✓</div>
      )}
      <div style={{width:small?32:40,height:small?32:40,borderRadius:small?8:10,
        background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:selected?`0 3px 10px ${c.bg}55`:"none",
      }}>
        <span style={{fontFamily:"var(--ff-display)",fontWeight:800,fontSize:small?11:13,
          color:c.fg,letterSpacing:"-0.01em"}}>{SHORT[team]}</span>
      </div>
      <span style={{fontFamily:"var(--ff-display)",fontSize:small?11:12,color:selected?c.bg:"var(--t2)",
        fontWeight:700,textAlign:"center",lineHeight:1.1,
        maxWidth:small?48:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
      }}>{team.split(" ").slice(-1)[0]}</span>
    </button>
  );
};

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

  const filtered = ALL_PLAYERS.filter(p=>p.toLowerCase().includes(q.toLowerCase())).slice(0,60);
  const team = value ? teamOf(value) : null;
  const tc = team ? TC[team] : null;

  return (
    <div ref={ref} style={{position:"relative"}}>
      {label&&<label style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
      <div onClick={()=>{ if(!disabled){setOpen(o=>!o);setQ("");} }}
        style={{...inpStyle,cursor:disabled?"not-allowed":"pointer",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          opacity:disabled?.6:1,userSelect:"none",
          borderColor:value?tc?tc.bg+"99":"var(--ac)":"var(--bd)",
          background:value&&tc?`${tc.bg}0d`:"var(--sf2)",
        }}>
        <div style={{flex:1,overflow:"hidden",display:"flex",alignItems:"center",gap:10}}>
          {value && tc && <div style={{width:8,height:8,borderRadius:"50%",background:tc.bg,flexShrink:0}}/>}
          <span style={{color:value?"var(--t)":"var(--t3)",fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:value?600:400}}>
            {value||"Search player…"}
          </span>
          {value && team && (
            <span style={{fontSize:11,fontWeight:700,color:tc?.bg||"var(--t3)",
              background:tc?`${tc.bg}18`:"var(--sf2)",padding:"2px 7px",borderRadius:6,flexShrink:0}}>
              {SHORT[team]||""}
            </span>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:300,
          background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",
          boxShadow:"var(--sh-lg)",overflow:"hidden"}}>
          <div style={{padding:10,borderBottom:"1px solid var(--bd)",background:"var(--sf2)"}}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a name to search…"
              style={{...inpStyle,padding:"10px 13px",fontSize:14}}/>
          </div>
          <div style={{maxHeight:230,overflowY:"auto"}}>
            {filtered.length===0 && <div style={{padding:"16px",color:"var(--t3)",fontSize:14,textAlign:"center"}}>No players found</div>}
            {filtered.map(p=>{
              const pt=teamOf(p); const c=TC[pt]||{bg:"#888"};
              return (
                <div key={p} onClick={()=>{onChange(p);setOpen(false);setQ("");}}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"11px 16px",cursor:"pointer",
                    background:value===p?`${c.bg}12`:"transparent",
                    borderLeft:value===p?`3px solid ${c.bg}`:"3px solid transparent",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=value===p?`${c.bg}12`:"var(--sf2)"}
                  onMouseLeave={e=>e.currentTarget.style.background=value===p?`${c.bg}12`:"transparent"}>
                  <span style={{fontSize:15,fontWeight:value===p?700:400,color:"var(--t)"}}>{p}</span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,
                    background:c.bg,color:TC[pt]?.fg||"#fff",padding:"2px 8px",borderRadius:100,
                    fontFamily:"var(--ff-display)",fontWeight:700}}>
                    {SHORT[pt]||""}
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
// TOP-4 TEAM GRID PICKER
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
        <label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Top 4 Playoff Teams</label>
        <Pill color={value.length===4?"green":"gold"}>{value.length}/4 picked</Pill>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {available.map(t=>{
          const on=value.includes(t); const full=!on&&value.length>=4;
          return <TeamCard key={t} team={t} selected={on} onClick={()=>toggle(t)} disabled={disabled||full} small/>;
        })}
      </div>
    </div>
  );
};

// Section header with icon strip
const SecHead = ({icon,title,sub,right}) => (
  <div style={{marginBottom:16,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {icon&&<span style={{fontSize:18}}>{icon}</span>}
        <h3 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:18,color:"var(--t)",letterSpacing:"0.01em"}}>{title}</h3>
      </div>
      {sub&&<p style={{fontSize:13,color:"var(--t3)",marginTop:2,marginLeft:icon?"26px":"0",fontWeight:500}}>{sub}</p>}
    </div>
    {right}
  </div>
);

// ─────────────────────────────────────────────
// ANIMATED TEAM TICKER
// ─────────────────────────────────────────────
const TeamTicker = () => {
  const items = [...TEAMS,...TEAMS];
  return (
    <div style={{overflow:"hidden",background:"var(--navy)",padding:"7px 0"}}>
      <style>{`.ticker-inner{display:inline-flex;animation:marquee 28s linear infinite;}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="ticker-inner">
        {items.map((t,i)=>{
          const c=TC[t];
          return (
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,marginRight:20,
              fontSize:12,fontFamily:"var(--ff-display)",fontWeight:700,letterSpacing:"0.04em",
              color:c.fg,background:c.bg,padding:"3px 10px",borderRadius:100,whiteSpace:"nowrap"}}>
              {SHORT[t]}
            </span>
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
        if(!form.name.trim()||!form.username.trim()||!form.password.trim()) throw new Error("Please fill all fields");
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
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Top accent bar */}
      <div style={{height:4,background:"linear-gradient(90deg,#E8480C,#F9CD1B,#C8102E,#3A225D,#004BA0,#F7500E,#EA1A85)"}}/>

      {/* Header band */}
      <div style={{background:"var(--navy)",padding:"24px 20px 20px"}}>
        <div style={{maxWidth:400,margin:"0 auto",textAlign:"center"}}>
          <div style={{width:60,height:60,borderRadius:16,background:"var(--ac)",
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            fontSize:28,marginBottom:12,boxShadow:"0 8px 24px rgba(232,72,12,.4)"}}>🏏</div>
          <h1 style={{fontFamily:"var(--ff-display)",fontWeight:800,fontSize:34,
            color:"#fff",letterSpacing:"0.04em",lineHeight:1.1}}>
            IPL PREDICTION<br/>
            <span style={{color:"#F9CD1B"}}>LEAGUE 2026</span>
          </h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,.5)",marginTop:8,fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase"}}>
            Predict · Compete · Win
          </p>
          {/* Team pills */}
          <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:14}}>
            {TEAMS.map(t=>(
              <span key={t} style={{background:TC[t].bg,color:TC[t].fg,fontSize:10,
                fontFamily:"var(--ff-display)",fontWeight:700,padding:"2px 8px",borderRadius:100}}>
                {SHORT[t]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{flex:1,padding:"24px 20px",maxWidth:420,margin:"0 auto",width:"100%"}}>

        {urlCode&&<div className="pop" style={{background:"#E8F7EF",border:"1px solid #A8DFC0",borderRadius:"var(--r-sm)",padding:"12px 14px",marginBottom:16,fontSize:14,color:"#0A6B3B",fontWeight:600,display:"flex",gap:8}}>🔗 You've been invited! Sign in to join.</div>}

        {/* How it works */}
        <Card style={{marginBottom:20,borderTop:"3px solid var(--ac)"}}>
          <p style={{fontSize:12,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🎯 How It Works</p>
          {["Join a league with friends","Make your IPL 2026 predictions","Watch the live leaderboard!"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?8:0}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"var(--ac)",color:"#fff",
                fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:14,color:"var(--t2)",fontWeight:500}}>{s}</span>
            </div>
          ))}
        </Card>

        {/* Mode tabs */}
        <div style={{display:"flex",background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--r-sm)",padding:4,marginBottom:16}}>
          {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",cursor:"pointer",
                fontFamily:"var(--ff-body)",fontWeight:700,fontSize:14,transition:"all .15s",
                background:mode===m?"var(--navy)":"transparent",
                color:mode===m?"#fff":"var(--t3)",
              }}>{l}</button>
          ))}
        </div>

        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="signup"&&<Inp label="Your Name" value={form.name} onChange={set("name")} placeholder="e.g. Swapnil Kulkarni"/>}
            <Inp label="Username" value={form.username} onChange={set("username")} placeholder="swapnil123" autoCapitalize="none"/>
            <Inp label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            {err&&<div style={{background:"#FDECEA",border:"1px solid #F5B4B4",borderRadius:"var(--r-xs)",padding:"10px 13px",fontSize:14,color:"var(--red)",fontWeight:600}}>⚠️ {err}</div>}
            <Btn onClick={submit} disabled={busy} variant="navy" style={{padding:"15px 0",fontSize:15}}>
              {busy?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}
            </Btn>
          </div>
        </Card>
        <p style={{textAlign:"center",fontSize:12,color:"var(--t3)",marginTop:14,fontWeight:500}}>🔒 Predictions lock 28 Mar · 3:30 PM IST</p>
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
      if(!rows?.length) throw new Error("League not found — check the code with your friend");
      const league=rows[0];
      const al=await sb(`league_members?league_id=eq.${league.id}&user_id=eq.${user.id}&select=id`);
      if(al?.length) throw new Error("You're already in this league!");
      await sb("league_members",{method:"POST",body:{league_id:league.id,user_id:user.id}});
      setJoinCode(""); setView("list");
      setToast(`Joined "${league.name}"! 🎉`);
      setTimeout(()=>setToast(""),4000);
      load();
    } catch(e){setErr(e.message);}
    setBusy(false);
  };

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">

      {/* Welcome strip */}
      <div style={{background:"var(--navy)",borderRadius:"var(--r)",padding:"18px 20px",marginBottom:16,
        display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"var(--sh-md)"}}>
        <div>
          <p style={{fontSize:12,color:"rgba(255,255,255,.5)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>Welcome back</p>
          <h2 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:26,color:"#fff",marginTop:2}}>{user.name} 👋</h2>
          <div style={{display:"flex",gap:6,marginTop:8}}>
            <Pill color="orange">🏏 IPL 2026</Pill>
            <Pill color="gold">⏰ Locks 28 Mar</Pill>
          </div>
        </div>
        <Avatar name={user.name} size={52}/>
      </div>

      {/* Action bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h3 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:20,color:"var(--t)"}}>My Leagues</h3>
        {view==="list"
          ? <button onClick={()=>{setView("join");setErr("");}} style={{background:"var(--ac)",color:"#fff",border:"none",borderRadius:"var(--r-xs)",padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Join League</button>
          : <button onClick={()=>{setView("list");setErr("");}} style={{background:"var(--sf2)",color:"var(--t2)",border:"1px solid var(--bd)",borderRadius:"var(--r-xs)",padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>← Back</button>
        }
      </div>

      {toast&&<div className="pop" style={{display:"flex",alignItems:"center",gap:10,background:"#E8F7EF",border:"1px solid #A8DFC0",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:12}}>
        <span style={{fontSize:20}}>🎉</span><span style={{fontWeight:700,fontSize:14,color:"#0A6B3B"}}>{toast}</span>
      </div>}
      {err&&<div style={{background:"#FDECEA",border:"1px solid #F5B4B4",borderRadius:"var(--r-sm)",padding:"11px 14px",marginBottom:12,fontSize:14,color:"var(--red)",fontWeight:600}}>⚠️ {err}</div>}

      {view==="join"&&(
        <Card style={{marginBottom:14,borderTop:"3px solid var(--ac)"}}>
          <SecHead icon="🔗" title="Join a League" sub="Ask your league admin for their 6-character code"/>
          <Inp label="League Code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. RCB007" maxLength={6}
            style={{letterSpacing:"0.3em",fontFamily:"var(--ff-display)",fontSize:26,textAlign:"center",fontWeight:700}}
            onKeyDown={e=>e.key==="Enter"&&join()}/>
          <Btn onClick={join} disabled={busy||joinCode.length<4} style={{marginTop:12,padding:"14px 0"}} variant="navy">
            {busy?"Joining…":"Join League →"}
          </Btn>
        </Card>
      )}

      {view==="list"&&(
        loading ? (
          <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)",fontSize:14}}>Loading your leagues…</div>
        ) : leagues.length===0 ? (
          <div style={{textAlign:"center",padding:"48px 16px"}}>
            <div style={{fontSize:48,marginBottom:12}}>🏟️</div>
            <p style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:22,color:"var(--t)"}}>No League Yet</p>
            <p style={{fontSize:14,color:"var(--t3)",margin:"8px 0 22px",fontWeight:500}}>Enter a code to start playing with friends</p>
            <Btn onClick={()=>setView("join")} variant="navy" style={{width:"auto",padding:"13px 28px",margin:"0 auto"}}>+ Enter League Code</Btn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {leagues.map(l=>{
              const teamColor = TC[TEAMS[l.name.charCodeAt(0)%TEAMS.length]].bg;
              return (
                <button key={l.id} onClick={()=>onEnterLeague(l)}
                  style={{width:"100%",textAlign:"left",background:"var(--sf)",
                    border:"1px solid var(--bd)",borderRadius:"var(--r)",
                    padding:"0",cursor:"pointer",transition:"all .2s",overflow:"hidden",
                    boxShadow:"var(--sh)",display:"flex",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="var(--sh-md)";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="var(--sh)";e.currentTarget.style.transform="none";}}>
                  {/* Color strip */}
                  <div style={{width:5,background:teamColor,flexShrink:0}}/>
                  <div style={{flex:1,padding:"15px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <p style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:17,color:"var(--t)"}}>{l.name}</p>
                      <p style={{fontSize:13,color:"var(--t3)",marginTop:3,fontWeight:500}}>
                        {l.member_count} player{l.member_count!==1?"s":""}
                      </p>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:14,
                        letterSpacing:"0.2em",color:teamColor,background:`${teamColor}18`,
                        padding:"4px 12px",borderRadius:100}}>{l.code}</span>
                      {l.created_by===user.id&&<Pill color="navy">Admin</Pill>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",paddingRight:14,color:"var(--t3)"}}>›</div>
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
// LEAGUE DETAIL — LEADERBOARD
// ─────────────────────────────────────────────
const LeagueScreen = ({league,user,onBack}) => {
  const [members,setMembers] = useState([]);
  const [actuals,setActuals] = useState(null);
  const [loading,setLoading] = useState(true);
  const [copied,setCopied]   = useState(false);
  const medals = ["🥇","🥈","🥉"];
  const medalColors = ["#C8A800","#8A9099","#C26A2D"];

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

  const me      = members.find(m=>m.id===user.id);
  const myRank  = members.findIndex(m=>m.id===user.id)+1;
  const leader  = members[0];
  const ptsBehind = leader&&me&&me.score!==null&&leader.score!==null&&me.id!==leader.id ? leader.score-me.score : null;

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <button onClick={onBack} style={{width:40,height:40,borderRadius:10,
          background:"var(--sf)",border:"1px solid var(--bd)",cursor:"pointer",
          fontSize:18,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"var(--sh)",transition:"all .15s",flexShrink:0}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--ac)";e.currentTarget.style.color="var(--ac)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.color="var(--t2)";}}>
          ←
        </button>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:22,color:"var(--t)"}}>{league.name}</h2>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <button onClick={copyLink}
              style={{display:"inline-flex",alignItems:"center",gap:6,background:"#FEF0EB",
                border:"1px solid #F5C4B4",borderRadius:100,padding:"4px 12px",cursor:"pointer"}}>
              <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:14,
                letterSpacing:"0.2em",color:"var(--ac)"}}>{league.code}</span>
              <span style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>{copied?"✓ Copied!":"📋 share"}</span>
            </button>
            <span style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>{members.length} players</span>
          </div>
        </div>
      </div>

      {/* My position card */}
      {actuals&&me?.score!==null&&(
        <Card style={{marginBottom:14,background:"var(--navy)",border:"none"}} className="pop">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:38}}>{medals[myRank-1]||`#${myRank}`}</span>
              <div>
                <p style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:18,color:"#fff"}}>
                  You're #{myRank} of {members.length}
                </p>
                <p style={{fontSize:13,color:"rgba(255,255,255,.6)",marginTop:3,fontWeight:500}}>
                  {ptsBehind?`🔥 ${ptsBehind} pts behind ${leader.name.split(" ")[0]}`:"🏆 You're leading!"}
                </p>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{fontFamily:"var(--ff-display)",fontWeight:800,fontSize:38,color:"#F9CD1B",lineHeight:1}}>{me.score}</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:600}}>/ {MAX_PTS} pts</p>
            </div>
          </div>
        </Card>
      )}

      {loading?(
        <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading leaderboard…</div>
      ):(
        <>
          {!actuals&&(
            <div style={{display:"flex",alignItems:"center",gap:12,background:"#FFF8E6",
              border:"1px solid #F0D090",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:14}}>
              <span style={{fontSize:22}}>⏳</span>
              <div>
                <p style={{fontWeight:700,fontSize:14,color:"var(--gold)"}}>Tournament not started yet</p>
                <p style={{fontSize:13,color:"var(--t3)",marginTop:2,fontWeight:500}}>Scores appear once the admin enters results</p>
              </div>
            </div>
          )}

          {/* Top 3 podium */}
          {actuals && members.length>=2 && members[0].score!==null && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.15fr 1fr",gap:8,marginBottom:14,alignItems:"flex-end"}}>
              {[members[1],members[0],members[2]].map((m,idx)=>{
                if(!m) return <div key={idx}/>;
                const rank=idx===1?1:idx===0?2:3;
                const mc=medalColors[rank-1];
                return (
                  <div key={m.id} style={{
                    background:"var(--sf)",border:`2px solid ${mc}44`,
                    borderRadius:"var(--r)",padding:"14px 8px 12px",textAlign:"center",
                    boxShadow:`0 4px 16px ${mc}22`,
                  }}>
                    <div style={{fontSize:rank===1?30:22,marginBottom:6}}>{medals[rank-1]}</div>
                    <Avatar name={m.name} size={rank===1?44:36}/>
                    <p style={{fontWeight:700,fontSize:13,color:"var(--t)",marginTop:8,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name.split(" ")[0]}</p>
                    {m.score!==null&&<p style={{fontFamily:"var(--ff-display)",fontSize:rank===1?26:20,
                      color:mc,marginTop:4,fontWeight:700}}>{m.score}</p>}
                    {m.pred?.winner&&<div style={{marginTop:6,display:"flex",justifyContent:"center"}}>
                      <TeamChip team={m.pred.winner}/>
                    </div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {members.map((m,i)=>{
              const isMe=m.id===user.id;
              const pct=m.score!==null?Math.round((m.score/MAX_PTS)*100):0;
              const mc=i<3&&actuals?medalColors[i]:null;
              return (
                <div key={m.id} style={{
                  background:isMe?"#FEF0EB":"var(--sf)",
                  border:`1.5px solid ${isMe?"#F5C4B4":mc?`${mc}44`:"var(--bd)"}`,
                  borderRadius:"var(--r)",padding:"13px 16px",
                  boxShadow:mc?`0 2px 8px ${mc}18`:"var(--sh)",
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:34,textAlign:"center",flexShrink:0,
                      fontSize:i<3&&actuals?22:14,fontFamily:"var(--ff-body)",
                      fontWeight:800,color:mc||"var(--t3)"}}>
                      {actuals&&i<3?medals[i]:`#${i+1}`}
                    </div>
                    <Avatar name={m.name}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"var(--ff-body)",fontWeight:700,fontSize:15,
                          color:isMe?"var(--ac)":"var(--t)"}}>{m.name}</span>
                        {isMe&&<Pill color="orange">You</Pill>}
                        {!m.hasPred&&<Pill color="red">No pick yet</Pill>}
                      </div>
                      {m.pred?.winner&&<div style={{marginTop:5}}><TeamChip team={m.pred.winner}/></div>}
                      {actuals&&m.score!==null&&(
                        <div style={{marginTop:8,height:4,background:"var(--bd)",borderRadius:100,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:100,
                            background:`linear-gradient(90deg,var(--ac),#FF7A33)`,
                            width:`${pct}%`,transition:"width 1s ease"}}/>
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {actuals&&m.score!==null?(
                        <>
                          <p style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:26,
                            color:isMe?"var(--ac)":mc||"var(--t)",lineHeight:1}}>{m.score}</p>
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
            <Card style={{marginTop:14,borderTop:"3px solid var(--gold)"}}>
              <SecHead icon="📊" title="Tournament Results So Far"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["🏆 Champion",actuals.winner],["🥈 Runner-Up",actuals.finalist2],
                  ["🍊 Orange Cap",actuals.top_scorer],["💜 Purple Cap",actuals.top_wicket_taker],
                  ["💥 Most Sixes",actuals.max_sixes],["🏏 Most Fours",actuals.max_fours]
                ].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k} style={{background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"10px 12px",border:"1px solid var(--bd)"}}>
                    <p style={{fontSize:11,color:"var(--t3)",fontWeight:700}}>{k}</p>
                    <p style={{fontSize:14,fontWeight:700,color:"var(--t)",marginTop:3}}>{v}</p>
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

  const exclTop4 = [pred.winner,pred.finalist2].filter(Boolean);

  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>;

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">
      <Confetti active={confetti}/>

      {/* Page header */}
      <div style={{marginBottom:18}}>
        <h2 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:26,color:"var(--t)"}}>My Picks 🎯</h2>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap"}}>
          {locked?<Pill color="red">🔒 Locked — Tournament Started</Pill>
                 :<Pill color="orange">⏰ Locks 28 Mar · 3:30 PM IST</Pill>}
          {saved&&!locked&&<Pill color="green">✓ Saved</Pill>}
        </div>
      </div>

      {locked&&saved&&(
        <div style={{display:"flex",alignItems:"center",gap:12,background:"#E8F7EF",
          border:"1px solid #A8DFC0",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:16}}>
          <span style={{fontSize:24}}>🎉</span>
          <div>
            <p style={{fontWeight:700,fontSize:14,color:"var(--green)"}}>Your picks are locked in!</p>
            <p style={{fontSize:13,color:"var(--t3)",marginTop:2,fontWeight:500}}>Check the leaderboard once the tournament starts</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!locked&&(
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Progress</span>
            <span style={{fontSize:13,fontWeight:700,color:complete?"var(--green)":"var(--ac)"}}>{done}/7 complete</span>
          </div>
          <div style={{height:6,background:"var(--bd)",borderRadius:100,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:100,
              background:complete?"var(--green)":"var(--ac)",
              width:`${(done/7)*100}%`,transition:"width .4s ease"}}/>
          </div>
        </div>
      )}

      {/* Step tabs */}
      {!locked&&(
        <div style={{display:"flex",gap:6,marginBottom:18,background:"var(--sf)",
          border:"1px solid var(--bd)",borderRadius:"var(--r-sm)",padding:4}}>
          {[["1","🏆 Tournament",pred.winner&&pred.finalist2],["2","🏅 Top 4",pred.top4.length===4],["3","🎖️ Players",pred.top_scorer&&pred.top_wicket_taker&&pred.max_sixes&&pred.max_fours]].map(([n,l,done])=>(
            <button key={n} onClick={()=>setStep(Number(n))}
              style={{flex:1,padding:"10px 4px",borderRadius:8,border:"none",cursor:"pointer",
                fontFamily:"var(--ff-body)",fontWeight:700,fontSize:12,transition:"all .15s",textAlign:"center",
                background:step===Number(n)?"var(--navy)":"transparent",
                color:step===Number(n)?"#fff":done?"var(--green)":"var(--t3)",
              }}>
              <div style={{fontSize:14,marginBottom:2}}>{done?"✅":l.split(" ")[0]}</div>
              {l.split(" ").slice(1).join(" ")||n}
            </button>
          ))}
        </div>
      )}

      {/* STEP 1 — Team picks */}
      {(step===1||locked)&&(
        <Card style={{marginBottom:12}} accent="var(--ac)">
          <SecHead step={locked?null:"1"} icon="🏆" title="Tournament Podium" sub="Who wins IPL 2026?"/>

          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:10}}>🥇 IPL 2026 Champion</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
              {TEAMS.map(t=>(
                <TeamCard key={t} team={t} selected={pred.winner===t}
                  onClick={()=>{upd("winner",t);if(pred.finalist2===t)upd("finalist2","");}}
                  disabled={locked} small/>
              ))}
            </div>
          </div>

          {pred.winner&&(
            <div>
              <label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:10}}>🥈 Runner-Up (Finalist)</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
                {TEAMS.filter(t=>t!==pred.winner).map(t=>(
                  <TeamCard key={t} team={t} selected={pred.finalist2===t}
                    onClick={()=>upd("finalist2",t)} disabled={locked} small/>
                ))}
              </div>
            </div>
          )}

          {!locked&&<Btn onClick={()=>setStep(2)} disabled={!(pred.winner&&pred.finalist2)} variant="navy" style={{marginTop:16,padding:"13px 0"}}>Next: Pick Top 4 →</Btn>}
        </Card>
      )}

      {/* STEP 2 — Top 4 */}
      {(step===2||locked)&&(
        <Card style={{marginBottom:12}} accent="#C8860A">
          <SecHead icon="🏅" title="Top 4 Playoff Teams" sub="Pick the 4 semi-finalists (not including winner & runner-up)"/>
          <Top4 value={pred.top4} onChange={v=>upd("top4",v)} excluded={exclTop4} disabled={locked}/>
          {!locked&&(
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <Btn onClick={()=>setStep(1)} variant="light" style={{flex:"0 0 auto",width:100,padding:"13px 0"}}>← Back</Btn>
              <Btn onClick={()=>setStep(3)} disabled={pred.top4.length!==4} variant="navy" style={{flex:1,padding:"13px 0"}}>Next: Players →</Btn>
            </div>
          )}
        </Card>
      )}

      {/* STEP 3 — Players */}
      {(step===3||locked)&&(
        <Card style={{marginBottom:12}} accent="var(--green)">
          <SecHead icon="🎖️" title="Player Awards" sub="Type a name to search all 220+ players"/>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <PlayerPick label="🍊 Orange Cap — Top Run Scorer"   value={pred.top_scorer}       onChange={v=>upd("top_scorer",v)}       disabled={locked}/>
            <Divider/>
            <PlayerPick label="💜 Purple Cap — Most Wickets"     value={pred.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)} disabled={locked}/>
            <Divider/>
            <PlayerPick label="💥 Most Sixes in Tournament"      value={pred.max_sixes}        onChange={v=>upd("max_sixes",v)}        disabled={locked}/>
            <Divider/>
            <PlayerPick label="🏏 Most Fours in Tournament"      value={pred.max_fours}        onChange={v=>upd("max_fours",v)}        disabled={locked}/>
          </div>
          {!locked&&<Btn onClick={()=>setStep(2)} variant="light" style={{marginTop:14,padding:"11px 0",fontSize:13}}>← Back to Top 4</Btn>}
        </Card>
      )}

      {/* Points table */}
      <Card style={{marginBottom:16,borderTop:"3px solid #C8860A"}}>
        <SecHead icon="💰" title="Points on Offer"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[["🏆 Champion","20"],["🥈 Runner-Up","10"],["Each Top-4 Team","5"],["🍊 Orange Cap","15"],["💜 Purple Cap","15"],["💥 Sixes","10"],["🏏 Fours","10"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"10px 12px",border:"1px solid var(--bd)"}}>
              <span style={{fontSize:13,color:"var(--t2)",fontWeight:500}}>{k}</span>
              <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:17,color:"var(--gold)"}}>{v} pts</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          borderTop:"1px solid var(--bd)",marginTop:12,paddingTop:12}}>
          <span style={{fontWeight:700,color:"var(--t2)",fontSize:14}}>Maximum possible</span>
          <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:24,color:"var(--gold)"}}>{MAX_PTS} pts</span>
        </div>
      </Card>

      {!locked&&(
        <Btn onClick={save} disabled={!complete||status==="saving"}
          variant={complete?"green":"light"}
          style={{padding:"16px 0",fontSize:16}}>
          {status==="saving"?"Saving…":saved?"✅ Update My Picks":"🎯 Save My Picks"}
        </Btn>
      )}

      {status==="saved"&&<div className="pop" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        background:"#E8F7EF",border:"1px solid #A8DFC0",borderRadius:"var(--r-sm)",
        padding:"13px 16px",marginTop:12,fontSize:14,fontWeight:700,color:"var(--green)"}}>
        🎉 Picks saved! Good luck!
      </div>}
      {status?.startsWith("error:")&&<div style={{background:"#FDECEA",border:"1px solid #F5B4B4",
        borderRadius:"var(--r-sm)",padding:"12px 16px",marginTop:12,fontSize:14,color:"var(--red)",fontWeight:600}}>
        ❌ {status.replace("error:","")}
      </div>}
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
    <div style={{maxWidth:380,margin:"0 auto",padding:"60px 16px",textAlign:"center"}} className="fu">
      <div style={{fontSize:52,marginBottom:14}}>🔐</div>
      <h2 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:28,marginBottom:6}}>Admin Panel</h2>
      <p style={{color:"var(--t3)",fontSize:14,marginBottom:24,fontWeight:500}}>Enter results as the IPL progresses</p>
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Admin Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)}
            placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&unlock()}/>
          <Btn onClick={unlock} variant="navy" style={{padding:"14px 0"}}>Unlock Admin →</Btn>
        </div>
      </Card>
    </div>
  );

  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>;

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:26,color:"var(--t)"}}>Admin Panel ⚙️</h2>
        <p style={{fontSize:14,color:"var(--t3)",marginTop:3,fontWeight:500}}>Manage leagues & enter live results</p>
      </div>

      {/* Create league */}
      <Card style={{marginBottom:12,borderTop:"3px solid var(--ac)"}}>
        <SecHead icon="✨" title="Create a League"/>
        <div style={{display:"flex",gap:8}}>
          <input value={leagueName} onChange={e=>setLeagueName(e.target.value)} placeholder="e.g. Family IPL 2026"
            style={{...inpStyle,flex:1}} onKeyDown={e=>e.key==="Enter"&&createLeague()}/>
          <button onClick={createLeague} disabled={!leagueName.trim()}
            style={{background:"var(--ac)",color:"#fff",border:"none",borderRadius:"var(--r-sm)",
              padding:"0 18px",fontSize:14,fontWeight:700,cursor:"pointer",flexShrink:0,
              opacity:leagueName.trim()?1:.4}}>Create</button>
        </div>
        {leagueResult&&(
          <div className="pop" style={{marginTop:12,background:"#E8F7EF",border:"1px solid #A8DFC0",
            borderRadius:"var(--r-sm)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,fontSize:14,color:"var(--green)"}}>✅ "{leagueResult.name}" created!</span>
            <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:18,
              letterSpacing:"0.2em",color:"var(--ac)",background:"#FEF0EB",padding:"4px 14px",borderRadius:100}}>
              {leagueResult.code}
            </span>
          </div>
        )}
      </Card>

      {/* Results */}
      <Card style={{marginBottom:12,borderTop:"3px solid var(--gold)"}}>
        <SecHead icon="🏆" title="Tournament Results"/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Sel label="IPL 2026 Champion" value={act.winner}    onChange={v=>upd("winner",v)}    options={TEAMS}/>
          <Sel label="Runner-Up"         value={act.finalist2} onChange={v=>upd("finalist2",v)} options={TEAMS.filter(t=>t!==act.winner)}/>
          <Top4 value={act.top4||[]} onChange={v=>upd("top4",v)} excluded={[act.winner,act.finalist2].filter(Boolean)} disabled={false}/>
        </div>
      </Card>

      <Card style={{marginBottom:12,borderTop:"3px solid var(--green)"}}>
        <SecHead icon="🎖️" title="Player Awards"/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <PlayerPick label="Orange Cap — Top Scorer"   value={act.top_scorer}       onChange={v=>upd("top_scorer",v)}/>
          <PlayerPick label="Purple Cap — Most Wickets" value={act.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)}/>
          <PlayerPick label="Most Sixes"                value={act.max_sixes}        onChange={v=>upd("max_sixes",v)}/>
          <PlayerPick label="Most Fours"                value={act.max_fours}        onChange={v=>upd("max_fours",v)}/>
        </div>
      </Card>

      <Btn onClick={saveResults} variant="navy" style={{padding:"15px 0",fontSize:15,marginBottom:14}}>
        {saved?"✅ Saved!":"Save Results"}
      </Btn>

      {/* Participants */}
      <Card>
        <SecHead icon="👥" title={`All Participants (${participants.length})`}/>
        {participants.length===0&&<p style={{color:"var(--t3)",fontSize:14,textAlign:"center",padding:"12px 0"}}>No predictions submitted yet</p>}
        {participants.map((p,i)=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"12px 0",borderBottom:i<participants.length-1?"1px solid var(--bd)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={p.name} size={34}/>
              <div>
                <p style={{fontWeight:700,fontSize:15,color:"var(--t)"}}>{p.name}</p>
                <p style={{fontSize:12,color:"var(--t3)",fontWeight:500}}>@{p.username}</p>
              </div>
            </div>
            {p.pred?.winner?<TeamChip team={p.pred.winner}/>:<Pill color="red">No pick</Pill>}
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

        {/* Top rainbow accent */}
        <div style={{position:"fixed",top:0,left:0,right:0,height:3,
          background:"linear-gradient(90deg,#E8480C,#F9CD1B,#C8102E,#3A225D,#004BA0,#F7500E,#EA1A85)",zIndex:100}}/>

        {/* Header */}
        <header style={{position:"sticky",top:3,zIndex:50,
          background:"var(--navy)",boxShadow:"0 2px 12px rgba(0,0,0,.15)"}}>
          <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px",height:54,
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={backToLeagues} style={{display:"flex",alignItems:"center",gap:10,
              background:"none",border:"none",cursor:"pointer",padding:0}}>
              <div style={{width:32,height:32,borderRadius:9,background:"var(--ac)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
                boxShadow:"0 3px 10px rgba(232,72,12,.4)"}}>🏏</div>
              <div>
                <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:17,
                  color:"#fff",letterSpacing:"0.04em"}}>IPL PREDICTION</span>
                <span style={{fontFamily:"var(--ff-display)",fontWeight:700,fontSize:11,
                  color:"#F9CD1B",letterSpacing:"0.08em",display:"block",lineHeight:1,marginTop:1}}>LEAGUE 2026</span>
              </div>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Avatar name={user.name} size={30}/>
              <span style={{fontSize:13,color:"rgba(255,255,255,.7)",fontWeight:600,
                maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
              <button onClick={logout} style={{background:"rgba(255,255,255,.1)",
                border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"5px 11px",
                fontSize:12,fontWeight:700,color:"rgba(255,255,255,.7)",cursor:"pointer"}}>Out</button>
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
        <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,
          background:"#fff",borderTop:"1px solid var(--bd)",
          boxShadow:"0 -2px 16px rgba(0,0,0,.08)"}}>
          <div style={{maxWidth:520,margin:"0 auto",display:"flex"}}>
            {navItems.map(t=>{
              const active=tab===t.id||(t.id==="leagues"&&tab==="league-detail");
              return (
                <button key={t.id} onClick={()=>{setActiveLeague(null);setTab(t.id);}}
                  style={{flex:1,padding:"12px 0 10px",display:"flex",flexDirection:"column",
                    alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",
                    transition:"all .15s",
                    borderTop:`3px solid ${active?"var(--ac)":"transparent"}`,marginTop:-1}}>
                  <span style={{fontSize:22,lineHeight:1}}>{t.icon}</span>
                  <span style={{fontSize:11,fontFamily:"var(--ff-body)",fontWeight:700,
                    letterSpacing:"0.04em",textTransform:"uppercase",
                    color:active?"var(--ac)":"var(--t3)"}}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
