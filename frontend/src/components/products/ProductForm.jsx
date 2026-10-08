import { useState } from "react";
import { ArrowUpRight, Boxes, X } from "lucide-react";
import { createProduct, updateProduct } from "../../api/productApi.js";

export default function ProductForm({ token, onClose, onSaved, onCreated, product }) {
  const isEditing = Boolean(product);
  const saveHandler = typeof onSaved === "function" ? onSaved : onCreated;
  const [form, setForm] = useState(() =>
    product
      ? {
          productname: product.productname || "",
          quantity: String(product.quantity ?? ""),
          price: String(product.price ?? ""),
          hsncode: product.hsncode || "",
          gstrate: String(product.gst?.gstrate ?? "18"),
        }
      : { productname: "", quantity: "", price: "", hsncode: "", gstrate: "18" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        productname: form.productname,
        quantity: Number(form.quantity),
        price: Number(form.price),
        hsncode: form.hsncode,
        gst: { gstrate: Number(form.gstrate) },
      };
      const result = isEditing
        ? await updateProduct(token, product.productid, payload)
        : await createProduct(token, payload);

      if (typeof saveHandler === "function") {
        saveHandler(result);
      }
    } catch (submitError) {
      setError(submitError.message || "Could not add product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="entity-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="entity-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <header className="entity-modal-heading">
          <div>
            <p className="eyebrow">INVENTORY</p>
            <h2 id="product-form-title">
              {isEditing ? "Edit product" : "Add product"}
            </h2>
            <p>Set the price, available stock, and total GST rate.</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close product form"
          >
            <X size={19} />
          </button>
        </header>

        <form className="entity-form" onSubmit={submitProduct}>
          <label className="auth-field">
            <span>Product name</span>
            <span className="auth-input-wrap">
              <Boxes size={16} />
              <input
                name="productname"
                value={form.productname}
                onChange={updateField}
                minLength="2"
                maxLength="150"
                required
                placeholder="Product name"
              />
            </span>
          </label>

          <div className="entity-form-grid">
            <label className="auth-field">
              <span>Price per unit (INR)</span>
              <span className="auth-input-wrap">
                <span className="currency-mark">₹</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={updateField}
                  required
                  placeholder="0.00"
                />
              </span>
            </label>

            <label className="auth-field">
              <span>Opening stock</span>
              <span className="auth-input-wrap">
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={updateField}
                  required
                  placeholder="0"
                />
              </span>
            </label>
          </div>

          <div className="entity-form-grid">
            <label className="auth-field">
              <span>HSN code</span>
              <span className="auth-input-wrap">
                <input
                  name="hsncode"
                  value={form.hsncode}
                  onChange={updateField}
                  inputMode="numeric"
                  pattern="[0-9]{4,8}"
                  minLength="4"
                  maxLength="8"
                  required
                  placeholder="4 to 8 digits"
                />
              </span>
            </label>

            <label className="auth-field">
              <span>GST rate</span>
              <span className="auth-input-wrap">
                <select name="gstrate" value={form.gstrate} onChange={updateField}>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </span>
            </label>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <footer className="entity-modal-footer">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Saving…"
                : isEditing
                ? "Save changes"
                : "Add product"}
              <ArrowUpRight size={16} />
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
