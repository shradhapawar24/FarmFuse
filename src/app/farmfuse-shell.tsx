"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CloudSun,
  Factory,
  Leaf,
  Menu,
  Package,
  Plus,
  Route,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";

type Role = "buyer" | "farmer";
type View = "overview" | "matching" | "pools" | "produce" | "prices" | "logistics" | "orders" | "insights" | "profile";
type Farmer = { id: string; name: string; location: string; crop: string; quantity: number; price: number; color: string };
type Pool = { id: string; crop: string; required: number; matched: number; farmers: number; createdAt: string };
type MatchedFarmer = Farmer & { contribution: number };

const farmers: Farmer[] = [
  { id: "a", name: "Arjun Patil", location: "Nashik, MH", crop: "Tomato", quantity: 150, price: 22, color: "#e77850" },
  { id: "b", name: "Meera Shinde", location: "Dhule, MH", crop: "Tomato", quantity: 200, price: 23, color: "#e8b84b" },
  { id: "c", name: "Suresh Jadhav", location: "Jalgaon, MH", crop: "Tomato", quantity: 300, price: 21, color: "#77a85d" },
  { id: "d", name: "Kavita More", location: "Nandurbar, MH", crop: "Tomato", quantity: 350, price: 24, color: "#77a7a1" },
];
const nav: { label: string; view: View; icon: typeof BarChart3; roles: Role[] }[] = [
  { label: "Overview", view: "overview", icon: BarChart3, roles: ["buyer", "farmer"] },
  { label: "AI matching", view: "matching", icon: Zap, roles: ["buyer", "farmer"] },
  { label: "Farm pools", view: "pools", icon: Users, roles: ["buyer", "farmer"] },
  { label: "My produce", view: "produce", icon: Package, roles: ["farmer"] },
  { label: "Price intelligence", view: "prices", icon: CircleDollarSign, roles: ["buyer"] },
  { label: "Smart logistics", view: "logistics", icon: Truck, roles: ["buyer"] },
  { label: "Order tracking", view: "orders", icon: ClipboardList, roles: ["buyer", "farmer"] },
  { label: "Market insights", view: "insights", icon: CloudSun, roles: ["buyer", "farmer"] },
];

function matchSupply(required: number) {
  let remaining = required;
  return farmers.flatMap((farmer) => {
    if (remaining <= 0) return [];
    const contribution = Math.min(remaining, farmer.quantity);
    remaining -= contribution;
    return [{ ...farmer, contribution }];
  });
}

