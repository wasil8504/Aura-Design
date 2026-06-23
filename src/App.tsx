import React, { useState, useEffect } from "react";
import { Product, CartItem, Order, EmailLog, OrderStatus, BillingDetails } from "./types";
import ProductCatalog from "./components/ProductCatalog";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import UserDashboard from "./components/UserDashboard";
import EmailInboxLogs from "./components/EmailInboxLogs";
import { 
  ShoppingBag, ShieldCheck, Mail, Activity, ArrowUpRight, 
  Sparkles, Coffee, AlertCircle, RefreshCw, Layers, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Main states
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  
  // Navigation & UI switches
  const [activeTab, setActiveTab] = useState<"store" | "dashboard" | "emails">("store");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  // Email state tracking (allows highlighting of newly updated orders)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // In-app notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "mail" }[]>([]);

  const addToast = (message: string, type: "success" | "info" | "mail" = "success") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Initial Sync fetches
  const syncApplicationData = async () => {
    try {
      const [resProducts, resOrders, resEmails] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/emails")
      ]);

      if (!resProducts.ok || !resOrders.ok || !resEmails.ok) {
        throw new Error("Failed to communicate with full-stack Aura API endpoints.");
      }

      const [dataProducts, dataOrders, dataEmails] = await Promise.all([
        resProducts.json(),
        resOrders.json(),
        resEmails.json()
      ]);

      setProducts(dataProducts);
      setOrders(dataOrders);
      setEmails(dataEmails);
      setErrorText("");
    } catch (err: any) {
      console.error(err);
      setErrorText("Backend API offline. Is the server initialization running on port 3000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncApplicationData();
    // Fetch state every 10 seconds silently to ensure real-time synchronization
    const timer = setInterval(() => {
      fetch("/api/products").then(r => r.json()).then(setProducts).catch(console.error);
      fetch("/api/orders").then(r => r.json()).then(setOrders).catch(console.error);
      fetch("/api/emails").then(r => r.json()).then(setEmails).catch(console.error);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      addToast(`Added ${product.name} to checkout bag.`, "success");
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId);
      if (item) {
        addToast(`Removed ${item.product.name} from bag.`, "info");
      }
      return prevCart.filter((item) => item.product.id !== productId);
    });
  };

  // Submit Order Integration with secure simulated payments
  const handleSubmitOrder = async (billingDetails: BillingDetails, cardBrand: string, last4: string) => {
    const payload = {
      cartItems: cart,
      billingDetails,
      paymentMethod: {
        brand: cardBrand,
        last4: last4,
      },
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to process e-commerce secure payment.");
    }

    const data = await res.json();
    
    // Clear cart & trigger refresh
    setCart([]);
    addToast("Secure payment authorized! Order logged.", "success");
    addToast("📨 Automated purchase confirmation sent! Check notification logs.", "mail");

    // Sync state
    setOrders(prev => [data.order, ...prev]);
    setEmails(prev => [data.emailLog, ...prev]);
    setSelectedEmailId(data.emailLog.id);

    return data;
  };

  // Update order status trigger from Admin/ERP status lever
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update ERP status level.");
    }

    const data = await res.json();
    
    // Optimistic / Real sync updating of database state
    setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
    setEmails(prev => [data.emailLog, ...prev]);
    setSelectedEmailId(data.emailLog.id);
    addToast(`Order tracking updated to: ${status.toUpperCase()}`, "success");
    addToast(`📨 Mail Notification Dispatched: "${data.emailLog.subject}"`, "mail");
  };

  // Clear email registers mockup helper
  const handleClearEmails = async () => {
    const res = await fetch("/api/emails/clear", { method: "POST" });
    if (res.ok) {
      setEmails([]);
      setSelectedEmailId(null);
      addToast("Simulator email log registries successfully cleared.", "info");
    }
  };

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" id="master-app-root">
      
      {/* Dynamic Toast System notifications */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm" id="toast-wrapper-panel">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-4 rounded-xl border shadow-xl flex items-start gap-2.5 text-xs text-left ${
                toast.type === "success"
                  ? "bg-slate-900 text-white border-slate-900"
                  : toast.type === "mail"
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-white text-slate-800 border-slate-100"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : toast.type === "mail" ? (
                  <Mail className="w-4 h-4 text-blue-100 animate-pulse" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-semibold leading-relaxed">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modern, high-density Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40" id="global_site_header">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between">
          
          {/* Visual Brand Logo Title */}
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold font-mono tracking-tight text-sm">
              AU
            </span>
            <div className="text-left font-sans">
              <h1 className="font-black text-slate-900 text-sm md:text-base tracking-tight uppercase leading-none">Aura Design Co.</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                E-commerce ERP Portal
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 border border-slate-100 p-1 bg-slate-50/70 rounded-xl">
            <button
              id="nav-store-btn"
              onClick={() => setActiveTab("store")}
              className={`text-xs px-4 py-2 font-semibold tracking-wide rounded-lg transition-all cursor-pointer ${
                activeTab === "store"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Browse Products
            </button>
            <button
              id="nav-dashboard-btn"
              onClick={() => {
                setActiveTab("dashboard");
                // Reset email highlights to look clean
                setSelectedEmailId(null);
              }}
              className={`text-xs px-4 py-2 font-semibold tracking-wide rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Track Orders</span>
              {orders.length > 0 && (
                <span className="bg-slate-200/80 text-slate-700 font-mono text-[9px] px-1.5 py-0.2 rounded">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              id="nav-emails-btn"
              onClick={() => setActiveTab("emails")}
              className={`text-xs px-4 py-2 font-semibold tracking-wide rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "emails"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>SMTP Mailer Log</span>
              {emails.length > 0 && (
                <span className="bg-blue-100 text-blue-700 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                  {emails.length}
                </span>
              )}
            </button>
          </nav>

          {/* Cart triggers and developer portal links */}
          <div className="flex items-center gap-3">
            <button
              id="toggle-cart-btn"
              onClick={() => setCartOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl flex items-center gap-2 transition shadow-xs cursor-pointer text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4 text-slate-200 shrink-0" />
              <span className="hidden sm:inline">Checkout due</span>
              <span className="bg-white text-slate-900 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation slider */}
      <div className="md:hidden bg-white border-b border-slate-100 p-2 flex justify-around">
        <button
          onClick={() => setActiveTab("store")}
          className={`flex-1 py-2 text-xs font-bold ${activeTab === "store" ? "text-slate-900" : "text-slate-400"}`}
        >
          Explore
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-2 text-xs font-bold ${activeTab === "dashboard" ? "text-slate-900" : "text-slate-400"}`}
        >
          Timeline ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("emails")}
          className={`flex-1 py-2 text-xs font-bold ${activeTab === "emails" ? "text-slate-900" : "text-slate-400"}`}
        >
          Mailer ({emails.length})
        </button>
      </div>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="py-24 flex items-center justify-center flex-col space-y-3" id="main-spinner">
            <RefreshCw className="w-8 h-8 text-slate-800 animate-spin" />
            <p className="text-xs text-slate-500 font-medium font-mono">Securing full-stack data models...</p>
          </div>
        ) : errorText ? (
          <div className="max-w-md mx-auto my-12 bg-white border border-rose-100 text-rose-700 p-6 rounded-2xl text-center space-y-4 shadow-sm" id="main-error">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-bold text-slate-800">Connection Failed</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {errorText}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                syncApplicationData();
              }}
              className="bg-slate-900 hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
            >
              Verify Connection
            </button>
          </div>
        ) : (
          <div>
            <AnimatePresence mode="wait">
              {activeTab === "store" && (
                <motion.div
                  key="store"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCatalog
                    products={products}
                    onAddToCart={handleAddToCart}
                    cartItems={cart}
                  />
                </motion.div>
              )}

              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserDashboard
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onSelectOrderEmailHook={(orderId, status) => {
                      // Navigate to email log when active status updates
                      addToast("📨 ERP notification created. Click 'Mailer Log' tab to view HTML render.", "info");
                    }}
                  />
                </motion.div>
              )}

              {activeTab === "emails" && (
                <motion.div
                  key="emails"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmailInboxLogs
                    emails={emails}
                    onClearEmails={handleClearEmails}
                    selectedEmailIdHook={selectedEmailId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Global details footer */}
      <footer className="bg-white border-t border-slate-200/60 py-6 text-xs text-slate-500 font-medium" id="global_site_footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p>&copy; {new Date().getFullYear()} Aura Design Co. E-commerce simulated environment.</p>
          <div className="flex gap-4 items-center uppercase tracking-widest text-[9px] font-bold text-slate-400">
            <span>🛡️ SSL secured</span>
            <span>&bull;</span>
            <span>📦 DB state synced</span>
            <span>&bull;</span>
            <span>✉️ SMTP logs active</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer Layer */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={() => {
              setCartOpen(false);
              setCheckoutOpen(true);
            }}
            onClose={() => setCartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Checkout Gateway Screen Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            cartItems={cart}
            onSubmitOrder={handleSubmitOrder}
            onClose={() => {
              setCheckoutOpen(false);
              // Shift immediately to the Dashboard tracker when order is logged!
              setActiveTab("dashboard");
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
