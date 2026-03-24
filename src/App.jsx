import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// SUPABASE CONFIG  ← replace before deploying
// ─────────────────────────────────────────────
const SB_URL  = "YOUR_SUPABASE_URL";
const SB_KEY  = "YOUR_SUPABASE_ANON_KEY";
const ADMIN_PWD = "ipl2026admin"; // change this!

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
  "Chennai Super Kings":     { bg:"#F9CD1B", fg:"#1a1a2e" },
  "Mumbai Indians":          { bg:"#004BA0", fg:"#ffffff" },
  "Royal Challengers Bengaluru":{ bg:"#C8102E", fg:"#ffffff" },
  "Kolkata Knight Riders":   { bg:"#3A225D", fg:"#F0C040" },
  "Sunrisers Hyderabad":     { bg:"#F7500E", fg:"#ffffff" },
  "Delhi Capitals":          { bg:"#17479E", fg:"#EF3340" },
  "Lucknow Super Giants":    { bg:"#A72B2A", fg:"#FBBF24" },
  "Rajasthan Royals":        { bg:"#EA1A85", fg:"#ffffff" },
  "Gujarat Titans":          { bg:"#1C2B4A", fg:"#8AC0DE" },
  "Punjab Kings":            { bg:"#ED1B24", fg:"#ffffff" },
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
const LOCK_DATE = new Date("2026-03-28T10:00:00Z"); // 3:30pm IST
const isLocked = () => new Date() >= LOCK_DATE;

const POINTS = { winner:20, finalist2:10, top4_each:5, top_scorer:15, top_wicket_taker:15, max_sixes:10, max_fours:10 };
const MAX_PTS = 20+10+(5*4)+15+15+10+10; // 95

// ─────────────────────────────────────────────
// SUPABASE MINI-CLIENT
// ─────────────────────────────────────────────
const sb = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
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
// SCORE CALCULATOR
// ─────────────────────────────────────────────
const calcScore = (pred, act) => {
  if (!act || !pred) return null;
  let s = 0;
  if (pred.winner === act.winner) s += POINTS.winner;
  if (pred.finalist2 && (pred.finalist2 === act.finalist2 || pred.finalist2 === act.winner)) s += POINTS.finalist2;
  (pred.top4 || []).forEach(t => { if ((act.top4||[]).includes(t)) s += POINTS.top4_each; });
  if (pred.top_scorer === act.top_scorer) s += POINTS.top_scorer;
  if (pred.top_wicket_taker === act.top_wicket_taker) s += POINTS.top_wicket_taker;
  if (pred.max_sixes === act.max_sixes) s += POINTS.max_sixes;
  if (pred.max_fours === act.max_fours) s += POINTS.max_fours;
  return s;
};

// ─────────────────────────────────────────────
// GENERATE LEAGUE CODE
// ─────────────────────────────────────────────
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

// ─────────────────────────────────────────────
// TINY UI PRIMITIVES
// ─────────────────────────────────────────────
const Input = ({ label, ...p }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400">{label}</label>}
    <input {...p} className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all" />
  </div>
);

const Btn = ({ children, variant="primary", className="", ...p }) => {
  const base = "font-black text-xs uppercase tracking-[0.12em] rounded-xl px-5 py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const v = {
    primary: "bg-amber-500 hover:bg-amber-400 text-black",
    ghost:   "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    danger:  "bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-800/40",
  };
  return <button className={`${base} ${v[variant]} ${className}`} {...p}>{children}</button>;
};

