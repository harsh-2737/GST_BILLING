import { ArrowDownToLine, FileText, WalletCards } from "lucide-react";
import { formatCurrency } from "../../utils/formatters.js";

export default function SummaryCards({ summary, invoiceCount }) {
  return (
    <section className="summary-grid" aria-label="Invoice summary">
      <article className="summary-card summary-card-dark">
        <div className="summary-label">
          Total invoiced{" "}
          <span className="summary-icon">
            <FileText size={17} />
          </span>
        </div>
        <p className="summary-value">{formatCurrency(summary.total)}</p>
        <p className="summary-foot">
          Across {invoiceCount} {invoiceCount === 1 ? "invoice" : "invoices"}
        </p>
      </article>

      <article className="summary-card">
        <div className="summary-label">
          Collected{" "}
          <span className="summary-icon green-icon">
            <ArrowDownToLine size={17} />
          </span>
        </div>
        <p className="summary-value">{formatCurrency(summary.collected)}</p>
        <p className="summary-foot">Payments received</p>
      </article>

      <article className="summary-card">
        <div className="summary-label">
          Outstanding{" "}
          <span className="summary-icon amber-icon">
            <WalletCards size={17} />
          </span>
        </div>
        <p className="summary-value">{formatCurrency(summary.outstanding)}</p>
        <p className="summary-foot">
          {summary.pendingCount} awaiting payment
        </p>
      </article>
    </section>
  );
}
