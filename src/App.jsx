import React, { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
// SUPABASE CONFIG (Untouched)
// ─────────────────────────────────────────────
const SB_URL    = "https://rpzpnbhaqpfejolgjggu.supabase.co";
const SB_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenBuYmhhcXBmZWpvbGdqZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcyODQsImV4cCI6MjA4OTk3MzI4NH0.tDRO6axPkvI4udJJz2cJCOcH0WQFlu4sOl7U-h50s30";
const ADMIN_PWD = "ipl2026admin";

// ─────────────────────────────────────────────
// IPL 2026 DATA & THEMING
// ─────────────────────────────────────────────
const TEAMS = [
  "Chennai Super Kings","Mumbai Indians","Royal Challengers Bengaluru",
  "Kolkata Knight Riders","Sunrisers Hyderabad","Delhi Capitals",
  "Lucknow Super Giants","Rajasthan Royals","Gujarat Titans","Punjab Kings",
];
const SHORT = {
  "Chennai Super Kings":"CSK","Mumbai Indians":"MI","Royal Challengers Bengaluru":"RCB",
  "Kolkata Knight Riders":"KKR","Sunrisers Hyderabad":"SRH","Delhi Capitals":"DC",
  "Lucknow Super Giants":"LSG","Rajasthan Royals":"RR","Gujarat Titans":"GT","Punjab Kings":"PBKS",
};
const TC = {
  "Chennai Super Kings":         { bg:"#F9CD1B", fg:"#0A1931", icon:"🦁" },
  "Mumbai Indians":              { bg:"#004BA0", fg:"#FFFFFF", icon:"🌀" },
  "Royal Challengers Bengaluru": { bg:"#C8102E", fg:"#F9CD1B", icon:"👑" },
  "Kolkata Knight Riders":       { bg:"#3A225D", fg:"#F0C040", icon:"🛡️" },
  "Sunrisers Hyderabad":         { bg:"#F7500E", fg:"#000000", icon:"🦅" },
  "Delhi Capitals":              { bg:"#17479E", fg:"#EF3340", icon:"🐅" },
  "Lucknow Super Giants":        { bg:"#A72B2A", fg:"#FBBF24", icon:"🦇" },
  "Rajasthan Royals":            { bg:"#EA1A85", fg:"#FFFFFF", icon:"🩷" },
  "Gujarat Titans":              { bg:"#1C2B4A", fg:"#8AC0DE", icon:"⚡" },
  "Punjab Kings":                { bg:"#ED1B24", fg:"#FFFFFF", icon:"🛡️" },
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

const LOADING_ROASTS = [
  "Consulting Dhoni's gut feeling...",
  "Checking DRS (Drama Review System)...",
  "Asking Bumrah nicely to load faster...",
  "Waiting for RCB to win a trophy...",
  "Applying sunscreen for day matches..."
];

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
const teamOf   = p => Object.entries(SQUADS).find(([,sq])=>sq.includes(p))?.[0];

// ─────────────────────────────────────────────
// GLOBAL STYLES & ANIMATIONS
// ─────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
    
    :root {
      --ff-display: 'Bebas Neue', sans-serif;
      --ff-body: 'Nunito', sans-serif;
    }
    
    body {
      background: #0f172a; /* Deep stadium night blue */
      color: #f8fafc;
      font-family: var(--ff-body);
      -webkit-font-smoothing: antialiased;
    }

    /* Hide scrollbar for clean UI */
    ::-webkit-scrollbar { width: 0px; background: transparent; }

    .font-display { font-family: var(--ff-display); letter-spacing: 0.05em; }
    .font-body { font-family: var(--ff-body); }

    /* Custom Animations */
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.9); }
      50% { transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-pop { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

    @keyframes fillBar {
      from { width: 0%; }
    }
    .animate-fill { animation: fillBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .glow-text { text-shadow: 0 0 10px currentColor; }
    
    /* Stadium Floodlight Effect */
    .stadium-bg {
      position: fixed; top: 0; left: 0; right: 0; height: 100vh;
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 60%);
      z-index: -1; overflow: hidden;
    }
    .floodlight {
      position: absolute; width: 2px; height: 50vh; background: rgba(255,255,255,0.05);
      top: -10vh; box-shadow: 0 0 40px 10px rgba(255,255,255,0.05);
    }
  `}</style>
);

// ─────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────
const Button = ({ children, onClick, variant = 'primary', className = '', disabled, loading }) => {
  const base = "w-full font-display text-xl py-3 px-6 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2";
  const styles = {
    primary: "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]",
    glass: "glass-card text-white hover:bg-white/10",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={`${base} ${styles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <span className="animate-spin text-2xl">🏏</span> : children}
    </button>
  );
};