export default function FarmFuseShell() {
  const [role, setRole] = useState<Role>("buyer");
  const [view, setView] = useState<View>("overview");
  const [quantity, setQuantity] = useState(1000);
  const [pools, setPools] = useState<Pool[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("farmfuse-pools");
    return saved ? JSON.parse(saved) : [];
  });
  const [showLogin, setShowLogin] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [produce, setProduce] = useState(farmers);

  const localSelection = useMemo(() => matchSupply(quantity), [quantity]);
  const [serverSelection, setServerSelection] = useState<MatchedFarmer[] | null>(null);
  const selection = serverSelection ?? localSelection;

  useEffect(() => {
    void fetch(`/api/matching?quantity=${quantity}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.selected) setServerSelection(data.selected); })
      .catch(() => undefined);
  }, [quantity]);
  const matched = selection.reduce((sum, item) => sum + item.contribution, 0);
  const remaining = Math.max(quantity - matched, 0);
  const fulfillment = quantity ? Math.round((matched / quantity) * 100) : 0;
  const averagePrice = matched ? selection.reduce((sum, item) => sum + item.contribution * item.price, 0) / matched : 0;

  async function createPool() {
    const pool = { id: `FP-${String(pools.length + 1001)}`, crop: "Tomato", required: quantity, matched, farmers: selection.length, createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) };
    try {
      const orderResponse = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ crop: "Tomato", quantity, maximumPrice: 32, deliveryLocation: "Dhule", deliveryDate: "2026-09-18" }) });
      if (!orderResponse.ok) throw new Error("order");
      const orderData = await orderResponse.json();
      const poolResponse = await fetch("/api/pools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity, matched, averagePrice, selected: selection, bulkOrderId: orderData.order?.id }) });
      if (!poolResponse.ok) throw new Error("pool");
    } catch {
      setToast("Saved in demo mode; connect DATABASE_URL for hosted persistence");
    }
    const next = [pool, ...pools];
    setPools(next);
    window.localStorage.setItem("farmfuse-pools", JSON.stringify(next));
    setToast(`${pool.id} created with ${selection.length} participating farmers`);
    setView("pools");
  }

  async function addProduce() {
    const next = { id: `new-${Date.now()}`, name: "Your new listing", location: "Your farm", crop: "Tomato", quantity: 100, price: 25, color: "#9aa89a" };
    try {
      const response = await fetch("/api/produce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ crop: next.crop, quantity: next.quantity, price: next.price }) });
      const data = await response.json();
      if (data.produce?.id) next.id = data.produce.id;
    } catch { setToast("Saved in demo mode; connect DATABASE_URL for hosted persistence"); }
    setProduce([...produce, next]);
    setToast("Produce listing added");
  }

  async function removeProduce(id: string) {
    setProduce(produce.filter((item) => item.id !== id));
    try { await fetch(`/api/produce?id=${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { setToast("Removed locally in demo mode"); }
  }

  const activeNav = nav.filter((item) => item.roles.includes(role));

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Sprout size={19} /></div><span>farm<span>fuse</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="role-switcher">
          <button className={role === "buyer" ? "active" : ""} onClick={() => { setRole("buyer"); setView("overview"); }}>Buyer</button>
          <button className={role === "farmer" ? "active" : ""} onClick={() => { setRole("farmer"); setView("overview"); }}>Farmer</button>
        </div>
        <nav className="sidebar-nav">{activeNav.map((item) => { const Icon = item.icon; return <button key={item.view} className={view === item.view ? "selected" : ""} onClick={() => { setView(item.view); setMobileNav(false); }}><Icon size={17} /><span>{item.label}</span>{view === item.view && <ChevronRight size={14} className="nav-arrow" />}</button>; })}</nav>
        <div className="sidebar-spacer" />
        <button className="sidebar-link" onClick={() => setView("profile")}><Settings size={17} /> Profile & settings</button>
        <div className="account-chip"><div className="avatar">{role === "buyer" ? "NK" : "AP"}</div><div><strong>{role === "buyer" ? "Narmada Foods" : "Arjun Patil"}</strong><small>{role === "buyer" ? "Verified buyer" : "Verified farmer"}</small></div><ChevronRight size={15} /></div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
      <main className="main-content">
        <header className="topbar"><button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="crumb"><span>Workspace</span><ChevronRight size={14} /><strong>{nav.find((item) => item.view === view)?.label ?? "Profile"}</strong></div><div className="top-actions"><span className="live-dot"><i /> Demo environment</span><button className="quiet-button" onClick={() => setShowLogin(true)}>Sign in</button><button className="icon-button" aria-label="Notifications" onClick={() => setToast("You have 3 new notifications")}><Bell size={18} /><b>3</b></button><button className="top-avatar" onClick={() => setView("profile")}>{role === "buyer" ? "NK" : "AP"}</button></div></header>
        <div className="page-wrap">
          {view === "overview" && <Overview role={role} matched={matched} fulfillment={fulfillment} pools={pools} onMatch={() => setView("matching")} onViewPools={() => setView("pools")} />}
          {view === "matching" && <Matching quantity={quantity} setQuantity={setQuantity} selection={selection} matched={matched} remaining={remaining} fulfillment={fulfillment} averagePrice={averagePrice} onCreatePool={createPool} />}
          {view === "pools" && <Pools pools={pools} onMatch={() => setView("matching")} />}
          {view === "produce" && <Produce produce={produce} onAdd={addProduce} onDelete={removeProduce} />}
          {view === "prices" && <Prices />}
          {view === "logistics" && <Logistics matched={matched} farmers={selection.length} />}
          {view === "orders" && <Orders fulfillment={fulfillment} />}
          {view === "insights" && <Insights />}
          {view === "profile" && <Profile role={role} />}
        </div>
      </main>
      {toast && <div className="toast"><Check size={16} /> {toast}<button onClick={() => setToast("")} aria-label="Dismiss"><X size={15} /></button></div>}
      {showLogin && <div className="modal-scrim" onClick={() => setShowLogin(false)}><div className="login-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowLogin(false)}><X size={18} /></button><div className="brand modal-brand"><div className="brand-mark"><Sprout size={19} /></div><span>farm<span>fuse</span></span></div><h2>Welcome back</h2><p>Sign in to your FarmFuse workspace.</p><input placeholder="Email address" defaultValue={role === "buyer" ? "buyer@farmfuse.demo" : "farmer@farmfuse.demo"} /><input placeholder="Password" type="password" defaultValue="FarmFuse123" /><button className="primary-button full" onClick={async () => { const email = role === "buyer" ? "buyer@farmfuse.demo" : "farmer@farmfuse.demo"; const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "FarmFuse123" }) }); setShowLogin(false); setToast(response.ok ? "Signed in to demo workspace" : "Unable to sign in"); }}>Sign in <ArrowRight size={16} /></button><small>Demo credentials are prefilled for your presentation.</small></div></div>}
    </div>
  );
}

function PageIntro({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) { return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div>{action}</div>; }
function Stat({ label, value, detail, tone = "green", icon: Icon }: { label: string; value: string; detail: string; tone?: string; icon: typeof BarChart3 }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18} /></div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>; }
function Overview({ role, matched, fulfillment, pools, onMatch, onViewPools }: { role: Role; matched: number; fulfillment: number; pools: Pool[]; onMatch: () => void; onViewPools: () => void }) { return <><PageIntro eyebrow="Good morning, {role === 'buyer' ? 'Narmada Foods' : 'Arjun'}" title={role === "buyer" ? "Turn demand into momentum." : "Your harvest has a bigger market."} text={role === "buyer" ? "Coordinate the right supply, at the right price, from a single workspace." : "See where your produce can join a larger, better-paying order."} action={<button className="primary-button" onClick={onMatch}><Zap size={16} /> Run AI matching</button>} /><div className="stat-grid"><Stat label={role === "buyer" ? "Active orders" : "Available produce"} value={role === "buyer" ? "04" : "700 kg"} detail={role === "buyer" ? "+2 this month" : "Across 3 crops"} icon={role === "buyer" ? ShoppingCart : Package} /><Stat label="Farm pool participation" value={pools.length ? String(pools.length).padStart(2, "0") : "01"} detail="100% fulfilled" tone="amber" icon={Users} /><Stat label={role === "buyer" ? "Estimated savings" : "Expected earnings"} value={role === "buyer" ? "₹8,420" : "₹18,900"} detail="vs. spot market" tone="blue" icon={CircleDollarSign} /><Stat label="Fulfillment rate" value={`${fulfillment || 100}%`} detail="Last 30 days" tone="coral" icon={ShieldCheck} /></div><div className="dashboard-grid"><div className="feature-panel match-panel"><div className="panel-heading"><div><span className="eyebrow">Hero workflow</span><h2>Tomato order is ready to pool</h2></div><span className="status-pill success"><i /> Matching available</span></div><div className="order-summary"><div className="crop-orb">🍅</div><div><strong>BO-1001 · Tomato</strong><span>Dhule delivery hub · 18 Sep 2026</span></div><div className="summary-quantity"><strong>1,000 kg</strong><span>required quantity</span></div></div><div className="progress-meta"><span>Supply coverage</span><strong>{matched || 1000} / 1,000 kg</strong></div><div className="progress-track"><i style={{ width: `${Math.min(fulfillment || 100, 100)}%` }} /></div><button className="text-button" onClick={onMatch}>Open matching workspace <ArrowRight size={15} /></button></div><div className="side-panel"><div className="panel-heading"><h3>Recent activity</h3><button className="quiet-button" onClick={onViewPools}>View all</button></div><Activity icon={<Check size={15} />} color="green" title="Pool FP-1001 fulfilled" detail="4 farmers · just now" /><Activity icon={<Truck size={15} />} color="amber" title="Collection hub confirmed" detail="Dhule Hub · today" /><Activity icon={<CircleDollarSign size={15} />} color="blue" title="Price insight refreshed" detail="Tomato · 2h ago" /></div></div><div className="section-heading"><div><span className="eyebrow">Make it tangible</span><h2>How FarmFuse brings it together</h2></div><span className="muted-label">Illustrative demo workflow</span></div><div className="flow-strip"><FlowStep number="01" icon={<ShoppingCart size={19} />} title="Buyer demand" text="Create one clear bulk requirement" /><div className="flow-line" /><FlowStep number="02" icon={<Zap size={19} />} title="AI matching" text="Find the best supply combination" /><div className="flow-line" /><FlowStep number="03" icon={<Boxes size={19} />} title="FarmFuse Pool" text="Coordinate contributions together" /><div className="flow-line" /><FlowStep number="04" icon={<Factory size={19} />} title="Consolidate" text="One shipment, direct to buyer" /></div></> }
function Activity({ icon, color, title, detail }: { icon: React.ReactNode; color: string; title: string; detail: string }) { return <div className="activity"><span className={`activity-icon ${color}`}>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><ChevronRight size={14} /></div> }
function FlowStep({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) { return <div className="flow-step"><span className="step-number">{number}</span><div className="flow-icon">{icon}</div><strong>{title}</strong><span>{text}</span></div> }
function Matching({ quantity, setQuantity, selection, matched, remaining, fulfillment, averagePrice, onCreatePool }: { quantity: number; setQuantity: (value: number) => void; selection: (Farmer & { contribution: number })[]; matched: number; remaining: number; fulfillment: number; averagePrice: number; onCreatePool: () => void }) { return <><PageIntro eyebrow="AI-assisted optimization prototype" title="Build a stronger supply chain." text="Transparent matching that shows exactly how every farmer contributes to a buyer's requirement." action={<div className="demo-badge"><span>Prototype</span> Rule-based optimization</div>} /><div className="matching-layout"><div className="matching-main"><div className="requirement-card"><div className="requirement-top"><div><span className="eyebrow">Buyer requirement</span><h2><span>🍅</span> Tomato</h2><p>Delivery to Dhule collection hub · 18 Sep 2026</p></div><div className="quantity-editor"><label>Required quantity</label><div><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /><b>kg</b></div><small>Try 500, 750 or 1,200 kg</small></div></div><div className="requirement-metrics"><div><span>Matched</span><strong>{matched.toLocaleString()} kg</strong></div><div><span>Remaining</span><strong className={remaining ? "warn-text" : ""}>{remaining.toLocaleString()} kg</strong></div><div><span>Fulfillment</span><strong className="green-text">{fulfillment}%</strong></div><div><span>Avg. farmer price</span><strong>₹{averagePrice.toFixed(2)}<small>/kg</small></strong></div></div></div><div className="matching-header"><div><span className="eyebrow">Supply candidates</span><h2>Selected farmers</h2></div><span className="candidate-count">{selection.length} candidates selected</span></div><div className="farmer-list">{selection.map((farmer, index) => <div className="farmer-row" key={farmer.id}><div className="farmer-index">0{index + 1}</div><div className="farmer-avatar" style={{ background: farmer.color }}>{farmer.name.split(" ").map((part) => part[0]).join("")}</div><div className="farmer-info"><strong>{farmer.name}</strong><span>{farmer.location} · {farmer.crop}</span></div><div className="contribution"><strong>{farmer.contribution} kg</strong><span>contribution</span></div><div className="price"><strong>₹{farmer.price}</strong><span>/ kg</span></div><div className="row-check"><Check size={15} /></div></div>)}{!selection.length && <div className="empty-state">No compatible supply found for this crop.</div>}</div><div className="matching-explanation"><div className="explain-icon"><Zap size={17} /></div><div><strong>Why these farmers?</strong><p>The prototype prioritizes crop compatibility, then selects available quantities in ascending price order until the requirement is met. This keeps the result explainable and fair.</p></div></div>{matched >= quantity && <button className="primary-button pool-button" onClick={onCreatePool}><Users size={17} /> Create Farm Pool <ArrowRight size={16} /></button>}</div><aside className="matching-aside"><div className="aside-card visual-pool"><div className="eyebrow">Live pool preview</div><div className="pool-visual"><div className="node-stack">{selection.map((farmer) => <span key={farmer.id} style={{ background: farmer.color }}>{farmer.name.charAt(0)}</span>)}</div><div className="pool-connector" /><div className="pool-destination"><div><Boxes size={22} /></div><strong>FarmFuse<br />Pool</strong></div><div className="pool-connector" /><div className="buyer-node"><ShoppingCart size={19} /><span>Bulk buyer</span></div></div><div className="pool-result"><strong>{matched.toLocaleString()} kg</strong><span>{fulfillment}% fulfilled</span></div></div><div className="aside-card checklist"><div className="panel-heading"><h3>Matching signals</h3><ShieldCheck size={18} /></div><Signal label="Crop compatibility" value="100%" /><Signal label="Price within limit" value="Yes" /><Signal label="Location suitability" value="High" /><Signal label="Supply sufficiency" value={remaining ? "Shortfall" : "Complete"} warning={Boolean(remaining)} /></div></aside></div></> }
function Signal({ label, value, warning }: { label: string; value: string; warning?: boolean }) { return <div className="signal"><span>{label}</span><strong className={warning ? "warn-text" : "green-text"}>{!warning && <Check size={13} />}{value}</strong></div> }
function Pools({ pools, onMatch }: { pools: Pool[]; onMatch: () => void }) { const allPools = pools.length ? pools : [{ id: "FP-1001", crop: "Tomato", required: 1000, matched: 1000, farmers: 4, createdAt: "Today" }]; return <><PageIntro eyebrow="Shared supply, stronger outcomes" title="Farm Pools" text="A transparent view of farmers coordinated around one buyer requirement." action={<button className="primary-button" onClick={onMatch}><Plus size={16} /> New pool</button>} /><div className="pool-hero"><div><span className="eyebrow">Active pool · {allPools[0].id}</span><h2>🍅 Tomato · Dhule collection</h2><p>Direct fulfillment for Narmada Foods</p></div><div className="pool-hero-stat"><strong>{allPools[0].matched.toLocaleString()} kg</strong><span>{Math.round(allPools[0].matched / allPools[0].required * 100)}% fulfilled</span></div></div><div className="pool-table"><div className="table-head"><span>Pool</span><span>Crop & requirement</span><span>Farmers</span><span>Status</span><span>Created</span></div>{allPools.map((pool) => <div className="table-row" key={pool.id}><strong>{pool.id}</strong><span><b>{pool.crop}</b><small>{pool.required.toLocaleString()} kg required</small></span><span className="people-stack"><i>AP</i><i>MS</i><i>SJ</i><i>+{Math.max(pool.farmers - 3, 1)}</i></span><span className="status-pill success"><i /> {pool.matched >= pool.required ? "Fulfilled" : "In progress"}</span><span className="muted-label">{pool.createdAt}</span></div>)}</div><div className="pool-flow-large"><div className="section-heading"><div><span className="eyebrow">Coordination view</span><h2>One pool. Four farms. One delivery.</h2></div></div><div className="large-flow"><div className="source-column"><span>Participating farmers</span>{["Arjun Patil · 150 kg", "Meera Shinde · 200 kg", "Suresh Jadhav · 300 kg", "Kavita More · 350 kg"].map((name) => <div key={name}><Sprout size={15} />{name}</div>)}</div><ArrowRight className="large-arrow" /><div className="pool-core"><Boxes size={27} /><strong>FarmFuse Pool</strong><span>1,000 kg consolidated</span></div><ArrowRight className="large-arrow" /><div className="buyer-core"><ShoppingCart size={22} /><strong>Narmada Foods</strong><span>Bulk buyer · Dhule</span></div></div></div></> }
function Produce({ produce, onAdd, onDelete }: { produce: Farmer[]; onAdd: () => void; onDelete: (id: string) => void }) { return <><PageIntro eyebrow="Your supply ledger" title="My produce" text="Keep available quantities and asking prices current so buyers can match with confidence." action={<button className="primary-button" onClick={onAdd}><Plus size={16} /> Add produce</button>} /><div className="stat-grid three"><Stat label="Available supply" value="700 kg" detail="Across 3 crop types" icon={Package} /><Stat label="Active listings" value={String(produce.length).padStart(2, "0")} detail="Visible to buyers" tone="amber" icon={Leaf} /><Stat label="Average asking price" value="₹22.80" detail="Per kilogram" tone="blue" icon={CircleDollarSign} /></div><div className="produce-list"><div className="table-head"><span>Produce</span><span>Available</span><span>Asking price</span><span>Location</span><span>Action</span></div>{produce.map((item) => <div className="table-row" key={item.id}><span className="produce-name"><span style={{ background: item.color }}>{item.crop.slice(0, 1)}</span><b>{item.crop}</b></span><strong>{item.quantity} kg</strong><strong>₹{item.price}<small>/kg</small></strong><span className="muted-label">{item.location}</span><button className="delete-button" onClick={() => onDelete(item.id)} aria-label={`Remove ${item.crop}`}><X size={15} /></button></div>)}</div></> }
function Prices() { return <><PageIntro eyebrow="Know your value" title="Price intelligence" text="A calm reference point for negotiating fair, direct trade." /><div className="notice"><ShieldCheck size={17} /><span>Illustrative demo data · not live market price</span></div><div className="price-grid"><div className="price-card accent"><span>Reference market price</span><strong>₹28–₹32<span>/kg</span></strong><small>Indicative regional range</small><div className="range-bar"><i /></div></div><div className="price-card"><span>Suggested buying range</span><strong>₹29–₹31<span>/kg</span></strong><small>Balanced for both sides</small><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="price-card"><span>Estimated buyer savings</span><strong>₹8,420</strong><small>On this 1,000 kg order</small><div className="savings-line"><ArrowRight size={15} /> 9.4% below spot</div></div></div><div className="chart-panel"><div className="panel-heading"><div><span className="eyebrow">Tomato · last 30 days</span><h2>Price movement</h2></div><span className="status-pill neutral">Demo trend</span></div><div className="chart"><div className="chart-y"><span>₹34</span><span>₹30</span><span>₹26</span><span>₹22</span></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Illustrative tomato price trend"><path className="chart-fill" d="M0 160 C70 150 80 100 145 120 S220 150 275 92 S345 115 400 82 S480 40 530 68 S620 72 700 30 V220 H0 Z" /><path className="chart-line" d="M0 160 C70 150 80 100 145 120 S220 150 275 92 S345 115 400 82 S480 40 530 68 S620 72 700 30" /></svg></div></div></> }
function Logistics({ matched, farmers: farmerCount }: { matched: number; farmers: number }) { return <><PageIntro eyebrow="From farms to one truck" title="Smart logistics" text="A coordinated movement plan that keeps the last mile visible to everyone." action={<span className="status-pill success"><i /> Simulation active</span>} /><div className="logistics-stats"><Stat label="Participating farmers" value={String(farmerCount || 4)} detail="Across 4 locations" icon={Users} /><Stat label="Consolidated quantity" value={`${matched || 1000} kg`} detail="Ready for collection" tone="amber" icon={Boxes} /><Stat label="Collection hub" value="Dhule Hub" detail="12 km from buyer" tone="blue" icon={Factory} /></div><div className="logistics-flow"><LogisticNode icon={<Sprout size={23} />} title="Multiple farmers" detail="4 pickup points" /><div className="route-line"><i /><span>Pickup route</span></div><LogisticNode icon={<Factory size={23} />} title="Collection hub" detail="Dhule Agro Hub" active /><div className="route-line"><i /><span>Consolidate</span></div><LogisticNode icon={<Truck size={23} />} title="Bulk shipment" detail="1 vehicle · 1,000 kg" /><div className="route-line"><i /><span>Direct delivery</span></div><LogisticNode icon={<ShoppingCart size={23} />} title="Buyer" detail="Narmada Foods" /></div><div className="notice muted-notice"><Route size={17} /><span>Logistics information is simulated for the demo. No real-time GPS data is being claimed.</span></div></> }
function LogisticNode({ icon, title, detail, active }: { icon: React.ReactNode; title: string; detail: string; active?: boolean }) { return <div className={`logistic-node ${active ? "active" : ""}`}><div>{icon}</div><strong>{title}</strong><span>{detail}</span></div> }
function Orders({ fulfillment }: { fulfillment: number }) { return <><PageIntro eyebrow="Follow every handoff" title="Order tracking" text="One shared timeline from buyer request to completed delivery." /><div className="order-heading"><div><span className="eyebrow">BO-1001</span><h2>🍅 Tomato bulk order</h2><p>Narmada Foods · 1,000 kg · Dhule, Maharashtra</p></div><span className="status-pill success"><i /> In progress</span></div><div className="timeline">{["Order created", "Farmers matched", "Farm pool created", "Produce collection", "Bulk consolidation", "Dispatch", "Buyer delivery", "Completed"].map((step, index) => <div className={`timeline-step ${index < 4 ? "done" : index === 4 ? "current" : ""}`} key={step}><div className="timeline-dot">{index < 4 ? <Check size={13} /> : index + 1}</div><strong>{step}</strong><span>{index < 4 ? "10 Sep 2026" : index === 4 ? "Next · 12 Sep" : "Pending"}</span></div>)}</div><div className="order-bottom"><div><span className="eyebrow">Current progress</span><strong>{fulfillment || 100}% <small>ready for consolidation</small></strong></div><div className="progress-track"><i style={{ width: `${fulfillment || 100}%` }} /></div></div></> }
function Insights() { return <><PageIntro eyebrow="Signals for your next move" title="Market insights" text="Illustrative demand patterns to help plan what you grow and buy." /><div className="notice"><CloudSun size={17} /><span>Illustrative demo data · connect a verified market feed before production decisions</span></div><div className="insight-grid"><InsightCard crop="Tomato" color="#e77850" value="+18%" text="Demand rising" points="12,70 60,60 110,64 160,35 210,48 260,21 310,31" /><InsightCard crop="Potato" color="#c89d68" value="+9%" text="Stable demand" points="12,58 60,51 110,55 160,44 210,48 260,40 310,35" /><InsightCard crop="Onion" color="#77a7a1" value="-4%" text="Watch supply" points="12,25 60,40 110,35 160,51 210,47 260,64 310,59" /></div><div className="insight-table"><div className="panel-heading"><div><span className="eyebrow">Planning signals</span><h2>Crop pulse</h2></div></div>{[["Tomato", "High", "18–22 days", "₹29–₹31/kg"], ["Potato", "Steady", "30–45 days", "₹20–₹24/kg"], ["Onion", "Moderate", "15–25 days", "₹24–₹28/kg"]].map((row) => <div className="pulse-row" key={row[0]}><strong>{row[0]}</strong><span className="pulse-high">{row[1]}</span><span>{row[2]} harvest window</span><b>{row[3]}</b></div>)}</div></> }
function InsightCard({ crop, color, value, text, points }: { crop: string; color: string; value: string; text: string; points: string }) { return <div className="insight-card"><div className="insight-title"><span style={{ background: color }}>{crop.slice(0, 1)}</span><strong>{crop}</strong><span className="insight-change">{value}</span></div><svg viewBox="0 0 320 90" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg><small>{text} over the last 30 days</small></div> }
function Profile({ role }: { role: Role }) { return <><PageIntro eyebrow="Your account" title="Profile & settings" text="Manage the details that make coordination smoother." /><div className="profile-grid"><div className="profile-card"><div className="profile-cover" /><div className="profile-main"><div className="profile-avatar">{role === "buyer" ? "NK" : "AP"}</div><h2>{role === "buyer" ? "Narmada Foods" : "Arjun Patil"}</h2><p>{role === "buyer" ? "Bulk buyer · Dhule, Maharashtra" : "Farmer · Nashik, Maharashtra"}</p><span className="status-pill success"><i /> Verified account</span></div></div><div className="settings-card"><div className="panel-heading"><h2>Notifications</h2><Bell size={18} /></div><div className="setting-row"><div><strong>Pool activity</strong><span>Updates when contributions are matched</span></div><div className="toggle on"><i /></div></div><div className="setting-row"><div><strong>Price insights</strong><span>Weekly crop and market summaries</span></div><div className="toggle on"><i /></div></div><div className="setting-row"><div><strong>Logistics updates</strong><span>Collection and dispatch milestones</span></div><div className="toggle"><i /></div></div></div></div></> }
