import { useState, useEffect, useCallback, useRef } from "react";

const SB_URL    = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";
const ADMIN_PWD = "ipl2026admin";

const TEAMS = ["Chennai Super Kings","Mumbai Indians","Royal Challengers Bengaluru","Kolkata Knight Riders","Sunrisers Hyderabad","Delhi Capitals","Lucknow Super Giants","Rajasthan Royals","Gujarat Titans","Punjab Kings"];
const SHORT = {"Chennai Super Kings":"CSK","Mumbai Indians":"MI","Royal Challengers Bengaluru":"RCB","Kolkata Knight Riders":"KKR","Sunrisers Hyderabad":"SRH","Delhi Capitals":"DC","Lucknow Super Giants":"LSG","Rajasthan Royals":"RR","Gujarat Titans":"GT","Punjab Kings":"PBKS"};
const TC = {
  "Chennai Super Kings":{bg:"#F9CD1B",fg:"#0A1931"},"Mumbai Indians":{bg:"#004BA0",fg:"#FFFFFF"},
  "Royal Challengers Bengaluru":{bg:"#C8102E",fg:"#FFFFFF"},"Kolkata Knight Riders":{bg:"#3A225D",fg:"#F0C040"},
  "Sunrisers Hyderabad":{bg:"#F7500E",fg:"#FFFFFF"},"Delhi Capitals":{bg:"#17479E",fg:"#EF3340"},
  "Lucknow Super Giants":{bg:"#A72B2A",fg:"#FBBF24"},"Rajasthan Royals":{bg:"#EA1A85",fg:"#FFFFFF"},
  "Gujarat Titans":{bg:"#1C2B4A",fg:"#8AC0DE"},"Punjab Kings":{bg:"#ED1B24",fg:"#FFFFFF"},
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
const TPOINTS     = {winner:20,finalist2:10,top4_each:5,top_scorer:15,top_wicket_taker:15,max_sixes:10,max_fours:10};
const MAX_PTS     = 95;
const DPOINTS     = {winner:10,top_batter:8,top_bowler:8,potm:10};

const sb = async (path, opts={}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`,{
    headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json",Prefer:opts.prefer??"return=representation",...(opts.headers||{})},
    method:opts.method||"GET",body:opts.body!=null?JSON.stringify(opts.body):undefined,
  });
  const txt=await r.text();
  if(!r.ok) throw new Error(txt);
  return txt?JSON.parse(txt):null;
};

const calcTScore=(pred,act)=>{
  if(!act||!pred) return null;
  let s=0;
  if(pred.winner===act.winner) s+=TPOINTS.winner;
  if(pred.finalist2&&(pred.finalist2===act.finalist2||pred.finalist2===act.winner)) s+=TPOINTS.finalist2;
  (pred.top4||[]).forEach(t=>{if((act.top4||[]).includes(t))s+=TPOINTS.top4_each;});
  if(pred.top_scorer===act.top_scorer) s+=TPOINTS.top_scorer;
  if(pred.top_wicket_taker===act.top_wicket_taker) s+=TPOINTS.top_wicket_taker;
  if(pred.max_sixes===act.max_sixes) s+=TPOINTS.max_sixes;
  if(pred.max_fours===act.max_fours) s+=TPOINTS.max_fours;
  return s;
};

const initials=(n="")=>n.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const AV=["#E8480C","#004BA0","#C8102E","#3A225D","#1A7A4A","#17479E","#EA1A85","#F7500E"];
const avColor=(n="")=>AV[n.charCodeAt(0)%AV.length];
const teamOf=p=>Object.entries(SQUADS).find(([,sq])=>sq.includes(p))?.[0];
const fmtTime=d=>new Date(d).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const fmtDate=d=>new Date(d).toLocaleDateString([],{weekday:"short",day:"numeric",month:"short"});

// ─── CONFETTI ───
const Confetti=({active})=>{
  const ref=useRef(null);
  useEffect(()=>{
    if(!active) return;
    const cv=ref.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    cv.width=window.innerWidth; cv.height=window.innerHeight;
    const ps=Array.from({length:100},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height-cv.height,r:Math.random()*6+4,d:Math.random()*80+40,color:["#E8480C","#F9CD1B","#004BA0","#C8102E","#EA1A85"][Math.floor(Math.random()*5)],tilt:0,ta:0,ts:Math.random()*.1+.04}));
    let a=0,fr;
    const draw=()=>{ctx.clearRect(0,0,cv.width,cv.height);a+=.01;ps.forEach(p=>{p.ta+=p.ts;p.y+=(Math.cos(a+p.d)+3)*1.5;p.x+=Math.sin(a)*1.5;p.tilt=Math.sin(p.ta)*12;ctx.beginPath();ctx.lineWidth=p.r/2;ctx.strokeStyle=p.color;ctx.moveTo(p.x+p.tilt+p.r/4,p.y);ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/4);ctx.stroke();if(p.y>cv.height){p.y=-10;p.x=Math.random()*cv.width;}});fr=requestAnimationFrame(draw);};
    draw();const t=setTimeout(()=>cancelAnimationFrame(fr),3500);
    return()=>{cancelAnimationFrame(fr);clearTimeout(t);};
  },[active]);
  if(!active) return null;
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:999}}/>;
};

// ─── GLOBAL STYLES ───
const GS=()=>(
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#F4F6F8;--sf:#FFFFFF;--sf2:#F8F9FA;--bd:#E2E5EA;--bd2:#D0D4DB;
      --t:#0F1419;--t2:#3D4550;--t3:#8A9099;
      --ac:#E8480C;--navy:#0F1F3D;--green:#0A8F4F;--red:#D93025;--gold:#C8860A;
      --r:14px;--r-sm:10px;--r-xs:8px;
      --sh:0 1px 4px rgba(0,0,0,.08),0 2px 12px rgba(0,0,0,.05);
      --sh-md:0 4px 16px rgba(0,0,0,.10);--sh-lg:0 8px 32px rgba(0,0,0,.12);
      --fd:'Barlow Condensed',sans-serif;--fb:'Barlow',sans-serif;
    }
    html{scroll-behavior:smooth;}
    body{background:var(--bg);color:var(--t);font-family:var(--fb);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
    button{font-family:var(--fb);}
    select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A9099' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:38px!important;}
    select option{background:#fff;color:#0F1419;}
    input:focus,select:focus{outline:none;border-color:var(--ac)!important;box-shadow:0 0 0 3px rgba(232,72,12,.12)!important;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(.85);opacity:0}65%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .fu{animation:fadeUp .3s ease forwards;}
    .pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1) forwards;}
    .live-dot{animation:pulse 1s ease infinite;}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:4px}
  `}</style>
);

