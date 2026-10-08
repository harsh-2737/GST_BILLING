import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import CustomerForm from "../components/customers/CustomerForm.jsx";
import { deleteCustomer as deleteCustomerApi, fetchCustomers } from "../api/customerApi.js";

export { CustomerForm };

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

    fetchCustomers(token)
      .then((result) => {
        if (active) setCustomers(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function saveCustomer(customer) {
    if (editingCustomer) {
      setCustomers((current) =>
        current.map((item) =>
          item.customerid === customer.customerid ? customer : item
        )
      );
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
      await deleteCustomerApi(token, customer.customerid);
      setCustomers((current) =>
        current.filter((item) => item.customerid !== customer.customerid)
      );
    } catch (deleteError) {
      setActionError(deleteError.message || "Could not delete customer.");
    } finally {
      setDeletingCustomerId(null);
    }
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">BUSINESS DIRECTORY</p>
          <h1>
            Customers<span>.</span>
          </h1>
          <p className="heading-subtitle">
            Keep customer details ready for invoicing.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingCustomer(null);
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Add customer
        </button>
      </section>

      <section className="invoice-section entity-list-section">
        <div className="section-heading">
          <div>
            <h2>All customers</h2>
            <p>
              {customers.length} saved{" "}
              {customers.length === 1 ? "customer" : "customers"}
            </p>
          </div>
        </div>

        {actionError && (
          <p className="auth-error product-page-error" role="alert">
            {actionError}
          </p>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>GSTIN</th>
                <th>ADDRESS</th>
                <th>EMAIL</th>
                <th>MOBILE</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="table-message" colSpan="6">
                    Loading customers…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="table-message error-message" colSpan="6">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && customers.length === 0 && (
                <tr>
                  <td className="table-message" colSpan="6">
                    No customers yet. Add a customer to start creating invoices.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                customers.map((customer) => (
                  <tr key={customer.customerid}>
                    <td>
                      <span className="customer-name">{customer.name}</span>
                    </td>
                    <td className="date-cell">{customer.gstin || "—"}</td>
                    <td className="date-cell">{customer.address || "—"}</td>
                    <td className="date-cell">{customer.email}</td>
                    <td className="date-cell">{customer.phone_no}</td>
                    <td>
                      <div className="invoice-item-actions customer-row-actions">
                        <button
                          className="row-action"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setShowForm(true);
                          }}
                          aria-label={`Edit ${customer.name}`}
                          title="Edit customer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="row-action row-action-danger"
                          onClick={() => deleteCustomer(customer)}
                          disabled={deletingCustomerId !== null}
                          aria-label={`Delete ${customer.name}`}
                          title="Delete customer"
                        >
                          {deletingCustomerId === customer.customerid ? (
                            "…"
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {customers.length} customers</span>
          <span>Customer directory</span>
        </div>
      </section>

      {showForm && (
        <CustomerForm
          token={token}
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSaved={saveCustomer}
        />
      )}
    </div>
  );
}
