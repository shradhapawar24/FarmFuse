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
type View = "home" | "market" | "product" | "cart" | "checkout" | "sell" | "orders" | "track" | "intelligence";
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
  contributions?: Array<{ farmer: string; crop: string; quantity: number; price: number; location: string }>;
  buyer?: string;
  totalAmount?: number;
};
type CartItem = { listing: Listing; quantity: number };
type MatchEntry = { id: string; name: string; crop: string; location: string; quantity: number; price: number; ready?: string; contribution: number };
type MatchItem = { crop: string; required: number; matched: number; remaining: number; fulfillment: number; selected: MatchEntry[] };

function statusIndex(status: string) {
  return ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "REJECTED", "ORDER_PLACED", "MATCHED", "COLLECTION", "COLLECTION_POINT", "CONSOLIDATION", "DISPATCHED", "DELIVERED"].indexOf(status);
}

function statusLabel(status: string) {
  return ({ PENDING: "Pending", ACCEPTED: "Accepted", PREPARING: "Preparing", READY: "Ready", COMPLETED: "Completed", REJECTED: "Rejected", ORDER_PLACED: "Order placed", MATCHED: "Farmers matched", COLLECTION: "Produce being collected", COLLECTION_POINT: "Collection point", CONSOLIDATION: "Consolidating", DISPATCHED: "On the way", DELIVERED: "Delivered" } as Record<string, string>)[status] || status;
}

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
    productDetails: "Product details",
    addToCart: "Add to cart",
    viewDetails: "View details",
    cart: "Cart",
    checkout: "Checkout",
    placeOrder: "Place order",
    total: "Total",
    quantity: "Quantity",
    emptyCart: "Cart is empty.",
    myOrders: "My orders",
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
    productDetails: "उत्पाद विवरण",
    addToCart: "कार्ट में जोड़ें",
    viewDetails: "विवरण देखें",
    cart: "कार्ट",
    checkout: "चेकआउट",
    placeOrder: "ऑर्डर दें",
    total: "कुल",
    quantity: "मात्रा",
    emptyCart: "कार्ट खाली है।",
    myOrders: "मेरे ऑर्डर",
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
    productDetails: "उत्पादन तपशील",
    addToCart: "कार्टमध्ये जोडा",
    viewDetails: "तपशील पहा",
    cart: "कार्ट",
    checkout: "चेकआउट",
    placeOrder: "ऑर्डर द्या",
    total: "एकूण",
    quantity: "प्रमाण",
    emptyCart: "कार्ट रिकामी आहे.",
    myOrders: "माझे ऑर्डर",
  },
};

