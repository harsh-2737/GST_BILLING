import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import { createCustomer, updateCustomer } from "../../api/customerApi.js";

export default function CustomerForm({ token, onClose, onSaved, customer }) {
  const isEditing = Boolean(customer);
  const [form, setForm] = useState(() =>
    customer
      ? {
          name: customer.name || "",
          email: customer.email || "",
          phone_no: customer.phone_no || "",
          gstin: customer.gstin || "",
          address: customer.address || "",
        }
      : { name: "", email: "", phone_no: "", gstin: "", address: "" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitCustomer(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = isEditing
        ? await updateCustomer(token, customer.customerid, form)
        : await createCustomer(token, form);
      onSaved(result);
    } catch (submitError) {
      setError(submitError.message || "Could not add customer.");
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
        aria-labelledby="customer-form-title"
      >
        <header className="entity-modal-heading">
          <div>
            <p className="eyebrow">DIRECTORY</p>
            <h2 id="customer-form-title">
              {isEditing ? "Edit customer" : "Add customer"}
            </h2>
            <p>
              {isEditing
                ? "Update this customer’s details."
                : "Save a customer for future invoices."}
            </p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close customer form"
          >
            <X size={19} />
          </button>
        </header>

        <form className="entity-form" onSubmit={submitCustomer}>
          <label className="auth-field">
            <span>Customer name</span>
            <span className="auth-input-wrap">
              <UserRound size={16} />
              <input
                name="name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                minLength="2"
                maxLength="100"
                autoComplete="name"
                required
                placeholder="Full name or business name"
              />
            </span>
          </label>

          <label className="auth-field">
            <span>Email address</span>
            <span className="auth-input-wrap">
              <Mail size={16} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                autoComplete="email"
                required
                placeholder="customer@company.com"
              />
            </span>
          </label>

          <label className="auth-field">
            <span>Mobile number</span>
            <span className="auth-input-wrap">
              <Phone size={16} />
              <input
                name="phone_no"
                type="tel"
                value={form.phone_no}
                onChange={(event) =>
                  setForm({ ...form, phone_no: event.target.value })
                }
                autoComplete="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength="10"
                required
                placeholder="10-digit mobile number"
              />
            </span>
          </label>

          <label className="auth-field">
            <span>GSTIN</span>
            <span className="auth-input-wrap">
              <BadgeCheck size={16} />
              <input
                name="gstin"
                value={form.gstin}
                onChange={(event) =>
                  setForm({ ...form, gstin: event.target.value.toUpperCase() })
                }
                autoCapitalize="characters"
                pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]"
                minLength="15"
                maxLength="15"
                placeholder="15-character GSTIN (optional)"
              />
            </span>
          </label>

          <label className="auth-field">
            <span>Address</span>
            <span className="auth-input-wrap">
              <MapPin size={16} />
              <input
                name="address"
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                autoComplete="street-address"
                minLength="5"
                maxLength="300"
                required
                placeholder="Customer billing address"
              />
            </span>
          </label>

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
                : "Add customer"}
              <ArrowUpRight size={16} />
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
