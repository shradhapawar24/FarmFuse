"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Globe2,
  Leaf,
  LogIn,
  MapPin,
  Menu,
  Package,
  Pause,
  Pencil,
  Plus,
  Search,
  ShoppingBasket,
  Sprout,
  Trash2,
  Truck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";

type Role = "farmer" | "buyer";
type Language = "en" | "hi" | "mr";
type View = "home" | "market" | "sell" | "orders" | "track" | "intelligence";
type Listing = {
  id: string;
  crop: string;
  quantity: number;
  price: number;
  location: string;
  farmer: string;
  ready: string;
  available: boolean;
};
type RequirementItem = { crop: string; quantity: number };
type FarmOrder = {
  id: string;
  trackingId: string;
  items: RequirementItem[];
  farmers: string[];
  total: number;
  status: number;
  date: string;
};
type CartItem = { listing: Listing; quantity: number };

const crops = [
  "Tomato",
  "Potato",
  "Onion",
  "Carrot",
  "Cabbage",
  "Cauliflower",
  "Brinjal",
  "Okra",
  "Capsicum",
  "Green Chilli",
  "Peas",
  "Spinach",
  "Cucumber",
  "Pumpkin",
  "Coriander",
  "Garlic",
  "Ginger",
  "Beetroot",
  "Radish",
];
const cropIcons: Record<string, string> = {
  Tomato: "🍅",
  Potato: "🥔",
  Onion: "🧅",
  Carrot: "🥕",
  Cabbage: "🥬",
  Cauliflower: "🥦",
  Brinjal: "🍆",
  Okra: "🫛",
  Capsicum: "🫑",
  "Green Chilli": "🌶️",
  Peas: "🫛",
  Spinach: "🌿",
  Cucumber: "🥒",
  Pumpkin: "🎃",
  Coriander: "🌿",
  Garlic: "🧄",
  Ginger: "🫚",
  Beetroot: "🫒",
  Radish: "🥕",
};
const seedListings: Listing[] = [
  {
    id: "seed-1",
    crop: "Tomato",
    quantity: 4200,
    price: 24,
    location: "Nashik, Maharashtra",
    farmer: "Arjun Patil",
    ready: "Today",
    available: true,
  },
  {
    id: "seed-2",
    crop: "Potato",
    quantity: 5100,
    price: 22,
    location: "Dhule, Maharashtra",
    farmer: "Meera Shinde",
    ready: "18 Sep",
    available: true,
  },
  {
    id: "seed-3",
    crop: "Onion",
    quantity: 3900,
    price: 26,
    location: "Jalgaon, Maharashtra",
    farmer: "Suresh Jadhav",
    ready: "19 Sep",
    available: true,
  },
  {
    id: "seed-4",
    crop: "Carrot",
    quantity: 2400,
    price: 30,
    location: "Nandurbar, Maharashtra",
    farmer: "Kavita More",
    ready: "Tomorrow",
    available: true,
  },
  {
    id: "seed-5",
    crop: "Cabbage",
    quantity: 1800,
    price: 20,
    location: "Pune, Maharashtra",
    farmer: "Rohan Deshmukh",
    ready: "20 Sep",
    available: true,
  },
  {
    id: "seed-6",
    crop: "Cauliflower",
    quantity: 2600,
    price: 29,
    location: "Aurangabad, Maharashtra",
    farmer: "Priya Raut",
    ready: "21 Sep",
    available: true,
  },
];
const copy = {
  en: {
    home: "Home",
    market: "Buy Produce",
    sell: "Sell Produce",
    intelligence: "Intelligence",
    login: "Login / Profile",
    hero: "Sell Direct. Buy Direct. Grow Together.",
    heroText:
      "FarmFuse connects farmers and FPOs directly with consumers and bulk buyers, then quietly handles matching, collection and logistics behind the scenes.",
    sellNow: "I have vegetables to sell",
    buyNow: "I want to buy vegetables",
    publish: "Publish for buyers",
    stock: "Your farm today",
    buying: "Your buying space",
    add: "Add produce",
    orders: "Orders",
    match: "Find farmers",
    pool: "Create Farm Pool",
    search: "Search vegetables, farms or locations",
    direct: "A shorter route from field to table",
  },
  hi: {
    home: "होम",
    market: "उपज खरीदें",
    sell: "उपज बेचें",
    intelligence: "बुद्धिमत्ता",
    login: "लॉगिन / प्रोफ़ाइल",
    hero: "सीधे बेचें। सीधे खरीदें। साथ बढ़ें।",
    heroText:
      "FarmFuse किसानों और FPO को उपभोक्ताओं व थोक खरीदारों से जोड़ता है और मिलान, संग्रह व लॉजिस्टिक्स को आसान बनाता है।",
    sellNow: "मेरे पास सब्ज़ियां हैं",
    buyNow: "मुझे सब्ज़ियां खरीदनी हैं",
    publish: "खरीदारों के लिए प्रकाशित करें",
    stock: "आज का आपका खेत",
    buying: "आपकी खरीदारी",
    add: "उपज जोड़ें",
    orders: "ऑर्डर",
    match: "किसान खोजें",
    pool: "Farm Pool बनाएं",
    search: "सब्ज़ी, खेत या जगह खोजें",
    direct: "खेत से थाली तक छोटा रास्ता",
  },
  mr: {
    home: "मुख्यपृष्ठ",
    market: "माल खरेदी",
    sell: "माल विक्री",
    intelligence: "हुशारी",
    login: "लॉगिन / प्रोफाइल",
    hero: "थेट विका. थेट खरेदी करा. एकत्र वाढा.",
    heroText:
      "FarmFuse शेतकरी आणि FPO यांना ग्राहक व मोठ्या खरेदीदारांशी जोडते. जुळवणी, संकलन आणि वाहतूक सोपी होते.",
    sellNow: "माझ्याकडे भाजीपाला आहे",
    buyNow: "मला भाजीपाला खरेदी करायचा आहे",
    publish: "खरेदीदारांसाठी प्रकाशित करा",
    stock: "आजचे तुमचे शेत",
    buying: "तुमची खरेदी",
    add: "माल जोडा",
    orders: "ऑर्डर",
    match: "शेतकरी शोधा",
    pool: "Farm Pool तयार करा",
    search: "भाजी, शेत किंवा ठिकाण शोधा",
    direct: "शेतापासून ताटापर्यंत छोटा मार्ग",
  },
};