// ─── PRIMITIVES ───
const Card=({children,style={},accent})=>(
  <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--r)",padding:20,boxShadow:"var(--sh)",borderTop:accent?`3px solid ${accent}`:undefined,...style}}>{children}</div>
);
const inpS={background:"var(--sf2)",border:"1.5px solid var(--bd)",borderRadius:"var(--r-sm)",padding:"13px 16px",fontSize:15,color:"var(--t)",fontFamily:"var(--fb)",width:"100%",transition:"border-color .15s,box-shadow .15s"};
const Inp=({label,...p})=>(
  <div>{label&&<label style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}<input {...p} style={{...inpS,...(p.style||{})}}/></div>
);
const Sel=({label,value,onChange,options,placeholder,disabled})=>(
  <div>{label&&<label style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} style={{...inpS,cursor:disabled?"not-allowed":"pointer",color:value?"var(--t)":"var(--t3)",opacity:disabled?.6:1}}>
    <option value="">{placeholder||"Choose…"}</option>{options.map(o=><option key={o} value={o}>{o}</option>)}
  </select></div>
);
const Btn=({children,variant="primary",disabled,style={},...p})=>{
  const v={primary:{background:"var(--ac)",color:"#fff",boxShadow:"0 2px 8px rgba(232,72,12,.3)"},navy:{background:"var(--navy)",color:"#fff",boxShadow:"0 2px 8px rgba(15,31,61,.25)"},ghost:{background:"transparent",color:"var(--t2)",border:"1.5px solid var(--bd)"},light:{background:"var(--sf2)",color:"var(--t)",border:"1.5px solid var(--bd)"},green:{background:"var(--green)",color:"#fff",boxShadow:"0 2px 8px rgba(10,143,79,.25)"}}[variant]||{};
  return <button {...p} disabled={disabled} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",borderRadius:"var(--r-sm)",padding:"13px 20px",fontFamily:"var(--fb)",fontWeight:700,fontSize:15,cursor:disabled?"not-allowed":"pointer",transition:"all .15s",width:"100%",opacity:disabled?.45:1,...v,...style}} onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.08)";e.currentTarget.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{e.currentTarget.style.filter="none";e.currentTarget.style.transform="none";}}>{children}</button>;
};
const Pill=({children,color="orange",style={}})=>{
  const c={orange:{bg:"#FEF0EB",tc:"#C94400",bd:"#F5C4B4"},green:{bg:"#E8F7EF",tc:"#0A6B3B",bd:"#A8DFC0"},red:{bg:"#FDECEA",tc:"#B91C1C",bd:"#F5B4B4"},grey:{bg:"#F1F3F5",tc:"#6B7280",bd:"#D1D5DB"},gold:{bg:"#FFF8E6",tc:"#92650A",bd:"#F0D090"},navy:{bg:"#EBF0FA",tc:"#1E3A8A",bd:"#BDD0F5"}}[color]||{bg:"#F1F3F5",tc:"#6B7280",bd:"#D1D5DB"};
  return <span style={{display:"inline-flex",alignItems:"center",background:c.bg,color:c.tc,border:`1px solid ${c.bd}`,fontSize:11,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",padding:"3px 9px",borderRadius:100,whiteSpace:"nowrap",...style}}>{children}</span>;
};
const Avatar=({name,size=36})=>(
  <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${avColor(name)},${avColor(name+"x")})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontFamily:"var(--fd)",fontWeight:700,fontSize:size*.36,boxShadow:"0 2px 6px rgba(0,0,0,.15)"}}>{initials(name)}</div>
);
const TeamChip=({team,large})=>{
  const c=TC[team]||{bg:"#ccc",fg:"#333"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,background:c.bg,color:c.fg,borderRadius:100,padding:large?"5px 12px 5px 8px":"3px 9px 3px 6px",fontFamily:"var(--fd)",fontWeight:700,fontSize:large?13:11,whiteSpace:"nowrap"}}><span style={{width:large?8:6,height:large?8:6,borderRadius:"50%",background:c.fg+"55",flexShrink:0}}/>{large?team:SHORT[team]||team}</span>;
};
const TeamCard=({team,selected,onClick,disabled,small})=>{
  const c=TC[team];
  return <button onClick={onClick} disabled={disabled} style={{border:`2px solid ${selected?c.bg:"var(--bd)"}`,borderRadius:small?10:12,background:selected?`${c.bg}18`:"var(--sf2)",cursor:disabled?"not-allowed":"pointer",padding:small?"8px 4px":"12px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .15s",boxShadow:selected?`0 0 0 1px ${c.bg}66,0 4px 12px ${c.bg}22`:"none",opacity:disabled&&!selected?.35:1,position:"relative"}} onMouseEnter={e=>{if(!disabled&&!selected){e.currentTarget.style.borderColor=c.bg+"88";e.currentTarget.style.background=`${c.bg}0a`;}}} onMouseLeave={e=>{if(!selected){e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.background="var(--sf2)";}}}>
    {selected&&<div style={{position:"absolute",top:3,right:3,width:15,height:15,borderRadius:"50%",background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:c.fg,fontWeight:900}}>✓</div>}
    <div style={{width:small?32:40,height:small?32:40,borderRadius:small?8:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:selected?`0 3px 10px ${c.bg}55`:"none"}}><span style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:small?11:13,color:c.fg,letterSpacing:"-0.01em"}}>{SHORT[team]}</span></div>
    <span style={{fontFamily:"var(--fd)",fontSize:small?10:12,color:selected?c.bg:"var(--t2)",fontWeight:700,textAlign:"center",lineHeight:1.1,maxWidth:small?48:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team.split(" ").slice(-1)[0]}</span>
  </button>;
};
const SecHead=({icon,title,sub,right})=>(
  <div style={{marginBottom:16,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
    <div><div style={{display:"flex",alignItems:"center",gap:8}}>{icon&&<span style={{fontSize:18}}>{icon}</span>}<h3 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:18,color:"var(--t)"}}>{title}</h3></div>{sub&&<p style={{fontSize:13,color:"var(--t3)",marginTop:2,marginLeft:icon?"26px":"0",fontWeight:500}}>{sub}</p>}</div>
    {right}
  </div>
);
const TeamTicker=()=>{
  const items=[...TEAMS,...TEAMS];
  return <div style={{overflow:"hidden",background:"var(--navy)",padding:"7px 0"}}><div style={{display:"inline-flex",animation:"marquee 28s linear infinite"}}>{items.map((t,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,marginRight:20,fontSize:12,fontFamily:"var(--fd)",fontWeight:700,color:TC[t].fg,background:TC[t].bg,padding:"3px 10px",borderRadius:100,whiteSpace:"nowrap"}}>{SHORT[t]}</span>)}</div></div>;
};
// Top4 — shows ALL 10 teams
const Top4Picker=({value,onChange,disabled})=>{
  const toggle=t=>{if(value.includes(t))onChange(value.filter(x=>x!==t));else if(value.length<4)onChange([...value,t]);};
  return <div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Top 4 Playoff Teams</label><Pill color={value.length===4?"green":"gold"}>{value.length}/4 picked</Pill></div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>{TEAMS.map(t=>{const on=value.includes(t);const full=!on&&value.length>=4;return <TeamCard key={t} team={t} selected={on} onClick={()=>toggle(t)} disabled={disabled||full} small/>;})}</div><p style={{fontSize:12,color:"var(--t3)",marginTop:8,fontWeight:500}}>Pick any 4 teams — winner &amp; runner-up can also be included</p></div>;
};
// Searchable player picker
const PlayerPick=({label,value,onChange,disabled})=>{
  const [q,setQ]=useState(""); const [open,setOpen]=useState(false); const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const filtered=ALL_PLAYERS.filter(p=>p.toLowerCase().includes(q.toLowerCase())).slice(0,60);
  const team=value?teamOf(value):null; const tc=team?TC[team]:null;
  return <div ref={ref} style={{position:"relative"}}>
    {label&&<label style={{fontSize:12,fontWeight:700,color:"var(--t2)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <div onClick={()=>{if(!disabled){setOpen(o=>!o);setQ("");}}} style={{...inpS,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:disabled?.6:1,userSelect:"none",borderColor:value?tc?tc.bg+"99":"var(--ac)":"var(--bd)",background:value&&tc?`${tc.bg}0d`:"var(--sf2)"}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",alignItems:"center",gap:10}}>
        {value&&tc&&<div style={{width:8,height:8,borderRadius:"50%",background:tc.bg,flexShrink:0}}/>}
        <span style={{color:value?"var(--t)":"var(--t3)",fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:value?600:400}}>{value||"Search player…"}</span>
        {value&&team&&<span style={{fontSize:11,fontWeight:700,color:tc?.bg||"var(--t3)",background:tc?`${tc.bg}18`:"var(--sf2)",padding:"2px 7px",borderRadius:6,flexShrink:0}}>{SHORT[team]||""}</span>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    {open&&<div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:300,background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:"var(--r)",boxShadow:"var(--sh-lg)",overflow:"hidden"}}>
      <div style={{padding:10,borderBottom:"1px solid var(--bd)",background:"var(--sf2)"}}><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a name…" style={{...inpS,padding:"10px 13px",fontSize:14}}/></div>
      <div style={{maxHeight:230,overflowY:"auto"}}>
        {filtered.length===0&&<div style={{padding:16,color:"var(--t3)",fontSize:14,textAlign:"center"}}>No players found</div>}
        {filtered.map(p=>{const pt=teamOf(p);const c=TC[pt]||{bg:"#888"};return <div key={p} onClick={()=>{onChange(p);setOpen(false);setQ("");}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",cursor:"pointer",background:value===p?`${c.bg}12`:"transparent",borderLeft:value===p?`3px solid ${c.bg}`:"3px solid transparent"}} onMouseEnter={e=>e.currentTarget.style.background=value===p?`${c.bg}12`:"var(--sf2)"} onMouseLeave={e=>e.currentTarget.style.background=value===p?`${c.bg}12`:"transparent"}><span style={{fontSize:15,fontWeight:value===p?700:400,color:"var(--t)"}}>{p}</span><span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,background:c.bg,color:TC[pt]?.fg||"#fff",padding:"2px 8px",borderRadius:100,fontFamily:"var(--fd)",fontWeight:700}}>{SHORT[pt]||""}</span></div>;})}
      </div>
    </div>}
  </div>;
};

// ─── AUTH ───
const AuthScreen=({onLogin})=>{
  const [mode,setMode]=useState("login"); const [form,setForm]=useState({username:"",password:"",name:""}); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const submit=async()=>{setErr("");setBusy(true);try{let user;if(mode==="signup"){if(!form.name.trim()||!form.username.trim()||!form.password.trim())throw new Error("Please fill all fields");const ex=await sb(`users?username=eq.${form.username.toLowerCase()}&select=id`);if(ex?.length)throw new Error("Username taken");[user]=await sb("users",{method:"POST",body:{username:form.username.toLowerCase().trim(),password:form.password,name:form.name.trim()}});}else{const rows=await sb(`users?username=eq.${form.username.toLowerCase()}&password=eq.${form.password}&select=*`);if(!rows?.length)throw new Error("Wrong username or password");user=rows[0];}onLogin(user);}catch(e){setErr(e.message);}setBusy(false);};
  return <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
    <div style={{height:4,background:"linear-gradient(90deg,#E8480C,#F9CD1B,#C8102E,#3A225D,#004BA0,#F7500E,#EA1A85)"}}/>
    <div style={{background:"var(--navy)",padding:"28px 20px 22px"}}>
      <div style={{maxWidth:400,margin:"0 auto",textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:18,background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:14,boxShadow:"0 8px 24px rgba(232,72,12,.4)"}}>🏏</div>
        <h1 style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:34,color:"#fff",letterSpacing:"0.04em",lineHeight:1.1}}>IPL PREDICTION<br/><span style={{color:"#F9CD1B"}}>CHAMPIONSHIP 2026</span></h1>
        <p style={{fontSize:12,color:"rgba(255,255,255,.45)",marginTop:8,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>Predict · Daily · Win</p>
        <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:14}}>{TEAMS.map(t=><span key={t} style={{background:TC[t].bg,color:TC[t].fg,fontSize:10,fontFamily:"var(--fd)",fontWeight:700,padding:"2px 8px",borderRadius:100}}>{SHORT[t]}</span>)}</div>
      </div>
    </div>
    <div style={{flex:1,padding:"22px 20px",maxWidth:420,margin:"0 auto",width:"100%"}}>
      <Card style={{marginBottom:18,borderTop:"3px solid var(--ac)"}}>
        <p style={{fontSize:11,fontWeight:700,color:"var(--ac)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🎯 How It Works</p>
        {["Pick tournament winner, top 4 & player awards","Predict every match — winner, top batter, MVP","Rack up points over 45 days of IPL cricket!"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?7:0}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:i===2?"var(--navy)":"var(--ac)",color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
            <span style={{fontSize:14,color:"var(--t2)",fontWeight:500}}>{s}</span>
          </div>
        ))}
      </Card>
      <div style={{display:"flex",background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--r-sm)",padding:4,marginBottom:16}}>
        {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=><button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--fb)",fontWeight:700,fontSize:14,transition:"all .15s",background:mode===m?"var(--navy)":"transparent",color:mode===m?"#fff":"var(--t3)"}}>{l}</button>)}
      </div>
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {mode==="signup"&&<Inp label="Your Name" value={form.name} onChange={set("name")} placeholder="e.g. Swapnil Kulkarni"/>}
          <Inp label="Username" value={form.username} onChange={set("username")} placeholder="swapnil123" autoCapitalize="none"/>
          <Inp label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
          {err&&<div style={{background:"#FDECEA",border:"1px solid #F5B4B4",borderRadius:"var(--r-xs)",padding:"10px 13px",fontSize:14,color:"var(--red)",fontWeight:600}}>⚠️ {err}</div>}
          <Btn onClick={submit} disabled={busy} variant="navy" style={{padding:"15px 0",fontSize:15}}>{busy?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}</Btn>
        </div>
      </Card>
      <p style={{textAlign:"center",fontSize:12,color:"var(--t3)",marginTop:14,fontWeight:500}}>🔒 Tournament predictions lock 28 Mar · 3:30 PM IST</p>
    </div>
  </div>;
};

// ─── TODAY'S MATCHES ───
const TodayScreen=({user})=>{
  const [matches,setMatches]=useState([]); const [myPreds,setMyPreds]=useState({}); const [loading,setLoading]=useState(true); const [toast,setToast]=useState(""); const [saving,setSaving]=useState(null);
  const load=useCallback(async()=>{setLoading(true);try{const ms=await sb("daily_matches?select=*&order=match_date.asc").catch(()=>[]);setMatches(ms||[]);if((ms||[]).length){const ids=(ms||[]).map(m=>m.id);const preds=await sb(`daily_predictions?user_id=eq.${user.id}&match_id=in.(${ids.join(",")})&select=*`).catch(()=>[]);const pm={};(preds||[]).forEach(p=>pm[p.match_id]=p);setMyPreds(pm);}}catch(e){console.error(e);}setLoading(false);},[user.id]);
  useEffect(()=>{load();},[load]);
  const savePred=async(matchId,data)=>{setSaving(matchId);try{const ex=myPreds[matchId];if(ex){await sb(`daily_predictions?id=eq.${ex.id}`,{method:"PATCH",body:{...data,updated_at:new Date().toISOString()}});}else{await sb("daily_predictions",{method:"POST",body:{user_id:user.id,match_id:matchId,...data}});}setMyPreds(p=>({...p,[matchId]:{...(p[matchId]||{}),match_id:matchId,...data}}));setToast("✅ Prediction locked!");setTimeout(()=>setToast(""),2500);}catch(e){setToast("❌ "+e.message);setTimeout(()=>setToast(""),3000);}setSaving(null);};
  const totalDaily=Object.values(myPreds).reduce((s,p)=>s+(p.points_earned||0),0);
  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)",fontSize:14}}>Loading matches…</div>;
  return <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">
    <div style={{background:"var(--navy)",borderRadius:"var(--r)",padding:"16px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"var(--sh-md)"}}>
      <div><p style={{fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Daily Predictions</p><h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:22,color:"#fff",marginTop:2}}>Today's Matches</h2></div>
      <div style={{textAlign:"right"}}><p style={{fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:600,textTransform:"uppercase"}}>My Daily Pts</p><p style={{fontFamily:"var(--fd)",fontSize:28,color:"#F9CD1B",fontWeight:700,lineHeight:1}}>{totalDaily}</p></div>
    </div>
    {toast&&<div className="pop" style={{background:toast.startsWith("✅")?"#E8F7EF":"#FDECEA",border:`1px solid ${toast.startsWith("✅")?"#A8DFC0":"#F5B4B4"}`,borderRadius:"var(--r-sm)",padding:"12px 14px",marginBottom:12,fontSize:14,fontWeight:600,color:toast.startsWith("✅")?"#0A6B3B":"var(--red)"}}>{toast}</div>}
    {matches.length===0?(
      <div style={{textAlign:"center",padding:"40px 16px"}}>
        <div style={{fontSize:52,marginBottom:12}}>🏟️</div>
        <p style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:22,color:"var(--t)"}}>No Matches Today</p>
        <p style={{fontSize:14,color:"var(--t3)",marginTop:8,fontWeight:500,marginBottom:20}}>The admin adds fixtures before each match day. Check back soon!</p>
        <Card accent="#C8860A">
          <p style={{fontSize:12,fontWeight:700,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>💰 Daily Points Available Per Match</p>
          {[["Match Winner","10 pts"],["Top Batter","8 pts"],["Top Bowler","8 pts"],["Player of the Match","10 pts"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"var(--t2)",marginBottom:5,fontWeight:500}}><span>{k}</span><span style={{fontWeight:700,color:"var(--gold)"}}>{v}</span></div>
          ))}
        </Card>
      </div>
    ):(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {matches.map(m=><MatchCard key={m.id} match={m} myPred={myPreds[m.id]} onSave={d=>savePred(m.id,d)} saving={saving===m.id}/>)}
      </div>
    )}
  </div>;
};

const MatchCard=({match,myPred,onSave,saving})=>{
  const t1=TC[match.team1]||{bg:"#ccc",fg:"#333"}; const t2=TC[match.team2]||{bg:"#ccc",fg:"#333"};
  const isCompleted=match.status==="completed"; const isLive=match.status==="live";
  const canPredict=!isCompleted&&!isLive;
  const [pred,setPred]=useState({predicted_winner:myPred?.predicted_winner||"",predicted_batter:myPred?.predicted_batter||"",predicted_bowler:myPred?.predicted_bowler||"",predicted_potm:myPred?.predicted_potm||""});
  const [expanded,setExpanded]=useState(!myPred?.predicted_winner&&canPredict);
  const upd=(k,v)=>setPred(p=>({...p,[k]:v}));
  const matchPlayers=[...(SQUADS[match.team1]||[]),...(SQUADS[match.team2]||[])].sort();
  return <Card accent={isLive?"var(--ac)":isCompleted?"var(--green)":undefined}>
    {/* Match strip */}
    <div style={{display:"flex",borderRadius:10,overflow:"hidden",marginBottom:12}}>
      <div style={{flex:1,background:t1.bg,padding:"13px 8px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
        <span style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,color:t1.fg}}>{SHORT[match.team1]}</span>
        <span style={{fontSize:10,color:t1.fg+"bb",fontWeight:600,textAlign:"center",lineHeight:1.2}}>{match.team1.split(" ").slice(-2).join(" ")}</span>
      </div>
      <div style={{background:"var(--navy)",padding:"13px 10px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,minWidth:52}}>
        {isLive?<span className="live-dot" style={{fontSize:9,fontWeight:800,color:"#E8480C",textTransform:"uppercase",letterSpacing:"0.1em"}}>LIVE</span>:isCompleted?<span style={{fontSize:9,fontWeight:800,color:"#0A8F4F",textTransform:"uppercase"}}>DONE</span>:<span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.5)"}}>VS</span>}
        <span style={{fontFamily:"var(--fd)",fontSize:13,color:"#fff",fontWeight:700,marginTop:3}}>{fmtTime(match.match_date)}</span>
      </div>
      <div style={{flex:1,background:t2.bg,padding:"13px 8px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
        <span style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:22,color:t2.fg}}>{SHORT[match.team2]}</span>
        <span style={{fontSize:10,color:t2.fg+"bb",fontWeight:600,textAlign:"center",lineHeight:1.2}}>{match.team2.split(" ").slice(-2).join(" ")}</span>
      </div>
    </div>
    <p style={{fontSize:12,color:"var(--t3)",fontWeight:500,marginBottom:12,textAlign:"center"}}>📍 {match.venue} · {fmtDate(match.match_date)}</p>
    {/* Result */}
    {isCompleted&&match.actual_winner&&<div style={{background:"#E8F7EF",border:"1px solid #A8DFC0",borderRadius:"var(--r-sm)",padding:"10px 12px",marginBottom:12}}>
      <p style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Result</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[["🏆 Winner",match.actual_winner],["🏏 Top Batter",match.actual_top_batter],["🎳 Top Bowler",match.actual_top_bowler],["⭐ POTM",match.actual_potm]].filter(([,v])=>v).map(([k,v])=>(
          <div key={k}><p style={{fontSize:10,color:"var(--t3)",fontWeight:700}}>{k}</p><p style={{fontSize:13,fontWeight:700,color:"var(--t)",marginTop:2}}>{TEAMS.includes(v)?<TeamChip team={v}/>:v}</p></div>
        ))}
      </div>
    </div>}
    {/* My pick summary */}
    {myPred?.predicted_winner&&!expanded&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"10px 12px",marginBottom:10,border:"1px solid var(--bd)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>Your pick:</span><TeamChip team={pred.predicted_winner}/></div>
      {canPredict&&<button onClick={()=>setExpanded(true)} style={{fontSize:12,fontWeight:700,color:"var(--ac)",background:"none",border:"none",cursor:"pointer"}}>Edit</button>}
    </div>}
    {/* Prediction form */}
    {(canPredict&&expanded)&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div><label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:8}}>🏆 Match Winner</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[match.team1,match.team2].map(t=>{const c=TC[t];const sel=pred.predicted_winner===t;return <button key={t} onClick={()=>upd("predicted_winner",t)} style={{border:`2px solid ${sel?c.bg:"var(--bd)"}`,borderRadius:10,background:sel?`${c.bg}18`:"var(--sf2)",padding:"10px",cursor:"pointer",transition:"all .15s",boxShadow:sel?`0 0 0 1px ${c.bg}55,0 3px 10px ${c.bg}22`:"none"}}><div style={{width:36,height:36,borderRadius:9,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"}}><span style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:13,color:c.fg}}>{SHORT[t]}</span></div><span style={{fontSize:11,fontWeight:700,color:sel?c.bg:"var(--t2)",display:"block",textAlign:"center",lineHeight:1.2}}>{t.split(" ").slice(-2).join(" ")}</span></button>;})}
        </div>
      </div>
      <Sel label="🏏 Top Batter" value={pred.predicted_batter} onChange={v=>upd("predicted_batter",v)} options={matchPlayers}/>
      <Sel label="🎳 Top Bowler" value={pred.predicted_bowler} onChange={v=>upd("predicted_bowler",v)} options={matchPlayers}/>
      <Sel label="⭐ Player of the Match" value={pred.predicted_potm} onChange={v=>upd("predicted_potm",v)} options={matchPlayers}/>
      <Btn onClick={()=>{onSave(pred);setExpanded(false);}} disabled={saving||!pred.predicted_winner} variant="navy" style={{padding:"12px 0"}}>{saving?"Saving…":"Lock In Prediction 🔒"}</Btn>
    </div>}
  </Card>;
};

// ─── TOURNAMENT PICKS ───
const PicksScreen=({user})=>{
  const locked=isLocked(); const empty={winner:"",finalist2:"",top4:[],top_scorer:"",top_wicket_taker:"",max_sixes:"",max_fours:""};
  const [pred,setPred]=useState(empty); const [saved,setSaved]=useState(false); const [step,setStep]=useState(1);
  const [loading,setLoading]=useState(true); const [status,setStatus]=useState(null); const [confetti,setConfetti]=useState(false);
  useEffect(()=>{(async()=>{const rows=await sb(`predictions?user_id=eq.${user.id}&select=*`).catch(()=>[]);if(rows?.length){setPred(rows[0]);setSaved(true);}setLoading(false);})();},[user.id]);
  const upd=(k,v)=>setPred(p=>({...p,[k]:v}));
  const fields=[pred.winner,pred.finalist2,pred.top4.length===4,pred.top_scorer,pred.top_wicket_taker,pred.max_sixes,pred.max_fours];
  const done=fields.filter(Boolean).length; const complete=done===7;
  const save=async()=>{if(!complete)return;setStatus("saving");try{if(saved){await sb(`predictions?user_id=eq.${user.id}`,{method:"PATCH",body:{...pred,updated_at:new Date().toISOString()}});}else{await sb("predictions",{method:"POST",body:{...pred,user_id:user.id}});setConfetti(true);setTimeout(()=>setConfetti(false),3500);}setSaved(true);setStatus("saved");setTimeout(()=>setStatus(null),4000);}catch(e){setStatus("error:"+e.message);}};
  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>;
  return <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">
    <Confetti active={confetti}/>
    <div style={{marginBottom:18}}>
      <h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:26,color:"var(--t)"}}>🏆 Tournament Picks</h2>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap"}}>
        {locked?<Pill color="red">🔒 Locked</Pill>:<Pill color="orange">⏰ Locks 28 Mar · 3:30 PM IST</Pill>}
        {saved&&!locked&&<Pill color="green">✓ Saved</Pill>}
        <Pill color="gold">{MAX_PTS} pts up for grabs</Pill>
      </div>
    </div>
    {locked&&saved&&<div style={{display:"flex",alignItems:"center",gap:12,background:"#E8F7EF",border:"1px solid #A8DFC0",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:16}}><span style={{fontSize:24}}>🎉</span><div><p style={{fontWeight:700,fontSize:14,color:"var(--green)"}}>Your picks are locked in!</p><p style={{fontSize:13,color:"var(--t3)",marginTop:2,fontWeight:500}}>Check Rankings to track your score</p></div></div>}
    {!locked&&<div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Progress</span><span style={{fontSize:13,fontWeight:700,color:complete?"var(--green)":"var(--ac)"}}>{done}/7 complete</span></div>
      <div style={{height:6,background:"var(--bd)",borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",borderRadius:100,background:complete?"var(--green)":"var(--ac)",width:`${(done/7)*100}%`,transition:"width .4s ease"}}/></div>
    </div>}
    {!locked&&<div style={{display:"flex",gap:6,marginBottom:18,background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--r-sm)",padding:4}}>
      {[["1","🏆 Podium",pred.winner&&pred.finalist2],["2","🏅 Top 4",pred.top4.length===4],["3","🎖️ Players",pred.top_scorer&&pred.top_wicket_taker&&pred.max_sixes&&pred.max_fours]].map(([n,l,isDone])=>(
        <button key={n} onClick={()=>setStep(Number(n))} style={{flex:1,padding:"10px 4px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--fb)",fontWeight:700,fontSize:12,transition:"all .15s",textAlign:"center",background:step===Number(n)?"var(--navy)":"transparent",color:step===Number(n)?"#fff":isDone?"var(--green)":"var(--t3)"}}>
          <div style={{fontSize:14,marginBottom:2}}>{isDone?"✅":l.split(" ")[0]}</div>{l.split(" ").slice(1).join(" ")||n}
        </button>
      ))}
    </div>}
    {(step===1||locked)&&<Card style={{marginBottom:12}} accent="var(--ac)">
      <SecHead icon="🏆" title="Tournament Podium" sub="Who wins IPL 2026?"/>
      <div style={{marginBottom:18}}><label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:10}}>🥇 IPL Champion</label><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>{TEAMS.map(t=><TeamCard key={t} team={t} selected={pred.winner===t} onClick={()=>{upd("winner",t);if(pred.finalist2===t)upd("finalist2","");}} disabled={locked} small/>)}</div></div>
      {pred.winner&&<div><label style={{fontSize:12,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:10}}>🥈 Runner-Up</label><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>{TEAMS.filter(t=>t!==pred.winner).map(t=><TeamCard key={t} team={t} selected={pred.finalist2===t} onClick={()=>upd("finalist2",t)} disabled={locked} small/>)}</div></div>}
      {!locked&&<Btn onClick={()=>setStep(2)} disabled={!(pred.winner&&pred.finalist2)} variant="navy" style={{marginTop:16,padding:"13px 0"}}>Next: Top 4 →</Btn>}
    </Card>}
    {(step===2||locked)&&<Card style={{marginBottom:12}} accent="#C8860A">
      <SecHead icon="🏅" title="Top 4 Playoff Teams" sub="Pick any 4 — all 10 teams shown"/>
      <Top4Picker value={pred.top4} onChange={v=>upd("top4",v)} disabled={locked}/>
      {!locked&&<div style={{display:"flex",gap:8,marginTop:16}}><Btn onClick={()=>setStep(1)} variant="light" style={{flex:"0 0 auto",width:100,padding:"13px 0"}}>← Back</Btn><Btn onClick={()=>setStep(3)} disabled={pred.top4.length!==4} variant="navy" style={{flex:1,padding:"13px 0"}}>Next: Players →</Btn></div>}
    </Card>}
    {(step===3||locked)&&<Card style={{marginBottom:12}} accent="var(--green)">
      <SecHead icon="🎖️" title="Player Awards" sub="Search 220+ players across all 10 squads"/>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <PlayerPick label="🍊 Orange Cap — Top Run Scorer" value={pred.top_scorer} onChange={v=>upd("top_scorer",v)} disabled={locked}/>
        <PlayerPick label="💜 Purple Cap — Most Wickets" value={pred.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)} disabled={locked}/>
        <PlayerPick label="💥 Most Sixes" value={pred.max_sixes} onChange={v=>upd("max_sixes",v)} disabled={locked}/>
        <PlayerPick label="🏏 Most Fours" value={pred.max_fours} onChange={v=>upd("max_fours",v)} disabled={locked}/>
      </div>
      {!locked&&<Btn onClick={()=>setStep(2)} variant="light" style={{marginTop:12,padding:"11px 0",fontSize:13}}>← Back to Top 4</Btn>}
    </Card>}
    <Card style={{marginBottom:16,borderTop:"3px solid #C8860A"}}>
      <SecHead icon="💰" title="Points on Offer"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[["🏆 Champion","20"],["🥈 Runner-Up","10"],["Each Top-4","5"],["🍊 Orange Cap","15"],["💜 Purple Cap","15"],["💥 Sixes","10"],["🏏 Fours","10"]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"9px 12px",border:"1px solid var(--bd)"}}><span style={{fontSize:13,color:"var(--t2)",fontWeight:500}}>{k}</span><span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:17,color:"var(--gold)"}}>{v} pts</span></div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid var(--bd)",marginTop:10,paddingTop:10}}><span style={{fontWeight:700,color:"var(--t2)",fontSize:14}}>Max possible</span><span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:24,color:"var(--gold)"}}>{MAX_PTS} pts</span></div>
    </Card>
    {!locked&&<Btn onClick={save} disabled={!complete||status==="saving"} variant={complete?"green":"light"} style={{padding:"16px 0",fontSize:16}}>{status==="saving"?"Saving…":saved?"✅ Update My Picks":"🎯 Save My Picks"}</Btn>}
    {status==="saved"&&<div className="pop" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#E8F7EF",border:"1px solid #A8DFC0",borderRadius:"var(--r-sm)",padding:"13px 16px",marginTop:12,fontSize:14,fontWeight:700,color:"var(--green)"}}>🎉 Picks saved! Good luck!</div>}
    {status?.startsWith("error:")&&<div style={{background:"#FDECEA",border:"1px solid #F5B4B4",borderRadius:"var(--r-sm)",padding:"12px 16px",marginTop:12,fontSize:14,color:"var(--red)",fontWeight:600}}>❌ {status.replace("error:","")}</div>}
  </div>;
};

// ─── LEADERBOARD ───
const LeaderboardScreen=({user})=>{
  const [players,setPlayers]=useState([]); const [actuals,setActuals]=useState(null); const [loading,setLoading]=useState(true);
  const medals=["🥇","🥈","🥉"]; const medalColors=["#C8A800","#8A9099","#C26A2D"];
  useEffect(()=>{(async()=>{setLoading(true);try{const users=await sb("users?select=id,name,username").catch(()=>[]);const preds=await sb("predictions?select=*").catch(()=>[]);const acts=await sb("actuals?select=*").catch(()=>[]);const act=acts?.[0]||null;setActuals(act);const dp=await sb("daily_predictions?select=user_id,points_earned").catch(()=>[]);const dm={};(dp||[]).forEach(p=>{dm[p.user_id]=(dm[p.user_id]||0)+(p.points_earned||0);});const pm={};(preds||[]).forEach(p=>{pm[p.user_id]=p;});const ranked=(users||[]).map(u=>({...u,pred:pm[u.id]||null,tScore:pm[u.id]&&act?calcTScore(pm[u.id],act):null,dScore:dm[u.id]||0})).map(u=>({...u,total:(u.tScore||0)+u.dScore})).sort((a,b)=>b.total-a.total);setPlayers(ranked);}catch(e){console.error(e);}setLoading(false);})();},[]);
  const me=players.find(p=>p.id===user.id); const myRank=players.findIndex(p=>p.id===user.id)+1;
  return <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">
    <div style={{marginBottom:16}}><h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:26,color:"var(--t)"}}>📊 Rankings</h2><p style={{fontSize:13,color:"var(--t3)",marginTop:4,fontWeight:500}}>Tournament picks + daily match predictions combined</p></div>
    {me&&<Card style={{background:"var(--navy)",border:"none",marginBottom:14}} className="pop">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:34}}>{medals[myRank-1]||`#${myRank}`}</span><div><p style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:700,color:"#fff"}}>You're #{myRank} of {players.length}</p><div style={{display:"flex",gap:10,marginTop:4}}><span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>🏆 <b style={{color:"#F9CD1B"}}>{me.tScore??"-"}</b></span><span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>🏏 <b style={{color:"#E8480C"}}>{me.dScore}</b></span></div></div></div>
        <div style={{textAlign:"right"}}><p style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:36,color:"#F9CD1B",lineHeight:1}}>{me.total}</p><p style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>total pts</p></div>
      </div>
    </Card>}
    {!actuals&&<div style={{display:"flex",gap:12,alignItems:"center",background:"#FFF8E6",border:"1px solid #F0D090",borderRadius:"var(--r)",padding:"13px 16px",marginBottom:14}}><span style={{fontSize:20}}>⏳</span><div><p style={{fontWeight:700,fontSize:14,color:"var(--gold)"}}>Tournament scores pending</p><p style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>Admin updates after each milestone. Daily match points update live.</p></div></div>}
    {loading?<div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>:(
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {players.map((p,i)=>{const isMe=p.id===user.id;const mc=i<3?medalColors[i]:null;const pct=p.total?Math.round((p.total/(MAX_PTS+36))*100):0;
          return <div key={p.id} style={{background:isMe?"#FEF0EB":"var(--sf)",border:`1.5px solid ${isMe?"#F5C4B4":mc?`${mc}44`:"var(--bd)"}`,borderRadius:"var(--r)",padding:"13px 16px",boxShadow:mc?`0 2px 8px ${mc}18`:"var(--sh)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:34,textAlign:"center",flexShrink:0,fontSize:i<3?22:14,fontWeight:800,color:mc||"var(--t3)"}}>{i<3?medals[i]:`#${i+1}`}</div>
              <Avatar name={p.name}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:700,fontSize:15,color:isMe?"var(--ac)":"var(--t)"}}>{p.name}</span>{isMe&&<Pill color="orange">You</Pill>}{!p.pred&&<Pill color="red">No pick</Pill>}</div>
                {p.pred?.winner&&<div style={{marginTop:4}}><TeamChip team={p.pred.winner}/></div>}
                <div style={{marginTop:5,display:"flex",gap:8}}><span style={{fontSize:11,color:"var(--t3)"}}>🏆 <b style={{color:"var(--t2)"}}>{p.tScore??"-"}</b></span><span style={{fontSize:11,color:"var(--t3)"}}>🏏 <b style={{color:"var(--t2)"}}>{p.dScore}</b></span></div>
                {p.total>0&&<div style={{marginTop:6,height:4,background:"var(--bd)",borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",borderRadius:100,background:"linear-gradient(90deg,var(--ac),#FF7A33)",width:`${pct}%`,transition:"width 1s ease"}}/></div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}><p style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:26,color:isMe?"var(--ac)":mc||"var(--t)",lineHeight:1}}>{p.total||"—"}</p><p style={{fontSize:11,color:"var(--t3)"}}>pts</p></div>
            </div>
          </div>;
        })}
      </div>
    )}
    {actuals&&<Card style={{marginTop:14,borderTop:"3px solid var(--gold)"}}>
      <SecHead icon="📊" title="Tournament Results"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["🏆 Champion",actuals.winner],["🥈 Runner-Up",actuals.finalist2],["🍊 Orange Cap",actuals.top_scorer],["💜 Purple Cap",actuals.top_wicket_taker],["💥 Most Sixes",actuals.max_sixes],["🏏 Most Fours",actuals.max_fours]].filter(([,v])=>v).map(([k,v])=>(
          <div key={k} style={{background:"var(--sf2)",borderRadius:"var(--r-sm)",padding:"10px 12px",border:"1px solid var(--bd)"}}><p style={{fontSize:11,color:"var(--t3)",fontWeight:700}}>{k}</p><p style={{fontSize:14,fontWeight:700,color:"var(--t)",marginTop:3}}>{TEAMS.includes(v)?<TeamChip team={v}/>:v}</p></div>
        ))}
      </div>
    </Card>}
  </div>;
};

// ─── ADMIN RESULT CARD (separate component so hooks are valid) ───
const AdminResultCard=({match,onSave})=>{
  const [res,setRes]=useState({actual_winner:"",actual_top_batter:"",actual_top_bowler:"",actual_potm:""});
  const [sv,setSv]=useState(false);
  const mp=[...(SQUADS[match.team1]||[]),...(SQUADS[match.team2]||[])].sort();
  const save=async()=>{setSv(true);await onSave(res);setSv(false);};
  return <Card style={{marginBottom:12,borderTop:"3px solid var(--ac)"}}>
    <SecHead icon="⚡" title={`Result: ${SHORT[match.team1]||"?"} vs ${SHORT[match.team2]||"?"}`} sub={`${fmtDate(match.match_date)} · ${match.venue}`}/>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Sel label="Winner" value={res.actual_winner} onChange={v=>setRes(r=>({...r,actual_winner:v}))} options={[match.team1,match.team2].filter(Boolean)}/>
      <Sel label="Top Batter" value={res.actual_top_batter} onChange={v=>setRes(r=>({...r,actual_top_batter:v}))} options={mp}/>
      <Sel label="Top Bowler" value={res.actual_top_bowler} onChange={v=>setRes(r=>({...r,actual_top_bowler:v}))} options={mp}/>
      <Sel label="Player of the Match" value={res.actual_potm} onChange={v=>setRes(r=>({...r,actual_potm:v}))} options={mp}/>
      <Btn onClick={save} disabled={sv||!res.actual_winner} variant="primary" style={{padding:"12px 0"}}>{sv?"Saving…":"Save Result & Calculate Points"}</Btn>
    </div>
  </Card>;
};

// ─── ADMIN ───
const AdminScreen=()=>{
  const [unlocked,setUnlocked]=useState(false); const [pwd,setPwd]=useState("");
  const [act,setAct]=useState({winner:"",finalist2:"",top4:[],top_scorer:"",top_wicket_taker:"",max_sixes:"",max_fours:""});
  const [saved,setSaved]=useState(false); const [participants,setParticipants]=useState([]); const [loading,setLoading]=useState(false);
  const [matches,setMatches]=useState([]); const [newMatch,setNewMatch]=useState({team1:"",team2:"",venue:"",match_date:""});
  const [matchMsg,setMatchMsg]=useState("");
  const unlock=()=>{if(pwd===ADMIN_PWD)setUnlocked(true);else alert("Wrong password");};
  const upd=(k,v)=>setAct(a=>({...a,[k]:v}));
  const loadData=async()=>{setLoading(true);const rows=await sb("actuals?select=*").catch(()=>[]);if(rows?.[0])setAct(rows[0]);const preds=await sb("predictions?select=user_id").catch(()=>[]);const uids=(preds||[]).map(p=>p.user_id);if(uids.length){const users=await sb(`users?id=in.(${uids.join(",")})&select=id,name,username`);const pf=await sb("predictions?select=*").catch(()=>[]);const pm={};(pf||[]).forEach(p=>pm[p.user_id]=p);setParticipants((users||[]).map(u=>({...u,pred:pm[u.id]})));}const ms=await sb("daily_matches?select=*&order=match_date.asc").catch(()=>[]);setMatches(ms||[]);setLoading(false);};
  useEffect(()=>{if(unlocked)loadData();},[unlocked]);
  const saveResults=async()=>{const rows=await sb("actuals?select=id").catch(()=>[]);if(rows?.length)await sb(`actuals?id=eq.${rows[0].id}`,{method:"PATCH",body:act});else await sb("actuals",{method:"POST",body:act});setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const addMatch=async()=>{if(!newMatch.team1||!newMatch.team2||!newMatch.match_date||!newMatch.venue)return;await sb("daily_matches",{method:"POST",body:{...newMatch}});setNewMatch({team1:"",team2:"",venue:"",match_date:""});setMatchMsg("✅ Match added!");setTimeout(()=>setMatchMsg(""),2000);await loadData();};
  const saveResult=async(matchId,data)=>{await sb(`daily_matches?id=eq.${matchId}`,{method:"PATCH",body:{...data,status:"completed"}});const preds=await sb(`daily_predictions?match_id=eq.${matchId}&select=*`).catch(()=>[]);await Promise.all((preds||[]).map(p=>{const pts=(p.predicted_winner===data.actual_winner?DPOINTS.winner:0)+(p.predicted_batter===data.actual_top_batter?DPOINTS.top_batter:0)+(p.predicted_bowler===data.actual_top_bowler?DPOINTS.top_bowler:0)+(p.predicted_potm===data.actual_potm?DPOINTS.potm:0);return sb(`daily_predictions?id=eq.${p.id}`,{method:"PATCH",body:{points_earned:pts}});}));setMatchMsg("✅ Result saved & points calculated!");setTimeout(()=>setMatchMsg(""),3000);await loadData();};
  if(!unlocked) return <div style={{maxWidth:380,margin:"0 auto",padding:"60px 16px",textAlign:"center"}} className="fu"><div style={{fontSize:52,marginBottom:14}}>🔐</div><h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:28,marginBottom:6}}>Admin Panel</h2><p style={{color:"var(--t3)",fontSize:14,marginBottom:24,fontWeight:500}}>Manage matches & enter results</p><Card><div style={{display:"flex",flexDirection:"column",gap:12}}><Inp label="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&unlock()}/><Btn onClick={unlock} variant="navy" style={{padding:"14px 0"}}>Unlock →</Btn></div></Card></div>;
  if(loading) return <div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Loading…</div>;
  return <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}} className="fu">
    <div style={{marginBottom:20}}><h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:26,color:"var(--t)"}}>Admin Panel ⚙️</h2><p style={{fontSize:14,color:"var(--t3)",marginTop:3,fontWeight:500}}>Manage matches & enter results</p></div>
    {/* Add match */}
    <Card style={{marginBottom:12,borderTop:"3px solid var(--navy)"}}>
      <SecHead icon="📅" title="Add a Match"/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Sel label="Team 1" value={newMatch.team1} onChange={v=>setNewMatch(m=>({...m,team1:v}))} options={TEAMS}/>
        <Sel label="Team 2" value={newMatch.team2} onChange={v=>setNewMatch(m=>({...m,team2:v}))} options={TEAMS.filter(t=>t!==newMatch.team1)}/>
        <Inp label="Venue" value={newMatch.venue} onChange={e=>setNewMatch(m=>({...m,venue:e.target.value}))} placeholder="e.g. Wankhede Stadium"/>
        <Inp label="Date & Time" type="datetime-local" value={newMatch.match_date} onChange={e=>setNewMatch(m=>({...m,match_date:e.target.value}))}/>
        <Btn onClick={addMatch} disabled={!newMatch.team1||!newMatch.team2||!newMatch.match_date||!newMatch.venue} variant="navy" style={{padding:"12px 0"}}>Add Match</Btn>
        {matchMsg&&<p style={{fontSize:13,fontWeight:700,color:matchMsg.startsWith("✅")?"var(--green)":"var(--red)",textAlign:"center"}}>{matchMsg}</p>}
      </div>
    </Card>
    {/* Pending results */}
    {matches.filter(m=>m.status!=="completed").map(m=>(
      <AdminResultCard key={m.id} match={m} onSave={d=>saveResult(m.id,d)}/>
    ))}
    {/* Tournament results */}
    <Card style={{marginBottom:12,borderTop:"3px solid var(--gold)"}}><SecHead icon="🏆" title="Tournament Results"/><div style={{display:"flex",flexDirection:"column",gap:14}}><Sel label="Champion" value={act.winner} onChange={v=>upd("winner",v)} options={TEAMS}/><Sel label="Runner-Up" value={act.finalist2} onChange={v=>upd("finalist2",v)} options={TEAMS.filter(t=>t!==act.winner)}/><Top4Picker value={act.top4||[]} onChange={v=>upd("top4",v)} disabled={false}/></div></Card>
    <Card style={{marginBottom:12,borderTop:"3px solid var(--green)"}}><SecHead icon="🎖️" title="Player Awards"/><div style={{display:"flex",flexDirection:"column",gap:14}}><PlayerPick label="Orange Cap" value={act.top_scorer} onChange={v=>upd("top_scorer",v)}/><PlayerPick label="Purple Cap" value={act.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)}/><PlayerPick label="Most Sixes" value={act.max_sixes} onChange={v=>upd("max_sixes",v)}/><PlayerPick label="Most Fours" value={act.max_fours} onChange={v=>upd("max_fours",v)}/></div></Card>
    <Btn onClick={saveResults} variant="navy" style={{padding:"15px 0",fontSize:15,marginBottom:14}}>{saved?"✅ Saved!":"Save Tournament Results"}</Btn>
    <Card><SecHead icon="👥" title={`All Participants (${participants.length})`}/>{participants.length===0&&<p style={{color:"var(--t3)",fontSize:14,textAlign:"center",padding:"12px 0"}}>No predictions yet</p>}{participants.map((p,i)=><div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<participants.length-1?"1px solid var(--bd)":"none"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={p.name} size={34}/><div><p style={{fontWeight:700,fontSize:15,color:"var(--t)"}}>{p.name}</p><p style={{fontSize:12,color:"var(--t3)",fontWeight:500}}>@{p.username}</p></div></div>{p.pred?.winner?<TeamChip team={p.pred.winner}/>:<Pill color="red">No pick</Pill>}</div>)}</Card>
  </div>;
};

