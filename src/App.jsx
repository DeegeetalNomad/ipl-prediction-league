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
  "Chennai Super Kings":         { bg:"#F9CD1B", fg:"#1a1a2e" },
  "Mumbai Indians":              { bg:"#004BA0", fg:"#ffffff" },
  "Royal Challengers Bengaluru": { bg:"#C8102E", fg:"#ffffff" },
  "Kolkata Knight Riders":       { bg:"#3A225D", fg:"#F0C040" },
  "Sunrisers Hyderabad":         { bg:"#F7500E", fg:"#ffffff" },
  "Delhi Capitals":              { bg:"#17479E", fg:"#EF3340" },
  "Lucknow Super Giants":        { bg:"#A72B2A", fg:"#FBBF24" },
  "Rajasthan Royals":            { bg:"#EA1A85", fg:"#ffffff" },
  "Gujarat Titans":              { bg:"#1C2B4A", fg:"#8AC0DE" },
  "Punjab Kings":                { bg:"#ED1B24", fg:"#ffffff" },
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
    const pieces = Array.from({length:100},()=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height-canvas.height,
      r:Math.random()*6+4, d:Math.random()*80+40,
      color:["#E8480C","#F9CD1B","#004BA0","#C8102E","#EA1A85","#1A7A4A"][Math.floor(Math.random()*6)],
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
    const t=setTimeout(()=>cancelAnimationFrame(frame),3200);
    return()=>{cancelAnimationFrame(frame);clearTimeout(t);};
  },[active]);
  if (!active) return null;
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:999}}/>;
};

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#F4F1EA; --bg2:#EDE9E0; --sf:#FFFFFF; --bd:#E5DFD2; --bd2:#CFC8B8;
      --t:#1A1612; --t2:#6B6358; --t3:#9C9080;
      --ac:#E8480C; --ac2:#D03A00;
      --gold:#C8820A; --gold-bg:#FFF8E8;
      --gr:#1A7A4A; --gr-bg:#EDFAF3;
      --re:#C40000; --re-bg:#FFF0F0;
      --r:14px; --r-sm:10px;
      --sh:0 1px 3px rgba(0,0,0,.05),0 4px 16px rgba(0,0,0,.06);
      --sh-md:0 2px 8px rgba(0,0,0,.08),0 8px 32px rgba(0,0,0,.09);
      --fd:'Syne',sans-serif; --fb:'DM Sans',sans-serif;
    }
    body{background:var(--bg);color:var(--t);font-family:var(--fb);-webkit-font-smoothing:antialiased;}
    button{font-family:var(--fb);}
    select{appearance:none;-webkit-appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6358' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat:no-repeat;background-position:right 12px center;padding-right:38px!important;}
    select option{background:#fff;color:#1A1612;}
    input:focus,select:focus{outline:none;border-color:var(--ac)!important;box-shadow:0 0 0 3px rgba(232,72,12,.12)!important;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    .fu{animation:fadeUp .28s ease forwards;}
    .pop{animation:pop .32s cubic-bezier(.34,1.56,.64,1) forwards;}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:3px}
  `}</style>
);

// ─────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────
const inp = {background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r-sm)",padding:"12px 14px",fontSize:14,color:"var(--t)",fontFamily:"var(--fb)",width:"100%",transition:"border-color .15s,box-shadow .15s"};
const lbl = {fontSize:11,fontWeight:700,fontFamily:"var(--fd)",color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6};

const Card = ({children,style={}}) => (
  <div style={{background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",padding:20,...style}}>{children}</div>
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
      style={{...inp,cursor:disabled?"not-allowed":"pointer",color:value?"var(--t)":"var(--t3)",opacity:disabled?.5:1}}>
      <option value="">{placeholder||"Choose one…"}</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({children,variant="primary",disabled,style={},...p}) => {
  const base = {display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",borderRadius:"var(--r-sm)",padding:"13px 20px",fontFamily:"var(--fd)",fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .15s",letterSpacing:"0.02em",width:"100%"};
  const v = {
    primary:{background:"var(--ac)",color:"#fff"},
    secondary:{background:"var(--sf)",color:"var(--t)",border:"1.5px solid var(--bd)"},
    ghost:{background:"transparent",color:"var(--t2)",border:"1.5px solid var(--bd)"},
  };
  return <button {...p} disabled={disabled} style={{...base,...(v[variant]||v.primary),...style,opacity:disabled?.4:1,cursor:disabled?"not-allowed":"pointer"}}>{children}</button>;
};

const Badge = ({children,color="orange"}) => {
  const c = {orange:{bg:"#FFF0E8",tc:"#C43A00"},green:{bg:"#EDFAF3",tc:"#1A7A4A"},red:{bg:"#FFF0F0",tc:"#C40000"},grey:{bg:"#F0EDE8",tc:"#6B6358"}}[color]||{bg:"#F0EDE8",tc:"#6B6358"};
  return <span style={{display:"inline-block",background:c.bg,color:c.tc,fontSize:10,fontWeight:700,fontFamily:"var(--fd)",letterSpacing:"0.06em",textTransform:"uppercase",padding:"3px 8px",borderRadius:100,whiteSpace:"nowrap"}}>{children}</span>;
};

const Avatar = ({name,size=36}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:avColor(name),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontFamily:"var(--fd)",fontWeight:800,fontSize:size*.38}}>
    {initials(name)}
  </div>
);

const TeamChip = ({team,size="sm"}) => {
  const c = TC[team]||{bg:"#ccc",fg:"#333"};
  const tc = c.fg==="#ffffff"?"#444":c.fg;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:c.bg+"18",color:tc,border:`1.5px solid ${c.bg}44`,borderRadius:100,padding:size==="lg"?"5px 12px 5px 8px":"3px 9px 3px 6px",fontFamily:"var(--fd)",fontWeight:700,fontSize:size==="lg"?13:11,whiteSpace:"nowrap"}}>
      <span style={{width:size==="lg"?9:7,height:size==="lg"?9:7,borderRadius:"50%",background:c.bg,flexShrink:0}}/>
      {size==="lg"?team:SHORT[team]||team}
    </span>
  );
};

const SecHead = ({step,icon,title,sub}) => (
  <div style={{marginBottom:18}}>
    {step&&<div style={{fontSize:10,fontWeight:700,fontFamily:"var(--fd)",color:"var(--ac)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>Step {step}</div>}
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {icon&&<span style={{fontSize:19}}>{icon}</span>}
      <h3 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:16,color:"var(--t)"}}>{title}</h3>
    </div>
    {sub&&<p style={{fontSize:12,color:"var(--t3)",marginTop:3,marginLeft:icon?"27px":"0"}}>{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────
// SEARCHABLE PLAYER PICKER
// ─────────────────────────────────────────────
const PlayerPick = ({label,value,onChange,disabled}) => {
  const [q,setQ]     = useState("");
  const [open,setOpen] = useState(false);
  const ref          = useRef(null);

  useEffect(()=>{
    const h = e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const filtered = ALL_PLAYERS.filter(p=>p.toLowerCase().includes(q.toLowerCase())).slice(0,50);
  const teamOf   = p => Object.entries(SQUADS).find(([,sq])=>sq.includes(p))?.[0];

  return (
    <div ref={ref} style={{position:"relative"}}>
      {label&&<label style={lbl}>{label}</label>}
      <div onClick={()=>{ if(!disabled){setOpen(o=>!o);setQ("");} }}
        style={{...inp,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:disabled?.5:1,userSelect:"none"}}>
        <span style={{color:value?"var(--t)":"var(--t3)",fontSize:14,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value||"Search player…"}</span>
        {value&&<span style={{fontSize:10,color:"var(--t3)",marginLeft:6,flexShrink:0}}>{SHORT[teamOf(value)]||""}</span>}
        <span style={{color:"var(--t3)",fontSize:11,marginLeft:8,flexShrink:0}}>▾</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:200,background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",boxShadow:"var(--sh-md)",overflow:"hidden"}}>
          <div style={{padding:8,borderBottom:"1px solid var(--bd)"}}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a name…" style={{...inp,padding:"8px 12px",fontSize:13}}/>
          </div>
          <div style={{maxHeight:220,overflowY:"auto"}}>
            {filtered.length===0&&<div style={{padding:"12px 16px",color:"var(--t3)",fontSize:13}}>No players found</div>}
            {filtered.map(p=>{
              const team=teamOf(p); const c=TC[team]||{bg:"#ccc"};
              return (
                <div key={p} onClick={()=>{onChange(p);setOpen(false);setQ("");}}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",background:value===p?"#FFF0E8":"transparent",borderLeft:value===p?"3px solid var(--ac)":"3px solid transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background=value===p?"#FFF0E8":"#F5F2EB"}
                  onMouseLeave={e=>e.currentTarget.style.background=value===p?"#FFF0E8":"transparent"}>
                  <span style={{fontSize:14,fontWeight:value===p?600:400,color:"var(--t)"}}>{p}</span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color:"var(--t3)"}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:c.bg}}/>{SHORT[team]||""}
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
// TOP-4 PICKER
// ─────────────────────────────────────────────
const Top4 = ({value,onChange,excluded,disabled}) => {
  const toggle = t => {
    if (value.includes(t)) onChange(value.filter(x=>x!==t));
    else if (value.length<4) onChange([...value,t]);
  };
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <label style={lbl}>Top 4 Playoff Teams</label>
        <Badge color={value.length===4?"green":"grey"}>{value.length}/4 picked</Badge>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {TEAMS.filter(t=>!excluded.includes(t)).map(t=>{
          const on=value.includes(t); const full=!on&&value.length>=4; const c=TC[t]||{bg:"#ccc"};
          return (
            <button key={t} type="button" disabled={disabled||full} onClick={()=>toggle(t)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:"var(--r-sm)",border:`1.5px solid ${on?"var(--t)":"var(--bd)"}`,background:on?"var(--t)":"var(--sf)",cursor:(disabled||full)?"not-allowed":"pointer",opacity:full?.35:1,transition:"all .15s",textAlign:"left"}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:c.bg,flexShrink:0}}/>
              <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:12,color:on?"#fff":"var(--t)",flex:1}}>
                <span style={{opacity:.6,fontSize:10}}>{SHORT[t]} </span>{t.split(" ").slice(-1)[0]}
              </span>
              {on&&<span style={{color:"#fff",fontSize:14,marginLeft:"auto"}}>✓</span>}
            </button>
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
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"linear-gradient(180deg,#F4F1EA 0%,#EDE9E0 100%)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,#E8480C18,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,#F9CD1B18,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:380,position:"relative",zIndex:1}} className="fu">
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:66,height:66,borderRadius:18,background:"var(--ac)",fontSize:28,marginBottom:12,boxShadow:"0 8px 24px rgba(232,72,12,.3)"}}>🏏</div>
          <h1 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:26,color:"var(--t)",lineHeight:1.1}}>IPL Prediction</h1>
          <h2 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:20,color:"var(--ac)",marginTop:2}}>League 2026</h2>
          <p style={{fontSize:12,color:"var(--t3)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:8}}>Predict · Compete · Win</p>
        </div>

        {/* How it works */}
        <div style={{background:"var(--gold-bg)",border:"1.5px solid #F5D170",borderRadius:"var(--r)",padding:"13px 16px",marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,fontFamily:"var(--fd)",color:"var(--gold)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>🎯 How it works</p>
          {["1. Join a league using a code from your friend","2. Make your IPL 2026 predictions","3. Watch live scores on the leaderboard"].map((s,i)=>(
            <p key={i} style={{fontSize:13,color:"var(--t2)",marginBottom:i<2?4:0}}>{s}</p>
          ))}
        </div>

        {urlCode&&<div className="pop" style={{background:"var(--gr-bg)",border:"1.5px solid #88DDB0",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:12,fontSize:13,color:"var(--gr)",fontWeight:600,display:"flex",alignItems:"center",gap:8}}>🔗 You've been invited! Sign in to join.</div>}

        {/* Mode toggle */}
        <div style={{display:"flex",background:"var(--bg2)",borderRadius:"var(--r-sm)",padding:3,marginBottom:14}}>
          {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"10px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--fd)",fontWeight:700,fontSize:13,transition:"all .15s",background:mode===m?"var(--sf)":"transparent",color:mode===m?"var(--t)":"var(--t3)",boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{l}</button>
          ))}
        </div>

        <Card style={{boxShadow:"var(--sh-md)"}}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {mode==="signup"&&<Inp label="Your Name" value={form.name} onChange={set("name")} placeholder="e.g. Swapnil"/>}
            <Inp label="Username" value={form.username} onChange={set("username")} placeholder="your_username" autoCapitalize="none"/>
            <Inp label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            {err&&<div style={{background:"var(--re-bg)",border:"1.5px solid #FFBBBB",borderRadius:"var(--r-sm)",padding:"10px 12px",fontSize:13,color:"var(--re)",display:"flex",gap:8"}}>⚠️ {err}</div>}
            <Btn onClick={submit} disabled={busy} style={{padding:"14px 0",fontSize:15}}>{busy?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}</Btn>
          </div>
        </Card>
        <p style={{textAlign:"center",fontSize:11,color:"var(--t3)",marginTop:12}}>🔒 Predictions lock 28 Mar · 3:30 PM IST</p>
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
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h2 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,color:"var(--t)"}}>My Leagues</h2>
          <p style={{fontSize:13,color:"var(--t3)",marginTop:3}}>Hi {user.name} 👋</p>
        </div>
        {view==="list"
          ? <Btn onClick={()=>{setView("join");setErr("");}} variant="secondary" style={{width:"auto",padding:"10px 16px",fontSize:13}}>🔗 Join League</Btn>
          : <Btn onClick={()=>{setView("list");setErr("");}} variant="ghost"     style={{width:"auto",padding:"10px 16px",fontSize:13}}>← Back</Btn>
        }
      </div>

      {toast&&<div className="pop" style={{display:"flex",alignItems:"center",gap:10,background:"var(--gr-bg)",border:"1.5px solid #88DDB0",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:12}}><span style={{fontSize:22}}>🎉</span><span style={{fontWeight:600,fontSize:14,color:"var(--gr)"}}>{toast}</span></div>}
      {err&&<div style={{background:"var(--re-bg)",border:"1.5px solid #FFBBBB",borderRadius:"var(--r-sm)",padding:"11px 14px",marginBottom:12,fontSize:13,color:"var(--re)"}}>⚠️ {err}</div>}

      {view==="join"&&(
        <Card style={{marginBottom:14,boxShadow:"var(--sh-md)"}}>
          <SecHead icon="🔗" title="Join a League" sub="Ask your league admin for their 6-character code"/>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <Inp label="League Code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. RCB007" maxLength={6}
              style={{letterSpacing:"0.25em",fontFamily:"monospace",fontSize:20,textAlign:"center",fontWeight:700}} onKeyDown={e=>e.key==="Enter"&&join()}/>
            <Btn onClick={join} disabled={busy||joinCode.length<4} style={{padding:"14px 0"}}>{busy?"Joining…":"Join League →"}</Btn>
          </div>
        </Card>
      )}

      {view==="list"&&(
        loading ? (
          <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)",fontSize:14}}>Loading your leagues…</div>
        ) : leagues.length===0 ? (
          <div style={{textAlign:"center",padding:"48px 16px"}}>
            <div style={{fontSize:44,marginBottom:12}}>🏏</div>
            <p style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:16,color:"var(--t)"}}>No league yet</p>
            <p style={{fontSize:13,color:"var(--t3)",margin:"6px 0 20px"}}>Enter a code to start playing with friends 👇</p>
            <Btn onClick={()=>setView("join")} style={{width:"auto",padding:"12px 24px",margin:"0 auto"}}>🔗 Enter League Code</Btn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {leagues.map(l=>(
              <button key={l.id} onClick={()=>onEnterLeague(l)}
                style={{width:"100%",textAlign:"left",background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",padding:"16px 18px",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"space-between"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--ac)";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="var(--sh-md)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div>
                  <p style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:15,color:"var(--t)"}}>{l.name}</p>
                  <p style={{fontSize:12,color:"var(--t3)",marginTop:3}}>{l.member_count} member{l.member_count!==1?"s":""}</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                  <span style={{fontFamily:"monospace",fontWeight:700,fontSize:13,letterSpacing:"0.2em",color:"var(--ac)",background:"#FFF0E8",padding:"4px 10px",borderRadius:100}}>{l.code}</span>
                  {l.created_by===user.id&&<Badge color="grey">Admin</Badge>}
                </div>
              </button>
            ))}
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
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
        <button onClick={onBack} style={{width:38,height:38,borderRadius:10,background:"var(--sf)",border:"1.5px solid var(--bd)",cursor:"pointer",fontSize:16,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
        <div>
          <h2 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:20,color:"var(--t)"}}>{league.name}</h2>
          <p style={{fontSize:12,color:"var(--t3)",marginTop:1}}>🏆 Leaderboard</p>
        </div>
      </div>

      {/* Invite row */}
      <div style={{display:"flex",alignItems:"center",gap:10,paddingLeft:50,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={copyLink} style={{display:"inline-flex",alignItems:"center",gap:7,background:"#FFF0E8",border:"1.5px solid #FFD0B8",borderRadius:100,padding:"6px 14px",cursor:"pointer"}}>
          <span style={{fontFamily:"monospace",fontWeight:700,fontSize:13,letterSpacing:"0.2em",color:"var(--ac)"}}>{league.code}</span>
          <span style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>{copied?"✓ Invite link copied!":"📋 copy invite link"}</span>
        </button>
        <span style={{fontSize:12,color:"var(--t3)"}}>{members.length} player{members.length!==1?"s":""}</span>
      </div>

      {/* My position banner */}
      {actuals&&me?.score!==null&&(
        <div className="pop" style={{background:"linear-gradient(135deg,#FFF5EE,#FFEEE0)",border:"1.5px solid #FFD0B0",borderRadius:"var(--r)",padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28}}>{medals[myRank-1]||`#${myRank}`}</span>
            <div>
              <p style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:14,color:"var(--t)"}}>You're #{myRank} of {members.length}</p>
              <p style={{fontSize:12,color:"var(--t2)",marginTop:2}}>{ptsBehind?`🔥 ${ptsBehind} pts behind ${leader.name.split(" ")[0]}`:"🏆 You're leading!"}</p>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:26,color:"var(--ac)"}}>{me.score}</p>
            <p style={{fontSize:11,color:"var(--t3)"}}>/ {MAX_PTS} pts</p>
          </div>
        </div>
      )}

      {loading?(
        <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading leaderboard…</div>
      ):(
        <>
          {!actuals&&(
            <div style={{display:"flex",alignItems:"center",gap:12,background:"var(--gold-bg)",border:"1.5px solid #F5D170",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:14}}>
              <span style={{fontSize:22}}>⏳</span>
              <div>
                <p style={{fontWeight:700,fontSize:13,color:"var(--gold)"}}>Tournament not started yet</p>
                <p style={{fontSize:12,color:"#9A7A00",marginTop:2}}>Scores appear once the admin enters results</p>
              </div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {members.map((m,i)=>{
              const isMe=m.id===user.id;
              const pct=m.score!==null?Math.round((m.score/MAX_PTS)*100):0;
              return (
                <div key={m.id} style={{background:isMe?"#FFF5EE":"var(--sf)",border:`1.5px solid ${isMe?"#FFD0B0":i<3&&actuals?"var(--bd2)":"var(--bd)"}`,borderRadius:"var(--r)",padding:"14px 16px",boxShadow:i<3&&actuals?"var(--sh)":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:34,textAlign:"center",flexShrink:0,fontSize:i<3&&actuals?22:13,fontFamily:"var(--fd)",fontWeight:700,color:"var(--t3)"}}>
                      {actuals&&i<3?medals[i]:`#${i+1}`}
                    </div>
                    <Avatar name={m.name}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:14,color:isMe?"var(--ac)":"var(--t)"}}>{m.name}</span>
                        {isMe&&<Badge color="orange">You</Badge>}
                        {!m.hasPred&&<Badge color="red">No pick yet</Badge>}
                      </div>
                      {m.pred?.winner&&<div style={{marginTop:5}}><TeamChip team={m.pred.winner}/></div>}
                      {actuals&&m.score!==null&&(
                        <div style={{marginTop:8,height:4,background:"var(--bg2)",borderRadius:100,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:100,background:"linear-gradient(90deg,var(--ac),#FF6B35)",width:`${pct}%`,transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/>
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {actuals&&m.score!==null?(
                        <>
                          <p style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,color:isMe?"var(--ac)":"var(--t)"}}>{m.score}</p>
                          <p style={{fontSize:11,color:"var(--t3)"}}>/{MAX_PTS}</p>
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
                  <div key={k} style={{background:"var(--bg2)",borderRadius:"var(--r-sm)",padding:"10px 12px"}}>
                    <p style={{fontSize:11,color:"var(--t3)"}}>{k}</p>
                    <p style={{fontSize:13,fontWeight:700,color:"var(--t)",marginTop:3}}>{v}</p>
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
// MY PICKS SCREEN  (3-step flow)
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
        setConfetti(true); setTimeout(()=>setConfetti(false),3400);
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
        <h2 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,color:"var(--t)"}}>My Picks</h2>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap"}}>
          {locked?<Badge color="red">🔒 Locked</Badge>:<Badge color="orange">⏰ Locks 28 Mar · 3:30 PM IST</Badge>}
          {saved&&!locked&&<Badge color="green">✓ Saved</Badge>}
        </div>
      </div>

      {locked&&saved&&(
        <div style={{display:"flex",alignItems:"center",gap:12,background:"var(--gr-bg)",border:"1.5px solid #88DDB0",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:14}}>
          <span style={{fontSize:22}}>🎉</span>
          <div>
            <p style={{fontWeight:700,fontSize:13,color:"var(--gr)"}}>Your picks are locked in!</p>
            <p style={{fontSize:12,color:"#2A8A5A",marginTop:2}}>Check the leaderboard once the tournament starts</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {!locked&&(
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,color:"var(--t3)",fontWeight:600}}>Progress</span>
            <span style={{fontSize:12,fontWeight:700,color:complete?"var(--gr)":"var(--t2)"}}>{done}/7 complete</span>
          </div>
          <div style={{height:6,background:"var(--bg2)",borderRadius:100,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:100,background:complete?"var(--gr)":"var(--ac)",width:`${(done/7)*100}%`,transition:"width .4s ease"}}/>
          </div>
        </div>
      )}

      {/* Step pills */}
      {!locked&&(
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[["1","Tournament","🏆"],["2","Top 4","🏅"],["3","Players","🎖️"]].map(([n,l,ic])=>(
            <button key={n} onClick={()=>setStep(Number(n))}
              style={{flex:1,padding:"10px 6px",borderRadius:"var(--r-sm)",border:`1.5px solid ${step===Number(n)?"var(--t)":"var(--bd)"}`,background:step===Number(n)?"var(--t)":"var(--sf)",color:step===Number(n)?"#fff":"var(--t3)",fontFamily:"var(--fd)",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .15s",textAlign:"center"}}>
              <div style={{fontSize:14,marginBottom:2}}>{ic}</div>
              <div style={{fontSize:9,opacity:.8,marginBottom:1}}>STEP {n}</div>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {(step===1||locked)&&(
        <Card style={{marginBottom:10}}>
          <SecHead step={locked?null:1} icon="🏆" title="Tournament Podium" sub="Who wins IPL 2026?"/>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Sel label="IPL 2026 Champion"    value={pred.winner}    onChange={v=>upd("winner",v)}    options={TEAMS}                         disabled={locked}/>
            <Sel label="Runner-Up (Finalist)" value={pred.finalist2} onChange={v=>upd("finalist2",v)} options={TEAMS.filter(t=>t!==pred.winner)} disabled={locked}/>
          </div>
          {!locked&&step===1&&<Btn onClick={()=>setStep(2)} disabled={!canNext1} style={{marginTop:14,padding:"13px 0"}}>Next: Pick Top 4 →</Btn>}
        </Card>
      )}

      {/* STEP 2 */}
      {(step===2||locked)&&(
        <Card style={{marginBottom:10}}>
          <SecHead step={locked?null:2} icon="🏅" title="Top 4 Playoff Teams" sub="Pick the 4 semi-finalists (winner & runner-up already count)"/>
          <Top4 value={pred.top4} onChange={v=>upd("top4",v)} excluded={exclTop4} disabled={locked}/>
          {!locked&&step===2&&(
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <Btn onClick={()=>setStep(1)} variant="ghost"   style={{width:"auto",padding:"13px 20px"}}>← Back</Btn>
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

      {/* Points */}
      <Card style={{marginBottom:14}}>
        <SecHead icon="💰" title="Points on Offer"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[["🏆 Champion","20"],["🥈 Runner-Up","10"],["Each Top-4","5"],["🍊 Orange Cap","15"],["💜 Purple Cap","15"],["💥 Sixes","10"],["🏏 Fours","10"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--bg2)",borderRadius:"var(--r-sm)",padding:"8px 10px"}}>
              <span style={{fontSize:12,color:"var(--t2)"}}>{k}</span>
              <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:13,color:"var(--ac)"}}>{v} pts</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1.5px solid var(--bd)",marginTop:10,paddingTop:10}}>
          <span style={{fontWeight:700,color:"var(--t2)"}}>Maximum possible</span>
          <span style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:17,color:"var(--t)"}}>{MAX_PTS} pts</span>
        </div>
      </Card>

      {!locked&&(
        <Btn onClick={save} disabled={!complete||status==="saving"} style={{padding:"15px 0",fontSize:15,opacity:complete?1:.4}}>
          {status==="saving"?"Saving…":saved?"✅ Update My Picks":"Save My Picks →"}
        </Btn>
      )}

      {status==="saved"&&<div className="pop" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"var(--gr-bg)",border:"1.5px solid #88DDB0",borderRadius:"var(--r-sm)",padding:"13px 16px",marginTop:10,fontSize:14,fontWeight:600,color:"var(--gr)"}}>🎉 Picks saved! Good luck!</div>}
      {status?.startsWith("error:")&&<div style={{background:"var(--re-bg)",border:"1.5px solid #FFBBBB",borderRadius:"var(--r-sm)",padding:"12px 16px",marginTop:10,fontSize:13,color:"var(--re)"}}>❌ {status.replace("error:","")}</div>}
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
      <div style={{fontSize:52,marginBottom:12}}>🔐</div>
      <h2 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,marginBottom:8}}>Admin Panel</h2>
      <p style={{color:"var(--t3)",fontSize:13,marginBottom:24}}>Enter results as the IPL progresses</p>
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
        <h2 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,color:"var(--t)"}}>Admin Panel</h2>
        <p style={{fontSize:13,color:"var(--t3)",marginTop:3}}>Manage leagues & enter results</p>
      </div>

      {/* Create League */}
      <Card style={{marginBottom:12}}>
        <SecHead icon="✨" title="Create a League"/>
        <div style={{display:"flex",gap:8}}>
          <input value={leagueName} onChange={e=>setLeagueName(e.target.value)} placeholder="e.g. Family IPL 2026"
            style={{...inp,flex:1}} onKeyDown={e=>e.key==="Enter"&&createLeague()}/>
          <Btn onClick={createLeague} disabled={!leagueName.trim()} style={{width:"auto",padding:"0 18px",whiteSpace:"nowrap",flexShrink:0}}>Create</Btn>
        </div>
        {leagueResult&&(
          <div className="pop" style={{marginTop:12,background:"var(--gr-bg)",border:"1.5px solid #88DDB0",borderRadius:"var(--r-sm)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:600,fontSize:13,color:"var(--gr)"}}>✅ "{leagueResult.name}" created!</span>
            <span style={{fontFamily:"monospace",fontWeight:700,fontSize:15,letterSpacing:"0.2em",color:"var(--ac)",background:"#FFF0E8",padding:"4px 12px",borderRadius:100}}>{leagueResult.code}</span>
          </div>
        )}
      </Card>

      {/* Results */}
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
          <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<participants.length-1?"1px solid var(--bd)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={p.name} size={32}/>
              <div>
                <p style={{fontWeight:700,fontSize:14,color:"var(--t)"}}>{p.name}</p>
                <p style={{fontSize:11,color:"var(--t3)"}}>@{p.username}</p>
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

  const enterLeague  = l=>{ setActiveLeague(l); setTab("league-detail"); };
  const backToLeagues = ()=>{ setActiveLeague(null); setTab("leagues"); };

  const navItems = [
    {id:"leagues",icon:"🏟️",label:"Leagues"},
    {id:"picks",  icon:"🎯",label:"My Picks"},
    ...(isAdminRoute?[{id:"admin",icon:"⚙️",label:"Admin"}]:[]),
  ];

  return (
    <>
      <GS/>
      <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#F4F1EA 0%,#EDE9E0 100%)"}}>

        {/* Header */}
        <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(244,241,234,.94)",backdropFilter:"blur(12px)",borderBottom:"1.5px solid var(--bd)"}}>
          <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={backToLeagues} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:0}}>
              <div style={{width:32,height:32,borderRadius:9,background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🏏</div>
              <span style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:15,color:"var(--t)"}}>IPL Prediction League</span>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Avatar name={user.name} size={28}/>
              <span style={{fontSize:13,color:"var(--t2)",fontWeight:600,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
              <button onClick={logout} style={{background:"none",border:"1.5px solid var(--bd)",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,color:"var(--t3)",cursor:"pointer",fontFamily:"var(--fb)"}}>Out</button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{paddingBottom:90}}>
          {tab==="leagues"       && <LeaguesScreen user={user} onEnterLeague={enterLeague}/>}
          {tab==="league-detail" && activeLeague && <LeagueScreen league={activeLeague} user={user} onBack={backToLeagues}/>}
          {tab==="picks"         && <PicksScreen user={user}/>}
          {(tab==="admin"||isAdminRoute) && <AdminScreen/>}
        </main>

        {/* Bottom nav */}
        <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"rgba(244,241,234,.96)",backdropFilter:"blur(12px)",borderTop:"1.5px solid var(--bd)"}}>
          <div style={{maxWidth:520,margin:"0 auto",display:"flex"}}>
            {navItems.map(t=>{
              const active=tab===t.id||(t.id==="leagues"&&tab==="league-detail");
              return (
                <button key={t.id} onClick={()=>{setActiveLeague(null);setTab(t.id);}}
                  style={{flex:1,padding:"13px 0 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",transition:"all .15s",borderTop:`2.5px solid ${active?"var(--ac)":"transparent"}`,marginTop:"-1.5px"}}>
                  <span style={{fontSize:20,lineHeight:1}}>{t.icon}</span>
                  <span style={{fontSize:10,fontFamily:"var(--fd)",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",color:active?"var(--ac)":"var(--t3)"}}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
