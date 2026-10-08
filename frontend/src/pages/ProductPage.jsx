import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ProductForm from "../components/products/ProductForm.jsx";
import { deleteProduct as deleteProductApi, fetchProducts } from "../api/productApi.js";
import { formatCurrency } from "../utils/formatters.js";

export { ProductForm };

export default function ProductPage({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    let active = true;

    fetchProducts(token)
      .then((result) => {
        if (active) setProducts(result);
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

  function saveProduct(product) {
    if (editingProduct) {
      if (Number(product.quantity) > 0 && !product.archived) {
        setProducts((current) =>
          current.map((item) =>
            item.productid === product.productid ? product : item
          )
        );
      } else {
        setProducts((current) =>
          current.filter((item) => item.productid !== product.productid)
        );
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
      await deleteProductApi(token, product.productid);
      setProducts((current) =>
        current.filter((item) => item.productid !== product.productid)
      );
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete product.");
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h1>
            Products<span>.</span>
          </h1>
          <p className="heading-subtitle">
            Manage what you sell, stock levels, and GST rates.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Add product
        </button>
      </section>

      <section className="invoice-section entity-list-section">
        <div className="section-heading">
          <div>
            <h2>All products</h2>
            <p>
              {products.length} listed{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        {error && (
          <p className="auth-error product-page-error" role="alert">
            {error}
          </p>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>HSN</th>
                <th>PRICE</th>
                <th>GST</th>
                <th>IN STOCK</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="table-message" colSpan="6">
                    Loading products…
                  </td>
                </tr>
              )}
              {!loading && error && products.length === 0 && (
                <tr>
                  <td className="table-message error-message" colSpan="6">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && products.length === 0 && (
                <tr>
                  <td className="table-message" colSpan="6">
                    No products yet. Add a product to use it on invoices.
                  </td>
                </tr>
              )}
              {!loading &&
                products.map((product) => (
                  <tr key={product.productid}>
                    <td>
                      <span className="customer-name">{product.productname}</span>
                    </td>
                    <td className="date-cell">{product.hsncode}</td>
                    <td className="amount-cell">{formatCurrency(product.price)}</td>
                    <td className="date-cell">
                      {product.gst?.gsttype === "CGST+SGST"
                        ? `CGST ${Number(product.gst.gstrate) / 2}% + SGST ${Number(product.gst.gstrate) / 2}%`
                        : `${product.gst?.gsttype} · ${product.gst?.gstrate}%`}
                    </td>
                    <td>
                      <span
                        className={
                          Number(product.quantity) < 1 ? "stock-empty" : "date-cell"
                        }
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td>
                      <div className="invoice-item-actions customer-row-actions">
                        <button
                          className="row-action"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          aria-label={`Edit ${product.productname}`}
                          title="Edit product"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="delete-product-button"
                          onClick={() => deleteProduct(product)}
                          disabled={deletingProductId !== null}
                          aria-label={`Delete ${product.productname}`}
                          title="Delete product"
                        >
                          {deletingProductId === product.productid ? (
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
          <span>Showing {products.length} products</span>
          <span>Amounts in INR</span>
        </div>
      </section>

      {showForm && (
        <ProductForm
          token={token}
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSaved={saveProduct}
        />
      )}
    </div>
  );
}