// ─── ROOT APP ───
export default function App() {
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("ipl_user"));}catch{return null;}});
  const [tab,setTab]=useState("today");
  const isAdminRoute=typeof window!=="undefined"&&window.location.pathname.startsWith("/admin");
  const login=u=>{localStorage.setItem("ipl_user",JSON.stringify(u));setUser(u);};
  const logout=()=>{localStorage.removeItem("ipl_user");setUser(null);};
  if(!user) return <><GS/><AuthScreen onLogin={login}/></>;
  const navItems=[{id:"today",icon:"🏏",label:"Today"},{id:"picks",icon:"🎯",label:"My Picks"},{id:"board",icon:"📊",label:"Rankings"},...(isAdminRoute?[{id:"admin",icon:"⚙️",label:"Admin"}]:[])];
  return <>
    <GS/>
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#E8480C,#F9CD1B,#C8102E,#3A225D,#004BA0,#F7500E,#EA1A85)",zIndex:100}}/>
      <header style={{position:"sticky",top:3,zIndex:50,background:"var(--navy)",boxShadow:"0 2px 12px rgba(0,0,0,.15)"}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:"0 3px 10px rgba(232,72,12,.4)"}}>🏏</div>
            <div><span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:16,color:"#fff",letterSpacing:"0.04em"}}>IPL PREDICTION</span><span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:10,color:"#F9CD1B",letterSpacing:"0.08em",display:"block",lineHeight:1,marginTop:1}}>CHAMPIONSHIP 2026</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={user.name} size={28}/><span style={{fontSize:13,color:"rgba(255,255,255,.7)",fontWeight:600,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name.split(" ")[0]}</span><button onClick={logout} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",cursor:"pointer"}}>Out</button></div>
        </div>
        <TeamTicker/>
      </header>
      <main style={{paddingBottom:88}}>
        {tab==="today"&&<TodayScreen user={user}/>}
        {tab==="picks"&&<PicksScreen user={user}/>}
        {tab==="board"&&<LeaderboardScreen user={user}/>}
        {(tab==="admin"||isAdminRoute)&&<AdminScreen/>}
      </main>
      <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"#fff",borderTop:"1px solid var(--bd)",boxShadow:"0 -2px 16px rgba(0,0,0,.08)"}}>
        <div style={{maxWidth:520,margin:"0 auto",display:"flex"}}>
          {navItems.map(t=>{const active=tab===t.id;return <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 0 9px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",transition:"all .15s",borderTop:`3px solid ${active?"var(--ac)":"transparent"}`,marginTop:-1}}><span style={{fontSize:21,lineHeight:1}}>{t.icon}</span><span style={{fontSize:10,fontFamily:"var(--fb)",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",color:active?"var(--ac)":"var(--t3)"}}>{t.label}</span></button>;})}
        </div>
      </nav>
    </div>
  </>;
}
