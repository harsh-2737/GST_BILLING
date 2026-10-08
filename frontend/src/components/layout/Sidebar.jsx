import {
  FileText,
  LayoutDashboard,
  Package,
  UsersRound,
  WalletCards,
} from "lucide-react";

export default function Sidebar({ user, activeView, invoiceCount, onNavigate }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label="VYAPAR home">
        <span className="brand-mark">V</span>
        <span>VYAPAR<span className="brand-period">.</span></span>
      </a>

      <div className="workspace-switcher">
        <span className="workspace-avatar">
          {user?.businessName?.charAt(0)?.toUpperCase() || "B"}
        </span>
        <span className="workspace-copy">
          <strong>{user?.businessName || "Your business"}</strong>
          <small>Business account</small>
        </span>
      </div>

      <p className="nav-label">WORKSPACE</p>
      <nav className="main-nav" aria-label="Main navigation">
        <a
          className={`nav-item${activeView === "overview" ? " active" : ""}`}
          href="#overview"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("overview");
          }}
        >
          <LayoutDashboard size={18} />
          Overview
        </a>
        <a
          className={`nav-item${activeView === "invoices" ? " active" : ""}`}
          href="#invoices"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("invoices");
          }}
        >
          <FileText size={18} />
          Invoices
          <span className="nav-count">{invoiceCount}</span>
        </a>
        <a
          className={`nav-item${activeView === "customers" ? " active" : ""}`}
          href="#customers"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("customers");
          }}
        >
          <UsersRound size={18} />
          Customers
        </a>
        <a
          className={`nav-item${activeView === "products" ? " active" : ""}`}
          href="#products"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("products");
          }}
        >
          <Package size={18} />
          Products
        </a>
        <a
          className={`nav-item${activeView === "payments" ? " active" : ""}`}
          href="#payments"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("payments");
          }}
        >
          <WalletCards size={18} />
          Payments
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-row">
          <span className="profile-avatar">AO</span>
          <span className="workspace-copy">
            <strong>{user?.name || "Account owner"}</strong>
            <small>{user?.email || "Owner"}</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
