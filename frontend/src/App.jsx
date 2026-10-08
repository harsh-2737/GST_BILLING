import { useEffect, useMemo, useState } from "react";
import AuthScreen from "./components/auth/AuthScreen.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Topbar from "./components/layout/Topbar.jsx";
import InvoiceComposer from "./components/invoices/InvoiceComposer.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import CustomerPage from "./pages/CustomerPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import { fetchCurrentUser, logoutUser } from "./api/authApi.js";
import { fetchInvoices, updateInvoicePaymentStatus } from "./api/invoiceApi.js";
import { getStatus } from "./utils/formatters.js";

const VALID_VIEWS = ["customers", "products", "invoices", "payments"];

function App() {
  const [activeView, setActiveView] = useState(() => {
    const requestedView = window.location.hash.slice(1);
    return VALID_VIEWS.includes(requestedView) ? requestedView : "overview";
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
    fetchCurrentUser(session.token)
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
    fetchInvoices(session.token)
      .then((invoiceList) => {
        if (active) setInvoices(invoiceList);
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
      if (session?.token) {
        await logoutUser(session.token);
      }
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
      const updatedInvoice = await updateInvoicePaymentStatus(
        session.token,
        invoice.invoiceid,
        paymentstatus
      );
      setInvoices((current) =>
        current.map((item) =>
          item.invoiceid === invoice.invoiceid ? updatedInvoice : item
        )
      );
    } catch (updateError) {
      setPaymentUpdateError(updateError.message || "Could not update payment status.");
    } finally {
      setUpdatingPaymentInvoiceId(null);
    }
  }

  async function handleDownloadInvoice(invoice) {
    try {
      const { downloadInvoicePdf } = await import("./services/invoicePdf.js");
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
      <Sidebar
        user={session.user}
        activeView={activeView}
        invoiceCount={invoices.length}
        onNavigate={navigate}
      />

      <main className="main-content" id="overview">
        <Topbar activeView={activeView} onLogout={handleLogout} />

        {activeView === "customers" ? (
          <CustomerPage token={session.token} />
        ) : activeView === "products" ? (
          <ProductPage token={session.token} />
        ) : (
          <OverviewPage
            user={session.user}
            summary={summary}
            invoices={invoices}
            filteredInvoices={filteredInvoices}
            filter={filter}
            setFilter={setFilter}
            query={query}
            setQuery={setQuery}
            loading={loading}
            error={error}
            downloadError={downloadError}
            paymentUpdateError={paymentUpdateError}
            updatingPaymentInvoiceId={updatingPaymentInvoiceId}
            onOpenComposer={() => setShowInvoiceComposer(true)}
            onPaymentStatusUpdate={handlePaymentStatusUpdate}
            onDownloadInvoice={handleDownloadInvoice}
          />
        )}
      </main>

      {showInvoiceComposer && (
        <InvoiceComposer
          token={session.token}
          user={session.user}
          onClose={() => setShowInvoiceComposer(false)}
          onCreated={handleInvoiceCreated}
          onNavigateTo={(view) => {
            setShowInvoiceComposer(false);
            navigate(view);
          }}
        />
      )}
    </div>
  );
}

export default App;