// Massive Visual Team Card
const TeamCard = ({ team, selected, onClick, disabled, small }) => {
  const c = TC[team];
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-center transition-all duration-300
        ${small ? 'p-2 min-h-[90px]' : 'p-4 min-h-[140px]'}
        ${disabled && !selected ? 'opacity-30 cursor-not-allowed' : 'active:scale-90 cursor-pointer'}
        ${selected ? 'ring-4 shadow-2xl scale-105' : 'glass-card hover:bg-slate-800'}
      `}
      style={{ 
        borderColor: selected ? c.bg : 'transparent',
        boxShadow: selected ? `0 10px 30px ${c.bg}66` : 'none'
      }}
    >
      {selected && <div className="absolute inset-0 opacity-20" style={{ background: c.bg }} />}
      {selected && (
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg animate-pop">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
      )}
      
      <div className={`rounded-full flex items-center justify-center mb-2 z-10 transition-transform ${selected ? 'scale-110' : ''}`}
           style={{ background: c.bg, width: small ? 40 : 60, height: small ? 40 : 60, boxShadow: `0 4px 15px ${c.bg}88` }}>
        <span className="text-2xl">{c.icon}</span>
      </div>
      <span className="font-display text-white z-10 text-center leading-none" style={{ fontSize: small ? '1.2rem' : '1.8rem' }}>
        {SHORT[team]}
      </span>
      {!small && <span className="text-xs text-slate-300 mt-1 z-10 text-center font-bold uppercase tracking-wider">{team.split(" ").slice(-1)[0]}</span>}
    </button>
  );
};

const Confetti = ({ active }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pieces = Array.from({length: 150}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4, d: Math.random() * 80 + 40,
      color: Object.values(TC)[Math.floor(Math.random()*10)].bg,
      tilt: Math.floor(Math.random() * 10) - 10, tiltAngle: 0, tiltAngleInc: (Math.random() * 0.07) + 0.05
    }));
    let angle = 0, frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); angle += 0.01;
      pieces.forEach(p => {
        p.tiltAngle += p.tiltAngleInc; p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) / 2;
        p.x += Math.sin(angle); p.tilt = Math.sin(p.tiltAngle) * 15;
        ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y); ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r); ctx.stroke();
        if (p.y > canvas.height) { p.x = Math.random() * canvas.width; p.y = -20; p.tilt = Math.floor(Math.random() * 10) - 10; }
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => cancelAnimationFrame(frame), 4000);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-50" />;
};

// ─────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────

const LoadingRoast = () => {
  const roast = LOADING_ROASTS[Math.floor(Math.random() * LOADING_ROASTS.length)];
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-slide-up">
      <div className="text-6xl animate-bounce mb-6">🏏</div>
      <h2 className="font-display text-3xl text-orange-500 mb-2">Loading...</h2>
      <p className="text-slate-400 font-bold text-center px-6">{roast}</p>
    </div>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({username:"", password:"", name:""});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let user;
      if (mode==="signup") {
        if(!form.name||!form.username||!form.password) throw new Error("Fill all fields, champ.");
        const ex = await sb(`users?username=eq.${form.username.toLowerCase()}&select=id`);
        if(ex?.length) throw new Error("Username taken. Be more creative.");
        [user] = await sb("users",{method:"POST",body:{username:form.username.toLowerCase().trim(),password:form.password,name:form.name.trim()}});
      } else {
        const rows = await sb(`users?username=eq.${form.username.toLowerCase()}&password=eq.${form.password}&select=*`);
        if(!rows?.length) throw new Error("Wrong credentials. DRS review failed.");
        user = rows[0];
      }
      onLogin(user);
    } catch(e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 relative z-10 animate-slide-up">
      <div className="text-center mb-10">
        <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 shadow-[0_0_40px_rgba(249,115,22,0.5)] mb-6 animate-pop">
          <span className="text-6xl">🏆</span>
        </div>
        <h1 className="font-display text-6xl leading-none mb-2 glow-text">
          IPL <span className="text-orange-500">PREDICTOR</span>
        </h1>
        <p className="text-slate-300 font-bold uppercase tracking-widest text-sm">Predict. Trash Talk. Win.</p>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-slate-700 max-w-sm w-full mx-auto shadow-2xl">
        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => {setMode(m); setErr("");}}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === m ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}>
              {m === 'login' ? 'Sign In' : 'Join Now'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <input className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" 
              placeholder="Your Full Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          )}
          <input className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" 
            placeholder="Username" autoCapitalize="none" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
          <input className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" 
            placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()} />
          
          {err && <div className="text-rose-500 text-sm font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 animate-pop">⚠️ {err}</div>}
          
          <Button onClick={submit} loading={busy} className="mt-4">
            {mode === "login" ? "Enter Stadium 🏟️" : "Create Account 🚀"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PicksTab = ({ user }) => {
  const locked = isLocked();
  const empty = {winner:"", finalist2:"", top4:[], top_scorer:"", top_wicket_taker:"", max_sixes:"", max_fours:""};
  const [pred, setPred] = useState(empty);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      const rows = await sb(`predictions?user_id=eq.${user.id}&select=*`);
      if(rows?.length) { setPred(rows[0]); setSaved(true); }
      setLoading(false);
    })();
  }, [user.id]);

  const upd = (k,v) => setPred(p => ({...p, [k]:v}));
  
  const save = async () => {
    setStatus("saving");
    try {
      if(saved) await sb(`predictions?user_id=eq.${user.id}`, {method:"PATCH", body:{...pred, updated_at:new Date().toISOString()}});
      else {
        await sb("predictions", {method:"POST", body:{...pred, user_id:user.id}});
        setConfetti(true); setTimeout(() => setConfetti(false), 4000);
      }
      setSaved(true); setStatus("saved"); setTimeout(() => setStatus(null), 3000);
    } catch(e) { setStatus("error:"+e.message); }
  };

  const completed = [pred.winner, pred.finalist2, pred.top4.length===4, pred.top_scorer, pred.top_wicket_taker, pred.max_sixes, pred.max_fours].filter(Boolean).length;
  const isComplete = completed === 7;

  if (loading) return <LoadingRoast />;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-slide-up">
      <Confetti active={confetti} />
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display text-4xl leading-none glow-text">Tournament Picks</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">{locked ? "🔒 Picks Locked" : "⏰ Locks Mar 28"}</p>
        </div>
        {!locked && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
              <path strokeDasharray={`${(completed/7)*100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isComplete ? "#10B981" : "#F97316"} strokeWidth="3" className="transition-all duration-1000"/>
            </svg>
            <span className="absolute font-display text-lg">{completed}/7</span>
          </div>
        )}
      </div>

      {locked && saved && (
         <div className="glass-card bg-emerald-900/40 border-emerald-500/50 p-4 rounded-2xl mb-6 flex items-center gap-4 animate-pop">
           <span className="text-4xl">🧘‍♂️</span>
           <div>
             <h3 className="font-bold text-emerald-400">Picks locked in!</h3>
             <p className="text-xs text-emerald-200/70">Time to pray your captain doesn't get ducked.</p>
           </div>
         </div>
      )}

      {/* Champion & Runner up */}
      <div className="mb-8">
        <h3 className="font-display text-2xl text-orange-400 mb-4 flex items-center gap-2"><span>🏆</span> The Finals</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Winner</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold outline-none focus:border-yellow-500 appearance-none" 
              value={pred.winner} onChange={e=>upd('winner', e.target.value)} disabled={locked}>
              <option value="">Choose 🥇</option>
              {TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            {pred.winner && <div className="mt-3 animate-pop"><TeamCard team={pred.winner} selected small disabled={locked}/></div>}
          </div>
          
          <div className="glass-card p-4 rounded-2xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-300 to-slate-500"></div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Runner Up</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold outline-none focus:border-slate-400 appearance-none" 
              value={pred.finalist2} onChange={e=>upd('finalist2', e.target.value)} disabled={locked}>
              <option value="">Choose 🥈</option>
              {TEAMS.filter(t=>t!==pred.winner).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            {pred.finalist2 && <div className="mt-3 animate-pop"><TeamCard team={pred.finalist2} selected small disabled={locked}/></div>}
          </div>
        </div>
      </div>

      {/* Top 4 */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-display text-2xl text-orange-400 flex items-center gap-2"><span>🏅</span> Top 4 Playoff</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${pred.top4.length === 4 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            {pred.top4.length}/4
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {TEAMS.filter(t => t !== pred.winner && t !== pred.finalist2).map(t => {
            const isSel = pred.top4.includes(t);
            const isFull = !isSel && pred.top4.length >= 4;
            return (
              <TeamCard key={t} team={t} small selected={isSel} disabled={locked || isFull} 
                onClick={() => {
                  if (isSel) upd('top4', pred.top4.filter(x => x !== t));
                  else if (!isFull) upd('top4', [...pred.top4, t]);
                }} />
            );
          })}
        </div>
      </div>

      {/* Player Awards - Simplified with searchable inputs acting as dropdowns */}
      <div className="mb-8 space-y-4">
        <h3 className="font-display text-2xl text-orange-400 flex items-center gap-2 mb-4"><span>🎖️</span> Player Awards</h3>
        
        {[
          { key: 'top_scorer', label: '🍊 Orange Cap (Runs)', icon: '🏏' },
          { key: 'top_wicket_taker', label: '💜 Purple Cap (Wickets)', icon: '🎯' },
          { key: 'max_sixes', label: '💥 Most Sixes', icon: '🚀' },
          { key: 'max_fours', label: '🏏 Most Fours', icon: '🏎️' },
        ].map(award => (
          <div key={award.key} className="glass-card p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
            <div className="text-3xl">{award.icon}</div>
            <div className="flex-1 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{award.label}</label>
              <input 
                list="players" 
                className="w-full bg-slate-900 border-b-2 border-slate-700 px-2 py-1 text-white font-bold outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                placeholder="Type player name..."
                value={pred[award.key]}
                onChange={(e) => upd(award.key, e.target.value)}
                disabled={locked}
              />
              {pred[award.key] && teamOf(pred[award.key]) && (
                <div className="absolute right-0 bottom-2 text-xs font-bold px-2 py-0.5 rounded-full" 
                     style={{backgroundColor: TC[teamOf(pred[award.key])].bg, color: TC[teamOf(pred[award.key])].fg}}>
                  {SHORT[teamOf(pred[award.key])]}
                </div>
              )}
            </div>
          </div>
        ))}
        <datalist id="players">{ALL_PLAYERS.map(p => <option key={p} value={p} />)}</datalist>
      </div>

      {!locked && (
        <div className="fixed bottom-[80px] left-0 right-0 px-4 max-w-md mx-auto z-40">
           <Button onClick={save} disabled={!isComplete || status === "saving"} 
             variant={isComplete ? (saved ? 'glass' : 'success') : 'primary'}
             className="shadow-2xl">
             {status === "saving" ? "Consulting Umpires..." : saved ? "✅ Update Predictions" : "🔒 Lock It In"}
           </Button>
        </div>
      )}
    </div>
  );
};

const LeaderboardTab = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [actuals, setActuals] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-join default "Global" league for demo purposes if no leagues logic is fully flushed out here
  useEffect(() => {
    (async () => {
      try {
        // Just fetch all users for a global leaderboard for simplicity in this visual revamp
        const users = await sb(`users?select=id,username,name`);
        const preds = await sb(`predictions?select=*`);
        const acts = await sb(`actuals?select=*`);
        const act = acts?.[0] || null; setActuals(act);
        
        const pm = {}; (preds||[]).forEach(p => { pm[p.user_id] = p; });
        const ranked = (users||[]).map(u => ({...u, pred: pm[u.id]||null, score: pm[u.id]&&act ? calcScore(pm[u.id], act) : null}))
          .sort((a,b) => (b.score||0) - (a.score||0));
        setMembers(ranked);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingRoast />;

  const top3 = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-slide-up">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl leading-none glow-text">Global Leaderboard</h2>
        <p className="text-slate-400 font-bold text-sm mt-1">{actuals ? "Live Standings" : "Tournament hasn't started"}</p>
      </div>

      {/* PODIUM */}
      {actuals && top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 mb-12 h-48 mt-8">
          {[1, 0, 2].map(idx => {
            const m = top3[idx];
            if (!m) return <div key={idx} className="w-1/3" />;
            const rank = idx === 1 ? 2 : idx === 0 ? 1 : 3;
            const h = rank === 1 ? 'h-full' : rank === 2 ? 'h-4/5' : 'h-3/5';
            const colors = {1: 'from-yellow-400 to-yellow-600', 2: 'from-slate-300 to-slate-500', 3: 'from-orange-700 to-orange-900'};
            const medals = {1: '🥇', 2: '🥈', 3: '🥉'};
            
            return (
              <div key={m.id} className={`w-[30%] flex flex-col items-center justify-end relative animate-slide-up`} style={{animationDelay: `${idx*0.1}s`}}>
                <div className="absolute -top-12 flex flex-col items-center">
                  <span className="text-2xl mb-1">{medals[rank]}</span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-xl text-white shadow-lg bg-gradient-to-br ${colors[rank]}`}>
                    {initials(m.name)}
                  </div>
                </div>
                <div className={`w-full ${h} bg-gradient-to-t ${colors[rank]} rounded-t-lg opacity-80 flex flex-col items-center pt-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                  <span className="font-bold text-slate-900 text-xs truncate w-full text-center px-1">{m.name.split(" ")[0]}</span>
                  <span className="font-display text-xl text-slate-900 leading-none mt-1">{m.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {members.map((m, i) => {
          const isMe = m.id === user.id;
          const score = m.score || 0;
          const pct = Math.max(5, (score / MAX_PTS) * 100); // Min 5% so bar is visible
          
          return (
            <div key={m.id} className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${isMe ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-lg my-4 z-10' : 'border-slate-700/50 glass-card'}`}>
              
              {/* Progress Bar Background */}
              {actuals && (
                <div className="absolute top-0 left-0 bottom-0 bg-slate-800/80 z-0">
                  <div className="h-full bg-gradient-to-r from-slate-700/50 to-slate-600/50 animate-fill" style={{ width: `${pct}%` }} />
                </div>
              )}

              <div className="relative z-10 p-3 flex items-center gap-3">
                <div className="font-display text-2xl text-slate-500 w-8 text-center">#{i+1}</div>
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-display text-white border border-slate-600">
                  {initials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold truncate ${isMe ? 'text-orange-400' : 'text-white'}`}>{m.name}</span>
                    {isMe && <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">You</span>}
                  </div>
                  {m.pred?.winner ? (
                     <div className="flex items-center gap-1 mt-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Pick:</span>
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{backgroundColor: TC[m.pred.winner].bg, color: TC[m.pred.winner].fg}}>
                         {SHORT[m.pred.winner]}
                       </span>
                     </div>
                  ) : <span className="text-[10px] text-rose-400 font-bold uppercase mt-1 block">No Pick</span>}
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl leading-none">{actuals ? score : '-'}</span>
                  {actuals && <span className="text-[10px] text-slate-400 block -mt-1 font-bold">PTS</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TodayTab = () => {
  // Mock Data for "Daily Match Predictions"
  const matches = [
    { id: 1, date: "Today, 7:30 PM", t1: "Chennai Super Kings", t2: "Mumbai Indians", venue: "Chepauk Stadium" },
  ];
  const m = matches[0];
  const t1c = TC[m.t1]; const t2c = TC[m.t2];
  
  const [pred, setPred] = useState({ winner: "", batter: "", bowler: "", potm: "" });
  const [saved, setSaved] = useState(false);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-4xl leading-none glow-text">Matchday <span className="text-orange-500">Live</span></h2>
        <div className="bg-orange-500/20 border border-orange-500/50 text-orange-400 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
          🔥 3 Day Streak
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {[-2,-1,0,1,2].map(d => (
          <div key={d} className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border min-w-[60px] ${d === 0 ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 mx-2' : 'glass-card border-slate-700 text-slate-400'}`}>
            <span className="text-[10px] font-bold uppercase">Mar</span>
            <span className="font-display text-xl leading-none">{26 + d}</span>
          </div>
        ))}
      </div>

      {/* VS Card */}
      <div className="rounded-3xl overflow-hidden shadow-2xl relative mb-8">
        <div className="flex h-32">
          <div className="w-1/2 flex items-center justify-center relative" style={{background: t1c.bg}}>
            <span className="text-6xl absolute opacity-20">{t1c.icon}</span>
            <span className="font-display text-4xl z-10" style={{color: t1c.fg}}>{SHORT[m.t1]}</span>
          </div>
          <div className="w-1/2 flex items-center justify-center relative" style={{background: t2c.bg}}>
             <span className="text-6xl absolute opacity-20">{t2c.icon}</span>
             <span className="font-display text-4xl z-10" style={{color: t2c.fg}}>{SHORT[m.t2]}</span>
          </div>
        </div>
        
        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center z-20">
          <span className="font-display text-xl text-white italic">VS</span>
        </div>

        <div className="bg-slate-800 p-3 text-center border-t border-slate-700">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{m.date} • {m.venue}</p>
        </div>
      </div>

      {/* Daily Predictions */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-2">Predict & Earn (36 pts total)</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={()=>setPred({...pred, winner: m.t1})} className={`p-3 rounded-xl font-display text-xl border-2 transition-all ${pred.winner === m.t1 ? 'scale-105 border-white shadow-lg' : 'border-transparent opacity-60'}`} style={{background: t1c.bg, color: t1c.fg}}>{SHORT[m.t1]} to Win</button>
          <button onClick={()=>setPred({...pred, winner: m.t2})} className={`p-3 rounded-xl font-display text-xl border-2 transition-all ${pred.winner === m.t2 ? 'scale-105 border-white shadow-lg' : 'border-transparent opacity-60'}`} style={{background: t2c.bg, color: t2c.fg}}>{SHORT[m.t2]} to Win</button>
        </div>

        {['batter', 'bowler', 'potm'].map((type, i) => {
          const labels = ['🔥 Top Batter (10pt)', '🎯 Top Bowler (10pt)', '🌟 Player of Match (10pt)'];
          return (
            <div key={type} className="glass-card p-3 rounded-xl border border-slate-700/50">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{labels[i]}</label>
              <input 
                list="players" 
                className="w-full bg-transparent border-b border-slate-600 px-1 py-1 text-white font-bold outline-none focus:border-orange-500 text-sm"
                placeholder="Type player name..."
                value={pred[type]} onChange={(e) => setPred({...pred, [type]: e.target.value})}
              />
            </div>
          );
        })}
      </div>

      <Button variant={saved ? 'success' : 'primary'} onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2000); }} className="mt-6">
        {saved ? "✅ Locked in for tonight!" : "Save Today's Picks"}
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT APP COMPONENT
// ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => { try{return JSON.parse(localStorage.getItem("ipl_user"));}catch{return null;} });
  const [tab, setTab] = useState("today");

  const login = u => { localStorage.setItem("ipl_user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("ipl_user"); setUser(null); };

  if (!user) return <><GS/><div className="stadium-bg"><div className="floodlight" style={{left:'20%', transform:'rotate(-20deg)'}}/><div className="floodlight" style={{right:'20%', transform:'rotate(20deg)'}}/></div><AuthScreen onLogin={login}/></>;

  const navItems = [
    { id: "today", icon: "🏏", label: "Today" },
    { id: "picks", icon: "🏆", label: "Picks" },
    { id: "leaderboard", icon: "📊", label: "Ranks" }
  ];

  return (
    <>
      <GS/>
      <div className="stadium-bg fixed inset-0 pointer-events-none">
         <div className="floodlight" style={{left:'10%', transform:'rotate(-30deg)', opacity:0.5}}/>
         <div className="floodlight" style={{right:'10%', transform:'rotate(30deg)', opacity:0.5}}/>
      </div>

      <div className="min-h-screen relative z-10 flex flex-col">
        {/* Top Navbar */}
        <header className="glass-card sticky top-0 z-50 border-b border-slate-800/50 shadow-lg">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-rose-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-[0_0_10px_rgba(249,115,22,0.5)]">🏏</div>
              <span className="font-display text-xl tracking-wider glow-text">IPL PREDICTOR</span>
            </div>
            <button onClick={logout} className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors">Sign Out</button>
          </div>
        </header>

        {/* Dynamic Content area */}
        <main className="flex-1 overflow-y-auto">
          {tab === "today" && <TodayTab user={user} />}
          {tab === "picks" && <PicksTab user={user} />}
          {tab === "leaderboard" && <LeaderboardTab user={user} />}
        </main>

        {/* Sticky Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-slate-700/50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)] bg-[#0f172a]/90 backdrop-blur-xl">
          <div className="max-w-md mx-auto flex justify-around">
            {navItems.map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-3 flex flex-col items-center gap-1 relative group">
                  {active && <div className="absolute top-0 w-8 h-1 bg-orange-500 rounded-b-md shadow-[0_0_10px_#f97316]"></div>}
                  <span className={`text-2xl transition-transform duration-300 ${active ? 'scale-125 -translate-y-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`}>{t.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-orange-400' : 'text-slate-500'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}