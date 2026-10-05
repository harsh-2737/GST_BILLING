import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck, Mail, MapPin, Pencil, Phone, Plus, Trash2, UserRound, X } from "lucide-react";
import { readApiResponse } from "./api.js";

function CustomerForm({ token, onClose, onSaved, customer }) {
  const isEditing = Boolean(customer);
  const [form, setForm] = useState(() => customer ? {
    name: customer.name || "",
    email: customer.email || "",
    phone_no: customer.phone_no || "",
    gstin: customer.gstin || "",
    address: customer.address || "",
  } : { name: "", email: "", phone_no: "", gstin: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitCustomer(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(isEditing ? `/api/customers/update/${customer.customerid}` : "/api/customers/create", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || result.error || "Could not add customer.");
      onSaved(result);
    } catch (submitError) {
      setError(submitError.message || "Could not add customer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="entity-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="entity-modal" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
        <header className="entity-modal-heading">
          <div><p className="eyebrow">DIRECTORY</p><h2 id="customer-form-title">{isEditing ? "Edit customer" : "Add customer"}</h2><p>{isEditing ? "Update this customer’s details." : "Save a customer for future invoices."}</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close customer form"><X size={19} /></button>
        </header>
        <form className="entity-form" onSubmit={submitCustomer}>
          <label className="auth-field"><span>Customer name</span><span className="auth-input-wrap"><UserRound size={16} /><input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength="2" maxLength="100" autoComplete="name" required placeholder="Full name or business name" /></span></label>
          <label className="auth-field"><span>Email address</span><span className="auth-input-wrap"><Mail size={16} /><input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required placeholder="customer@company.com" /></span></label>
          <label className="auth-field"><span>Mobile number</span><span className="auth-input-wrap"><Phone size={16} /><input name="phone_no" type="tel" value={form.phone_no} onChange={(event) => setForm({ ...form, phone_no: event.target.value })} autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" required placeholder="10-digit mobile number" /></span></label>
          <label className="auth-field"><span>GSTIN</span><span className="auth-input-wrap"><BadgeCheck size={16} /><input name="gstin" value={form.gstin} onChange={(event) => setForm({ ...form, gstin: event.target.value.toUpperCase() })} autoCapitalize="characters" pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]" minLength="15" maxLength="15" required placeholder="15-character GSTIN" /></span></label>
          <label className="auth-field"><span>Address</span><span className="auth-input-wrap"><MapPin size={16} /><input name="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} autoComplete="street-address" minLength="5" maxLength="300" required placeholder="Customer billing address" /></span></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <footer className="entity-modal-footer"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Saving…" : isEditing ? "Save changes" : "Add customer"}<ArrowUpRight size={16} /></button></footer>
        </form>
      </section>
    </div>
  );
}

export default function CustomerPage({ token }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/customers", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.message || result.error || "Could not load customers.");
        if (!Array.isArray(result)) throw new Error("The server returned an invalid customer list.");
        if (active) setCustomers(result);
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  function saveCustomer(customer) {
    if (editingCustomer) {
      setCustomers((current) => current.map((item) => item.customerid === customer.customerid ? customer : item));
    } else {
      setCustomers((current) => [...current, customer]);
    }
    setShowForm(false);
    setEditingCustomer(null);
  }

  async function deleteCustomer(customer) {
    if (!window.confirm(`Delete ${customer.name}? This cannot be undone.`)) return;

    setDeletingCustomerId(customer.customerid);
    setActionError("");
    try {
      const response = await fetch(`/api/customers/delete/${customer.customerid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || result.error || "Could not delete customer.");
      setCustomers((current) => current.filter((item) => item.customerid !== customer.customerid));
    } catch (deleteError) {
      setActionError(deleteError.message || "Could not delete customer.");
    } finally {
      setDeletingCustomerId(null);
    }
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div><p className="eyebrow">BUSINESS DIRECTORY</p><h1>Customers<span>.</span></h1><p className="heading-subtitle">Keep customer details ready for invoicing.</p></div>
        <button className="primary-button" onClick={() => { setEditingCustomer(null); setShowForm(true); }}><Plus size={17} />Add customer</button>
      </section>
      <section className="invoice-section entity-list-section">
        <div className="section-heading"><div><h2>All customers</h2><p>{customers.length} saved {customers.length === 1 ? "customer" : "customers"}</p></div></div>
        {actionError && <p className="auth-error product-page-error" role="alert">{actionError}</p>}
        <div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>GSTIN</th><th>ADDRESS</th><th>EMAIL</th><th>MOBILE</th><th aria-label="Actions" /></tr></thead><tbody>
          {loading && <tr><td className="table-message" colSpan="6">Loading customers…</td></tr>}
          {!loading && error && <tr><td className="table-message error-message" colSpan="6">{error}</td></tr>}
          {!loading && !error && customers.length === 0 && <tr><td className="table-message" colSpan="6">No customers yet. Add a customer to start creating invoices.</td></tr>}
          {!loading && !error && customers.map((customer) => <tr key={customer.customerid}><td><span className="customer-name">{customer.name}</span></td><td className="date-cell">{customer.gstin || "—"}</td><td className="date-cell">{customer.address || "—"}</td><td className="date-cell">{customer.email}</td><td className="date-cell">{customer.phone_no}</td><td><div className="invoice-item-actions customer-row-actions"><button className="row-action" onClick={() => { setEditingCustomer(customer); setShowForm(true); }} aria-label={`Edit ${customer.name}`} title="Edit customer"><Pencil size={15} /></button><button className="row-action row-action-danger" onClick={() => deleteCustomer(customer)} disabled={deletingCustomerId !== null} aria-label={`Delete ${customer.name}`} title="Delete customer">{deletingCustomerId === customer.customerid ? "…" : <Trash2 size={16} />}</button></div></td></tr>)}
        </tbody></table></div>
        <div className="table-footer"><span>Showing {customers.length} customers</span><span>Customer directory</span></div>
      </section>
      {showForm && <CustomerForm token={token} customer={editingCustomer} onClose={() => { setShowForm(false); setEditingCustomer(null); }} onSaved={saveCustomer} />}
    </div>
  );
}