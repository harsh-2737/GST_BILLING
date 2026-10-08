export async function readApiResponse(response) {
  const body = await response.text();
  if (!body) {
    return { message: `The server returned an empty response (HTTP ${response.status}).` };
  }

  try {
    return JSON.parse(body);
  } catch {
    return { message: `The server returned an invalid response (HTTP ${response.status}).` };
  }
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
