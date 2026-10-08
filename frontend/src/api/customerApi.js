import { authHeader, readApiResponse } from "./apiClient.js";

export async function fetchCustomers(token) {
  const response = await fetch("/api/customers", {
    headers: authHeader(token),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not load customers.");
  }
  if (!Array.isArray(result)) {
    throw new Error("The server returned an invalid customer list.");
  }
  return result;
}

export async function createCustomer(token, customerData) {
  const response = await fetch("/api/customers/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(customerData),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not add customer.");
  }
  return result;
}

export async function updateCustomer(token, customerId, customerData) {
  const response = await fetch(`/api/customers/update/${customerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(customerData),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not update customer.");
  }
  return result;
}

export async function deleteCustomer(token, customerId) {
  const response = await fetch(`/api/customers/delete/${customerId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not delete customer.");
  }
  return result;
}