type Copy = typeof copy.en;
export default function FarmFuseShell() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("farmfuse-language") as Language) || "en";
  });
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState("");
  const [view, setView] = useState<View>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<FarmOrder[]>([]);
  const [requirement, setRequirement] = useState<RequirementItem[]>([
    { crop: "Tomato", quantity: 100 },
    { crop: "Potato", quantity: 200 },
    { crop: "Onion", quantity: 150 },
  ]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("farmfuse-cart") || "[]") as CartItem[]; } catch { return []; }
  });
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTracking, setSelectedTracking] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | undefined>();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [busy, setBusy] = useState(false);
  const t = copy[language];
  useEffect(() => {
    localStorage.setItem("farmfuse-language", language);
  }, [language]);
  useEffect(() => {
    localStorage.setItem("farmfuse-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (!role) return;
    void Promise.all([
      fetch("/api/produce").then((response) => response.ok ? response.json() : { produce: [] }),
      fetch("/api/orders").then((response) => response.ok ? response.json() : { orders: [] }),
    ]).then(([produceData, orderData]) => {
      setListings((produceData.produce || []).map((item: { id: string; crop: string; quantityKg: number; pricePerKg: number; location: string; farmer: { name: string }; readyDate?: string; createdAt: string }) => ({ id: item.id, crop: item.crop, quantity: item.quantityKg, price: item.pricePerKg, location: item.location, farmer: item.farmer.name, ready: item.readyDate ? new Date(item.readyDate).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString(), available: true })));
      setOrders((orderData.orders || []).map((item: { id: string; orderCode: string; status: string; createdAt: string; totalAmount?: number; buyer?: { name: string }; items: Array<{ crop: string; quantityKg: number; pricePerKg: number; produce?: { location: string; farmer: { name: string } } | null }>; farmPool?: { members: Array<{ contributionKg: number; produce: { crop: string; location: string; pricePerKg: number; farmer: { name: string } } }> } | null }) => {
        const poolMembers = item.farmPool?.members || [];
        const directContributions = item.items.filter((entry) => entry.produce).map((entry) => ({ farmer: entry.produce!.farmer.name, crop: entry.crop, quantity: entry.quantityKg, price: entry.pricePerKg, location: entry.produce!.location }));
        const contributions = poolMembers.length ? poolMembers.map((member) => ({ farmer: member.produce.farmer.name, crop: member.produce.crop, quantity: member.contributionKg, price: member.produce.pricePerKg, location: member.produce.location })) : directContributions;
        return { id: item.id, trackingId: item.orderCode, items: item.items.map((entry) => ({ crop: entry.crop, quantity: entry.quantityKg })), farmers: [...new Set(contributions.map((entry) => entry.farmer))], total: item.items.reduce((sum, entry) => sum + entry.quantityKg, 0), totalAmount: item.totalAmount ?? item.items.reduce((sum, entry) => sum + entry.quantityKg * entry.pricePerKg, 0), status: statusIndex(item.status), date: item.createdAt, buyer: item.buyer?.name, contributions };
      }));
    }).catch(() => setToast("Could not load database data."));
  }, [role]);
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
    else if (view === "product") navigate("market");
    else if (view === "cart") navigate("market");
    else if (view === "checkout") navigate("cart");
    else if (view === "orders") navigate(role === "buyer" ? "market" : "sell");
    else navigate("home");
  }
  async function addOrder(items = requirement, currentMatches = matches) {
    if (!items.length || !currentMatches.length || currentMatches.length !== items.length || currentMatches.some((item) => item.matched <= 0)) {
      setToast("Run Smart Matching and ensure every vegetable has supply.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/pools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: currentMatches }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the Farm Pool.");
      const created = data.order;
      setSelectedTracking(created.orderCode);
      setToast(`Order placed. Tracking ID ${created.orderCode}`);
      navigate("track");
      const refreshed = await fetch("/api/orders");
      if (refreshed.ok) {
        const orderData = await refreshed.json();
        const next = orderData.orders?.find((order: { orderCode: string }) => order.orderCode === created.orderCode);
        if (next) setOrders((current) => [{ id: next.id, trackingId: next.orderCode, items: next.items.map((entry: { crop: string; quantityKg: number }) => ({ crop: entry.crop, quantity: entry.quantityKg })), farmers: [...new Set(next.farmPool.members.map((member: { produce: { farmer: { name: string } } }) => member.produce.farmer.name))] as string[], total: next.items.reduce((sum: number, entry: { quantityKg: number }) => sum + entry.quantityKg, 0), status: statusIndex(next.status), date: next.createdAt, contributions: next.farmPool.members.map((member: { contributionKg: number; produce: { crop: string; location: string; pricePerKg: number; farmer: { name: string } } }) => ({ farmer: member.produce.farmer.name, crop: member.produce.crop, quantity: member.contributionKg, price: member.produce.pricePerKg, location: member.produce.location })) }, ...current.filter((order) => order.trackingId !== next.orderCode)]);
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not create the Farm Pool.");
    } finally {
      setBusy(false);
    }
  }
  async function placeCartOrder() {
    if (!cart.length) {
      setToast("Your cart is empty.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart.map((item) => ({ listingId: item.listing.id, quantity: item.quantity })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not place the order.");
      const created = data.order;
      const order: FarmOrder = {
        id: created.id,
        trackingId: created.orderCode,
        items: created.items.map((item: { crop: string; quantityKg: number }) => ({ crop: item.crop, quantity: item.quantityKg })),
        farmers: [...new Set(created.items.map((item: { produce?: { farmer: { name: string } } | null }) => item.produce?.farmer.name).filter(Boolean))] as string[],
        total: created.items.reduce((sum: number, item: { quantityKg: number }) => sum + item.quantityKg, 0),
        totalAmount: created.totalAmount,
        status: statusIndex(created.status),
        date: created.createdAt,
        contributions: created.items.filter((item: { produce?: { farmer: { name: string } } | null }) => item.produce).map((item: { produce: { farmer: { name: string }; location: string }; crop: string; quantityKg: number; pricePerKg: number }) => ({ farmer: item.produce.farmer.name, crop: item.crop, quantity: item.quantityKg, price: item.pricePerKg, location: item.produce.location })),
      };
      setOrders((current) => [order, ...current.filter((item) => item.trackingId !== order.trackingId)]);
      const refreshedProduce = await fetch("/api/produce");
      if (refreshedProduce.ok) {
        const produceData = await refreshedProduce.json();
        setListings((produceData.produce || []).map((item: { id: string; crop: string; quantityKg: number; pricePerKg: number; location: string; farmer: { name: string }; readyDate?: string; createdAt: string }) => ({ id: item.id, crop: item.crop, quantity: item.quantityKg, price: item.pricePerKg, location: item.location, farmer: item.farmer.name, ready: item.readyDate ? new Date(item.readyDate).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString(), available: true })));
      }
      setCart([]);
      setSelectedTracking(order.trackingId);
      setToast(`Order ${order.trackingId} placed successfully.`);
      navigate("orders");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not place the order.");
    } finally {
      setBusy(false);
    }
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
            <button className="cart-button" onClick={() => navigate("cart")}>
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
              setSelectedListing(listing);
              navigate("product");
            }}
            onAddQuantity={(listing, quantity) => {
              setCart((items) => items.some((item) => item.listing.id === listing.id) ? items.map((item) => item.listing.id === listing.id ? { ...item, quantity: Math.min(listing.quantity, item.quantity + quantity) } : item) : [...items, { listing, quantity }]);
              setToast(`${listing.crop} added to cart.`);
            }}
            onCheckout={() => navigate("checkout")}
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
        {view === "product" && role === "buyer" && selectedListing && (
          <ProductDetails t={t} listing={selectedListing} onAdd={(quantity) => {
            setCart((items) => items.some((item) => item.listing.id === selectedListing.id) ? items.map((item) => item.listing.id === selectedListing.id ? { ...item, quantity } : item) : [...items, { listing: selectedListing, quantity }]);
            setToast(`${selectedListing.crop} added to cart.`);
            navigate("cart");
          }} />
        )}{" "}
        {view === "cart" && role === "buyer" && <CartView t={t} cart={cart} onChange={(listingId, quantity) => setCart((items) => items.map((item) => item.listing.id === listingId ? { ...item, quantity } : item))} onRemove={(listingId) => setCart((items) => items.filter((item) => item.listing.id !== listingId))} onCheckout={() => navigate("checkout")} onMarket={() => navigate("market")} />}{" "}
        {view === "checkout" && role === "buyer" && <Checkout t={t} cart={cart} busy={busy} onBack={() => navigate("cart")} onPlaceOrder={placeCartOrder} />}{" "}
        {view === "sell" && role === "farmer" && (
          <Sell
            t={t}
            listings={listings}
            setListings={setListings}
            setToast={setToast}
            userName={userName}
            onOrders={() => navigate("orders")}
          />
        )}{" "}
        {view === "orders" && (
          <Orders
            t={t}
            role={role}
            requirement={requirement}
            orders={orders}
            setRequirement={setRequirement}
            matches={matches}
            setMatches={setMatches}
            busy={busy}
            onMatch={async () => {
              setBusy(true);
              try {
                const response = await fetch("/api/matching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: requirement }) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Matching failed.");
                setMatches(data.items);
              } catch (error) { setToast(error instanceof Error ? error.message : "Matching failed."); } finally { setBusy(false); }
            }}
            onPool={() => addOrder(requirement, matches)}
            onStatus={async (order, status) => {
              const response = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderCode: order.trackingId, status }) });
              if (!response.ok) { setToast((await response.json()).error || "Could not update order."); return; }
              setOrders((current) => current.map((item) => item.trackingId === order.trackingId ? { ...item, status: statusIndex(status) } : item));
              setToast(`Order ${order.trackingId} is now ${statusLabel(status)}.`);
            }}
          />
        )}{" "}
        {view === "track" && (
          <Tracking
            order={activeOrder}
            onAdvance={async () => {
              if (!activeOrder) return;
              const statuses = ["ORDER_PLACED", "MATCHED", "COLLECTION", "COLLECTION_POINT", "CONSOLIDATION", "DISPATCHED", "DELIVERED"];
              const nextStatus = statuses[Math.min(6, activeOrder.status + 1)];
              const response = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderCode: activeOrder.trackingId, status: nextStatus }) });
              if (!response.ok) { setToast("Could not update this order status."); return; }
              setOrders((items) => items.map((item) => item.id === activeOrder.id ? { ...item, status: Math.min(6, item.status + 1) } : item));
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
        </div>
        <div className="hero-visual">
          <div className="floating-note note-top">
            <span>Database-backed workflow</span>
            <strong>Publish, match, pool and track</strong>
            <small>Every quantity comes from a saved listing or order.</small>
          </div>
          <div className="floating-note note-bottom">
            <span className="pulse" /> Explainable matching{" "}
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
function ProductDetails({ t, listing, onAdd }: { t: Copy; listing: Listing; onAdd: (quantity: number) => void }) {
  const [quantity, setQuantity] = useState("1");
  const amount = Number(quantity);
  const valid = Number.isFinite(amount) && amount > 0 && amount <= listing.quantity;
  return (
    <div className="content">
      <PageHeader eyebrow={t.productDetails} title={listing.crop} detail={`${listing.quantity} kg available from ${listing.farmer}.`} />
      <div className="panel form-panel">
        <div className="listing-meta"><span><Package size={15} /> {listing.quantity} kg available</span><span><MapPin size={15} /> {listing.location}</span><span><Sprout size={15} /> {listing.farmer}</span></div>
        <h2>₹{listing.price}/kg</h2>
        <label>{t.quantity} (kg)<input type="number" min="1" max={listing.quantity} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        {!valid && <p className="auth-error">Enter a quantity from 1 to {listing.quantity} kg.</p>}
        <button className="button primary" disabled={!valid} onClick={() => onAdd(amount)}>{t.addToCart} <ShoppingBasket size={16} /></button>
      </div>
    </div>
  );
}
function CartView({ t, cart, onChange, onRemove, onCheckout, onMarket }: { t: Copy; cart: CartItem[]; onChange: (id: string, quantity: number) => void; onRemove: (id: string) => void; onCheckout: () => void; onMarket: () => void }) {
  const total = cart.reduce((sum, item) => sum + item.quantity * item.listing.price, 0);
  return (
    <div className="content">
      <PageHeader eyebrow={t.cart} title="Review your produce" detail="Quantities and prices are carried into checkout exactly as selected." />
      {cart.length === 0 ? <><Empty text={t.emptyCart} /><button className="button primary" onClick={onMarket}>{t.market} <ArrowRight size={16} /></button></> : <div className="panel order-items">
        {cart.map((item) => <div className="item-line" key={item.listing.id}><span>{cropIcons[item.listing.crop]} {item.listing.crop} · {item.listing.farmer}<small> ₹{item.listing.price}/kg</small></span><input aria-label={`${item.listing.crop} quantity`} type="number" min="1" max={item.listing.quantity} value={item.quantity} onChange={(event) => { const value = Number(event.target.value); if (value >= 1 && value <= item.listing.quantity) onChange(item.listing.id, value); }} /><strong>₹{(item.quantity * item.listing.price).toLocaleString()}</strong><button title="Remove product" onClick={() => onRemove(item.listing.id)}><Trash2 size={15} /></button></div>)}
        <div className="requirement-total"><span>{t.total}</span><strong>₹{total.toLocaleString()}</strong></div><button className="button primary" onClick={onCheckout}>{t.checkout} <ArrowRight size={16} /></button>
      </div>}
    </div>
  );
}
function Checkout({ t, cart, busy, onBack, onPlaceOrder }: { t: Copy; cart: CartItem[]; busy: boolean; onBack: () => void; onPlaceOrder: () => void }) {
  const total = cart.reduce((sum, item) => sum + item.quantity * item.listing.price, 0);
  return <div className="content"><PageHeader eyebrow={t.checkout} title="Confirm your order" detail="No payment is processed in this prototype." /><div className="panel order-items">{cart.length === 0 ? <Empty text={t.emptyCart} /> : <>{cart.map((item) => <div className="item-line" key={item.listing.id}><span>{item.listing.crop} · {item.quantity} kg · ₹{item.listing.price}/kg</span><strong>₹{(item.quantity * item.listing.price).toLocaleString()}</strong></div>)}<div className="requirement-total"><span>{t.total}</span><strong>₹{total.toLocaleString()}</strong></div><div className="button-row"><button className="button light" onClick={onBack}>{t.cart}</button><button className="button primary" disabled={busy} onClick={onPlaceOrder}>{busy ? "Placing..." : t.placeOrder} <Check size={16} /></button></div></>}</div></div>;
}
function Marketplace({
  t,
  listings,
  search,
  setSearch,
  cart,
  onAddCart,
  onAddQuantity,
  onCheckout,
  onBulk,
}: {
  t: Copy;
  listings: Listing[];
  search: string;
  setSearch: (value: string) => void;
  cart: CartItem[];
  onAddCart: (listing: Listing) => void;
  onAddQuantity: (listing: Listing, quantity: number) => void;
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
                  <button className="button light" onClick={() => onAddQuantity(listing, 1)} disabled={listing.quantity < 1}>
                    Add 1 kg <Plus size={15} />
                  </button>
                  <button
                    className="button primary"
                    onClick={() => onAddCart(listing)}
                  >
                    View details <ArrowRight size={15} />
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
  userName,
  onOrders,
}: {
  t: Copy;
  listings: Listing[];
  setListings: (items: Listing[]) => void;
  setToast: (value: string) => void;
  userName: string;
  onOrders: () => void;
}) {
  const [form, setForm] = useState({
    crop: "Tomato",
    quantity: "320",
    price: "24",
    location: "Nashik, Maharashtra",
    ready: "Today",
  });
  const mine = listings.filter((item) => item.farmer === userName);
  async function publish(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/produce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ crop: form.crop, quantity: Number(form.quantity), price: Number(form.price), location: form.location, ready: form.ready }) });
    const data = await response.json();
    if (!response.ok) { setToast(data.error || "Could not publish produce."); return; }
    setListings([...listings, { id: data.produce.id, crop: data.produce.crop, quantity: data.produce.quantityKg, price: data.produce.pricePerKg, location: data.produce.location, farmer: userName, ready: form.ready, available: true }]);
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
        <Stat icon={<ClipboardList />} label="Published listings" value={String(mine.filter((item) => item.available).length)} />
        <Stat icon={<Users />} label="Paused listings" value={String(mine.filter((item) => !item.available).length)} />
        <Stat icon={<Truck />} label="Orders" value="View orders" />
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
                  <button title="Edit listing" onClick={async () => {
                    const quantity = window.prompt("New quantity in kg", String(listing.quantity));
                    const price = window.prompt("New price per kg", String(listing.price));
                    if (!quantity || !price) return;
                    const response = await fetch("/api/produce", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: listing.id, quantity: Number(quantity), price: Number(price) }) });
                    if (response.ok) setListings(listings.map((item) => item.id === listing.id ? { ...item, quantity: Number(quantity), price: Number(price) } : item));
                    setToast(response.ok ? "Listing updated." : "Could not update listing.");
                  }}>
                    <Pencil size={15} />
                  </button>
                  <button title="Pause listing" onClick={async () => {
                    const response = await fetch("/api/produce", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: listing.id, available: false }) });
                    if (response.ok) setListings(listings.map((item) => item.id === listing.id ? { ...item, available: false } : item));
                    setToast(response.ok ? "Listing paused." : "Could not pause listing.");
                  }}>
                    <Pause size={15} />
                  </button>
                  <button title="Remove listing" onClick={async () => {
                    const response = await fetch(`/api/produce?id=${encodeURIComponent(listing.id)}`, { method: "DELETE" });
                    if (response.ok) setListings(listings.map((item) => item.id === listing.id ? { ...item, available: false } : item));
                    setToast(response.ok ? "Listing removed from marketplace." : "Could not remove listing.");
                  }}>
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
  orders,
  setRequirement,
  matches,
  setMatches,
  busy,
  onMatch,
  onPool,
  onStatus,
}: {
  t: Copy;
  role: Role;
  requirement: RequirementItem[];
  orders: FarmOrder[];
  setRequirement: (items: RequirementItem[]) => void;
  matches: MatchItem[];
  setMatches: (items: MatchItem[]) => void;
  busy: boolean;
  onMatch: () => void;
  onPool: () => void;
  onStatus: (order: FarmOrder, status: string) => void;
}) {
  useEffect(() => setMatches([]), [requirement, setMatches]);
  if (role === "farmer")
    return (
      <div className="content">
        <PageHeader
          eyebrow="Farmer workspace"
          title="Your orders and pool requests"
          detail="See the buyer demand connected to your listings."
        />
        <div className="farmer-order-list">
          {orders.length === 0 && <Empty text="No orders include your published produce yet." />}
            {orders.map((order) => <article className="panel" key={order.trackingId}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">FarmFuse Tracking ID</span>
                <h2>{order.trackingId}</h2>
              </div>
              <span className="status-pill">{statusLabel(["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "REJECTED", "ORDER_PLACED", "MATCHED", "COLLECTION", "COLLECTION_POINT", "CONSOLIDATION", "DISPATCHED", "DELIVERED"][order.status] || "PENDING")}</span>
            </div>
            {order.contributions?.map((entry) => <p className="muted" key={`${order.trackingId}-${entry.farmer}-${entry.crop}`}>{entry.farmer}: {entry.quantity} kg {entry.crop} · ₹{entry.price}/kg · {entry.location}</p>)}
            {order.status <= 4 && <div className="button-row">
              {(order.status === 0) && <><button className="button primary" onClick={() => onStatus(order, "ACCEPTED")}>Accept</button><button className="button light" onClick={() => onStatus(order, "REJECTED")}>Reject</button></>}
              {order.status === 1 && <button className="button primary" onClick={() => onStatus(order, "PREPARING")}>Mark preparing</button>}
              {order.status === 2 && <button className="button primary" onClick={() => onStatus(order, "READY")}>Mark ready</button>}
              {order.status === 3 && <button className="button primary" onClick={() => onStatus(order, "COMPLETED")}>Mark completed</button>}
            </div>}
            <button className="button light" onClick={() => onMatch()}>View collection details <ArrowRight size={16} /></button>
          </article>)}
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
      {orders.length > 0 && <div className="farmer-order-list">
        <div className="panel-heading"><h2>My orders</h2><span className="eyebrow">Synced from the database</span></div>
        {orders.map((order) => <article className="panel" key={order.trackingId}><div className="panel-heading"><div><span className="eyebrow">{order.trackingId}</span><h2>{order.items.map((item) => `${item.crop} ${item.quantity} kg`).join(" · ")}</h2></div><span className="status-pill">{statusLabel(["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "REJECTED", "ORDER_PLACED", "MATCHED", "COLLECTION", "COLLECTION_POINT", "CONSOLIDATION", "DISPATCHED", "DELIVERED"][order.status] || "PENDING")}</span></div><p className="muted">Total: ₹{(order.totalAmount ?? 0).toLocaleString()} · {new Date(order.date).toLocaleString()}</p>{order.contributions?.map((entry) => <p className="muted" key={`${order.trackingId}-${entry.farmer}-${entry.crop}`}>Farmer: {entry.farmer} · {entry.quantity} kg · ₹{entry.price}/kg</p>)}</article>)}
      </div>}
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
              <h2>Actual available supply</h2>
            </div>
            <span className="match-score">{matches.length ? `${Math.round(matches.reduce((sum, item) => sum + item.fulfillment, 0) / matches.length)}%` : "--"}</span>
          </div>
          <p className="muted">
            Explainable ranking uses available quantity, price, location and ready date. It is deterministic prototype logic, not a trained model.
          </p>
          <div className="match-bars">
            {matches.length === 0 ? <Empty text="Change the requirement, then run Smart Matching." /> : matches.map((item) => (
              <div className="match-crop" key={item.crop}>
                <div className="panel-heading"><strong>{cropIcons[item.crop]} {item.crop}</strong><span>{item.matched} / {item.required} kg · {item.fulfillment}%</span></div>
                {item.selected.map((match) => <div className="match-row" key={match.id}><span><strong>{match.name}</strong><small>{match.location} · {match.contribution} kg · ₹{match.price}/kg · ready {match.ready ? new Date(match.ready).toLocaleDateString() : "date not supplied"}</small></span><div><i style={{ width: `${Math.min((match.contribution / item.required) * 100, 100)}%` }} /></div></div>)}
                <small className="muted">Remaining: {item.remaining} kg</small>
              </div>
            ))}
          </div>
          <div className="fulfilled">
            <span>{matches.reduce((sum, item) => sum + item.matched, 0)} / {matches.reduce((sum, item) => sum + item.required, 0)} kg matched</span>
            <strong>{matches.length && matches.every((item) => item.remaining === 0) ? "100% fulfilled" : "Supply insufficient"}</strong>
          </div>
          <button className="button primary full-button" disabled={busy || !matches.length || matches.some((item) => item.remaining > 0)} onClick={onPool}>
            {t.pool} <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="pool-story">
        <span className="eyebrow">Current Farm Pool path</span>
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
  const contributions = order.contributions || [];
  const farmers = contributions.length ? contributions : order.farmers.map((farmer) => ({ farmer, location: "Location saved on order", quantity: 0, crop: "Produce", price: 0 }));
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
        {farmers.map((entry, index) => (
          <div className={`map-pin farm-pin-${index % 4}`} key={`${entry.farmer}-${entry.crop}`}>
            {index % 2 === 0 ? "👨‍🌾" : "👩‍🌾"}
            <small>{entry.farmer} · {entry.quantity} kg {entry.crop} · {entry.location}</small>
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
        <span>Selected farmer locations <ArrowRight size={14} /> <b>Collection hub</b> <ArrowRight size={14} /> Buyer</span>
        <small>Illustrative route calculation using the actual farmers selected for this order. No live GPS or traffic data.</small>
      </div>
    </div>
  );
}
function Intelligence() {
  const sampleDemand = [120, 145, 138, 170, 184, 196];
  const forecast = Math.round(sampleDemand.slice(-3).reduce((sum, value) => sum + value, 0) / 3);
  return (
    <div className="content">
      <PageHeader
        eyebrow="FarmFuse Intelligence"
        title="The intelligence stays behind the experience."
        detail="Prototype calculations are shown with their inputs and are not live market predictions."
      />
      <div className="intelligence-grid">
        <article className="intel-card">
          <div className="intel-icon">
            <Zap />
          </div>
          <span className="eyebrow">01 / Demand forecasting</span>
          <h2>Tomato demand forecast</h2>
          <div className="chart">
            {sampleDemand.map((value) => <i key={value} style={{ height: `${(value / 220) * 100}%` }} />)}
          </div>
          <p>Sample historical demand: {sampleDemand.join(", ")} kg. Current sample demand: {sampleDemand.at(-1)} kg. Simple forecast: {forecast} kg based on the recent average.</p>
        </article>
        <article className="intel-card">
          <div className="intel-icon peach">
            <Users />
          </div>
          <span className="eyebrow">02 / Smart farmer matching</span>
          <h2>Availability-first matching</h2>
          <div className="big-number">Actual <small>data</small></div>
          <p>
            Each crop is matched separately using available quantity, price, location and ready date. Contributions stop at the requested quantity.
          </p>
        </article>
        <article className="intel-card">
          <div className="intel-icon blue">
            <Truck />
          </div>
          <span className="eyebrow">03 / Route optimization</span>
          <h2>Selected farmers to collection hub to buyer.</h2>
          <div className="route-number"><strong>Illustrative</strong><ArrowRight /><strong>route</strong><small>Calculated from selected farmer locations</small></div>
          <p>
            Logistics uses the farmers saved on the order. It does not claim live GPS, traffic or vehicle tracking.
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
                <strong>Orders and deliveries</strong>
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
