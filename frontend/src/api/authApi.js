import { authHeader, readApiResponse } from "./apiClient.js";

export async function loginUser(credentials) {
  const response = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Unable to authenticate.");
  }
  if (!result.token || !result.user) {
    throw new Error(result.message || "The server returned an incomplete sign-in response.");
  }
  return result;
}

export async function registerUser(userData) {
  const response = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || result.error || "Unable to register.");
  }
  if (!result.token || !result.user) {
    throw new Error(result.message || "The server returned an incomplete registration response.");
  }
  return result;
}

export async function fetchCurrentUser(token) {
  const response = await fetch("/api/users/me", {
    headers: authHeader(token),
  });
  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(result.message || "Session expired");
  }
  if (!result.user) {
    throw new Error("Session response is incomplete");
  }
  return result;
}

export async function logoutUser(token) {
  try {
    await fetch("/api/users/logout", {
      method: "POST",
      headers: authHeader(token),
    });
  } catch {
    // Ignore logout failures to allow client-side signout
  }
}
