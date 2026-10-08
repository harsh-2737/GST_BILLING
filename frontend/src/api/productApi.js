import { authHeader, readApiResponse } from "./apiClient.js";

export async function fetchProducts(token) {
  const response = await fetch("/api/products", {
    headers: authHeader(token),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not load products.");
  }
  if (!Array.isArray(result)) {
    throw new Error("The server returned an invalid product list.");
  }
  return result;
}

export async function createProduct(token, productData) {
  const response = await fetch("/api/products/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(productData),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not add product.");
  }
  return result;
}

export async function updateProduct(token, productId, productData) {
  const response = await fetch(`/api/products/update/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(productData),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not update product.");
  }
  return result;
}

export async function deleteProduct(token, productId) {
  const response = await fetch(`/api/products/delete/${productId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not delete product.");
  }
  return result;
}
