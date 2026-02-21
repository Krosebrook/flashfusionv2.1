import { useState } from "react";
import { LayoutDashboard, Palette, ShoppingBag, Zap, Bell, Search, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Plus, Package, Globe, Check, RefreshCw, ChevronDown, X, Rocket, Brush, Type, Image, Video, Layout, BookOpen, Wand2, ShoppingCart, Eye, DollarSign, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const T = { bg: "#080B14", surface: "#0E1220", surfaceHover: "#131829", border: "#1C2236", borderHover: "#2A3356", accent: "#5B6EF5", accentHover: "#6F7FF7", accentMuted: "rgba(91,110,245,0.12)", text: "#E8ECFF", textMuted: "#6B7599", textDim: "#3D4566", green: "#22D3A0", greenMuted: "rgba(34,211,160,0.12)", amber: "#F59E0B", amberMuted: "rgba(245,158,11,0.12)", red: "#FF5A6A", redMuted: "rgba(255,90,106,0.12)", purple: "#A78BFA", purpleMuted: "rgba(167,139,250,0.12)" };

const revenueData = [{ month: "Aug", revenue: 4200, orders: 38 },{ month: "Sep", revenue: 5800, orders: 52 },{ month: "Oct", revenue: 5100, orders: 47 },{ month: "Nov", revenue: 7400, orders: 68 },{ month: "Dec", revenue: 9200, orders: 84 },{ month: "Jan", revenue: 8600, orders: 79 }];
const creatorData = [{ week: "W1", content: 12, brands: 3 },{ week: "W2", content: 18, brands: 5 },{ week: "W3", content: 24, brands: 4 },{ week: "W4", content: 31, brands: 7 }];
const recentContent = [{ id: 1, title: "Summer Campaign 2025", type: "Brand Kit", status: "published", date: "2h ago", icon: "🎨" },{ id: 2, title: "Product Launch Video Script", type: "Copy", status: "draft", date: "5h ago", icon: "📝" },{ id: 3, title: "Social Media Pack – Q1", type: "Graphics", status: "published", date: "1d ago", icon: "🖼️" },{ id: 4, title: "Email Newsletter Template", type: "Template", status: "review", date: "2d ago", icon: "✉️" }];
const products = [{ id: 1, name: "Midnight Hoodie", sku: "APP-001", price: 89, stock: 142, status: "active", revenue: 12638 },{ id: 2, name: "Brand Kit Pro Bundle", sku: "DIG-002", price: 49, stock: "∞", status: "active", revenue: 8820 },{ id: 3, name: "Creator Canvas Tee", sku: "APP-003", price: 35, stock: 67, status: "active", revenue: 2345 },{ id: 4, name: "Foil Logo Snapback", sku: "ACC-004", price: 42, stock: 0, status: "out_of_stock", revenue: 1890 },{ id: 5, name: "Custom Merch Drop Pack", sku: "BUN-005", price: 129, stock: 28, status: "active", revenue: 3612 }];
const tools = [{ icon: Brush, label: "Brand Kit Generator", desc: "Colors, fonts, logos from a prompt", badge: "AI", color: T.purple },{ icon: Type, label: "Copy Engine", desc: "Headlines, emails, social captions", badge: "AI", color: T.accent },{ icon: Image, label: "Visual Composer", desc: "On-brand graphics and social assets", badge: "AI", color: T.green },{ icon: Video, label: "Video Script", desc: "Hooks, narratives, CTAs for production", badge: "AI", color: T.amber },{ icon: Layout, label: "Template Library", desc: "200+ production-ready templates", badge: null, color: T.textMuted },{ icon: BookOpen, label: "Style Guide Builder", desc: "Codify your brand in an exportable doc", badge: "New", color: T.green }];
const brandKits = [{ name: "Midnight Co.", colors: ["#5B6EF5","#A78BFA","#22D3A0","#080B14"], font: "Satoshi / DM Mono" },{ name: "Solar Merch", colors: ["#F59E0B","#FF5A6A","#1C2236","#FAFAFA"], font: "Cabinet / Inter" },{ name: "NorthEdge Studio", colors: ["#22D3A0","#0E1220","#5B6EF5","#E8ECFF"], font: "Mona Sans / Mono" }];

const Badge = ({ children, color = "accent" }) => { const c = { accent: { bg: T.accentMuted, text: T.accent }, green: { bg: T.greenMuted, text: T.green }, amber: { bg: T.amberMuted, text: T.amber }, red: { bg: T.redMuted, text: T.red }, purple: { bg: T.purpleMuted, text: T.purple }, muted: { bg: "#1C2236", text: T.textMuted } }[color]; return <span style={{ background: c.bg, color: c.text, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 4 }}>{children}</span>; };

const Stat = ({ label, value, delta, deltaDir, icon: Icon }) => { const [hov, setHov] = useState(false); return <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: T.surface, border: `1px solid ${hov ? T.borderHover : T.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s", cursor: "default" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: T.textMuted, fontSize: 13, fontWeight: 500 }}>{label}</span><div style={{ background: T.accentMuted, borderRadius: 10, padding: 8, display: "flex" }}><Icon size={16} color={T.accent} /></div></div><div style={{ display: "flex", alignItems: "flex-end", gap: 10, justifyContent: "space-between" }}><span style={{ color: T.text, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "monospace" }}>{value}</span>{delta && <span style={{ color: deltaDir === "up" ? T.green : T.red, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 2, paddingBottom: 4 }}>{deltaDir === "up" ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}{delta}</span>}</div></div>; };

const CustomTooltip = ({ active, payload, label }) => { if (!active || !payload?.length) return null; return <div style={{ background: "#10172B", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px" }}><p style={{ color: T.textMuted, fontSize: 11, margin: "0 0 6px" }}>{label}</p>{payload.map((p,i) => <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600, margin: "2px 0" }}>{p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value} <span style={{ color: T.textMuted, fontWeight: 400 }}>{p.name}</span></p>)}</div>; };

function DashboardView() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      <Stat label="Total Revenue" value="$49.2K" delta="18.4%" deltaDir="up" icon={DollarSign}/>
      <Stat label="Active Campaigns" value="12" delta="3 new" deltaDir="up" icon={Sparkles}/>
      <Stat label="Products Live" value="38" icon={Package}/>
      <Stat label="Avg. Conversion" value="4.7%" delta="0.3%" deltaDir="down" icon={Activity}/>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Revenue Overview</h3><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>Last 6 months</p></div><Badge color="green">↑ 18.4% MoM</Badge></div>
        <div style={{ padding: "16px 8px 8px" }}><ResponsiveContainer width="100%" height={190}><AreaChart data={revenueData}><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.accent} stopOpacity={0.3}/><stop offset="95%" stopColor={T.accent} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`}/><Tooltip content={<CustomTooltip/>}/><Area type="monotone" dataKey="revenue" stroke={T.accent} fill="url(#rg)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
        <div style={{ padding: "20px 24px 0" }}><h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Content Output</h3><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>This month</p></div>
        <div style={{ padding: "16px 8px 8px" }}><ResponsiveContainer width="100%" height={190}><BarChart data={creatorData}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="week" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey="content" fill={T.accent} radius={[4,4,0,0]}/><Bar dataKey="brands" fill={T.purple} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
      </div>
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Creations</h3><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>Latest content and campaigns</p></div><button style={{ color: T.accent, fontSize: 13, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>View all <ChevronRight size={14}/></button></div>
      <div style={{ padding: "12px 0 8px" }}>{recentContent.map((item,i) => { const [hov, setHov] = useState(false); return <div key={item.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 24px", borderTop: i > 0 ? `1px solid ${T.border}` : "none", background: hov ? T.surfaceHover : "transparent", transition: "background 0.15s", cursor: "pointer" }}><div style={{ width: 40, height: 40, borderRadius: 10, background: T.accentMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div><div style={{ flex: 1, minWidth: 0 }}><p style={{ color: T.text, fontSize: 14, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>{item.type}</p></div><Badge color={item.status === "published" ? "green" : item.status === "draft" ? "muted" : "amber"}>{item.status}</Badge><span style={{ color: T.textMuted, fontSize: 12, width: 48, textAlign: "right", flexShrink: 0 }}>{item.date}</span></div>; })}</div>
    </div>
  </div>;
}

function CreatorStudioView() {
  const [prompt, setPrompt] = useState("");
  const [gen, setGen] = useState(false);
  const [done, setDone] = useState(false);
  const handleGen = () => { if (!prompt.trim()) return; setGen(true); setTimeout(() => { setGen(false); setDone(true); }, 1800); };
  return <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}><div style={{ background: T.purpleMuted, borderRadius: 10, padding: 8, display: "flex" }}><Wand2 size={18} color={T.purple}/></div><div><h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>AI Creative Console</h3><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>Describe what you need — brand kit, copy, visuals, or campaign</p></div></div>
      <div style={{ display: "flex", gap: 10 }}><input placeholder='e.g. "Brand kit for a premium streetwear label — dark, bold, editorial"' value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGen()} style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}/><button onClick={handleGen} disabled={gen || !prompt.trim()} style={{ background: gen ? T.accentMuted : T.accent, color: gen ? T.accent : "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", opacity: !prompt.trim() ? 0.5 : 1 }}>{gen ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }}/> Generating…</> : <><Sparkles size={14}/> Generate</>}</button></div>
      {done && <div style={{ marginTop: 16, padding: 16, background: T.greenMuted, border: `1px solid rgba(34,211,160,0.2)`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}><Check size={16} color={T.green}/><span style={{ color: T.green, fontSize: 13, fontWeight: 500 }}>Brand kit generated — saved to your library</span><button onClick={() => setDone(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.green }}><X size={14}/></button></div>}
    </div>
    <div><p style={{ color: T.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Creation Tools</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>{tools.map(tool => { const [hov, setHov] = useState(false); return <div key={tool.label} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? T.surfaceHover : T.surface, border: `1px solid ${hov ? T.borderHover : T.border}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: 14, alignItems: "flex-start" }}><div style={{ background: `${tool.color}20`, borderRadius: 10, padding: 10, display: "flex", flexShrink: 0 }}><tool.icon size={18} color={tool.color}/></div><div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{tool.label}</span>{tool.badge && <Badge color={tool.badge === "AI" ? "accent" : tool.badge === "New" ? "green" : "muted"}>{tool.badge}</Badge>}</div><p style={{ color: T.textMuted, fontSize: 12, margin: "4px 0 0", lineHeight: 1.5 }}>{tool.desc}</p></div></div>; })}</div>
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Brand Kit Library</h3><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>Saved brand identities</p></div><button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={14}/> New Kit</button></div>
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>{brandKits.map(kit => { const [hov, setHov] = useState(false); return <div key={kit.name} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: hov ? T.surfaceHover : T.bg, borderRadius: 12, cursor: "pointer", border: `1px solid ${hov ? T.border : "transparent"}`, transition: "all 0.15s" }}><div style={{ display: "flex", gap: 6 }}>{kit.colors.map((c,i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: c, border: "1px solid rgba(255,255,255,0.08)" }}/>)}</div><div style={{ flex: 1 }}><span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{kit.name}</span><p style={{ color: T.textMuted, fontSize: 11, margin: "2px 0 0" }}>{kit.font}</p></div><ChevronRight size={16} color={T.textMuted}/></div>; })}</div>
    </div>
  </div>;
}

function EcomHubView() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? products : products.filter(p => filter === "active" ? p.status === "active" : p.status === "out_of_stock");
  return <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      <Stat label="Gross Revenue" value="$29.3K" delta="12.1%" deltaDir="up" icon={DollarSign}/>
      <Stat label="Orders This Month" value="247" delta="9.4%" deltaDir="up" icon={ShoppingCart}/>
      <Stat label="Active Products" value="34" icon={Package}/>
      <Stat label="Storefront Views" value="18.4K" delta="22%" deltaDir="up" icon={Eye}/>
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16 }}>
      <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Product Catalog</h3><p style={{ color: T.textMuted, fontSize: 12, margin: "2px 0 0" }}>{products.length} products total</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all","active","out_of_stock"].map(f => <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? T.accentMuted : "transparent", border: `1px solid ${filter === f ? T.accent : T.border}`, borderRadius: 8, padding: "7px 14px", color: filter === f ? T.accent : T.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{f === "all" ? "All" : f === "active" ? "Active" : "Out of Stock"}</button>)}
          <button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={13}/> Add Product</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 60px 90px 60px", padding: "10px 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        {["Product","SKU","Price","Stock","Revenue","Status"].map((h,i) => <span key={i} style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</span>)}
      </div>
      {filtered.map((p,i) => { const [hov, setHov] = useState(false); return <div key={p.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 60px 90px 60px", padding: "14px 24px", borderTop: i > 0 ? `1px solid ${T.border}` : "none", background: hov ? T.surfaceHover : "transparent", transition: "background 0.15s", cursor: "pointer", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, background: T.accentMuted, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Package size={14} color={T.accent}/></div><span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{p.name}</span></div><span style={{ color: T.textMuted, fontSize: 12, fontFamily: "monospace" }}>{p.sku}</span><span style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>${p.price}</span><span style={{ color: p.stock === 0 ? T.red : p.stock === "∞" ? T.green : T.text, fontSize: 13, fontFamily: "monospace" }}>{p.stock}</span><span style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>${p.revenue.toLocaleString()}</span><Badge color={p.status === "active" ? "green" : "red"}>{p.status === "active" ? "Live" : "OOS"}</Badge></div>; })}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}><div style={{ display: "flex", gap: 14 }}><div style={{ background: T.greenMuted, borderRadius: 12, padding: 12, display: "flex", flexShrink: 0 }}><Globe size={20} color={T.green}/></div><div><h4 style={{ color: T.text, fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>Storefront Live</h4><p style={{ color: T.textMuted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.6 }}>flashfusion.store is active and serving traffic</p><div style={{ display: "flex", gap: 8 }}><Badge color="green">● Online</Badge><Badge color="muted">SSL Active</Badge></div></div></div></div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}><div style={{ display: "flex", gap: 14 }}><div style={{ background: T.amberMuted, borderRadius: 12, padding: 12, display: "flex", flexShrink: 0 }}><Rocket size={20} color={T.amber}/></div><div><h4 style={{ color: T.text, fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>Next Drop</h4><p style={{ color: T.textMuted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.6 }}>3 products scheduled — launching Mar 1</p><button style={{ background: T.amber, color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Manage Drop</button></div></div></div>
    </div>
  </div>;
}

const navItems = [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },{ id: "creator", icon: Palette, label: "Creator Studio" },{ id: "ecom", icon: ShoppingBag, label: "Ecom Hub" }];

export default function FlashFusion() {
  const [view, setView] = useState("dashboard");
  const [searchFocused, setSearchFocused] = useState(false);
  const titles = { dashboard: { title: "Dashboard", sub: "Welcome back — here's your overview" }, creator: { title: "Creator Studio", sub: "AI-powered brand kits, copy, and visuals" }, ecom: { title: "Ecom Hub", sub: "Products, storefronts, and revenue" } };
  return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#1C2236;border-radius:99px} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:#3D4566}`}</style>
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      {/* Sidebar */}
      <aside style={{ width: 216, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "0 0 24px" }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={16} color="#fff" fill="#fff"/></div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: T.text, letterSpacing: "-0.01em" }}>FlashFusion</span>
          </div>
        </div>
        <div style={{ padding: "14px 12px 10px" }}>
          <div style={{ background: T.accentMuted, borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, background: T.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>K</div>
            <div style={{ flex: 1, minWidth: 0 }}><p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: 0 }}>Kyle's Workspace</p><p style={{ color: T.textMuted, fontSize: 10, margin: 0 }}>Pro Plan</p></div>
            <ChevronDown size={12} color={T.textMuted}/>
          </div>
        </div>
        <nav style={{ padding: "6px 10px", flex: 1 }}>
          <p style={{ color: T.textDim, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 10px 8px" }}>Navigation</p>
          {navItems.map(({ id, icon: Icon, label }) => { const active = view === id; const [hov, setHov] = useState(false); return <button key={id} onClick={() => setView(id)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? T.accentMuted : hov ? T.surfaceHover : "transparent", color: active ? T.accent : hov ? T.text : T.textMuted, fontSize: 13, fontWeight: active ? 600 : 500, transition: "all 0.15s", marginBottom: 2, textAlign: "left" }}><Icon size={16}/>{label}</button>; })}
        </nav>
        <div style={{ padding: "0 12px" }}>
          <div style={{ background: `linear-gradient(135deg, ${T.accentMuted}, ${T.purpleMuted})`, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px" }}>
            <p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>Upgrade to Team</p>
            <p style={{ color: T.textMuted, fontSize: 11, margin: "0 0 10px", lineHeight: 1.5 }}>Shared brand kits and team collaboration</p>
            <button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 7, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", width: "100%" }}>Learn More</button>
          </div>
        </div>
      </aside>
      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0, background: T.surface }}>
          <div style={{ flex: 1 }}><h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: T.text, margin: 0, letterSpacing: "-0.01em" }}>{titles[view].title}</h1><p style={{ color: T.textMuted, fontSize: 12, margin: 0 }}>{titles[view].sub}</p></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bg, border: `1px solid ${searchFocused ? T.accent : T.border}`, borderRadius: 10, padding: "8px 14px", width: 240, transition: "border-color 0.15s" }}><Search size={14} color={T.textMuted}/><input placeholder="Search…" onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 13, flex: 1, fontFamily: "inherit" }}/><kbd style={{ color: T.textDim, fontSize: 10, background: T.surface, borderRadius: 4, padding: "2px 5px", border: `1px solid ${T.border}` }}>⌘K</kbd></div>
          <button style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: 9, cursor: "pointer", display: "flex", position: "relative" }}><Bell size={16} color={T.textMuted}/><div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, background: T.red, borderRadius: "50%", border: `1.5px solid ${T.surface}` }}/></button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>K</div>
        </header>
        <main style={{ flex: 1, overflow: "auto", padding: 28, animation: "fadeIn 0.25s ease-out" }} key={view}>
          {view === "dashboard" && <DashboardView/>}
          {view === "creator" && <CreatorStudioView/>}
          {view === "ecom" && <EcomHubView/>}
        </main>
      </div>
    </div>
  </>;
}