import { useEffect, useState } from "react";
import { ArrowUpRight, Boxes, Pencil, Plus, Trash2, X } from "lucide-react";
import { readApiResponse } from "./api.js";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

export function ProductForm({ token, onClose, onSaved, onCreated, product }) {
  const isEditing = Boolean(product);
  const saveHandler = typeof onSaved === "function" ? onSaved : onCreated;
  const [form, setForm] = useState(() => product ? {
    productname: product.productname || "",
    quantity: String(product.quantity ?? ""),
    price: String(product.price ?? ""),
    hsncode: product.hsncode || "",
    gstrate: String(product.gst?.gstrate ?? "18"),
  } : { productname: "", quantity: "", price: "", hsncode: "", gstrate: "18" });
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
      const response = await fetch(isEditing ? `/api/products/update/${product.productid}` : "/api/products/create", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productname: form.productname,
          quantity: Number(form.quantity),
          price: Number(form.price),
          hsncode: form.hsncode,
          gst: { gstrate: Number(form.gstrate) },
        }),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || result.error || "Could not add product.");
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
    <div className="entity-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="entity-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
        <header className="entity-modal-heading">
          <div><p className="eyebrow">INVENTORY</p><h2 id="product-form-title">{isEditing ? "Edit product" : "Add product"}</h2><p>Set the price, available stock, and total GST rate.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close product form"><X size={19} /></button>
        </header>
        <form className="entity-form" onSubmit={submitProduct}>
          <label className="auth-field"><span>Product name</span><span className="auth-input-wrap"><Boxes size={16} /><input name="productname" value={form.productname} onChange={updateField} minLength="2" maxLength="150" required placeholder="Product name" /></span></label>
          <div className="entity-form-grid">
            <label className="auth-field"><span>Price per unit (INR)</span><span className="auth-input-wrap"><span className="currency-mark">₹</span><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} required placeholder="0.00" /></span></label>
            <label className="auth-field"><span>Opening stock</span><span className="auth-input-wrap"><input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={updateField} required placeholder="0" /></span></label>
          </div>
          <div className="entity-form-grid">
            <label className="auth-field"><span>HSN code</span><span className="auth-input-wrap"><input name="hsncode" value={form.hsncode} onChange={updateField} inputMode="numeric" pattern="[0-9]{4,8}" minLength="4" maxLength="8" required placeholder="4 to 8 digits" /></span></label>
            <label className="auth-field"><span>GST rate</span><span className="auth-input-wrap"><select name="gstrate" value={form.gstrate} onChange={updateField}><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option></select></span></label>
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <footer className="entity-modal-footer"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Saving…" : isEditing ? "Save changes" : "Add product"}<ArrowUpRight size={16} /></button></footer>
        </form>
      </section>
    </div>
  );
}

export default function ProductPage({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.message || result.error || "Could not load products.");
        if (!Array.isArray(result)) throw new Error("The server returned an invalid product list.");
        if (active) setProducts(result);
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  function saveProduct(product) {
    if (editingProduct) {
      if (Number(product.quantity) > 0 && !product.archived) {
        setProducts((current) => current.map((item) => item.productid === product.productid ? product : item));
      } else {
        setProducts((current) => current.filter((item) => item.productid !== product.productid));
      }
    } else if (Number(product.quantity) > 0 && !product.archived) {
      setProducts((current) => [...current, product]);
    }
    setShowForm(false);
    setEditingProduct(null);
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete ${product.productname} from your products?`)) return;

    setDeletingProductId(product.productid);
    setError("");
    try {
      const response = await fetch(`/api/products/delete/${product.productid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || result.error || "Could not delete product.");
      setProducts((current) => current.filter((item) => item.productid !== product.productid));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete product.");
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div><p className="eyebrow">INVENTORY</p><h1>Products<span>.</span></h1><p className="heading-subtitle">Manage what you sell, stock levels, and GST rates.</p></div>
        <button className="primary-button" onClick={() => { setEditingProduct(null); setShowForm(true); }}><Plus size={17} />Add product</button>
      </section>
      <section className="invoice-section entity-list-section">
        <div className="section-heading"><div><h2>All products</h2><p>{products.length} listed {products.length === 1 ? "product" : "products"}</p></div></div>
        {error && <p className="auth-error product-page-error" role="alert">{error}</p>}
        <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>HSN</th><th>PRICE</th><th>GST</th><th>IN STOCK</th><th aria-label="Actions" /></tr></thead><tbody>
          {loading && <tr><td className="table-message" colSpan="6">Loading products…</td></tr>}
          {!loading && error && products.length === 0 && <tr><td className="table-message error-message" colSpan="6">{error}</td></tr>}
          {!loading && !error && products.length === 0 && <tr><td className="table-message" colSpan="6">No products yet. Add a product to use it on invoices.</td></tr>}
          {!loading && products.map((product) => <tr key={product.productid}><td><span className="customer-name">{product.productname}</span></td><td className="date-cell">{product.hsncode}</td><td className="amount-cell">{formatCurrency(product.price)}</td><td className="date-cell">{product.gst?.gsttype === "CGST+SGST" ? `CGST ${Number(product.gst.gstrate) / 2}% + SGST ${Number(product.gst.gstrate) / 2}%` : `${product.gst?.gsttype} · ${product.gst?.gstrate}%`}</td><td><span className={Number(product.quantity) < 1 ? "stock-empty" : "date-cell"}>{product.quantity}</span></td><td><div className="invoice-item-actions customer-row-actions"><button className="row-action" onClick={() => { setEditingProduct(product); setShowForm(true); }} aria-label={`Edit ${product.productname}`} title="Edit product"><Pencil size={15} /></button><button className="delete-product-button" onClick={() => deleteProduct(product)} disabled={deletingProductId !== null} aria-label={`Delete ${product.productname}`} title="Delete product">{deletingProductId === product.productid ? "…" : <Trash2 size={16} />}</button></div></td></tr>)}
        </tbody></table></div>
        <div className="table-footer"><span>Showing {products.length} products</span><span>Amounts in INR</span></div>
      </section>
      {showForm && <ProductForm token={token} product={editingProduct} onClose={() => { setShowForm(false); setEditingProduct(null); }} onSaved={saveProduct} />}
    </div>
  );
}