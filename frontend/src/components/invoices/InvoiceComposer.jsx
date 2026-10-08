import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Package,
  Plus,
  UsersRound,
  X,
} from "lucide-react";
import ProductForm from "../products/ProductForm.jsx";
import { fetchCustomers } from "../../api/customerApi.js";
import { fetchProducts } from "../../api/productApi.js";
import { createInvoice } from "../../api/invoiceApi.js";
import { formatCurrency } from "../../utils/formatters.js";

export default function InvoiceComposer({ token, user, onClose, onCreated, onNavigateTo }) {
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

    Promise.all([fetchCustomers(token), fetchProducts(token)])
      .then(([customerResult, productResult]) => {
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
    const lineTax = (lineSubtotal * Number(product.gst?.gstrate || 0)) / 100;
    return {
      subtotal: result.subtotal + lineSubtotal,
      cgst: result.cgst + lineTax / 2,
      sgst: result.sgst + lineTax / 2,
    };
  }, { subtotal: 0, cgst: 0, sgst: 0 });

  function updateItem(itemId, field, value) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
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
        return current.map((item, index) =>
          index === emptyRowIndex
            ? { ...item, productid: String(product.productid) }
            : item
        );
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
      const payload = {
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
      };

      const invoice = await createInvoice(token, payload);
      onCreated(invoice);
    } catch (submitError) {
      setError(submitError.message || "Could not create invoice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="invoice-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="invoice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-form-title"
      >
        <header className="invoice-modal-header">
          <div>
            <p className="eyebrow">BILLING</p>
            <h2 id="invoice-form-title">Create invoice</h2>
            <p>Choose a customer and add the products being billed.</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close invoice form"
          >
            <X size={19} />
          </button>
        </header>

        {loading ? (
          <p className="invoice-form-state">Loading customers and products…</p>
        ) : (
          <form onSubmit={submitInvoice}>
            {(customers.length === 0 || products.length === 0) && !error && (
              <div className="invoice-form-state">
                <p>Add at least one customer and one in-stock product before creating an invoice.</p>
                <div className="invoice-setup-actions">
                  {customers.length === 0 && (
                    <button type="button" onClick={() => onNavigateTo("customers")}>
                      <UsersRound size={15} />
                      Add customers
                    </button>
                  )}
                  {products.length === 0 && (
                    <button type="button" onClick={() => setShowProductForm(true)}>
                      <Package size={15} />
                      Create a product
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="invoice-form-grid">
              <label className="invoice-field">
                <span>Customer</span>
                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  required
                  disabled={customers.length === 0}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.customerid} value={c.customerid}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="invoice-field">
                <span>Invoice date</span>
                <span className="invoice-date-input">
                  <CalendarDays size={16} />
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(event) => setInvoiceDate(event.target.value)}
                    required
                  />
                </span>
              </label>
            </div>

            <div className="invoice-items-heading">
              <div>
                <h3>Products</h3>
                <p>Prices and GST rates come from your product list.</p>
              </div>
            </div>

            <div className="invoice-item-list">
              {items.map((item) => {
                const product = products.find((entry) => String(entry.productid) === item.productid);
                return (
                  <div className="invoice-item-row" key={item.id}>
                    <label className="invoice-field product-select-field">
                      <span>Product</span>
                      <select
                        value={item.productid}
                        onChange={(event) => updateItem(item.id, "productid", event.target.value)}
                        required
                        disabled={products.length === 0}
                      >
                        <option value="">Select product</option>
                        {products.map((option) => {
                          const selectedElsewhere = items.some(
                            (other) => other.id !== item.id && other.productid === String(option.productid)
                          );
                          return (
                            <option
                              key={option.productid}
                              value={option.productid}
                              disabled={selectedElsewhere || option.quantity < 1}
                            >
                              {option.productname} · {formatCurrency(option.price)}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="invoice-field quantity-field">
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        max={product?.quantity || undefined}
                        value={item.buyitem}
                        onChange={(event) => updateItem(item.id, "buyitem", event.target.value)}
                        required
                      />
                    </label>
                    <div className="invoice-line-total">
                      <span>Line total</span>
                      <strong>
                        {product
                          ? formatCurrency(
                              Number(product.price) *
                                Number(item.buyitem) *
                                (1 + Number(product.gst?.gstrate || 0) / 100)
                            )
                          : "—"}
                      </strong>
                      {product && (
                        <small>
                          {product.quantity} in stock ·{" "}
                          {product.gst?.gsttype === "CGST+SGST"
                            ? `CGST ${Number(product.gst.gstrate) / 2}% + SGST ${Number(product.gst.gstrate) / 2}%`
                            : `GST ${product.gst?.gstrate || 0}%`}
                        </small>
                      )}
                    </div>
                    <button
                      className="remove-item-button"
                      type="button"
                      onClick={() =>
                        setItems((current) => current.filter((entry) => entry.id !== item.id))
                      }
                      aria-label="Remove product"
                      disabled={items.length === 1}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="invoice-item-actions">
              <button
                className="add-item-button"
                type="button"
                onClick={() =>
                  setItems((current) => [...current, { id: Date.now(), productid: "", buyitem: 1 }])
                }
                disabled={items.length >= products.length}
              >
                <Plus size={15} />
                Add product line
              </button>
              <button
                className="add-item-button"
                type="button"
                onClick={() => setShowProductForm(true)}
              >
                <Package size={15} />
                Create product
              </button>
            </div>

            <div className="invoice-total-block">
              <div>
                <span>Subtotal</span>
                <strong>{formatCurrency(totals.subtotal)}</strong>
              </div>
              <div>
                <span>CGST</span>
                <strong>{formatCurrency(totals.cgst)}</strong>
              </div>
              <div>
                <span>SGST</span>
                <strong>{formatCurrency(totals.sgst)}</strong>
              </div>
              <div className="invoice-grand-total">
                <span>Total due</span>
                <strong>{formatCurrency(totals.subtotal + totals.cgst + totals.sgst)}</strong>
              </div>
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <footer className="invoice-modal-footer">
              <button className="secondary-button" type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={
                  submitting ||
                  loading ||
                  customers.length === 0 ||
                  products.length === 0
                }
              >
                {submitting ? "Creating…" : "Create invoice"}
                <ArrowUpRight size={16} />
              </button>
            </footer>
          </form>
        )}
      </section>
      {showProductForm && (
        <ProductForm
          token={token}
          onClose={() => setShowProductForm(false)}
          onSaved={addProductToInvoice}
        />
      )}
    </div>
  );
}