const Sel = ({ label, value, onChange, options, placeholder, disabled }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400">{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
      className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 disabled:opacity-40">
      <option value="">{placeholder||"— select —"}</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Chip = ({ team, size="sm" }) => {
  const c = TC[team]||{bg:"#334155",fg:"#fff"};
  return (
    <span className={`inline-block font-black rounded-full ${size==="lg"?"px-4 py-1.5 text-sm":"px-2.5 py-0.5 text-xs"}`}
      style={{background:c.bg,color:c.fg}}>
      {size==="lg" ? team : SHORT[team]||team}
    </span>
  );
};

const Card = ({ children, className="" }) => (
  <div className={`bg-white/[0.03] border border-white/8 rounded-2xl p-5 ${className}`}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400/80 mb-3">{children}</p>
);

// Top-4 multi-picker
const Top4Picker = ({ value, onChange, excluded, disabled }) => {
  const toggle = t => {
    if (value.includes(t)) onChange(value.filter(x=>x!==t));
    else if (value.length<4) onChange([...value,t]);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400">
        Top 4 Playoff Teams <span className="text-white/30 normal-case">({value.length}/4 picked)</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {TEAMS.filter(t=>!excluded.includes(t)).map(t=>{
          const on = value.includes(t);
          const full = !on && value.length>=4;
          return (
            <button key={t} type="button" disabled={disabled||full} onClick={()=>toggle(t)}
              className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                on  ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                    : "border-white/8 bg-white/3 text-white/50 hover:text-white hover:border-white/20"
              } disabled:opacity-30`}>
              <span className="text-white/40 mr-1">{SHORT[t]}</span> {t.split(" ").slice(-1)[0]}
              {on && <span className="float-right text-amber-500">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SCREEN: AUTH
// ─────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({username:"",password:"",name:""});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      if (mode==="signup") {
        if (!form.name.trim()||!form.username.trim()||!form.password.trim()) throw new Error("Fill all fields");
        // check unique
        const exists = await sb(`users?username=eq.${form.username.toLowerCase()}&select=id`);
        if (exists?.length) throw new Error("Username taken — try another");
        const [user] = await sb("users", { method:"POST", body:{ username:form.username.toLowerCase().trim(), password:form.password, name:form.name.trim() }});
        onLogin(user);
      } else {
        const rows = await sb(`users?username=eq.${form.username.toLowerCase()}&password=eq.${form.password}&select=*`);
        if (!rows?.length) throw new Error("Wrong username or password");
        onLogin(rows[0]);
      }
    } catch(e){ setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{background:"radial-gradient(ellipse 80% 60% at 50% -10%, #92400e33, transparent), radial-gradient(ellipse 60% 80% at 80% 110%, #1e3a5f44, transparent), #030712"}}>

      {/* ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-[100px]" style={{background:"radial-gradient(#F59E0B,transparent)"}}/>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[120px]" style={{background:"radial-gradient(#3B82F6,transparent)"}}/>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 relative"
            style={{background:"linear-gradient(135deg,#92400e,#F59E0B22)",border:"1px solid #F59E0B33"}}>
            <span className="text-4xl">🏏</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-none" style={{fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif",letterSpacing:"-0.02em"}}>
            IPL Prediction
          </h1>
          <h2 className="text-xl font-black leading-none mt-0.5" style={{fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif",color:"#F59E0B"}}>
            League 2026
          </h2>
          <p className="text-white/30 text-xs mt-3 tracking-widest uppercase">Predict · Compete · Dominate</p>
        </div>

        {/* Tab */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-5 border border-white/8">
          {[["login","Sign In"],["signup","Join League"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                mode===m ? "bg-amber-500 text-black shadow-lg" : "text-white/40 hover:text-white"
              }`}>{l}</button>
          ))}
        </div>

        <Card className="space-y-4">
          {mode==="signup" && <Input label="Display Name" value={form.name} onChange={set("name")} placeholder="e.g. Swapnil" />}
          <Input label="Username" value={form.username} onChange={set("username")} placeholder="your_username" autoCapitalize="none" />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••"
            onKeyDown={e=>e.key==="Enter"&&submit()} />
          {err && <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-2.5">{err}</p>}
          <Btn onClick={submit} disabled={busy} className="w-full py-3.5">
            {busy?"…":mode==="login"?"Sign In →":"Create Account →"}
          </Btn>
        </Card>

        <p className="text-center text-white/20 text-xs mt-5">🔒 Predictions lock 28 Mar · 3:30 PM IST</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SCREEN: LEAGUES HUB
// ─────────────────────────────────────────────
const LeaguesScreen = ({ user, onEnterLeague }) => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("my"); // my | create | join

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // leagues this user is a member of
      const memberships = await sb(`league_members?user_id=eq.${user.id}&select=league_id`);
      const ids = (memberships||[]).map(m=>m.league_id);
      if (!ids.length) { setLeagues([]); setLoading(false); return; }
      const rows = await sb(`leagues?id=in.(${ids.join(",")})&select=*&order=created_at.asc`);
      // get member counts
      const counts = await Promise.all((rows||[]).map(l=>sb(`league_members?league_id=eq.${l.id}&select=user_id`)));
      setLeagues((rows||[]).map((l,i)=>({...l,member_count:counts[i]?.length||0})));
    } catch(e){ setErr(e.message); }
    setLoading(false);
  },[user.id]);

  useEffect(()=>{ load(); },[load]);

  const createLeague = async () => {
    if (!createName.trim()) return;
    setBusy(true); setErr("");
    try {
      const code = genCode();
      const [league] = await sb("leagues",{method:"POST",body:{name:createName.trim(),code,created_by:user.id}});
      await sb("league_members",{method:"POST",body:{league_id:league.id,user_id:user.id}});
      setCreateName(""); setTab("my"); load();
    } catch(e){ setErr(e.message); }
    setBusy(false);
  };

  const joinLeague = async () => {
    if (!joinCode.trim()) return;
    setBusy(true); setErr("");
    try {
      const rows = await sb(`leagues?code=eq.${joinCode.trim().toUpperCase()}&select=*`);
      if (!rows?.length) throw new Error("League not found — check the code");
      const league = rows[0];
      const already = await sb(`league_members?league_id=eq.${league.id}&user_id=eq.${user.id}&select=id`);
      if (already?.length) throw new Error("You're already in this league");
      await sb("league_members",{method:"POST",body:{league_id:league.id,user_id:user.id}});
      setJoinCode(""); setTab("my"); load();
    } catch(e){ setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-white" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>My Leagues</h2>
          <p className="text-white/30 text-xs mt-0.5">Hi {user.name} 👋</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-5">
        {[["my","🏟️ My Leagues"],["create","✨ Create"],["join","🔗 Join"]].map(([t,l])=>(
          <button key={t} onClick={()=>{setTab(t);setErr("");}}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              tab===t?"bg-amber-500 text-black":"bg-white/5 text-white/50 hover:text-white border border-white/8"
            }`}>{l}</button>
        ))}
      </div>

      {err && <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-2.5 mb-4">{err}</p>}

      {/* MY LEAGUES */}
      {tab==="my" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-white/20 text-sm">Loading…</div>
          ) : leagues.length===0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏏</p>
              <p className="text-white/30 text-sm">No leagues yet.</p>
              <p className="text-white/20 text-xs mt-1">Create one or join a friend's league.</p>
            </div>
          ) : leagues.map(l=>(
            <button key={l.id} onClick={()=>onEnterLeague(l)}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-amber-500/30 rounded-2xl px-5 py-4 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-black text-sm group-hover:text-amber-300 transition-colors">{l.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{l.member_count} member{l.member_count!==1?"s":""}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-500/60 font-black text-xs tracking-widest font-mono">{l.code}</p>
                  {l.created_by===user.id && <p className="text-white/20 text-[10px] mt-0.5">Admin</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CREATE */}
      {tab==="create" && (
        <Card className="space-y-4">
          <SectionLabel>Create a New League</SectionLabel>
          <Input label="League Name" value={createName} onChange={e=>setCreateName(e.target.value)}
            placeholder="e.g. Family IPL 2026" onKeyDown={e=>e.key==="Enter"&&createLeague()} />
          <p className="text-white/30 text-xs">A unique 6-digit code will be generated. Share it with friends to let them join.</p>
          <Btn onClick={createLeague} disabled={busy||!createName.trim()} className="w-full">
            {busy?"Creating…":"Create League →"}
          </Btn>
        </Card>
      )}

      {/* JOIN */}
      {tab==="join" && (
        <Card className="space-y-4">
          <SectionLabel>Join a League</SectionLabel>
          <Input label="League Code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. RCB007" maxLength={6} style={{letterSpacing:"0.2em",fontFamily:"monospace"}}
            onKeyDown={e=>e.key==="Enter"&&joinLeague()} />
          <p className="text-white/30 text-xs">Ask your league admin for their 6-digit code.</p>
          <Btn onClick={joinLeague} disabled={busy||joinCode.length<4} className="w-full">
            {busy?"Joining…":"Join League →"}
          </Btn>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SCREEN: LEAGUE DETAIL (leaderboard)
// ─────────────────────────────────────────────
const LeagueScreen = ({ league, user, onBack }) => {
  const [members, setMembers] = useState([]);
  const [actuals, setActuals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        // members
        const mems = await sb(`league_members?league_id=eq.${league.id}&select=user_id`);
        const uids = mems.map(m=>m.user_id);
        const users = await sb(`users?id=in.(${uids.join(",")})&select=id,username,name`);
        // predictions
        const preds = uids.length ? await sb(`predictions?user_id=in.(${uids.join(",")})&select=*`) : [];
        // actuals
        const acts = await sb(`actuals?select=*`);
        const act = acts?.[0]||null;
        setActuals(act);

        const predMap = {};
        (preds||[]).forEach(p=>{ predMap[p.user_id]=p; });

        const ranked = (users||[]).map(u=>({
          ...u,
          pred: predMap[u.id]||null,
          score: predMap[u.id]&&act ? calcScore(predMap[u.id],act) : null,
          hasPred: !!predMap[u.id],
        })).sort((a,b)=>{
          if (a.score===null && b.score===null) return 0;
          if (a.score===null) return 1;
          if (b.score===null) return -1;
          return b.score-a.score;
        });
        setMembers(ranked);
      } catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[league.id]);

  const copyCode = () => {
    navigator.clipboard.writeText(league.code).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  const medals = ["🥇","🥈","🥉"];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onBack} className="text-white/30 hover:text-white transition-colors text-xl leading-none">←</button>
        <h2 className="text-xl font-black text-white" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>{league.name}</h2>
      </div>

      {/* League code pill */}
      <div className="flex items-center gap-3 mb-6 ml-8">
        <button onClick={copyCode}
          className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 rounded-full px-4 py-1.5 transition-all">
          <span className="text-amber-400 font-black text-xs tracking-[0.2em] font-mono">{league.code}</span>
          <span className="text-amber-500/60 text-xs">{copied?"✓ Copied!":"tap to copy"}</span>
        </button>
        <span className="text-white/20 text-xs">{members.length} member{members.length!==1?"s":""}</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/20">Loading…</div>
      ) : (
        <>
          {/* Scoring info banner if no actuals yet */}
          {!actuals && (
            <div className="bg-amber-900/15 border border-amber-800/30 rounded-2xl px-5 py-3.5 mb-5 flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="text-amber-400 text-xs font-black">Tournament not started</p>
                <p className="text-white/30 text-[11px] mt-0.5">Scores will appear once results are entered</p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="space-y-2.5">
            {members.map((m,i)=>{
              const isMe = m.id===user.id;
              const pct = m.score!==null ? Math.round((m.score/MAX_PTS)*100) : 0;
              return (
                <div key={m.id}
                  className={`rounded-2xl px-5 py-4 border transition-all ${isMe?"bg-amber-500/8 border-amber-500/30":"bg-white/[0.02] border-white/6"}`}>
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {actuals ? (
                        <span className="text-xl">{medals[i]||<span className="text-white/30 text-sm font-black">#{i+1}</span>}</span>
                      ) : (
                        <span className="text-white/20 text-sm font-black">#{i+1}</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-black text-sm ${isMe?"text-amber-300":"text-white"}`}>{m.name}</p>
                        {isMe && <span className="text-[9px] text-amber-500/60 uppercase tracking-wider font-bold">you</span>}
                        {!m.hasPred && <span className="text-[9px] text-red-400/60 uppercase tracking-wider font-bold">no prediction</span>}
                      </div>
                      {m.pred?.winner && (
                        <div className="mt-1"><Chip team={m.pred.winner}/></div>
                      )}
                      {/* Score bar */}
                      {actuals && m.score!==null && (
                        <div className="mt-2">
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{width:`${pct}%`,background:`linear-gradient(90deg,#F59E0B,#FCD34D)`}}/>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      {actuals && m.score!==null ? (
                        <>
                          <p className={`text-2xl font-black ${isMe?"text-amber-400":"text-white"}`}>{m.score}</p>
                          <p className="text-white/20 text-[10px]">/ {MAX_PTS}</p>
                        </>
                      ) : (
                        <p className="text-white/15 text-xs">—</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actuals recap */}
          {actuals && (
            <div className="mt-6">
              <Card>
                <SectionLabel>📊 Tournament Results So Far</SectionLabel>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {[
                    ["🏆 Champion",actuals.winner],
                    ["🥈 Runner-Up",actuals.finalist2],
                    ["🍊 Orange Cap",actuals.top_scorer],
                    ["💜 Purple Cap",actuals.top_wicket_taker],
                    ["💥 Most Sixes",actuals.max_sixes],
                    ["🏏 Most Fours",actuals.max_fours],
                  ].filter(([,v])=>v).map(([k,v])=>(
                    <div key={k} className="flex flex-col">
                      <span className="text-white/25">{k}</span>
                      <span className="text-white font-bold truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SCREEN: PREDICTIONS
// ─────────────────────────────────────────────
const PredictScreen = ({ user }) => {
  const locked = isLocked();
  const empty = {winner:"",finalist2:"",top4:[],top_scorer:"",top_wicket_taker:"",max_sixes:"",max_fours:""};
  const [pred, setPred] = useState(empty);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      const rows = await sb(`predictions?user_id=eq.${user.id}&select=*`);
      if (rows?.length) { setPred(rows[0]); setSaved(true); }
      setLoading(false);
    })();
  },[user.id]);

  const upd = (k,v) => setPred(p=>({...p,[k]:v}));
  const complete = pred.winner&&pred.finalist2&&pred.top4.length===4&&pred.top_scorer&&pred.top_wicket_taker&&pred.max_sixes&&pred.max_fours;

  const save = async () => {
    if (!complete) { setMsg("⚠️ Complete all fields first"); return; }
    try {
      if (saved) {
        await sb(`predictions?user_id=eq.${user.id}`,{method:"PATCH",body:{...pred,updated_at:new Date().toISOString()}});
      } else {
        await sb("predictions",{method:"POST",body:{...pred,user_id:user.id}});
      }
      setSaved(true);
      setMsg("✅ Predictions saved!");
      setTimeout(()=>setMsg(""),3000);
    } catch(e){ setMsg("❌ "+e.message); }
  };

  const excl2 = [pred.winner].filter(Boolean);
  const exclTop4 = [pred.winner,pred.finalist2].filter(Boolean);

  if (loading) return <div className="text-center py-16 text-white/20">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-white" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>My Predictions</h2>
        <p className="text-white/30 text-xs mt-1">
          {locked ? "🔒 Locked — IPL has started!" : "⏰ Locks 28 Mar · 3:30 PM IST"}
        </p>
      </div>

      {locked&&saved && (
        <div className="bg-green-900/20 border border-green-800/40 rounded-2xl px-5 py-3.5">
          <p className="text-green-400 text-xs font-black">🔒 Your predictions are locked in. Good luck!</p>
        </div>
      )}

      {/* Podium */}
      <Card className="space-y-5">
        <SectionLabel>🏆 Tournament Podium</SectionLabel>
        <Sel label="IPL 2026 Champion" value={pred.winner} onChange={v=>upd("winner",v)} options={TEAMS} disabled={locked}/>
        <Sel label="Runner-Up (Finalist 2)" value={pred.finalist2} onChange={v=>upd("finalist2",v)}
          options={TEAMS.filter(t=>t!==pred.winner)} disabled={locked}/>
        <Top4Picker value={pred.top4} onChange={v=>upd("top4",v)} excluded={exclTop4} disabled={locked}/>
        <p className="text-white/20 text-xs">Pick the 4 semi-finalists (winner & runner-up already counted above)</p>
      </Card>

      {/* Player awards */}
      <Card className="space-y-5">
        <SectionLabel>🎖️ Player Awards</SectionLabel>
        <Sel label="🍊 Orange Cap — Top Run Scorer" value={pred.top_scorer} onChange={v=>upd("top_scorer",v)} options={ALL_PLAYERS} disabled={locked}/>
        <Sel label="💜 Purple Cap — Most Wickets" value={pred.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)} options={ALL_PLAYERS} disabled={locked}/>
        <Sel label="💥 Most Sixes" value={pred.max_sixes} onChange={v=>upd("max_sixes",v)} options={ALL_PLAYERS} disabled={locked}/>
        <Sel label="🏏 Most Fours" value={pred.max_fours} onChange={v=>upd("max_fours",v)} options={ALL_PLAYERS} disabled={locked}/>
      </Card>

      {/* Points table */}
      <Card>
        <SectionLabel>Points on Offer</SectionLabel>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          {[["Champion","20"],["Runner-Up","10"],["Each Top-4 Team","5"],["Top Scorer","15"],["Top Wickets","15"],["Max Sixes","10"],["Max Fours","10"]].map(([k,v])=>(
            <div key={k} className="flex justify-between pr-4">
              <span className="text-white/30">{k}</span><span className="text-amber-400 font-black">{v} pts</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/8 flex justify-between text-sm">
          <span className="text-white/40 font-bold">Maximum possible</span>
          <span className="text-amber-400 font-black">{MAX_PTS} pts</span>
        </div>
      </Card>

      {!locked && (
        <Btn onClick={save} disabled={!complete} className="w-full py-4">
          {saved ? "✅ Update Predictions" : "Save Predictions →"}
        </Btn>
      )}
      {msg && <p className="text-center text-xs font-bold text-amber-400">{msg}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────
// SCREEN: ADMIN
// ─────────────────────────────────────────────
const AdminScreen = ({ user }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [act, setAct] = useState({winner:"",finalist2:"",top4:[],top_scorer:"",top_wicket_taker:"",max_sixes:"",max_fours:""});
  const [saved, setSaved] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const unlock = () => { if (pwd===ADMIN_PWD) setUnlocked(true); else alert("Wrong password"); };

  useEffect(()=>{
    if (!unlocked) return;
    (async()=>{
      setLoading(true);
      const rows = await sb("actuals?select=*");
      if (rows?.[0]) setAct(rows[0]);
      const preds = await sb("predictions?select=user_id");
      const uids = (preds||[]).map(p=>p.user_id);
      if (uids.length) {
        const users = await sb(`users?id=in.(${uids.join(",")})&select=id,name,username`);
        const predsFull = await sb(`predictions?select=*`);
        const pm = {}; (predsFull||[]).forEach(p=>pm[p.user_id]=p);
        setParticipants((users||[]).map(u=>({...u,pred:pm[u.id]})));
      }
      setLoading(false);
    })();
  },[unlocked]);

  const save = async () => {
    const rows = await sb("actuals?select=id");
    if (rows?.length) {
      await sb(`actuals?id=eq.${rows[0].id}`,{method:"PATCH",body:act});
    } else {
      await sb("actuals",{method:"POST",body:act});
    }
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  const upd = (k,v)=>setAct(a=>({...a,[k]:v}));

  if (!unlocked) return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🔐</div>
      <h2 className="text-xl font-black text-white mb-5">Admin Panel</h2>
      <Input label="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)}
        placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&unlock()} />
      <Btn onClick={unlock} className="w-full mt-4">Unlock →</Btn>
    </div>
  );

  if (loading) return <div className="text-center py-16 text-white/20">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-white" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>Admin Panel</h2>
        <p className="text-white/30 text-xs mt-1">Enter results — scores update instantly across all leagues</p>
      </div>

      <Card className="space-y-5">
        <SectionLabel>🏆 Tournament Results</SectionLabel>
        <Sel label="IPL 2026 Champion" value={act.winner} onChange={v=>upd("winner",v)} options={TEAMS}/>
        <Sel label="Runner-Up" value={act.finalist2} onChange={v=>upd("finalist2",v)} options={TEAMS.filter(t=>t!==act.winner)}/>
        <Top4Picker value={act.top4||[]} onChange={v=>upd("top4",v)} excluded={[act.winner,act.finalist2].filter(Boolean)} disabled={false}/>
      </Card>

      <Card className="space-y-5">
        <SectionLabel>🎖️ Player Awards</SectionLabel>
        <Sel label="Orange Cap" value={act.top_scorer} onChange={v=>upd("top_scorer",v)} options={ALL_PLAYERS}/>
        <Sel label="Purple Cap" value={act.top_wicket_taker} onChange={v=>upd("top_wicket_taker",v)} options={ALL_PLAYERS}/>
        <Sel label="Most Sixes" value={act.max_sixes} onChange={v=>upd("max_sixes",v)} options={ALL_PLAYERS}/>
        <Sel label="Most Fours" value={act.max_fours} onChange={v=>upd("max_fours",v)} options={ALL_PLAYERS}/>
      </Card>

      <Btn onClick={save} className="w-full py-4">{saved?"✅ Saved!":"Save Results"}</Btn>

      {/* Participants list */}
      <Card>
        <SectionLabel>All Participants ({participants.length})</SectionLabel>
        <div className="space-y-2">
          {participants.map(p=>(
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <span className="text-white text-sm font-bold">{p.name}</span>
                <span className="text-white/30 text-xs ml-2">@{p.username}</span>
              </div>
              {p.pred?.winner ? <Chip team={p.pred.winner}/> : <span className="text-red-400/50 text-xs">No prediction</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("ipl_user")); }catch{return null;} });
  const [tab, setTab] = useState("leagues");
  const [activeLeague, setActiveLeague] = useState(null);

  const login = u => { localStorage.setItem("ipl_user",JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("ipl_user"); setUser(null); };

  if (!user) return <AuthScreen onLogin={login}/>;

  const enterLeague = l => { setActiveLeague(l); setTab("league-detail"); };
  const backToLeagues = () => { setActiveLeague(null); setTab("leagues"); };

  const navTabs = [
    {id:"leagues",icon:"🏟️",label:"Leagues"},
    {id:"predict",icon:"🎯",label:"Predict"},
    {id:"admin",icon:"⚙️",label:"Admin"},
  ];

  return (
    <div className="min-h-screen text-white"
      style={{background:"radial-gradient(ellipse 100% 40% at 50% 0%, #92400e18, transparent), #030712"}}>

      {/* Ambient texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}/>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={backToLeagues} className="flex items-center gap-2.5">
            <span className="text-xl">🏏</span>
            <span className="font-black text-sm tracking-tight" style={{fontFamily:"'Palatino Linotype',Palatino,serif",color:"#F59E0B"}}>
              IPL Prediction League
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-white/25 text-xs hidden sm:block">{user.name}</span>
            <button onClick={logout} className="text-white/20 hover:text-white/60 text-xs transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-24 min-h-screen">
        {tab==="leagues"       && <LeaguesScreen user={user} onEnterLeague={enterLeague}/>}
        {tab==="league-detail" && activeLeague && <LeagueScreen league={activeLeague} user={user} onBack={backToLeagues}/>}
        {tab==="predict"       && <PredictScreen user={user}/>}
        {tab==="admin"         && <AdminScreen user={user}/>}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-lg mx-auto flex">
          {navTabs.map(t=>{
            const active = tab===t.id || (t.id==="leagues"&&tab==="league-detail");
            return (
              <button key={t.id} onClick={()=>{ setActiveLeague(null); setTab(t.id); }}
                className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all ${active?"text-amber-400":"text-white/25 hover:text-white/50"}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5"/>}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
