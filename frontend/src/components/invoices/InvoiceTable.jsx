import { ArrowUpRight, Download, Search } from "lucide-react";
import { formatCurrency, formatDate, getStatus } from "../../utils/formatters.js";
import { INVOICE_FILTERS } from "../../constants/filters.js";

export default function InvoiceTable({
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
  onPaymentStatusUpdate,
  onDownloadInvoice,
}) {
  return (
    <section className="invoice-section" id="invoices">
      <div className="section-heading">
        <div>
          <h2>Recent invoices</h2>
          <p>Keep track of what’s been billed and paid.</p>
        </div>
        <a className="text-link" href="#invoices">
          View all <ArrowUpRight size={15} />
        </a>
      </div>

      <div className="table-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Filter invoices">
          {INVOICE_FILTERS.map((item) => (
            <button
              className={`filter-tab${filter === item ? " selected" : ""}`}
              key={item}
              onClick={() => setFilter(item)}
              role="tab"
              aria-selected={filter === item}
            >
              {item}
              {item === "All invoices" && (
                <span className="tab-count">{invoices.length}</span>
              )}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search invoices"
            aria-label="Search invoices"
          />
        </label>
      </div>

      {downloadError && (
        <p className="auth-error product-page-error" role="alert">
          {downloadError}
        </p>
      )}
      {paymentUpdateError && (
        <p className="auth-error product-page-error" role="alert">
          {paymentUpdateError}
        </p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>INVOICE</th>
              <th>CUSTOMER</th>
              <th>ISSUED</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="table-message" colSpan="6">
                  Loading invoices…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td className="table-message error-message" colSpan="6">
                  {error} Check that the backend is running on port 5000.
                </td>
              </tr>
            )}
            {!loading && !error && filteredInvoices.length === 0 && (
              <tr>
                <td className="table-message" colSpan="6">
                  {invoices.length
                    ? "No invoices match your search."
                    : "No invoices yet. Create your first invoice to see it here."}
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              filteredInvoices.map((invoice) => {
                const status = getStatus(invoice);
                return (
                  <tr key={invoice._id || invoice.invoiceid}>
                    <td>
                      <span className="invoice-number">
                        INV-{String(invoice.invoiceid).padStart(4, "0")}
                      </span>
                    </td>
                    <td>
                      <span className="customer-name">
                        {invoice.customer?.name || "Unknown customer"}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(invoice.invoicedate)}
                    </td>
                    <td className="amount-cell">
                      {formatCurrency(invoice.totalamount)}
                    </td>
                    <td>
                      <div className="invoice-status-controls">
                        <span className={`status-pill status-${status.toLowerCase()}`}>
                          <span />
                          {status}
                        </span>
                        <select
                          className="payment-status-select"
                          aria-label={`Update payment status for invoice ${invoice.invoiceid}`}
                          value={invoice.payment?.paymentstatus || "Pending"}
                          onChange={(event) =>
                            onPaymentStatusUpdate(invoice, event.target.value)
                          }
                          disabled={updatingPaymentInvoiceId === invoice.invoiceid}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <button
                        className="row-action"
                        onClick={() => onDownloadInvoice(invoice)}
                        aria-label={`Download invoice ${invoice.invoiceid} as PDF`}
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </span>
        <span>Amounts in INR</span>
      </div>
    </section>
  );
}
