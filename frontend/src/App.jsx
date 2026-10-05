import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Building2,
  ChevronDown,
  Download,
  FilePlus2,
  FileText,
  LayoutDashboard,
  LogOut,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import CustomerPage from "./CustomerPage.jsx";
import ProductPage, { ProductForm } from "./ProductPage.jsx";
import { readApiResponse } from "./api.js";

const filters = ["All invoices", "Paid", "Pending", "Overdue", "Failed", "Refunded"];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getStatus(invoice) {
  const paymentStatus = invoice.payment?.paymentstatus;
  if (paymentStatus && paymentStatus !== "Pending") return paymentStatus;
  if (invoice.status === "Overdue") return "Overdue";
  if (paymentStatus) return paymentStatus;
  return invoice.status === "Paid" ? "Paid" : "Pending";
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", businessName: "", gstin: "", address: "", email: "", phone_no: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegistering = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${isRegistering ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || "Unable to authenticate.");
      if (!result.token || !result.user) {
        throw new Error(result.message || "The server returned an incomplete sign-in response.");
      }
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message || "Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <a className="brand auth-brand" href="#login" aria-label="VYAPAR home">
          <span className="brand-mark">V</span>
          <span>VYAPAR<span className="brand-period">.</span></span>
        </a>
        <div className="auth-story-copy">
          <p className="eyebrow">A CLEARER WAY TO DO BUSINESS</p>
          <h1>Every bill.<br />Under control<span>.</span></h1>
          <p>GST billing and payments, together in one place.</p>
        </div>
        <div className="auth-story-foot">Simple books. Better business.</div>
      </section>

      <section className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <span className="auth-icon"><LockKeyhole size={18} /></span>
            <p className="eyebrow">YOUR VYAPAR WORKSPACE</p>
            <h2>{isRegistering ? "Create your account" : "Welcome back"}</h2>
            <p>{isRegistering ? "Set up your business account to get started." : "Sign in to continue to your business."}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <label className="auth-field">
                  <span>Business name</span>
                  <span className="auth-input-wrap"><Building2 size={16} /><input name="businessName" value={form.businessName} onChange={updateField} autoComplete="organization" minLength="2" maxLength="150" required placeholder="Registered business name" /></span>
                </label>
                <label className="auth-field">
                  <span>GSTIN</span>
                  <span className="auth-input-wrap"><BadgeCheck size={16} /><input name="gstin" value={form.gstin} onChange={updateField} autoCapitalize="characters" minLength="15" maxLength="15" pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]" required placeholder="15-character GSTIN" /></span>
                </label>
                <label className="auth-field">
                  <span>Business address</span>
                  <span className="auth-input-wrap"><MapPin size={16} /><input name="address" value={form.address} onChange={updateField} autoComplete="street-address" minLength="5" maxLength="300" required placeholder="Registered business address" /></span>
                </label>
                <label className="auth-field">
                  <span>Owner name</span>
                  <span className="auth-input-wrap"><UserRound size={16} /><input name="name" value={form.name} onChange={updateField} autoComplete="name" minLength="2" maxLength="100" required placeholder="Full name" /></span>
                </label>
                <label className="auth-field">
                  <span>Mobile number</span>
                  <span className="auth-input-wrap"><Phone size={16} /><input name="phone_no" type="tel" value={form.phone_no} onChange={updateField} autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" required placeholder="10-digit mobile number" /></span>
                </label>
              </>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <span className="auth-input-wrap"><Mail size={16} /><input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required placeholder="you@company.com" /></span>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <span className="auth-input-wrap"><LockKeyhole size={16} /><input name="password" type="password" value={form.password} onChange={updateField} autoComplete={isRegistering ? "new-password" : "current-password"} minLength="6" maxLength="100" required placeholder={isRegistering ? "At least 6 characters" : "Enter your password"} /></span>
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}
              <ArrowUpRight size={16} />
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering ? "Already have an account?" : "New to VYAPAR?"}{" "}
            <button type="button" onClick={() => { setMode(isRegistering ? "login" : "register"); setError(""); }}>
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
        <footer className="auth-footer">Protected access for your business account</footer>
      </section>
    </main>
  );
}

