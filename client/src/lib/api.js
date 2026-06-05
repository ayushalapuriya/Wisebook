const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function getToken() {
  return localStorage.getItem("wisebook_token");
}

export function setSession(token, user) {
  localStorage.setItem("wisebook_token", token);
  localStorage.setItem("wisebook_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("wisebook_token");
  localStorage.removeItem("wisebook_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("wisebook_user");
  return raw ? JSON.parse(raw) : null;
}

export async function api(path, options = {}) {
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  } catch (_error) {
    throw new Error(`Backend is not reachable at ${API_URL}. Start the server with "npm run dev" inside the server folder.`);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    const requestError = new Error(error.message || "Request failed");
    requestError.status = response.status;
    throw requestError;
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function downloadFile(path, filename) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Download failed" }));
    throw new Error(error.message || "Download failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
