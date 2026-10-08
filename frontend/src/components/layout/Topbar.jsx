import { LogOut } from "lucide-react";

export default function Topbar({ activeView, onLogout }) {
  const formattedToday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const viewTitle = activeView.charAt(0).toUpperCase() + activeView.slice(1);

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-slash">/</span>
        <strong>{viewTitle}</strong>
      </div>
      <div className="topbar-actions">
        <button
          className="topbar-logout"
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={17} />
          <span>Log out</span>
        </button>
        <span className="topbar-divider" />
        <span className="today-label">{formattedToday}</span>
      </div>
    </header>
  );
}