type Copy = typeof copy.en;
export default function FarmFuseShell() {
  const [language, setLanguage] = useState<Language>("en");
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState("");
  const [view, setView] = useState<View>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      return typeof window === "undefined"
        ? seedListings
        : JSON.parse(
            localStorage.getItem("farmfuse-listings") ||
              JSON.stringify(seedListings),
          );
    } catch {
      return seedListings;
    }
  });
  const [orders, setOrders] = useState<FarmOrder[]>(() => {
    try {
      return typeof window === "undefined"
        ? []
        : JSON.parse(localStorage.getItem("farmfuse-orders") || "[]");
    } catch {
      return [];
    }
  });
  const [requirement, setRequirement] = useState<RequirementItem[]>([
    { crop: "Tomato", quantity: 100 },
    { crop: "Potato", quantity: 200 },
    { crop: "Onion", quantity: 150 },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTracking, setSelectedTracking] = useState("");
  const t = copy[language];
  useEffect(() => {
    localStorage.setItem("farmfuse-listings", JSON.stringify(listings));
  }, [listings]);
  useEffect(() => {
    localStorage.setItem("farmfuse-orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const visibleListings = useMemo(
    () =>
      listings.filter(
        (item) =>
          item.available &&
          `${item.crop} ${item.location} ${item.farmer}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [listings, search],
  );
  const activeOrder =
    orders.find((item) => item.trackingId === selectedTracking) || orders[0];
  function navigate(next: View) {
    setView(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goBack() {
    if (view === "track") navigate("orders");
    else navigate("home");
  }
  function addOrder(items = requirement) {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    const farmers = visibleListings
      .filter((listing) => items.some((item) => item.crop === listing.crop))
      .slice(0, 4)
      .map((item) => item.farmer);
    const order = {
      id: `order-${Date.now()}`,
      trackingId: `FF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      items,
      farmers,
      total,
      status: 2,
      date: new Date().toISOString(),
    };
    setOrders((current) => [order, ...current]);
    setSelectedTracking(order.trackingId);
    setToast(`Order placed. Tracking ID ${order.trackingId}`);
    navigate("track");
  }
  if (!role)
    return (
      <>
        <Landing
          t={t}
          language={language}
          setLanguage={setLanguage}
          onAuth={(mode) => {
            setAuthMode(mode);
            setAuthOpen(true);
          }}
          onMarketplace={() => {
            setAuthMode("login");
            setAuthOpen(true);
          }}
        />
        {authOpen && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthOpen(false)}
            onSuccess={(nextRole, name) => {
              setRole(nextRole);
              setUserName(name);
              setAuthOpen(false);
              navigate(nextRole === "farmer" ? "sell" : "market");
            }}
          />
        )}
      </>
    );
  return (
    <div className="site-shell">
      <header className="navbar">
        <button className="brand" onClick={() => navigate("home")}>
          <span className="brand-icon">
            <Sprout size={18} />
          </span>
          <span>
            farm<span>fuse</span>
          </span>
        </button>
        <button
          className="mobile-menu"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu />
        </button>
        <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
          <button onClick={() => navigate("home")}>{t.home}</button>
          {role === "buyer" && (
            <button onClick={() => navigate("market")}>{t.market}</button>
          )}
          {role === "farmer" && (
            <>
              <button onClick={() => navigate("sell")}>{t.sell}</button>
              <button onClick={() => navigate("intelligence")}>{t.intelligence}</button>
            </>
          )}
          <button onClick={() => navigate("orders")}>
            {role === "farmer" ? "Farmer orders" : t.orders}
          </button>
        </nav>
        <div className="nav-actions">
          <label className="language">
            <Globe2 size={15} />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </label>
          {role === "buyer" && (
            <button className="cart-button" onClick={() => navigate("market")}>
              Cart <b>{cart.length}</b>
            </button>
          )}
          <button
            className="profile-button"
            onClick={() => {
              setRole(null);
              setUserName("");
              setView("home");
            }}
          >
            <CircleUserRound size={17} /> {userName || "Profile"}
          </button>
        </div>
      </header>
      <main>
        {view !== "home" && (
          <button className="back-button" onClick={goBack}>
            <ArrowRight size={15} /> Back
          </button>
        )}
        {view === "home" && <Home t={t} role={role} onNavigate={navigate} />}{" "}
        {view === "market" && role === "buyer" && (
          <Marketplace
            t={t}
            listings={visibleListings}
            search={search}
            setSearch={setSearch}
            cart={cart}
            onAddCart={(listing) => {
              setCart((items) =>
                items.some((item) => item.listing.id === listing.id)
                  ? items.map((item) =>
                      item.listing.id === listing.id
                        ? { ...item, quantity: item.quantity + 50 }
                        : item,
                    )
                  : [...items, { listing, quantity: 50 }],
              );
              setToast(`${listing.crop} added to cart.`);
            }}
            onCheckout={() => {
              addOrder(
                cart.map((item) => ({
                  crop: item.listing.crop,
                  quantity: item.quantity,
                })),
              );
              setCart([]);
            }}
            onBulk={(crop) => {
              setRequirement((items) =>
                items.some((item) => item.crop === crop)
                  ? items
                  : [...items, { crop, quantity: 100 }],
              );
              navigate("orders");
            }}
          />
        )}{" "}
        {view === "sell" && role === "farmer" && (
          <Sell
            t={t}
            listings={listings}
            setListings={setListings}
            setToast={setToast}
            onOrders={() => navigate("orders")}
          />
        )}{" "}
        {view === "orders" && (
          <Orders
            t={t}
            role={role}
            requirement={requirement}
            setRequirement={setRequirement}
            onMatch={() => setToast("Smart matching found 4 suitable farmers.")}
            onPool={() => addOrder()}
          />
        )}{" "}
        {view === "track" && (
          <Tracking
            order={activeOrder}
            onAdvance={() => {
              if (!activeOrder) return;
              setOrders((items) =>
                items.map((item) =>
                  item.id === activeOrder.id
                    ? { ...item, status: Math.min(6, item.status + 1) }
                    : item,
                ),
              );
            }}
          />
        )}{" "}
        {view === "intelligence" && role === "farmer" && <Intelligence />}
      </main>
      <footer>
        <div className="brand">
          <span className="brand-icon">
            <Leaf size={17} />
          </span>
          <span>
            farm<span>fuse</span>
          </span>
        </div>
        <span>Farmers and buyers, growing together.</span>
      </footer>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function Landing({
  t,
  language,
  setLanguage,
  onAuth,
  onMarketplace,
}: {
  t: Copy;
  language: Language;
  setLanguage: (language: Language) => void;
  onAuth: (mode: "login" | "register") => void;
  onMarketplace: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="landing">
      <header className="navbar landing-nav">
        <button className="brand">
          <span className="brand-icon">
            <Sprout size={18} />
          </span>
          <span>
            farm<span>fuse</span>
          </span>
        </button>
        <button
          className="mobile-menu landing-menu"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu />
        </button>
        {menuOpen && (
          <div className="corner-menu">
            <button onClick={onMarketplace}>Browse marketplace</button>
            <button onClick={() => onAuth("login")}>Login</button>
            <button onClick={() => onAuth("register")}>Register</button>
          </div>
        )}
        <div className="nav-actions">
          <label className="language">
            <Globe2 size={15} />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </label>
          <button className="profile-button" onClick={() => onAuth("login")}>
            <LogIn size={17} /> Login
          </button>
          <button
            className="button primary register-button"
            onClick={() => onAuth("register")}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">
            <Leaf size={15} /> Farmer-first marketplace
          </span>
          <h1>{t.hero}</h1>
          <p>{t.heroText}</p>
          <div className="hero-actions">
            <button
              className="button primary"
              onClick={() => onAuth("register")}
            >
              <Sprout size={17} />
              {t.sellNow}
            </button>
            <button className="button light" onClick={onMarketplace}>
              <ShoppingBasket size={17} />
              {t.buyNow}
            </button>
          </div>
          <div className="hero-proof">
            <span>
              <strong>24k+</strong> kg connected supply
            </span>
            <span>
              <strong>1,280</strong> farmer partners
            </span>
            <span>
              <strong>32%</strong> route reduction*
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-note note-top">
            <span>Incoming supply</span>
            <strong>Fresh produce is arriving</strong>
            <small>Tomato · 4,200 kg from Nashik</small>
          </div>
          <div className="floating-note note-bottom">
            <span className="pulse" /> Smart matching active{" "}
            <ArrowRight size={15} />
          </div>
        </div>
      </section>
      <section className="direct-strip">
        <span className="eyebrow">{t.direct}</span>
        <div className="flow">
          <b>👨‍🌾 Farmers / FPOs</b>
          <ArrowRight />
          <b>FarmFuse marketplace</b>
          <ArrowRight />
          <b>🛒 Consumers & buyers</b>
        </div>
      </section>
      <section className="home-section">
        <div className="section-title">
          <span className="eyebrow">The FarmFuse difference</span>
          <h2>Less waiting. More value. A clearer path for every harvest.</h2>
        </div>
        <div className="feature-row">
          <Feature
            icon={<Zap />}
            title="Demand forecasting"
            text="See what buyers need next, before produce is picked."
          />
          <Feature
            icon={<Users />}
            title="Smart farmer matching"
            text="Combine the right farms by quantity, price and distance."
          />
          <Feature
            icon={<Truck />}
            title="Smart logistics"
            text="One collection route replaces a chain of unnecessary handoffs."
          />
        </div>
      </section>
      <section className="compare">
        <div>
          <span className="eyebrow">The old chain</span>
          <p>
            Farmer <ArrowRight /> Trader <ArrowRight /> Wholesaler{" "}
            <ArrowRight /> Distributor <ArrowRight /> Retailer
          </p>
        </div>
        <div className="compare-new">
          <span className="eyebrow">The direct chain</span>
          <p>
            Farmers / FPOs <ArrowRight /> <strong>FarmFuse</strong>{" "}
            <ArrowRight /> Buyers
          </p>
        </div>
      </section>
      <section className="home-section how">
        <div className="section-title">
          <span className="eyebrow">How it works</span>
          <h2>From a field listing to a fulfilled farm pool.</h2>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "List your harvest",
              "Share crop, quantity, price and ready date.",
            ],
            [
              "02",
              "Match demand",
              "Buyers find supply, or ask FarmFuse to match a pool.",
            ],
            [
              "03",
              "Collect and deliver",
              "Farmers stay visible while logistics brings the order together.",
            ],
          ].map(([number, title, text]) => (
            <div className="step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function PageHeader({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  );
}
function Marketplace({
  t,
  listings,
  search,
  setSearch,
  cart,
  onAddCart,
  onCheckout,
  onBulk,
}: {
  t: Copy;
  listings: Listing[];
  search: string;
  setSearch: (value: string) => void;
  cart: CartItem[];
  onAddCart: (listing: Listing) => void;
  onCheckout: () => void;
  onBulk: (crop: string) => void;
}) {
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.listing.price,
    0,
  );
  return (
    <div className="content">
      <PageHeader
        eyebrow="Buyer marketplace"
        title="Choose your harvest."
        detail="Different farms, different vegetables, one simple basket."
      />
      <div className="market-toolbar">
        <div className="search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.search}
          />
        </div>
        <button className="filter-button">
          All produce <ChevronDown size={15} />
        </button>
      </div>
      {cart.length > 0 && (
        <div className="cart-panel">
          <div>
            <span className="eyebrow">Your cart</span>
            <strong>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} kg across{" "}
              {cart.length} vegetables
            </strong>
          </div>
          <div className="cart-items">
            {cart.map((item) => (
              <span key={item.listing.id}>
                {cropIcons[item.listing.crop]} {item.listing.crop}{" "}
                {item.quantity} kg
              </span>
            ))}
          </div>
          <strong>₹{cartTotal.toLocaleString()}</strong>
          <button className="button primary" onClick={onCheckout}>
            Buy from cart <ArrowRight size={15} />
          </button>
        </div>
      )}
      {listings.length === 0 ? (
        <Empty text="No produce matches that search yet." />
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <article className="listing-card" key={listing.id}>
              <div
                className={`produce-art produce-${listing.crop.toLowerCase().replace(" ", "-")}`}
              >
                <span>{cropIcons[listing.crop] || "🌱"}</span>
                <small>Fresh listing</small>
              </div>
              <div className="listing-body">
                <div className="listing-title">
                  <div>
                    <span className="eyebrow">{listing.ready}</span>
                    <h3>{listing.crop}</h3>
                  </div>
                  <strong>
                    ₹{listing.price}
                    <small>/kg</small>
                  </strong>
                </div>
                <div className="listing-meta">
                  <span>
                    <Package size={15} />
                    {listing.quantity.toLocaleString()} kg available
                  </span>
                  <span>
                    <MapPin size={15} />
                    {listing.location}
                  </span>
                  <span>
                    <Sprout size={15} />
                    {listing.farmer}
                  </span>
                </div>
                <div className="listing-actions">
                  <button
                    className="button light"
                    onClick={() => onBulk(listing.crop)}
                  >
                    Bulk request
                  </button>
                  <button
                    className="button primary"
                    onClick={() => onAddCart(listing)}
                  >
                    Add to cart <Plus size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
function Sell({
  t,
  listings,
  setListings,
  setToast,
  onOrders,
}: {
  t: Copy;
  listings: Listing[];
  setListings: (items: Listing[]) => void;
  setToast: (value: string) => void;
  onOrders: () => void;
}) {
  const [form, setForm] = useState({
    crop: "Tomato",
    quantity: "320",
    price: "24",
    location: "Nashik, Maharashtra",
    ready: "Today",
  });
  const mine = listings.filter((item) => item.farmer === "Arjun Patil");
  function publish(event: React.FormEvent) {
    event.preventDefault();
    const listing = {
      ...form,
      id: `listing-${Date.now()}`,
      quantity: Number(form.quantity),
      price: Number(form.price),
      farmer: "Arjun Patil",
      available: true,
    };
    setListings([...listings, listing]);
    setToast(`${form.crop} is now visible to buyers.`);
  }
  return (
    <div className="content">
      <PageHeader
        eyebrow="Farmer workspace"
        title={t.stock}
        detail="Your produce stays in your control. Pause or update a listing anytime."
        action={
          <span className="live-chip">
            <span /> Marketplace live
          </span>
        }
      />
      <div className="dashboard-stats">
        <Stat
          icon={<Package />}
          label="Current stock"
          value={`${mine.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} kg`}
        />
        <Stat icon={<ClipboardList />} label="Open orders" value="08" />
        <Stat icon={<Users />} label="Buyer requests" value="04" />
        <Stat icon={<Truck />} label="Active deliveries" value="02" />
      </div>
      <div className="farmer-actions">
        <button
          className="button primary"
          onClick={() =>
            setToast("Your stock is being considered for nearby buyer pools.")
          }
        >
          Find a Farm Pool <Users size={16} />
        </button>
        <button className="button light" onClick={onOrders}>
          See my orders <ClipboardList size={16} />
        </button>
      </div>
      <div className="workspace-columns">
        <form className="panel form-panel" onSubmit={publish}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">New listing</span>
              <h2>{t.add}</h2>
            </div>
            <Plus size={20} />
          </div>
          <div className="form-grid">
            <label>
              Vegetable
              <select
                value={form.crop}
                onChange={(event) =>
                  setForm({ ...form, crop: event.target.value })
                }
              >
                {crops.map((crop) => (
                  <option key={crop}>{crop}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity (kg)
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) =>
                  setForm({ ...form, quantity: event.target.value })
                }
              />
            </label>
            <label>
              Price per kg (₹)
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value })
                }
              />
            </label>
            <label>
              Ready date
              <input
                value={form.ready}
                onChange={(event) =>
                  setForm({ ...form, ready: event.target.value })
                }
              />
            </label>
            <label className="full">
              Farm / collection location
              <input
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
              />
            </label>
          </div>
          <button className="button primary full-button" type="submit">
            {t.publish} <ArrowRight size={16} />
          </button>
        </form>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">My stock</span>
              <h2>Listings buyers can see</h2>
            </div>
          </div>
          <div className="stock-list">
            {mine.length === 0 ? (
              <Empty text="Add your first crop listing." />
            ) : (
              mine.map((listing) => (
                <div className="stock-row" key={listing.id}>
                  <span className="stock-emoji">{cropIcons[listing.crop]}</span>
                  <div>
                    <strong>{listing.crop}</strong>
                    <small>
                      {listing.quantity} kg · ₹{listing.price}/kg
                    </small>
                  </div>
                  <button title="Edit listing">
                    <Pencil size={15} />
                  </button>
                  <button
                    title="Pause listing"
                    onClick={() =>
                      setListings(
                        listings.map((item) =>
                          item.id === listing.id
                            ? { ...item, available: false }
                            : item,
                        ),
                      )
                    }
                  >
                    <Pause size={15} />
                  </button>
                  <button
                    title="Remove listing"
                    onClick={() =>
                      setListings(
                        listings.filter((item) => item.id !== listing.id),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function Orders({
  t,
  role,
  requirement,
  setRequirement,
  onMatch,
  onPool,
}: {
  t: Copy;
  role: Role;
  requirement: RequirementItem[];
  setRequirement: (items: RequirementItem[]) => void;
  onMatch: () => void;
  onPool: () => void;
}) {
  const matches = [
    { name: "Arjun Patil", location: "Nashik", contribution: 250 },
    { name: "Meera Shinde", location: "Dhule", contribution: 200 },
    { name: "Suresh Jadhav", location: "Jalgaon", contribution: 300 },
    { name: "Kavita More", location: "Nandurbar", contribution: 250 },
  ];
  if (role === "farmer")
    return (
      <div className="content">
        <PageHeader
          eyebrow="Farmer workspace"
          title="Your orders and pool requests"
          detail="See the buyer demand connected to your listings."
        />
        <div className="farmer-order-list">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Buyer request</span>
                <h2>Tomato pool · 1,000 kg</h2>
              </div>
              <span className="status-pill">Open for matching</span>
            </div>
            <p className="muted">
              Collection point: Dhule market yard · Required by 18 Sep
            </p>
            <div className="fulfilled">
              <span>Your possible contribution</span>
              <strong>250 kg</strong>
            </div>
            <button className="button primary" onClick={() => onMatch()}>
              Join this Farm Pool <Users size={16} />
            </button>
          </article>
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Your delivery</span>
                <h2>FF-7K29M4</h2>
              </div>
              <span className="status-pill success">Ready for collection</span>
            </div>
            <p className="muted">
              Your contribution: 250 kg Tomato · Collection hub: Dhule
            </p>
            <button className="button light" onClick={() => onMatch()}>
              View collection details <ArrowRight size={16} />
            </button>
          </article>
        </div>
      </div>
    );
  return (
    <div className="content">
      <PageHeader
        eyebrow="Buyer workspace"
        title={t.buying}
        detail="Bring several crops together in one transparent requirement."
        action={
          <button
            className="button primary"
            onClick={() =>
              setRequirement([...requirement, { crop: "Carrot", quantity: 50 }])
            }
          >
            <Plus size={16} /> Add vegetable
          </button>
        }
      />
      <div className="workspace-columns">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">One requirement, many farms</span>
              <h2>What do you need?</h2>
            </div>
            <ShoppingBasket size={20} />
          </div>
          <div className="requirement-list">
            {requirement.map((item, index) => (
              <div className="requirement-row" key={`${item.crop}-${index}`}>
                <span>{cropIcons[item.crop]}</span>
                <select
                  value={item.crop}
                  onChange={(event) =>
                    setRequirement(
                      requirement.map((current, i) =>
                        i === index
                          ? { ...current, crop: event.target.value }
                          : current,
                      ),
                    )
                  }
                >
                  {crops.map((crop) => (
                    <option key={crop}>{crop}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    setRequirement(
                      requirement.map((current, i) =>
                        i === index
                          ? { ...current, quantity: Number(event.target.value) }
                          : current,
                      ),
                    )
                  }
                />
                <b>kg</b>
                <button
                  onClick={() =>
                    setRequirement(requirement.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="requirement-total">
            <span>Total requirement</span>
            <strong>
              {requirement
                .reduce((sum, item) => sum + item.quantity, 0)
                .toLocaleString()}{" "}
              kg
            </strong>
          </div>
          <div className="button-row">
            <button className="button primary" onClick={onMatch}>
              {t.match} <ArrowRight size={16} />
            </button>
            <button
              className="button light"
              onClick={() =>
                setRequirement([
                  ...requirement,
                  { crop: "Carrot", quantity: 50 },
                ])
              }
            >
              <Plus size={16} /> Add vegetable
            </button>
          </div>
        </div>
        <div className="panel match-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Smart matching</span>
              <h2>Suitable farmers found</h2>
            </div>
            <span className="match-score">96%</span>
          </div>
          <p className="muted">
            AI-assisted matching weighs available quantity, price, freshness and
            collection distance. It supports decisions; it does not replace the
            farmers.
          </p>
          <div className="match-bars">
            {matches.map((match) => (
              <div className="match-row" key={match.name}>
                <span>
                  <strong>{match.name}</strong>
                  <small>
                    {match.location} · {match.contribution} kg
                  </small>
                </span>
                <div>
                  <i
                    style={{ width: `${(match.contribution / 300) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="fulfilled">
            <span>1,000 / 1,000 kg matched</span>
            <strong>100% fulfilled</strong>
          </div>
          <button className="button primary full-button" onClick={onPool}>
            {t.pool} <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="pool-story">
        <span className="eyebrow">Farm Pool FF-7K29M4</span>
        <div>
          <b>Multiple farmers</b>
          <ArrowRight />
          <b>Collection hub</b>
          <ArrowRight />
          <b>Consolidation</b>
          <ArrowRight />
          <b>Buyer</b>
        </div>
        <p>
          FarmFuse coordinates the order without buying or reselling produce.
          Each farmer contribution remains visible.
        </p>
      </div>
    </div>
  );
}
function Tracking({
  order,
  onAdvance,
}: {
  order?: FarmOrder;
  onAdvance: () => void;
}) {
  const steps = [
    "Order placed",
    "Farmers matched",
    "Produce being collected",
    "Collection point",
    "Consolidating",
    "On the way",
    "Delivered",
  ];
  return (
    <div className="content">
      <PageHeader
        eyebrow="Transparent delivery"
        title="Every order has a clear next step."
        detail="Prototype route view: locations are illustrative, not live GPS."
        action={
          order && (
            <button className="button primary" onClick={onAdvance}>
              Advance status <ArrowRight size={16} />
            </button>
          )
        }
      />
      {order ? (
        <>
          <div className="tracking-top panel">
            <div>
              <span className="eyebrow">FarmFuse Tracking ID</span>
              <h2>{order.trackingId}</h2>
              <button
                className="copy-link"
                onClick={() => navigator.clipboard?.writeText(order.trackingId)}
              >
                Copy tracking ID
              </button>
            </div>
            <div className="tracking-facts">
              <b>{order.farmers.length || 4} farmers</b>
              <span>{order.total.toLocaleString()} kg</span>
              <span>100% fulfilled</span>
            </div>
          </div>
          <div className="tracking-layout">
            <div className="panel">
              <div className="timeline">
                {steps.map((step, index) => (
                  <div
                    className={
                      index <= order.status
                        ? "timeline-step done"
                        : "timeline-step"
                    }
                    key={step}
                  >
                    <span>
                      {index <= order.status ? <Check size={14} /> : index + 1}
                    </span>
                    <div>
                      <strong>{step}</strong>
                      <small>
                        {index <= order.status
                          ? "Complete"
                          : index === order.status + 1
                            ? "Next in route"
                            : "Waiting"}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <RouteMap order={order} />
          </div>
          <div className="panel order-items">
            <span className="eyebrow">Order contents</span>
            <h2>From the farm pool</h2>
            {order.items.map((item) => (
              <div className="item-line" key={item.crop}>
                <span>
                  {cropIcons[item.crop]} {item.crop}
                </span>
                <strong>{item.quantity} kg</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Empty text="Place an order from the marketplace to see its tracking journey here." />
      )}
    </div>
  );
}
function RouteMap({ order }: { order: FarmOrder }) {
  const locations: Record<string, string> = {
    "Arjun Patil": "Nashik",
    "Meera Shinde": "Dhule",
    "Suresh Jadhav": "Jalgaon",
    "Kavita More": "Nandurbar",
    "Rohan Deshmukh": "Pune",
    "Priya Raut": "Aurangabad",
  };
  const farmers = order.farmers.length ? order.farmers : ["Nearby farm"];
  const baseQuantity = Math.floor(order.total / farmers.length);
  const routeStart = 104 + farmers.length * 11;
  const routeEnd = 68 + farmers.length * 7;
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Collection route</span>
          <h2>{farmers.length} farms · {order.total.toLocaleString()} kg</h2>
        </div>
        <MapPin size={20} />
      </div>
      <div className="route-map">
        <div className="route-path path-one" />
        <div className="route-path path-two" />
        <div className="route-path path-three" />
        {farmers.map((farmer, index) => (
          <div className={`map-pin farm-pin-${index % 4}`} key={farmer}>
            {index % 2 === 0 ? "👨‍🌾" : "👩‍🌾"}
            <small>{farmer} · {index === farmers.length - 1 ? order.total - baseQuantity * (farmers.length - 1) : baseQuantity} kg · {locations[farmer] || "Nearby"}</small>
          </div>
        ))}
        <div className="map-pin hub-pin">
          📍<small>Collection hub</small>
        </div>
        <div className="map-pin buyer-pin">
          🛒<small>Buyer</small>
        </div>
      </div>
      <div className="route-callout">
        <strong>Suggested collection route</strong>
        <span>
          {routeStart} km <ArrowRight size={14} /> <b>{routeEnd} km</b>
        </span>
        <small>Illustrative route calculation for this order · {Math.round(((routeStart - routeEnd) / routeStart) * 100)}% potential reduction</small>
      </div>
    </div>
  );
}
function Intelligence() {
  return (
    <div className="content">
      <PageHeader
        eyebrow="FarmFuse Intelligence"
        title="The intelligence stays behind the experience."
        detail="Simple signals help farmers plan and help buyers source with confidence."
      />
      <div className="intelligence-grid">
        <article className="intel-card">
          <div className="intel-icon">
            <Zap />
          </div>
          <span className="eyebrow">01 / Demand forecasting</span>
          <h2>Tomato demand is rising next week.</h2>
          <div className="chart">
            <i style={{ height: "35%" }} />
            <i style={{ height: "52%" }} />
            <i style={{ height: "48%" }} />
            <i style={{ height: "76%" }} />
            <i style={{ height: "91%" }} />
            <i style={{ height: "84%" }} />
          </div>
          <p>
            Current connected supply covers 82% of projected demand. Farmers can
            plan the next harvest with a clearer signal.
          </p>
        </article>
        <article className="intel-card">
          <div className="intel-icon peach">
            <Users />
          </div>
          <span className="eyebrow">02 / Smart farmer matching</span>
          <h2>Four farms can fulfil one larger order.</h2>
          <div className="big-number">
            1,000 <small>kg</small>
          </div>
          <div className="mini-progress">
            <i />
          </div>
          <p>
            Matches balance quantity, price, freshness and collection distance.
            The final choice stays transparent.
          </p>
        </article>
        <article className="intel-card">
          <div className="intel-icon blue">
            <Truck />
          </div>
          <span className="eyebrow">03 / Route optimization</span>
          <h2>Consolidate collection before the last mile.</h2>
          <div className="route-number">
            <strong>142</strong>
            <ArrowRight />
            <strong>96</strong>
            <small>km illustrative route</small>
          </div>
          <p>
            Multiple farm pickups become one coordinated movement to a
            collection hub and then the buyer.
          </p>
        </article>
      </div>
      <div className="note-band">
        <Sprout size={20} />
        <p>
          <strong>FarmFuse is a marketplace, not a middleman.</strong> Farmers
          and buyers connect directly. FarmFuse helps them discover, match and
          move produce with less waste.
        </p>
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Leaf size={24} />
      <p>{text}</p>
    </div>
  );
}
function Home({
  t,
  role,
  onNavigate,
}: {
  t: Copy;
  role: Role;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="content">
      <PageHeader
        eyebrow="Your FarmFuse workspace"
        title={t.home}
        detail="Choose a path and keep the chain moving."
      />
      <div className="home-portal">
        {role === "farmer" ? (
          <>
            <button onClick={() => onNavigate("sell")}>
              <Sprout />
              <span>
                <strong>{t.sellNow}</strong>
                <small>List stock, publish produce and respond to buyer pools.</small>
              </span>
              <ArrowRight />
            </button>
            <button onClick={() => onNavigate("intelligence")}>
              <Zap />
              <span>
                <strong>Plan your next harvest</strong>
                <small>Use demand, matching and route insights before you list.</small>
              </span>
              <ArrowRight />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate("market")}>
              <ShoppingBasket />
              <span>
                <strong>{t.buyNow}</strong>
                <small>Browse incoming produce and add vegetables to your cart.</small>
              </span>
              <ArrowRight />
            </button>
            <button onClick={() => onNavigate("orders")}>
              <Truck />
              <span>
                <strong>Incoming supply and deliveries</strong>
                <small>Review requirements, farm pools and your order journey.</small>
              </span>
              <ArrowRight />
            </button>
          </>
        )}
      </div>
      <div className="home-banner">
        <span className="eyebrow">One clear platform</span>
        <h2>Direct connection, pooled supply, thoughtful logistics.</h2>
        <button
          className="button light"
          onClick={() => onNavigate(role === "farmer" ? "intelligence" : "market")}
        >
          See the intelligence <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function AuthModal({
  mode: initialMode,
  onClose,
  onSuccess,
}: {
  mode: "login" | "register";
  onClose: () => void;
  onSuccess: (role: Role, name: string) => void;
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER",
    location: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to continue.");
      onSuccess(
        data.user.role === "farmer" ? "farmer" : "buyer",
        data.user.name,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to continue.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-overlay" onClick={onClose}>
      <form
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="auth-heading">
          <span className="brand-icon">
            <Sprout size={18} />
          </span>
          <div>
            <span className="eyebrow">FarmFuse account</span>
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          </div>
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            <LogIn size={15} /> Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            <UserPlus size={15} /> Register
          </button>
        </div>
        {mode === "register" && (
          <label className="auth-field">
            Full name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Your name or FPO"
            />
          </label>
        )}
        <label className="auth-field">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="you@example.com"
          />
        </label>
        <label className="auth-field">
          Password
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="At least 8 characters"
          />
        </label>
        {mode === "register" && (
          <>
            <label className="auth-field">
              I am joining as
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              >
                <option value="BUYER">Buyer / consumer</option>
                <option value="FARMER">Farmer / FPO</option>
              </select>
            </label>
            <label className="auth-field">
              Location
              <input
                required
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
                placeholder="Nashik, Maharashtra"
              />
            </label>
          </>
        )}
        {error && <p className="auth-error">{error}</p>}
        <button className="button primary auth-submit" disabled={busy}>
          {busy
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Create account"}{" "}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