function InvoiceComposer({ token, user, onClose, onCreated, onNavigateTo }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [items, setItems] = useState([{ id: 1, productid: "", buyitem: 1 }]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/customers", { headers }),
      fetch("/api/products", { headers }),
    ])
      .then(async ([customerResponse, productResponse]) => {
        const [customerResult, productResult] = await Promise.all([
          readApiResponse(customerResponse),
          readApiResponse(productResponse),
        ]);
        if (!customerResponse.ok) throw new Error(customerResult.message || "Could not load customers.");
        if (!productResponse.ok) throw new Error(productResult.message || "Could not load products.");
        if (!Array.isArray(customerResult) || !Array.isArray(productResult)) {
          throw new Error("The server returned an invalid customer or product list.");
        }
        if (active) {
          setCustomers(customerResult);
          setProducts(productResult);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || "Could not load invoice data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const totals = items.reduce((result, item) => {
    const product = products.find((entry) => String(entry.productid) === item.productid);
    if (!product) return result;
    const lineSubtotal = Number(product.price) * Number(item.buyitem || 0);
    const lineTax = lineSubtotal * Number(product.gst?.gstrate || 0) / 100;
    return {
      subtotal: result.subtotal + lineSubtotal,
      cgst: result.cgst + lineTax / 2,
      sgst: result.sgst + lineTax / 2,
    };
  }, { subtotal: 0, cgst: 0, sgst: 0 });

  function updateItem(itemId, field, value) {
    setItems((current) => current.map((item) => (
      item.id === itemId ? { ...item, [field]: value } : item
    )));
  }

  function addProductToInvoice(product) {
    setShowProductForm(false);
    if (Number(product.quantity) < 1 || product.archived) {
      setError("Product was saved, but it needs in-stock quantity before it can be invoiced.");
      return;
    }

    setError("");
    setProducts((current) => [...current, product]);
    setItems((current) => {
      const emptyRowIndex = current.findIndex((item) => !item.productid);
      if (emptyRowIndex >= 0) {
        return current.map((item, index) => index === emptyRowIndex
          ? { ...item, productid: String(product.productid) }
          : item);
      }
      return [...current, { id: Date.now(), productid: String(product.productid), buyitem: 1 }];
    });
  }

  async function submitInvoice(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const customer = customers.find((entry) => String(entry.customerid) === customerId);
    if (!customer) {
      setError("Choose a customer before creating the invoice.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/invoices/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: { userid: user.userid, name: user.name, email: user.email },
          customer: {
            customerid: customer.customerid,
            name: customer.name,
            email: customer.email,
            phone_no: customer.phone_no,
          },
          invoicedate: new Date(`${invoiceDate}T12:00:00`).toISOString(),
          items: items.map((item) => ({
            productid: Number(item.productid),
            buyitem: Number(item.buyitem),
          })),
          payment: { paymentstatus: "Pending", paymentmode: "Cash" },
          status: "Draft",
        }),
      });
      const result = await readApiResponse(response);
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Could not create invoice (HTTP ${response.status}).`);
      }

      const invoice = result.data?.invoice || result.data;
      if (!invoice?.invoiceid) throw new Error("The server did not return the created invoice.");
      onCreated(invoice);
    } catch (submitError) {
      setError(submitError.message || "Could not create invoice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="invoice-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="invoice-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-form-title">
        <header className="invoice-modal-header">
          <div><p className="eyebrow">BILLING</p><h2 id="invoice-form-title">Create invoice</h2><p>Choose a customer and add the products being billed.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close invoice form"><X size={19} /></button>
        </header>

        {loading ? <p className="invoice-form-state">Loading customers and products…</p> : (
          <form onSubmit={submitInvoice}>
            {(customers.length === 0 || products.length === 0) && !error && (
              <div className="invoice-form-state">
                <p>Add at least one customer and one in-stock product before creating an invoice.</p>
                <div className="invoice-setup-actions">
                  {customers.length === 0 && <button type="button" onClick={() => onNavigateTo("customers")}><UsersRound size={15} />Add customers</button>}
                  {products.length === 0 && <button type="button" onClick={() => setShowProductForm(true)}><Package size={15} />Create a product</button>}
                </div>
              </div>
            )}

            <div className="invoice-form-grid">
              <label className="invoice-field">
                <span>Customer</span>
                <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required disabled={customers.length === 0}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.customerid} value={customer.customerid}>{customer.name}</option>)}
                </select>
              </label>
              <label className="invoice-field">
                <span>Invoice date</span>
                <span className="invoice-date-input"><CalendarDays size={16} /><input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} required /></span>
              </label>
            </div>

            <div className="invoice-items-heading"><div><h3>Products</h3><p>Prices and GST rates come from your product list.</p></div></div>
            <div className="invoice-item-list">
              {items.map((item) => {
                const product = products.find((entry) => String(entry.productid) === item.productid);
                return (
                  <div className="invoice-item-row" key={item.id}>
                    <label className="invoice-field product-select-field">
                      <span>Product</span>
                      <select value={item.productid} onChange={(event) => updateItem(item.id, "productid", event.target.value)} required disabled={products.length === 0}>
                        <option value="">Select product</option>
                        {products.map((option) => {
                          const selectedElsewhere = items.some((other) => other.id !== item.id && other.productid === String(option.productid));
                          return <option key={option.productid} value={option.productid} disabled={selectedElsewhere || option.quantity < 1}>{option.productname} · {formatCurrency(option.price)}</option>;
                        })}
                      </select>
                    </label>
                    <label className="invoice-field quantity-field">
                      <span>Qty</span>
                      <input type="number" min="1" step="1" max={product?.quantity || undefined} value={item.buyitem} onChange={(event) => updateItem(item.id, "buyitem", event.target.value)} required />
                    </label>
                    <div className="invoice-line-total"><span>Line total</span><strong>{product ? formatCurrency(Number(product.price) * Number(item.buyitem) * (1 + Number(product.gst?.gstrate || 0) / 100)) : "—"}</strong>{product && <small>{product.quantity} in stock · {product.gst?.gsttype === "CGST+SGST" ? `CGST ${Number(product.gst.gstrate) / 2}% + SGST ${Number(product.gst.gstrate) / 2}%` : `GST ${product.gst?.gstrate || 0}%`}</small>}</div>
                    <button className="remove-item-button" type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Remove product" disabled={items.length === 1}><X size={16} /></button>
                  </div>
                );
              })}
            </div>
            <div className="invoice-item-actions">
              <button className="add-item-button" type="button" onClick={() => setItems((current) => [...current, { id: Date.now(), productid: "", buyitem: 1 }])} disabled={items.length >= products.length}><Plus size={15} />Add product line</button>
              <button className="add-item-button" type="button" onClick={() => setShowProductForm(true)}><Package size={15} />Create product</button>
            </div>

            <div className="invoice-total-block">
              <div><span>Subtotal</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
              <div><span>CGST</span><strong>{formatCurrency(totals.cgst)}</strong></div>
              <div><span>SGST</span><strong>{formatCurrency(totals.sgst)}</strong></div>
              <div className="invoice-grand-total"><span>Total due</span><strong>{formatCurrency(totals.subtotal + totals.cgst + totals.sgst)}</strong></div>
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}
            <footer className="invoice-modal-footer">
              <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting || loading || customers.length === 0 || products.length === 0}>
                {submitting ? "Creating…" : "Create invoice"}<ArrowUpRight size={16} />
              </button>
            </footer>
          </form>
        )}
      </section>
      {showProductForm && <ProductForm token={token} onClose={() => setShowProductForm(false)} onCreated={addProductToInvoice} />}
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState(() => {
    const requestedView = window.location.hash.slice(1);
    return ["customers", "products", "invoices"].includes(requestedView) ? requestedView : "overview";
  });
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vyapar-session") || "null");
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All invoices");
  const [query, setQuery] = useState("");
  const [showInvoiceComposer, setShowInvoiceComposer] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [paymentUpdateError, setPaymentUpdateError] = useState("");
  const [updatingPaymentInvoiceId, setUpdatingPaymentInvoiceId] = useState(null);

  useEffect(() => {
    if (!session?.token) {
      setAuthReady(true);
      return undefined;
    }

    let active = true;
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${session.token}` } })
      .then(async (response) => {
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error("Session expired");
        if (!result.user) throw new Error("Session response is incomplete");
        return result;
      })
      .then((result) => {
        if (active) setSession((current) => ({ ...current, user: result.user }));
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem("vyapar-session");
          setSession(null);
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!session?.token) {
      setInvoices([]);
      setLoading(false);
      return undefined;
    }

    let active = true;

    fetch("/api/invoices", { headers: { Authorization: `Bearer ${session.token}` } })
      .then(async (response) => {
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.message || `Could not load invoices (HTTP ${response.status}).`);
        return result;
      })
      .then((result) => {
        if (!active) return;
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unexpected invoice response.");
        }
        setInvoices(result.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authReady, session?.token]);

  function handleAuthenticated(result) {
    localStorage.setItem("vyapar-session", JSON.stringify(result));
    setSession(result);
    setAuthReady(true);
  }

  function navigate(view) {
    setActiveView(view);
    window.history.replaceState(null, "", `#${view}`);
  }

  async function handleLogout() {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } finally {
      localStorage.removeItem("vyapar-session");
      setSession(null);
      setInvoices([]);
      setError("");
    }
  }

  const filteredInvoices = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status = getStatus(invoice);
      const matchesFilter = filter === "All invoices" || status === filter;
      const matchesSearch =
        !searchTerm ||
        String(invoice.invoiceid).toLowerCase().includes(searchTerm) ||
        (invoice.customer?.name || "").toLowerCase().includes(searchTerm);

      return matchesFilter && matchesSearch;
    });
  }, [filter, invoices, query]);

  const summary = useMemo(() => {
    const paid = invoices.filter((invoice) => getStatus(invoice) === "Paid");
    const pending = invoices.filter((invoice) => getStatus(invoice) === "Pending");

    return {
      total: invoices.reduce((sum, invoice) => sum + (Number(invoice.totalamount) || 0), 0),
      collected: paid.reduce((sum, invoice) => sum + (Number(invoice.totalamount) || 0), 0),
      outstanding: pending.reduce((sum, invoice) => sum + (Number(invoice.totalamount) || 0), 0),
      pendingCount: pending.length,
    };
  }, [invoices]);

  function handleInvoiceCreated(invoice) {
    setInvoices((current) => [invoice, ...current]);
    setShowInvoiceComposer(false);
    setFilter("All invoices");
    setError("");
    navigate("invoices");
  }

  async function handlePaymentStatusUpdate(invoice, paymentstatus) {
    if (paymentstatus === (invoice.payment?.paymentstatus || "Pending")) return;

    setUpdatingPaymentInvoiceId(invoice.invoiceid);
    setPaymentUpdateError("");
    try {
      const response = await fetch(`/api/invoices/update/${invoice.invoiceid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ payment: { paymentstatus } }),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || result.error || "Could not update payment status.");
      if (!result.data?.invoice) throw new Error("The server returned an invalid invoice update.");
      setInvoices((current) => current.map((item) => item.invoiceid === invoice.invoiceid ? result.data.invoice : item));
    } catch (updateError) {
      setPaymentUpdateError(updateError.message || "Could not update payment status.");
    } finally {
      setUpdatingPaymentInvoiceId(null);
    }
  }

  async function handleDownloadInvoice(invoice) {
    try {
      const { downloadInvoicePdf } = await import("./invoicePdf.js");
      downloadInvoicePdf(invoice, session.user);
      setDownloadError("");
    } catch (downloadFailure) {
      setDownloadError(downloadFailure.message || "Could not download invoice PDF.");
    }
  }

  if (!authReady) {
    return <main className="auth-loading" aria-live="polite">Loading your workspace…</main>;
  }

  if (!session?.token) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="VYAPAR home">
          <span className="brand-mark">V</span>
          <span>VYAPAR<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">{session.user?.businessName?.charAt(0)?.toUpperCase() || "B"}</span>
          <span className="workspace-copy"><strong>{session.user?.businessName || "Your business"}</strong><small>Business account</small></span>
          <ChevronDown size={16} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          <a className={`nav-item${activeView === "overview" ? " active" : ""}`} href="#overview" onClick={(event) => { event.preventDefault(); navigate("overview"); }}><LayoutDashboard size={18} />Overview</a>
          <a className={`nav-item${activeView === "invoices" ? " active" : ""}`} href="#invoices" onClick={(event) => { event.preventDefault(); navigate("invoices"); }}><FileText size={18} />Invoices<span className="nav-count">{invoices.length}</span></a>
          <a className={`nav-item${activeView === "customers" ? " active" : ""}`} href="#customers" onClick={(event) => { event.preventDefault(); navigate("customers"); }}><UsersRound size={18} />Customers</a>
          <a className={`nav-item${activeView === "products" ? " active" : ""}`} href="#products" onClick={(event) => { event.preventDefault(); navigate("products"); }}><Package size={18} />Products</a>
          <a className={`nav-item${activeView === "payments" ? " active" : ""}`} href="#payments" onClick={(event) => { event.preventDefault(); navigate("payments"); }}><WalletCards size={18} />Payments</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-row">
            <span className="profile-avatar">AO</span>
            <span className="workspace-copy"><strong>{session.user?.name || "Account owner"}</strong><small>{session.user?.email || "Owner"}</small></span>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</strong></div>
          <div className="topbar-actions">
            <button className="topbar-logout" onClick={handleLogout} aria-label="Log out" title="Log out"><LogOut size={17} /><span>Log out</span></button>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
            <span className="topbar-divider" />
            <span className="today-label">{new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</span>
          </div>
        </header>

        {activeView === "customers" ? <CustomerPage token={session.token} /> : activeView === "products" ? <ProductPage token={session.token} /> : <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
              <h1>{getGreeting()}, {session.user?.name?.split(" ")[0] || "there"}<span>.</span></h1>
              <p className="heading-subtitle">Here’s what’s happening with your business today.</p>
            </div>
            <button className="primary-button" onClick={() => setShowInvoiceComposer(true)}><FilePlus2 size={17} />Create invoice</button>
          </section>

          <section className="summary-grid" aria-label="Invoice summary">
            <article className="summary-card summary-card-dark">
              <div className="summary-label">Total invoiced <span className="summary-icon"><FileText size={17} /></span></div>
              <p className="summary-value">{formatCurrency(summary.total)}</p>
              <p className="summary-foot">Across {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}</p>
            </article>
            <article className="summary-card">
              <div className="summary-label">Collected <span className="summary-icon green-icon"><ArrowDownToLine size={17} /></span></div>
              <p className="summary-value">{formatCurrency(summary.collected)}</p>
              <p className="summary-foot">Payments received</p>
            </article>
            <article className="summary-card">
              <div className="summary-label">Outstanding <span className="summary-icon amber-icon"><WalletCards size={17} /></span></div>
              <p className="summary-value">{formatCurrency(summary.outstanding)}</p>
              <p className="summary-foot">{summary.pendingCount} awaiting payment</p>
            </article>
          </section>

          <section className="invoice-section" id="invoices">
            <div className="section-heading">
              <div><h2>Recent invoices</h2><p>Keep track of what’s been billed and paid.</p></div>
              <a className="text-link" href="#invoices">View all <ArrowUpRight size={15} /></a>
            </div>

            <div className="table-toolbar">
              <div className="filter-tabs" role="tablist" aria-label="Filter invoices">
                {filters.map((item) => (
                  <button
                    className={`filter-tab${filter === item ? " selected" : ""}`}
                    key={item}
                    onClick={() => setFilter(item)}
                    role="tab"
                    aria-selected={filter === item}
                  >
                    {item}
                    {item === "All invoices" && <span className="tab-count">{invoices.length}</span>}
                  </button>
                ))}
              </div>
              <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoices" aria-label="Search invoices" /></label>
            </div>
            {downloadError && <p className="auth-error product-page-error" role="alert">{downloadError}</p>}
            {paymentUpdateError && <p className="auth-error product-page-error" role="alert">{paymentUpdateError}</p>}

            <div className="table-wrap">
              <table>
                <thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>ISSUED</th><th>AMOUNT</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {loading && <tr><td className="table-message" colSpan="6">Loading invoices…</td></tr>}
                  {!loading && error && <tr><td className="table-message error-message" colSpan="6">{error} Check that the backend is running on port 5000.</td></tr>}
                  {!loading && !error && filteredInvoices.length === 0 && <tr><td className="table-message" colSpan="6">{invoices.length ? "No invoices match your search." : "No invoices yet. Create your first invoice to see it here."}</td></tr>}
                  {!loading && !error && filteredInvoices.map((invoice) => {
                    const status = getStatus(invoice);
                    return (
                      <tr key={invoice._id || invoice.invoiceid}>
                        <td><span className="invoice-number">INV-{String(invoice.invoiceid).padStart(4, "0")}</span></td>
                        <td><span className="customer-name">{invoice.customer?.name || "Unknown customer"}</span></td>
                        <td className="date-cell">{formatDate(invoice.invoicedate)}</td>
                        <td className="amount-cell">{formatCurrency(invoice.totalamount)}</td>
                        <td><div className="invoice-status-controls"><span className={`status-pill status-${status.toLowerCase()}`}><span />{status}</span><select className="payment-status-select" aria-label={`Update payment status for invoice ${invoice.invoiceid}`} value={invoice.payment?.paymentstatus || "Pending"} onChange={(event) => handlePaymentStatusUpdate(invoice, event.target.value)} disabled={updatingPaymentInvoiceId === invoice.invoiceid}><option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Failed">Failed</option><option value="Refunded">Refunded</option></select></div></td>
                        <td><button className="row-action" onClick={() => handleDownloadInvoice(invoice)} aria-label={`Download invoice ${invoice.invoiceid} as PDF`} title="Download PDF"><Download size={16} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing {filteredInvoices.length} of {invoices.length} invoices</span><span>Amounts in INR</span></div>
          </section>
          <footer className="page-footer">VYAPAR <span>·</span> GST billing, made clear.</footer>
        </div>}
      </main>
      {showInvoiceComposer && (
        <InvoiceComposer
          token={session.token}
          user={session.user}
          onClose={() => setShowInvoiceComposer(false)}
          onCreated={handleInvoiceCreated}
          onNavigateTo={(view) => { setShowInvoiceComposer(false); navigate(view); }}
        />
      )}
    </div>
  );
}

export default App;