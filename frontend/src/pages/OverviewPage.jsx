import { FilePlus2 } from "lucide-react";
import SummaryCards from "../components/overview/SummaryCards.jsx";
import InvoiceTable from "../components/invoices/InvoiceTable.jsx";
import { getGreeting } from "../utils/formatters.js";

export default function OverviewPage({
  user,
  summary,
  invoices,
  filteredInvoices,
  filter,
  setFilter,
  query,
  setQuery,
  loading,
  error,
  downloadError,
  paymentUpdateError,
  updatingPaymentInvoiceId,
  onOpenComposer,
  onPaymentStatusUpdate,
  onDownloadInvoice,
}) {
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
          <h1>
            {getGreeting()}, {firstName}
            <span>.</span>
          </h1>
          <p className="heading-subtitle">
            Here’s what’s happening with your business today.
          </p>
        </div>
        <button className="primary-button" onClick={onOpenComposer}>
          <FilePlus2 size={17} />
          Create invoice
        </button>
      </section>

      <SummaryCards summary={summary} invoiceCount={invoices.length} />

      <InvoiceTable
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
        onPaymentStatusUpdate={onPaymentStatusUpdate}
        onDownloadInvoice={onDownloadInvoice}
      />

      <footer className="page-footer">
        VYAPAR <span>·</span> GST billing, made clear.
      </footer>
    </div>
  );
}
