import { authHeader, readApiResponse } from "./apiClient.js";

export async function fetchInvoices(token) {
  const response = await fetch("/api/invoices", {
    headers: authHeader(token),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || `Could not load invoices (HTTP ${response.status}).`);
  }
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unexpected invoice response.");
  }
  return result.data;
}

export async function createInvoice(token, invoicePayload) {
  const response = await fetch("/api/invoices/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(invoicePayload),
  });
  const result = await readApiResponse(response);
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Could not create invoice (HTTP ${response.status}).`);
  }
  const invoice = result.data?.invoice || result.data;
  if (!invoice?.invoiceid) {
    throw new Error("The server did not return the created invoice.");
  }
  return invoice;
}

export async function updateInvoicePaymentStatus(token, invoiceId, paymentstatus) {
  const response = await fetch(`/api/invoices/update/${invoiceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ payment: { paymentstatus } }),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not update payment status.");
  }
  if (!result.data?.invoice) {
    throw new Error("The server returned an invalid invoice update.");
  }
  return result.data.invoice;
}
