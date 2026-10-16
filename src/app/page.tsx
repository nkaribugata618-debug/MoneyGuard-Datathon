"use client";

import { useMemo, useState, ChangeEvent } from "react";
import mlSummary from "@/data/ml_summary.json";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Boxes, BriefcaseBusiness,
  ChevronDown, CircleDollarSign, CloudUpload, Download, FileSearch, Filter, Gauge,
  Lightbulb, Megaphone, Menu, Search, ShieldAlert, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Sparkles, Target, TrendingUp, Upload, Wallet, X
} from "lucide-react";

type Finding = { title: string; detail: string; amount: string; severity: "High" | "Medium" | "Review"; area: string };
const revenueTrend = [
  { month: "Jan", revenue: 128, profit: 24 }, { month: "Feb", revenue: 141, profit: 29 },
  { month: "Mar", revenue: 154, profit: 31 }, { month: "Apr", revenue: 148, profit: 28 },
  { month: "May", revenue: 177, profit: 39 }, { month: "Jun", revenue: 189, profit: 42 },
  { month: "Jul", revenue: 204, profit: 48 }, { month: "Aug", revenue: 196, profit: 45 },
  { month: "Sep", revenue: 224, profit: 54 }, { month: "Oct", revenue: 218, profit: 51 },
  { month: "Nov", revenue: 241, profit: 62 }, { month: "Dec", revenue: 259, profit: 68 },
];
const regionData = [
  { name: "South", value: 32, color: "#4169f5" }, { name: "North", value: 27, color: "#19b989" },
  { name: "East", value: 19, color: "#ff9b45" }, { name: "West", value: 15, color: "#8b5cf6" },
  { name: "Central", value: 7, color: "#f16a78" },
];
const categoryData = [
  { name: "Electronics", score: 82 }, { name: "Clothing", score: 67 },
  { name: "Home & Kitchen", score: 59 }, { name: "Beauty", score: 48 }, { name: "Sports", score: 37 },
];
const demoFindings: Finding[] = [
  { title: "Campaign efficiency needs review", detail: "Compare spend against attributed conversions before reallocating budget.", amount: "Needs data validation", severity: "High", area: "Marketing" },
  { title: "Regional margin variation", detail: "Compare net margin and operating costs across regions.", amount: "Needs data validation", severity: "Medium", area: "Regional" },
  { title: "Slow-moving inventory check", detail: "Review stock age and sales velocity to identify possible excess inventory.", amount: "Needs data validation", severity: "Medium", area: "Inventory" },
  { title: "Category profitability review", detail: "Rank categories using profit after discounts, returns, and product costs.", amount: "Needs data validation", severity: "Review", area: "Category" },
];
const nav = [
  { label: "Overview", icon: Gauge }, { label: "Money Leak Finder", icon: ShieldAlert },
  { label: "Regional Analysis", icon: BarChart3 }, { label: "Category Analysis", icon: ShoppingBag },
  { label: "Marketing Analysis", icon: Megaphone }, { label: "Inventory Analysis", icon: Boxes },
  { label: "Recommendations", icon: Lightbulb }, { label: "Data Explorer", icon: FileSearch },
];
const money = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [region, setRegion] = useState("All regions");
  const [category, setCategory] = useState("All categories");
  const [search, setSearch] = useState("");
  const [uploaded, setUploaded] = useState<{name:string; rows:string[][]; headers:string[]} | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");

  const findings = useMemo(() => demoFindings.filter(f =>
    `${f.title} ${f.detail} ${f.area}`.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { setNotice("Please upload a CSV file."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      const parse = (line: string) => line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
      setUploaded({ name: file.name, headers: parse(lines[0] || ""), rows: lines.slice(1, 101).map(parse) });
      setActive("Data Explorer");
      setNotice(`Loaded ${file.name}. Previewing up to 100 rows; map columns and validate calculations before using results.`);
    };
    reader.readAsText(file);
  }

  function exportFindings() {
    const csv = ["Area,Finding,Severity,Detail,Amount", ...findings.map(f =>
      [f.area, f.title, f.severity, f.detail, f.amount].map(v => `"${v.replaceAll('"','""')}"`).join(",")
    )].join("\n");
    const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"}));
    const a = document.createElement("a"); a.href = url; a.download = "moneyguard-findings-review.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><ShieldCheck size={27}/></div><div><strong>MoneyGuard</strong><span>Find leaks. Save profit.</span></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>{nav.map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${active === item.label ? "selected" : ""}`} onClick={() => {setActive(item.label);setMobileNav(false);}}><Icon size={18}/><span>{item.label}</span>{item.label==="Money Leak Finder" && <i className="nav-dot"/>}</button>; })}</nav>
        <div className="sidebar-bottom"><div className="spark-box"><Sparkles size={18}/><span>Turn data into better decisions.</span></div><div className="profile"><div className="avatar">MG</div><div><b>MoneyGuard workspace</b><small>DATATHON prototype</small></div></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21}/></button>
          <div className="breadcrumbs">Workspace <span>/</span> <b>{active}</b></div>
          <div className="top-actions"><span className="demo-pill"><i/> Prototype mode</span><button className="icon-btn" aria-label="Notifications" onClick={() => setNotice("No new notifications.")}><Bell size={18}/></button><div className="top-avatar">S</div></div>
        </header>

        <div className="page-content">
          <div className="welcome-row"><div><div className="eyebrow"><Activity size={14}/> BUSINESS INTELLIGENCE</div><h1>{active === "Overview" ? "Business overview" : active}</h1><p className="subtitle">{active === "Overview" ? "A clearer view of performance, risks, and opportunities." : `Explore ${active.toLowerCase()} using your business data.`}</p></div><label className="upload-btn"><Upload size={16}/> Import CSV<input type="file" accept=".csv,text/csv" onChange={handleFile} hidden/></label></div>

          {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}><X size={15}/></button></div>}
          <div className="filter-bar"><div className="filter-title"><SlidersHorizontal size={16}/> Filters</div><label>Region<select value={region} onChange={e=>setRegion(e.target.value)}><option>All regions</option><option>South</option><option>North</option><option>East</option><option>West</option><option>Central</option></select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option><option>Electronics</option><option>Clothing</option><option>Home & Kitchen</option><option>Beauty</option><option>Sports</option></select></label><div className="filter-note"><Filter size={14}/> Demo visuals until real analysis is connected</div></div>

          {active === "Data Explorer" ? (
            <section className="panel data-panel">
              <div className="panel-heading"><div><h2><FileSearch size={19}/> Data explorer</h2><p>Upload a CSV to inspect its structure.</p></div>{uploaded && <span className="file-tag">{uploaded.name}</span>}</div>
              {!uploaded ? <label className="dropzone"><CloudUpload size={32}/><b>Drop a CSV here or browse files</b><span>CSV preview only — no data is sent to a server.</span><input type="file" accept=".csv,text/csv" onChange={handleFile} hidden/></label> :
                <><div className="table-wrap"><table><thead><tr>{uploaded.headers.map((h,i)=><th key={i}>{h || `Column ${i+1}`}</th>)}</tr></thead><tbody>{uploaded.rows.slice(0,12).map((row,i)=><tr key={i}>{uploaded.headers.map((_,j)=><td key={j}>{row[j] ?? "—"}</td>)}</tr>)}</tbody></table></div><p className="small-muted">Showing {Math.min(uploaded.rows.length,12)} of {uploaded.rows.length} parsed rows (maximum 100 loaded). This is a preview, not a validated analysis.</p></>}
            </section>
          ) : active === "Money Leak Finder" ? (
            <><section className="panel" style={{marginBottom: "18px"}}>
              <div className="panel-heading"><div><h2><ShieldCheck size={19}/> ML anomaly screening — trained results</h2><p>Isolation Forest scored the uploaded Colab transaction dataset.</p></div><span className="file-tag">Model output</span></div>
              <div className="metric-grid">
                <div className="metric-card"><span>Transactions scored</span><strong>{mlSummary.rows_scored.toLocaleString("en-IN")}</strong></div>
                <div className="metric-card"><span>Flagged for review</span><strong>{mlSummary.anomaly_count.toLocaleString("en-IN")}</strong></div>
                <div className="metric-card"><span>Flag rate</span><strong>{mlSummary.anomaly_rate_percent}%</strong></div>
              </div>
              <p className="small-muted">Features: {mlSummary.features_used.join(", ")}. A high score means relatively unusual within this dataset; it is not a probability of fraud or proof of loss.</p>
              <div className="table-wrap"><table><thead><tr><th>Transaction</th><th>Region</th><th>Category</th><th>Status</th><th>Net value</th><th>Risk score</th></tr></thead><tbody>{mlSummary.top_anomalies.slice(0, 10).map((row, i) => <tr key={row.transaction_id + i}><td>{row.transaction_id}</td><td>{row.region ?? "—"}</td><td>{row.category ?? "—"}</td><td>{row.status ?? "—"}</td><td>{row.net_value == null ? "—" : money(Number(row.net_value))}</td><td><b>{row.ml_risk_score}</b></td></tr>)}</tbody></table></div>
              <p className="small-muted">Showing the top 10 of the 100 highest-risk flagged records bundled with this prototype. Review these records against source evidence before treating them as money leaks.</p>
            </section><div className="section-intro"><div><h2>Findings that deserve a closer look</h2><p>These are review prompts, not confirmed losses. Validate against your dataset before presenting.</p></div><button className="secondary-btn" onClick={exportFindings}><Download size={15}/> Export review list</button></div><div className="search-box"><Search size={17}/><input placeholder="Search findings or business areas..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="finding-list">{findings.map((f,i)=><article className="finding-card" key={f.title}><div className={`severity-icon ${f.severity.toLowerCase()}`}><ShieldAlert size={20}/></div><div className="finding-copy"><div className="finding-title-row"><h3>{f.title}</h3><span className={`severity ${f.severity.toLowerCase()}`}>{f.severity}</span></div><p>{f.detail}</p><small>{f.area} · Evidence required before quantifying impact</small></div><div className="finding-amount">{f.amount}</div></article>)}</div></>
          ) : active === "Recommendations" ? (
            <div className="recommendation-grid">{[
              ["01","Validate campaign ROI","Join campaign spend with attributed conversions or revenue. Compare like-for-like periods before changing budgets.","Marketing"],
              ["02","Review inventory velocity","Compare stock on hand with recent sales, stock age, and replenishment lead time.","Inventory"],
              ["03","Prioritize contribution margin","Calculate net sales less product cost, discounts, and returns at category and regional levels.","Profitability"],
            ].map(([n,t,d,tag])=><article className="recommendation-card" key={n}><span className="rec-number">{n}</span><span className="rec-tag">{tag}</span><h3>{t}</h3><p>{d}</p><div className="rec-foot"><Lightbulb size={16}/> Evidence-first action plan</div></article>)}</div>
          ) : active === "Regional Analysis" || active === "Category Analysis" || active === "Marketing Analysis" || active === "Inventory Analysis" ? (
            <><div className="callout"><ShieldCheck size={20}/><div><b>Analysis workspace ready</b><p>Connect your Colab-exported tables to replace the demonstration visuals with verified metrics. Current charts are illustrative and should not be presented as real findings.</p></div></div><div className="chart-grid"><ChartPanel title={active==="Regional Analysis"?"Regional performance (illustrative)":active==="Category Analysis"?"Category performance (illustrative)":active==="Marketing Analysis"?"Campaign review framework":"Inventory review framework"}><ResponsiveContainer width="100%" height="100%"><BarChart data={active==="Regional Analysis"?regionData.map(x=>({name:x.name,value:x.value})):categoryData.map(x=>({name:x.name,value:x.score}))}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf5"/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#7b8498"}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#7b8498"}}/><Tooltip/><Bar dataKey="value" fill="#4169f5" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartPanel><div className="panel insight-panel"><div className="panel-heading"><h2><Target size={18}/> What to validate</h2></div><ul><li>Check the source columns and grain of each dataset.</li><li>Confirm whether amounts are revenue, cost, margin, or inventory value.</li><li>Separate observed results from estimates and hypotheses.</li><li>Record the exact rows or calculations supporting each finding.</li></ul></div></div></>
          ) : (
            <>
              <div className="demo-warning"><span><Sparkles size={16}/> DESIGN PREVIEW</span><p>Numbers and charts below are illustrative placeholders. They are not actual results from your DATATHON dataset.</p></div>
              <div className="kpi-grid">
                <Kpi icon={<Wallet size={19}/>} color="blue" label="Total revenue" value="Connect dataset" change="Awaiting verified calculation" />
                <Kpi icon={<CircleDollarSign size={19}/>} color="green" label="Estimated profit" value="Connect dataset" change="Requires cost and return data" />
                <Kpi icon={<Megaphone size={19}/>} color="purple" label="Campaign spend" value="Connect dataset" change="Requires campaign totals" />
                <Kpi icon={<Boxes size={19}/>} color="orange" label="Inventory exposure" value="Connect dataset" change="Requires stock valuation" />
              </div>
              <div className="chart-grid">
                <ChartPanel title="Revenue vs profit trend"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueTrend}><defs><linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4169f5" stopOpacity={0.19}/><stop offset="100%" stopColor="#4169f5" stopOpacity={0}/></linearGradient><linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#19b989" stopOpacity={0.18}/><stop offset="100%" stopColor="#19b989" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f6"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#7b8498"}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#7b8498"}}/><Tooltip/><Area type="monotone" dataKey="revenue" stroke="#4169f5" fill="url(#revFill)" strokeWidth={2.5}/><Area type="monotone" dataKey="profit" stroke="#19b989" fill="url(#profitFill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></ChartPanel>
                <div className="panel region-panel"><div className="panel-heading"><h2><BriefcaseBusiness size={18}/> Revenue by region</h2><button className="text-btn" onClick={()=>setActive("Regional Analysis")}>Explore</button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={regionData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3} stroke="none">{regionData.map(d=><Cell key={d.name} fill={d.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-center"><b>Demo</b><span>preview</span></div></div><div className="legend">{regionData.map(d=><div key={d.name}><i style={{background:d.color}}/><span>{d.name}</span><b>{d.value}%</b></div>)}</div></div>
              </div>
              <div className="bottom-grid">
                <div className="panel"><div className="panel-heading"><h2><TrendingUp size={18}/> Category score preview</h2><button className="text-btn" onClick={()=>setActive("Category Analysis")}>Explore</button></div><div className="category-bars">{categoryData.map(d=><div className="bar-row" key={d.name}><span>{d.name}</span><div className="bar-track"><i style={{width:`${d.score}%`}}/></div><b>{d.score}</b></div>)}</div><p className="small-muted">Illustrative index only — not profit or revenue.</p></div>
                <div className="panel"><div className="panel-heading"><h2><ShieldAlert size={18}/> Money leak review queue</h2><button className="text-btn" onClick={()=>setActive("Money Leak Finder")}>View all</button></div><div className="mini-findings">{demoFindings.slice(0,3).map((f,i)=><button key={f.title} onClick={()=>setActive("Money Leak Finder")}><span className={`mini-dot dot-${i}`}/><span><b>{f.title}</b><small>{f.area} · Validate evidence</small></span><ChevronDown size={15}/></button>)}</div></div>
                <div className="panel"><div className="panel-heading"><h2><Lightbulb size={18}/> Recommended next steps</h2><button className="text-btn" onClick={()=>setActive("Recommendations")}>View all</button></div><div className="next-steps"><div><span className="step-icon green"><ArrowUpRight size={17}/></span><p>Validate net sales and contribution margin.</p></div><div><span className="step-icon blue"><Target size={17}/></span><p>Compare campaign spend to attributed outcomes.</p></div><div><span className="step-icon orange"><Boxes size={17}/></span><p>Review slow-moving stock and stock age.</p></div></div></div>
              </div>
            </>
          )}
          <footer className="footer"><span>MoneyGuard · DATATHON prototype</span><span><i/> Evidence-first analytics · <b>Demo data clearly marked</b></span></footer>
        </div>
      </section>
    </main>
  );
}

function Kpi({icon,color,label,value,change}:{icon:React.ReactNode;color:string;label:string;value:string;change:string}) {
  return <article className="kpi-card"><div className={`kpi-icon ${color}`}>{icon}</div><div className="kpi-content"><span>{label}</span><strong>{value}</strong><small>{change}</small></div><div className="kpi-decoration"><ArrowDownRight size={18}/></div></article>;
}
function ChartPanel({title,children}:{title:string;children:React.ReactNode}) {
  return <section className="panel chart-panel"><div className="panel-heading"><h2><Activity size={18}/>{title}</h2><span className="chart-tag">Demo</span></div><div className="chart-area">{children}</div></section>;
}
